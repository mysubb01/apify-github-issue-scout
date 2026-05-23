# Apify Submission Packet

## Submission Target

- Program: Apify Content Writing Program
- Program page: https://apify.com/resources/write-for-apify
- Intended channel: Apify Discord `#apify-writers`
- Draft status: ready for editor/topic-fit review
- Payment status: not submitted, not accepted, not paid

## Copy-Ready Discord Message

```text
Hi Apify team,

I would like to submit/pitch a practical Crawlee article for the current content program:

Building a GitHub Issue Scout with Crawlee and Human-in-the-Loop Triage

The article is based on a working TypeScript demo that searches public GitHub issues, extracts paid-work signals, flags risky bounty patterns, and writes a ranked shortlist for human review. The key angle is responsible automation: Crawlee collects and structures public data, but the final decision stays human-reviewed, with no auto-commenting or auto-claiming.

Working repo:
https://github.com/mysubb01/apify-github-issue-scout

Full draft:
https://github.com/mysubb01/apify-github-issue-scout/blob/main/article-draft.md

Portfolio/case-study pages:
https://mysubb01.github.io/apify-github-issue-scout/
https://mysubb01.github.io/apify-github-issue-scout/case-study.html

The demo includes:
- Crawlee-based GitHub issue collection
- typed lead model and transparent scoring
- risk filters for maintainer-only, core-team-only, star-gated, token/crypto, crowded, and tiny-reward issues
- local CLI demo with JSON output
- Apify Actor adapter, input schema, Dockerfile, dataset output, and key-value summary output

Local verification:
- npm run build
- npm run demo
- npm run actor:local

I am happy to adapt the angle to the current Call for Papers theme, especially if the preferred focus is Crawlee, Apify Actors, Playwright/Cheerio crawling, AI/data workflows, or responsible automation.
```

## Short Form Fields

### Proposed title

```text
Building a GitHub Issue Scout with Crawlee and Human-in-the-Loop Triage
```

### One-sentence summary

```text
A practical TypeScript/Crawlee tutorial that turns noisy public GitHub issue searches into a ranked, human-reviewed shortlist while avoiding spammy auto-claiming behavior.
```

### Article category

```text
Crawlee tutorial, Apify Actor workflow, developer automation, public web data triage
```

### Target reader

```text
Developers who want to use Crawlee or Apify Actors to collect public web/API data, score it transparently, and turn it into a safe review workflow instead of an uncontrolled automation bot.
```

### Why this fits Apify

```text
The article is built around a real Crawlee workflow with working TypeScript code, a local CLI, and an Apify Actor adapter. It shows a practical use case for collecting public web data, structuring it into a dataset, and producing a key-value summary while keeping the workflow responsible and human-reviewed.
```

### What the reader will build

```text
Readers will build a GitHub issue scout that:
- queries public GitHub issue search results
- normalizes issue metadata into typed leads
- extracts reward and paid-work signals
- flags risky patterns such as maintainer-only, star-gated, token/crypto, and crowded issues
- ranks each result as pursue, review, or skip
- writes JSON output locally
- runs as an Apify Actor with dataset and key-value-store output
```

### Existing working code

```text
Repository: https://github.com/mysubb01/apify-github-issue-scout
Main scanner: src/scout.ts
Actor adapter: src/actor.ts
Actor metadata: .actor/actor.json
Actor input schema: .actor/input_schema.json
Dockerfile: Dockerfile
```

## Article Outline

1. Why paid-work search is a triage problem, not just a search problem
2. What the scout will build and what it deliberately will not do
3. Setting up the Crawlee TypeScript project
4. Building GitHub issue search URLs
5. Parsing public GitHub search API responses safely
6. Designing the lead model
7. Extracting reward and positive signals
8. Filtering risky patterns
9. Ranking leads as `pursue`, `review`, or `skip`
10. Running the CLI demo and inspecting `output/leads.json`
11. Turning the workflow into an Apify Actor
12. Human-in-the-loop safety rules
13. Extensions: Playwright page inspection, daily schedules, CSV export, and stricter cash-only modes

## Verification Evidence to Include

```bash
npm install
npm run build
npm run demo
npm run actor:local
```

Expected outputs:

```text
output/leads.json
storage/key_value_stores/default/OUTPUT.json
storage/datasets/default/*.json
```

## Editor Notes

- The draft intentionally avoids teaching spammy bounty automation.
- The workflow only reads public issue metadata and keeps final decisions human-reviewed.
- If the current Call for Papers prefers Playwright-heavy content, the article can add a final section that uses `PlaywrightCrawler` to inspect the top N issue pages after the first Crawlee/API pass.
- If the current Call for Papers prefers Apify Actors, the article can emphasize the Actor adapter, input schema, dataset records, and key-value summary.
- If the current Call for Papers prefers AI/data collection, the article can frame the ranked shortlist as a dataset for later human or LLM-assisted triage, with strict no-auto-commenting guardrails.

## Links

- Repo: https://github.com/mysubb01/apify-github-issue-scout
- Article draft: https://github.com/mysubb01/apify-github-issue-scout/blob/main/article-draft.md
- Article pitch: https://github.com/mysubb01/apify-github-issue-scout/blob/main/article-pitch.md
- Portfolio: https://mysubb01.github.io/apify-github-issue-scout/
- Case study: https://mysubb01.github.io/apify-github-issue-scout/case-study.html
- Services: https://mysubb01.github.io/apify-github-issue-scout/services.html

## Current Submission Status

This packet is prepared for manual submission. It has not been submitted through Discord, accepted by Apify, or paid.
