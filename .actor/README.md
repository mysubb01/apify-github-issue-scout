# GitHub Issue Scout Actor

This Actor searches public GitHub issues, scores paid-work signals, and filters noisy bounty traps before human review.

It is designed for safe lead triage:

- no automatic comments,
- no automatic bounty claims,
- no private data collection,
- structured dataset output for review.

## Output

The Actor writes every lead to the default dataset and writes a summary object to the default key-value store under `OUTPUT` by default.
