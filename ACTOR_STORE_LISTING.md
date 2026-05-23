# Apify Actor Store Listing Packet

## Actor Name

GitHub Issue Scout

## Short Description

Scout public GitHub issues for paid-work signals, rank useful leads, and filter noisy bounty traps before human review.

## Suggested Store Slug

`github-issue-scout`

## Category Fit

- Developer tools
- Automation
- Lead generation
- Open-source workflow intelligence

## Buyer-Facing Summary

GitHub Issue Scout turns noisy public GitHub issue searches into a structured review queue. It collects public issue metadata, flags useful paid-work signals, detects common risk patterns, and writes ranked leads to the dataset so a human can inspect the real issue before doing work.

It is not an auto-claimer or comment bot. It is a safer triage layer for developers, DevRel teams, freelancers, and open-source maintainers who want to avoid wasting time on stale, crowded, maintainer-only, or low-quality bounty tasks.

## Core Value Proposition

- Save time before starting paid open-source work.
- Avoid stale, crowded, or blocked bounty issues.
- Keep risky actions human-reviewed.
- Get structured JSON output for downstream review or workflow automation.
- Use a working Crawlee + Apify Actor example for developer workflow intelligence.

## Input Summary

- `queries`: GitHub issue search queries.
- `limit`: results per query, capped to avoid unnecessary API load.
- `outputKey`: key-value store key for the run summary.

## Output Summary

The default dataset receives one item per lead with:

- repository,
- issue title,
- URL,
- labels,
- comment count,
- reward signal,
- positive signals,
- risk signals,
- score,
- verdict.

The key-value store receives a summary object under `OUTPUT` by default.

## Suggested Monetization Model

Start free or low-cost until real Store usage data exists.

Recommended first paid experiment:

- Model: pay per event.
- Event: one completed scout run.
- Initial price: 0.20-0.50 USD per run.
- Rationale: the Actor creates value at run level, while result counts can vary depending on query quality.

Alternative:

- Keep the Actor free as a portfolio/demo asset.
- Use it to drive paid technical writing, Actor build, or GitHub workflow review services.

## Publication Checklist

- [x] Clear description.
- [x] Comprehensive README.
- [x] Working input schema.
- [x] Dockerfile.
- [x] Local Actor run path.
- [x] Sample output.
- [x] Public portfolio page.
- [x] Case study.
- [ ] Apify account owner uploads or selects a logo/icon.
- [ ] Apify account owner deploys Actor.
- [ ] Apify account owner tests a cloud run.
- [ ] Apify account owner configures Store visibility.
- [ ] Apify account owner chooses pricing/monetization model.

## Suggested Store README Opening

GitHub Issue Scout helps you triage public GitHub issue searches before spending engineering time. It searches configurable GitHub issue queries, extracts public metadata, scores useful paid-work signals, flags common risk patterns, and writes structured leads to the dataset for human review.

This Actor does not comment, claim bounties, open pull requests, or authenticate into GitHub. It is intentionally human-in-the-loop.

## Related Links

- Portfolio: https://mysubb01.github.io/apify-github-issue-scout/
- Services: https://mysubb01.github.io/apify-github-issue-scout/services.html
- Case study: https://mysubb01.github.io/apify-github-issue-scout/case-study.html
- Article draft: https://github.com/mysubb01/apify-github-issue-scout/blob/main/article-draft.md
- Source repository: https://github.com/mysubb01/apify-github-issue-scout
