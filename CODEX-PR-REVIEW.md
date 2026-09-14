# Automatic Codex PR review pilot

This repository is a pilot for native Codex GitHub pull request reviews using an
existing ChatGPT Business account. It has no OpenAI API key or paid API workflow.
Automatic triggering is configured in Codex, not by a repository file.

The `Codex review gate` workflow waits for the native Codex review summary for
the latest PR commit. Add its check name as a required status check in a GitHub
Ruleset for the target branch to block merging while the review is running.

## One-time setup

1. Connect the GitHub account that owns this repository in Codex.
2. Open [Codex Code review settings](https://chatgpt.com/codex/settings/code-review).
3. Enable **Auto review** and select **On PR open** as the review trigger.
4. Keep **Exhaustive code review** and **Auto security review** disabled for the
   initial pilot.
5. Ensure this repository is available to the ChatGPT Codex Connector. If GitHub
   shows repository access controls, allow this repository only.
6. Commit `AGENTS.md` with this file, then open a pull request on GitHub.
7. In GitHub, open **Settings → Rulesets**, create an active branch ruleset for
   the target branch, enable **Require status checks to pass before merging**,
   and add `Codex review gate` after it has run once. Also require a human
   approval and resolved conversations.

## Acceptance

1. Open a small pull request with a real code change and a clear description.
2. Confirm Codex posts a review automatically after the PR opens.
3. Push a follow-up change, then post `@codex review` in the PR to verify a
   manual re-review.
4. Confirm review comments follow the English repository rules in `AGENTS.md`.
5. Check the current Business usage dashboard after the review. This verifies
   that the review uses the existing subscription allowance; it does not prove
   exact per-PR or per-user attribution.

AI review does not replace local checks or human approval. If the included
allowance is unavailable, the review may not run; do not add a paid API fallback
for this pilot.

## Rollback

Disable **Auto review** in
[Codex Code review settings](https://chatgpt.com/codex/settings/code-review).
Deleting these repository files does not disable an already enabled cloud setting.
