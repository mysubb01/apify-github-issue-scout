# GitHub Issue Scout Actor

This Actor searches public GitHub issues, scores paid-work signals, and filters noisy bounty traps before human review.

Use it when you want a structured shortlist of GitHub issues that may be worth manual inspection before you spend engineering time on a bounty, contributor task, documentation request, or paid open-source lead.

It is designed for safe lead triage:

- no automatic comments,
- no automatic bounty claims,
- no private data collection,
- structured dataset output for review.

## What it does

The Actor runs one or more GitHub issue search queries, normalizes the public metadata, and classifies each issue with:

- reward signals,
- positive signals,
- risk signals,
- score,
- verdict.

Verdicts are:

- `pursue`: worth opening manually and reproducing locally,
- `review`: unclear, inspect before touching code,
- `skip`: likely poor expected value.

## Example use cases

- DevRel teams watching public issue queues for contribution opportunities.
- Freelancers filtering noisy bounty searches before starting work.
- Open-source maintainers auditing whether their bounty labels attract low-quality attempts.
- Developer advocates turning public GitHub data into a human-reviewed lead queue.

## Input

- `queries`: GitHub issue search queries. Add `is:issue` when you want to avoid pull requests.
- `limit`: max GitHub results to inspect per query. The default is intentionally small.
- `outputKey`: key-value store key for the summary object.

## Output

The Actor writes every lead to the default dataset and writes a summary object to the default key-value store under `OUTPUT` by default.

Each dataset item includes:

- `repo`
- `title`
- `url`
- `comments`
- `labels`
- `score`
- `rewardSignal`
- `positiveSignals`
- `riskSignals`
- `verdict`

## Safety notes

This Actor does not submit PRs, claim bounties, post comments, or authenticate into GitHub. It only reads public issue search results and prepares a reviewable shortlist.

Before acting on a lead, always open the linked issue manually and confirm:

- the issue is still open,
- the maintainer accepts outside contributors,
- no official assignee is already working on it,
- the reward path is real,
- you can reproduce the task locally.

## Example queries

```text
bounty "good first issue" is:issue state:open comments:<10 updated:>2026-04-01
"paid" "documentation" is:issue state:open comments:<15 updated:>2026-01-01
"reward" "help wanted" is:issue state:open comments:<10 updated:>2026-04-01
```

## Related resources

- Portfolio: https://mysubb01.github.io/apify-github-issue-scout/
- Case study: https://mysubb01.github.io/apify-github-issue-scout/case-study.html
- Source repository: https://github.com/mysubb01/apify-github-issue-scout
