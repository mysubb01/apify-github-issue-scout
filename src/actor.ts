import { Actor } from 'apify';
import { DEFAULT_QUERIES, scanIssues } from './scout.js';

type ActorInput = {
  queries?: string[];
  limit?: number;
  outputKey?: string;
};

type Verdict = 'pursue' | 'review' | 'skip';

function normalizeInput(input: ActorInput | null): Required<ActorInput> {
  return {
    queries: input?.queries && input.queries.length > 0 ? input.queries : DEFAULT_QUERIES,
    limit: input?.limit && input.limit > 0 ? Math.min(input.limit, 30) : 10,
    outputKey: input?.outputKey?.trim() || 'OUTPUT',
  };
}

await Actor.main(async () => {
  const input = normalizeInput(await Actor.getInput<ActorInput>());
  const leads = await scanIssues({
    limit: input.limit,
    queries: input.queries,
    pushToCrawleeDataset: false,
  });

  await Actor.pushData(
    leads.map((lead) => ({
      ...lead,
      scannedAt: new Date().toISOString(),
    })),
  );

  const verdictCounts = leads.reduce<Record<Verdict, number>>(
    (counts, lead) => {
      counts[lead.verdict] += 1;
      return counts;
    },
    { pursue: 0, review: 0, skip: 0 },
  );

  await Actor.setValue(input.outputKey, {
    generatedAt: new Date().toISOString(),
    queryCount: input.queries.length,
    leadCount: leads.length,
    verdictCounts,
    topLeads: leads.slice(0, 10),
  });
});
