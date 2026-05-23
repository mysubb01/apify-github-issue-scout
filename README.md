# GitHub Issue Scout for Paid-Work Triage

This is a small Crawlee demo for finding public GitHub issues that may be worth human review before doing paid open-source work.

The goal is not to auto-comment or auto-claim bounties. The crawler collects public GitHub issue search results, extracts paid-work signals, flags risky patterns, and writes a ranked JSON shortlist that a human can inspect.

It was built as a working-code companion for an Apify/Crawlee technical article pitch.

Related writing assets:

- [Portfolio page](https://mysubb01.github.io/apify-github-issue-scout/)
- [Paid services](https://mysubb01.github.io/apify-github-issue-scout/services.html)
- [Case study](https://mysubb01.github.io/apify-github-issue-scout/case-study.html)
- [Outreach kit](https://mysubb01.github.io/apify-github-issue-scout/outreach-kit.html)
- [Actor Store listing packet](./ACTOR_STORE_LISTING.md)
- [Apify current CFP alignment](./APIFY_CFP_ALIGNMENT.md)
- [Apify submission packet](./APIFY_SUBMISSION_PACKET.md)
- [Article draft](./article-draft.md)
- [Article pitch](./article-pitch.md)

## Why This Demo Exists

Public bounty searches are noisy. A result can look valuable but still be a bad target because it is maintainer-only, core-team-only, already crowded, star-gated, or full of low-quality AI attempts.

This demo turns that lesson into a practical workflow:

- Collect issue candidates with Crawlee.
- Keep only structured public metadata.
- Score positive signals like reward text, helpful labels, and low comment count.
- Flag risk signals before spending engineering time.
- Produce a reviewable JSON artifact instead of posting spam.

## Run It

```bash
npm install
npm run demo
```

The default output is:

```text
output/leads.json
```

You can provide your own query:

```bash
npm start -- --query 'bounty "good first issue" state:open comments:<10 updated:>2026-04-01' --limit 10 --output output/custom-leads.json
```

Tip: add `is:issue` to GitHub search queries when you want to exclude pull requests from the result set.

## Run as an Apify Actor Locally

The repository also includes an Apify Actor adapter:

- `.actor/actor.json`
- `.actor/input_schema.json`
- `Dockerfile`
- `src/actor.ts`

Run the Actor locally:

```bash
npm install
npm run actor:local
```

Local Actor output is written to Apify-compatible storage:

```text
storage/key_value_stores/default/OUTPUT.json
storage/datasets/default/*.json
```

The Actor version accepts:

- `queries`: GitHub issue search queries
- `limit`: max results per query, capped at 30
- `outputKey`: key-value store key for the summary object

## Output Shape

Each lead includes:

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

Verdicts:

- `pursue`: worth opening manually and reproducing locally
- `review`: unclear, inspect before touching code
- `skip`: likely poor expected value

## Safety Rules

- Do not auto-comment on GitHub issues.
- Do not claim a bounty until you have reproduced the issue and checked maintainer eligibility.
- Skip issues that are maintainer-only, core-team-only, star-gated, or already crowded.
- Treat this as a lead-scoring assistant, not an autonomous bounty hunter.

## Article Angle

This demo is designed as the working example for an Apify/Crawlee technical article:

> Building a GitHub Issue Scout with Crawlee and Human-in-the-Loop Triage

The article would walk through building the crawler, designing the scoring rules, and avoiding the common trap of wasting time on noisy or low-trust bounty issues.

Because it is Actor-ready, the article can also include a final section on turning the script into a reusable Apify Actor.
