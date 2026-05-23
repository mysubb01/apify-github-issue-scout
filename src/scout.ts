import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { CheerioCrawler } from '@crawlee/cheerio';
import { Dataset } from '@crawlee/core';

type Label = {
  name: string;
};

type SearchIssue = {
  html_url: string;
  title: string;
  body: string | null;
  comments: number;
  created_at: string;
  updated_at: string;
  labels: Label[];
  repository_url: string;
  is_pull_request: boolean;
};

type GitHubSearchResponse = {
  total_count: number;
  items: SearchIssue[];
};

type Lead = {
  query: string;
  repo: string;
  title: string;
  url: string;
  comments: number;
  labels: string[];
  updatedAt: string;
  score: number;
  rewardSignal: string | null;
  positiveSignals: string[];
  riskSignals: string[];
  verdict: 'pursue' | 'review' | 'skip';
};

type CliOptions = {
  limit: number;
  output: string;
  queries: string[];
};

type ScanOptions = {
  limit: number;
  queries: string[];
  pushToCrawleeDataset?: boolean;
};

export const DEFAULT_QUERIES = [
  'bounty "good first issue" is:issue state:open comments:<10 updated:>2026-04-01',
  '"paid" "documentation" is:issue state:open comments:<15 updated:>2026-01-01',
  '"reward" "help wanted" is:issue state:open comments:<10 updated:>2026-04-01',
];

const RISK_PATTERNS = [
  { label: 'maintainer-only', pattern: /maintainers? only|core team only/i },
  { label: 'do-not-assign-newcomers', pattern: /do not ask to be assigned unless/i },
  { label: 'star-gated', pattern: /star the repo|more stars|starring the repo/i },
  { label: 'crypto-or-token-work', pattern: /crypto-eligible|wallet address|stablecoin|usdt|stellar|soroban|btc|xmr|token/i },
  { label: 'already-crowded', pattern: /already submitted|work in progress|wip/i },
  { label: 'low-quality-ai-warning', pattern: /low quality ai pr|ai prs will not receive review/i },
  { label: 'agent-generated-noise', pattern: /agent-report|agent-in-progress|bounty-autopilot/i },
];

const POSITIVE_LABELS = [
  'good first issue',
  'help wanted',
  'bounty',
  'fund',
  'funding',
  'external',
  'documentation',
  'docs',
];

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    limit: 10,
    output: 'output/leads.json',
    queries: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--limit' && next) {
      options.limit = Number.parseInt(next, 10);
      index += 1;
    } else if (arg === '--output' && next) {
      options.output = next;
      index += 1;
    } else if (arg === '--query' && next) {
      options.queries.push(next);
      index += 1;
    }
  }

  if (!Number.isFinite(options.limit) || options.limit < 1) {
    options.limit = 10;
  }

  if (options.queries.length === 0) {
    options.queries = DEFAULT_QUERIES;
  }

  return options;
}

function buildSearchUrl(query: string, perPage: number): string {
  const params = new URLSearchParams({
    q: query,
    sort: 'updated',
    order: 'desc',
    per_page: String(perPage),
  });

  return `https://api.github.com/search/issues?${params.toString()}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toStringValue(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function toNumberValue(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function parseLabels(value: unknown): Label[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item): Label | null => {
      if (!isRecord(item)) {
        return null;
      }

      const name = toStringValue(item.name);
      return name ? { name } : null;
    })
    .filter((item): item is Label => item !== null);
}

function parseIssue(value: unknown): SearchIssue | null {
  if (!isRecord(value)) {
    return null;
  }

  const htmlUrl = toStringValue(value.html_url);
  const title = toStringValue(value.title);
  const comments = toNumberValue(value.comments);
  const createdAt = toStringValue(value.created_at);
  const updatedAt = toStringValue(value.updated_at);
  const repositoryUrl = toStringValue(value.repository_url);
  const bodyValue = value.body;
  const body = typeof bodyValue === 'string' || bodyValue === null ? bodyValue : null;

  if (!htmlUrl || !title || comments === null || !createdAt || !updatedAt || !repositoryUrl) {
    return null;
  }

  return {
    html_url: htmlUrl,
    title,
    body,
    comments,
    created_at: createdAt,
    updated_at: updatedAt,
    labels: parseLabels(value.labels),
    repository_url: repositoryUrl,
    is_pull_request: isRecord(value.pull_request),
  };
}

function parseSearchResponse(raw: string): GitHubSearchResponse {
  const parsed: unknown = JSON.parse(raw);

  if (!isRecord(parsed)) {
    return { total_count: 0, items: [] };
  }

  const totalCount = toNumberValue(parsed.total_count) ?? 0;
  const items = Array.isArray(parsed.items)
    ? parsed.items.map(parseIssue).filter((item): item is SearchIssue => item !== null)
    : [];

  return { total_count: totalCount, items };
}

function bodyToText(body: unknown): string {
  if (typeof body === 'string') {
    return body;
  }

  if (Buffer.isBuffer(body)) {
    return body.toString('utf8');
  }

  return String(body ?? '');
}

function repoFromApiUrl(repositoryUrl: string): string {
  return repositoryUrl.replace('https://api.github.com/repos/', '');
}

function findRewardSignal(text: string, labels: string[]): string | null {
  const priceMatch = text.match(/\$[0-9][0-9,]*(?:\.[0-9]{1,2})?\s*[kKmM]?/);
  if (priceMatch) {
    return priceMatch[0].replace(/\s+/g, '');
  }

  const priceLabel = labels.find((label) => /price:\s*\d+\s*usd/i.test(label));
  return priceLabel ?? null;
}

function rewardToUsdFloor(signal: string | null): number | null {
  if (!signal) {
    return null;
  }

  const match = signal.match(/\$?([0-9][0-9,]*(?:\.[0-9]{1,2})?)([kKmM])?/);
  if (!match) {
    return null;
  }

  const rawAmount = Number.parseFloat(match[1].replaceAll(',', ''));
  if (!Number.isFinite(rawAmount)) {
    return null;
  }

  const suffix = match[2]?.toLowerCase();
  if (suffix === 'k') {
    return rawAmount * 1000;
  }
  if (suffix === 'm') {
    return rawAmount * 1000000;
  }

  return rawAmount;
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function classifyIssue(issue: SearchIssue, query: string): Lead {
  const labels = issue.labels.map((label) => label.name);
  const searchable = `${issue.title}\n${issue.body ?? ''}\n${labels.join('\n')}`;
  const positiveSignals: string[] = [];
  const riskSignals: string[] = [];
  const rewardSignal = findRewardSignal(searchable, labels);
  const rewardFloor = rewardToUsdFloor(rewardSignal);

  if (rewardSignal) {
    positiveSignals.push(`reward:${rewardSignal}`);
  }

  if (rewardFloor !== null && rewardFloor < 50) {
    riskSignals.push('reward-too-small');
  }

  if (issue.is_pull_request) {
    riskSignals.push('pull-request-result');
  }

  for (const label of labels) {
    const lower = label.toLowerCase();
    if (POSITIVE_LABELS.some((positive) => lower.includes(positive))) {
      positiveSignals.push(`label:${label}`);
    }
  }

  if (/bounty|paid|reward|funded|funding/i.test(searchable)) {
    positiveSignals.push('paid-work-language');
  }

  for (const risk of RISK_PATTERNS) {
    if (risk.pattern.test(searchable)) {
      riskSignals.push(risk.label);
    }
  }

  if (issue.comments >= 10) {
    riskSignals.push('comment-count-high');
  } else if (issue.comments <= 3) {
    positiveSignals.push('low-comment-count');
  }

  let score = 0;
  score += rewardFloor !== null && rewardFloor >= 50 ? 25 : 0;
  score += positiveSignals.length * 8;
  score -= riskSignals.length * 24;
  score -= Math.min(issue.comments, 20);

  const hardSkipSignals = new Set(['crypto-or-token-work', 'maintainer-only', 'core-team-only', 'star-gated']);
  const hasHardSkip = riskSignals.some((signal) => hardSkipSignals.has(signal));
  const verdict: Lead['verdict'] =
    hasHardSkip || riskSignals.length >= 2 || score < 10 ? 'skip' : score >= 35 ? 'pursue' : 'review';

  return {
    query,
    repo: repoFromApiUrl(issue.repository_url),
    title: issue.title,
    url: issue.html_url,
    comments: issue.comments,
    labels,
    updatedAt: issue.updated_at,
    score,
    rewardSignal,
    positiveSignals: unique(positiveSignals),
    riskSignals: unique(riskSignals),
    verdict,
  };
}

async function writeOutput(outputPath: string, leads: Lead[]): Promise<void> {
  const resolved = path.resolve(outputPath);
  await mkdir(path.dirname(resolved), { recursive: true });
  await writeFile(resolved, `${JSON.stringify(leads, null, 2)}\n`, 'utf8');
}

export async function scanIssues(options: ScanOptions): Promise<Lead[]> {
  const perPage = Math.min(options.limit, 30);
  const leads: Lead[] = [];

  const crawler = new CheerioCrawler({
    maxRequestsPerCrawl: options.queries.length,
    requestHandlerTimeoutSecs: 30,
    async requestHandler({ request, body, pushData, log }) {
      const query = typeof request.userData.query === 'string' ? request.userData.query : request.url;
      log.info(`Scanning query: ${query}`);

      const response = parseSearchResponse(bodyToText(body));
      const classified = response.items.map((issue) => classifyIssue(issue, query));
      leads.push(...classified);

      if (options.pushToCrawleeDataset) {
        await pushData(
          classified.map((lead) => ({
            ...lead,
            scannedAt: new Date().toISOString(),
          })),
        );
      }
    },
    failedRequestHandler({ request, log }) {
      log.error(`Failed to scan ${request.url}`);
    },
  });

  await crawler.run(
    options.queries.map((query) => ({
      url: buildSearchUrl(query, perPage),
      userData: { query },
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'apify-github-issue-scout-demo',
      },
    })),
  );

  const verdictRank: Record<Lead['verdict'], number> = {
    pursue: 3,
    review: 2,
    skip: 1,
  };
  return leads.sort((left, right) => {
    const verdictDelta = verdictRank[right.verdict] - verdictRank[left.verdict];
    return verdictDelta === 0 ? right.score - left.score : verdictDelta;
  });
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));
  const ranked = await scanIssues({
    limit: options.limit,
    queries: options.queries,
    pushToCrawleeDataset: true,
  });
  await writeOutput(options.output, ranked);

  const dataset = await Dataset.open();
  const { total } = await dataset.getData({ limit: 1 });

  console.log(`Scanned ${options.queries.length} queries.`);
  console.log(`Ranked ${ranked.length} leads into ${options.output}.`);
  console.log(`Crawlee dataset contains ${total} records.`);
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  await main();
}
