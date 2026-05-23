# Building a GitHub Issue Scout with Crawlee and Human-in-the-Loop Triage

Open-source paid work sounds easy from a distance: search for "bounty", pick an issue, submit a pull request, and get paid. In practice, the signal is much noisier.

Some paid-looking issues are already crowded. Some are only for maintainers or core team members. Some require starring a repository before being reviewed. Others are full of low-quality automated attempts, or they use crypto/token workflows that may not fit your payment constraints.

This article shows how to build a small GitHub issue scout with Crawlee. The scout searches public GitHub issues, extracts paid-work signals, flags risky patterns, and writes a ranked shortlist for human review.

The important part is the last phrase: human review. This is not an auto-claimer, auto-commenter, or autonomous bounty hunter. It is a lead-scoring assistant that helps you decide where not to waste your engineering time.

Working demo repository:

```text
https://github.com/mysubb01/apify-github-issue-scout
```

## What We Are Building

The workflow has four steps:

1. Query public GitHub issue search results.
2. Normalize each result into a typed lead.
3. Score positive and risky signals.
4. Save a ranked JSON output for manual review.

The repository also includes an Apify Actor adapter, so the same workflow can be run as a local script or as an Actor-style job that writes results to the default dataset and a summary object to key-value storage.

## Why Use Crawlee for This?

Crawlee is useful here because it gives us a reliable crawling runtime, request handling, logging, retry behavior, and storage integration without turning a small script into a custom framework.

For this first version, we use GitHub's public search API instead of scraping the GitHub HTML pages. That keeps the demo stable and focused on the triage logic. You can later extend the workflow with `PlaywrightCrawler` if you want to inspect issue pages, render dynamic content, or collect extra page-level signals.

The core crawler uses `CheerioCrawler`, but it is fetching JSON responses:

```ts
import { CheerioCrawler } from '@crawlee/cheerio';

const crawler = new CheerioCrawler({
  maxRequestsPerCrawl: options.queries.length,
  requestHandlerTimeoutSecs: 30,
  async requestHandler({ request, body, log }) {
    const query = typeof request.userData.query === 'string'
      ? request.userData.query
      : request.url;

    log.info(`Scanning query: ${query}`);
    // Parse GitHub search response and classify issues here.
  },
});
```

The start URLs are GitHub issue search API URLs:

```ts
function buildSearchUrl(query: string, perPage: number): string {
  const params = new URLSearchParams({
    q: query,
    sort: 'updated',
    order: 'desc',
    per_page: String(perPage),
  });

  return `https://api.github.com/search/issues?${params.toString()}`;
}
```

The default queries include `is:issue` to avoid mixing pull requests into the result set:

```ts
export const DEFAULT_QUERIES = [
  'bounty "good first issue" is:issue state:open comments:<10 updated:>2026-04-01',
  '"paid" "documentation" is:issue state:open comments:<15 updated:>2026-01-01',
  '"reward" "help wanted" is:issue state:open comments:<10 updated:>2026-04-01',
];
```

## Designing the Lead Model

For each issue, the scout keeps only public metadata that is useful for triage:

```ts
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
```

This shape is intentionally simple. A lead should explain itself. If a result is marked `skip`, the `riskSignals` field should show why. If it is marked `review`, the reviewer should know what made it interesting but not yet safe enough to pursue.

Example output:

```json
{
  "repo": "ubiquity-os/plugins-wishlist",
  "title": "Generalized \"GitHub Webhook + Contributor Role -> Rewards\" With Config v3",
  "url": "https://github.com/ubiquity-os/plugins-wishlist/issues/47",
  "comments": 8,
  "labels": ["Time: <1 Day", "Priority: 1 (Normal)", "Price: 300 USD"],
  "score": 33,
  "rewardSignal": "Price: 300 USD",
  "positiveSignals": ["reward:Price: 300 USD", "paid-work-language"],
  "riskSignals": [],
  "verdict": "review"
}
```

The goal is not to blindly trust the score. The goal is to reduce the review queue to something a human can inspect quickly.

## Extracting Positive Signals

The scout looks for signals that may indicate real paid work:

- A dollar amount in the issue title or body.
- Labels like `bounty`, `funding`, `help wanted`, or `documentation`.
- Low comment count, because crowded issues often have lower expected value.
- General paid-work language such as `bounty`, `paid`, `reward`, `funded`, or `funding`.

The reward extractor handles normal amounts and suffixes like `$4k`:

```ts
function findRewardSignal(text: string, labels: string[]): string | null {
  const priceMatch = text.match(/\$[0-9][0-9,]*(?:\.[0-9]{1,2})?\s*[kKmM]?/);
  if (priceMatch) {
    return priceMatch[0].replace(/\s+/g, '');
  }

  const priceLabel = labels.find((label) => /price:\s*\d+\s*usd/i.test(label));
  return priceLabel ?? null;
}
```

The code also converts a reward signal into an approximate amount so tiny rewards do not dominate the score:

```ts
function rewardToUsdFloor(signal: string | null): number | null {
  if (!signal) return null;

  const match = signal.match(/\$?([0-9][0-9,]*(?:\.[0-9]{1,2})?)([kKmM])?/);
  if (!match) return null;

  const rawAmount = Number.parseFloat(match[1].replaceAll(',', ''));
  if (!Number.isFinite(rawAmount)) return null;

  const suffix = match[2]?.toLowerCase();
  if (suffix === 'k') return rawAmount * 1000;
  if (suffix === 'm') return rawAmount * 1000000;

  return rawAmount;
}
```

That means `$0.01` is not treated like a serious opportunity.

## Filtering Risky Patterns

The most valuable part of this scout is not finding leads. It is avoiding traps.

These are examples of risk patterns:

```ts
const RISK_PATTERNS = [
  { label: 'maintainer-only', pattern: /maintainers? only|core team only/i },
  { label: 'do-not-assign-newcomers', pattern: /do not ask to be assigned unless/i },
  { label: 'star-gated', pattern: /star the repo|more stars|starring the repo/i },
  { label: 'crypto-or-token-work', pattern: /crypto-eligible|wallet address|stablecoin|usdt|stellar|soroban|btc|xmr|token/i },
  { label: 'already-crowded', pattern: /already submitted|work in progress|wip/i },
  { label: 'low-quality-ai-warning', pattern: /low quality ai pr|ai prs will not receive review/i },
  { label: 'agent-generated-noise', pattern: /agent-report|agent-in-progress|bounty-autopilot/i },
];
```

Some signals are hard skips for this workflow:

```ts
const hardSkipSignals = new Set([
  'crypto-or-token-work',
  'maintainer-only',
  'core-team-only',
  'star-gated',
]);
```

This reflects a practical rule: a high reward is not enough if the issue is not actually accessible or if the payment path is out of scope.

## Scoring the Issue

The score is intentionally simple:

```ts
let score = 0;
score += rewardFloor !== null && rewardFloor >= 50 ? 25 : 0;
score += positiveSignals.length * 8;
score -= riskSignals.length * 24;
score -= Math.min(issue.comments, 20);
```

Then the issue is classified:

```ts
const verdict =
  hasHardSkip || riskSignals.length >= 2 || score < 10
    ? 'skip'
    : score >= 35
      ? 'pursue'
      : 'review';
```

This is not machine learning, and that is a feature. The rules are transparent. When the score looks wrong, you can inspect the signal lists and adjust the classifier.

## Running the CLI Demo

Clone the repository and run:

```bash
npm install
npm run demo
```

The demo writes:

```text
output/leads.json
```

You can also pass a custom query:

```bash
npm start -- --query 'bounty "good first issue" is:issue state:open comments:<10 updated:>2026-04-01' --limit 10 --output output/custom-leads.json
```

The output includes `pursue`, `review`, and `skip` verdicts. In practice, I recommend treating `pursue` as "open manually and reproduce first", not "start coding now".

## Turning It into an Apify Actor

The repository includes an Actor adapter:

```text
.actor/actor.json
.actor/input_schema.json
Dockerfile
src/actor.ts
```

The Actor adapter reads input with `Actor.getInput()`, runs the same scanner, pushes each lead to the default dataset, and writes a summary object to the key-value store.

```ts
import { Actor } from 'apify';
import { DEFAULT_QUERIES, scanIssues } from './scout.js';

await Actor.main(async () => {
  const input = normalizeInput(await Actor.getInput());
  const leads = await scanIssues({
    limit: input.limit,
    queries: input.queries,
    pushToCrawleeDataset: false,
  });

  await Actor.pushData(leads.map((lead) => ({
    ...lead,
    scannedAt: new Date().toISOString(),
  })));

  await Actor.setValue(input.outputKey, {
    generatedAt: new Date().toISOString(),
    queryCount: input.queries.length,
    leadCount: leads.length,
    topLeads: leads.slice(0, 10),
  });
});
```

Run it locally:

```bash
npm run actor:local
```

Local Actor output is written to:

```text
storage/key_value_stores/default/OUTPUT.json
storage/datasets/default/*.json
```

The input schema lets users configure:

- `queries`: GitHub search queries
- `limit`: max results per query
- `outputKey`: key-value store key for the summary object

## Human-in-the-Loop Rules

This workflow is deliberately conservative:

- Do not auto-comment on issues.
- Do not claim a bounty until you reproduce the task locally.
- Do not trust a reward label without reading maintainer comments.
- Skip issues that are maintainer-only, core-team-only, star-gated, or already crowded.
- Keep the final decision human-reviewed.

The scout is useful because it reduces the search space. It should not replace judgment.

## Extensions

Here are natural next steps:

- Add a `PlaywrightCrawler` pass for the top N leads to inspect issue pages and linked pull requests.
- Add repository trust signals such as age, stars, recent maintainer activity, or license.
- Export CSV in addition to JSON.
- Send a daily digest to Slack, Discord, or email.
- Add a stricter "only cash/non-token rewards" mode.
- Deploy the Actor on Apify and schedule it to run once a day.

## Conclusion

Paid open-source work is not just a search problem. It is a triage problem.

The expensive mistake is not missing one possible bounty. The expensive mistake is spending hours on an issue that was never realistically claimable. A small Crawlee scout helps by separating signals from traps and by making the review process repeatable.

The result is a safer workflow: collect public data, rank it transparently, skip obvious traps, and let a human decide what deserves engineering time.
