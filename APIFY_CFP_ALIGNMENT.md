# Apify Current CFP Alignment

## Current Source Check

Checked on 2026-05-23.

The public Apify writing program page says:

- The next Call for Papers is open.
- Submissions should go through Discord `#apify-writers`.
- Accepted articles are paid once reviewed and ready for publication.
- The program focuses on practical, expert-to-expert content.
- Stated topic areas include:
  - Crawlee deep dives
  - advanced web scraping tutorials in JavaScript/TypeScript or Python
  - browser automation with Playwright or Puppeteer
  - creative uses of AI and machine learning for web data collection

The linked Notion program page was not reachable from the public link during this check, so this file does not claim a specific current topic title. It prepares three safe positioning variants that match the public topic categories above.

## Best-Fit Variant 1: Crawlee Deep Dive

Use this if the current Call for Papers emphasizes Crawlee internals, Crawlee tutorials, or structured crawling workflows.

```text
Title: Building a GitHub Issue Scout with Crawlee and Human-in-the-Loop Triage

Angle:
This is a Crawlee deep dive into turning noisy public GitHub issue search results into a structured, reviewable dataset. The article focuses on request setup, response parsing, typed lead modeling, transparent scoring, and output generation.

Why it fits:
- Uses Crawlee as the collection/runtime layer
- Includes working TypeScript code
- Shows a real data workflow instead of a toy scraper
- Produces a JSON dataset that can be reviewed manually or extended later

What readers learn:
- how to use Crawlee for JSON/API-style collection
- how to normalize heterogeneous public issue metadata
- how to design transparent scoring rules
- how to keep automation responsible with a human review step
```

## Best-Fit Variant 2: Apify Actor Workflow

Use this if the current Call for Papers emphasizes Apify Actors, datasets, input schemas, or running workflows on the Apify platform.

```text
Title: Turning a Crawlee Script into an Apify Actor for GitHub Issue Triage

Angle:
This version focuses on packaging the GitHub issue scout as an Apify Actor. It starts from a local TypeScript/Crawlee workflow and shows how to add an Actor adapter, input schema, dataset records, and a key-value-store summary.

Why it fits:
- Includes `.actor/actor.json`
- Includes `.actor/input_schema.json`
- Includes `Dockerfile`
- Includes `src/actor.ts`
- Writes individual leads to the default dataset
- Writes a summary object with verdict counts and top leads

What readers learn:
- how to turn a local crawler into an Actor-style workflow
- how to define configurable inputs
- how to push dataset rows
- how to write summary output to key-value storage
```

## Best-Fit Variant 3: AI/Web Data Collection

Use this if the current Call for Papers emphasizes AI agents, LLM workflows, AI-ready datasets, or creative web data collection.

```text
Title: Collecting AI-Ready GitHub Issue Signals with Crawlee

Angle:
This version frames the scout as a data collection and triage pipeline for AI-assisted review. Crawlee collects public issue metadata and produces a structured dataset that a human or later LLM-assisted workflow can review safely.

Why it fits:
- Collects real public web/API data
- Structures noisy text and labels into typed fields
- Separates positive signals from risk signals
- Avoids uncontrolled autonomous actions
- Can be extended into a human-in-the-loop AI review workflow

What readers learn:
- how to prepare a structured dataset from messy public issue data
- how to encode safety/risk signals before involving an AI assistant
- how to design guardrails against spammy auto-commenting or auto-claiming
```

## Recommended Submission Choice

Start with Variant 2 if the form asks for the strongest Apify-specific fit.

Reason: the repository is already Actor-ready, and Apify's platform-specific value is clearest when the article shows dataset output, key-value summary output, input schema, and local Actor execution.

Use Variant 1 if the editor prefers Crawlee-first tutorials.

Use Variant 3 if the editor asks for AI/data-collection or AI-agent-related topics.

## Updated Copy-Ready Message

```text
Hi Apify team,

I would like to submit/pitch a practical article for the current content program. I saw the public program page mention Crawlee deep dives, advanced JavaScript/TypeScript scraping workflows, browser automation, and creative AI/web-data use cases.

My strongest fit is this Actor-ready Crawlee tutorial:

Turning a Crawlee Script into an Apify Actor for GitHub Issue Triage

It is based on a working TypeScript repository that searches public GitHub issue data, extracts paid-work and risk signals, ranks each lead as pursue/review/skip, and keeps the final decision human-reviewed. The project includes both a local Crawlee CLI and an Apify Actor adapter.

Working repo:
https://github.com/mysubb01/apify-github-issue-scout

Submission packet:
https://github.com/mysubb01/apify-github-issue-scout/blob/main/APIFY_SUBMISSION_PACKET.md

Full article draft:
https://github.com/mysubb01/apify-github-issue-scout/blob/main/article-draft.md

Note on originality:
The linked draft is a public working outline/sample for topic-fit review. If this topic is accepted, I can prepare a fresh unpublished final manuscript in the requested editorial format and adapt the title, examples, and framing to the active Call for Papers.

Actor-specific files:
- src/actor.ts
- .actor/actor.json
- .actor/input_schema.json
- Dockerfile

Verification already run locally:
- npm run build
- CLI demo: processed 3 GitHub search requests and wrote ranked leads
- Actor local run: wrote dataset records plus an OUTPUT summary with leadCount and verdictCounts

If the current CFP theme is more Crawlee-focused, I can frame it as a Crawlee deep dive. If it is more AI/data-focused, I can frame it as collecting structured, AI-reviewable GitHub issue signals with human-in-the-loop guardrails.
```

## Status

This alignment note is prepared for manual Discord submission. It has not been submitted, accepted, or paid. The public draft should be treated as a sample/outline; the final publication manuscript still needs to be prepared as an unpublished editorial draft after topic acceptance.
