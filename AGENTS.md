# Repository guidance

This repository is an English-language TypeScript and WebGL shader playground.
It is a personal pilot repository for native Codex GitHub pull request reviews.
The review service is configured outside the repository; see
`CODEX-PR-REVIEW.md` for setup and acceptance steps.

## Code Review Rules

These rules apply to reviews rather than implementation work.

- Write findings in English. Keep code identifiers unchanged.
- Review the pull request diff against the stated requirement and relevant
  callers. Treat the author's explanation as context, not proof of correctness.
- Report only actionable defects introduced by the change. Explain the trigger,
  impact, and smallest relevant location. State uncertainty rather than
  inferring behavior from unavailable context.
- For shader, WebGL, or render-loop changes, check compilation, uniform types,
  coordinate-space conversions, alpha handling, texture sampling boundaries,
  and resource cleanup. Consider both paused and active animation states.
- For UI changes, check that controls preserve the active effect state and that
  keyboard, mouse, touch, and numeric input interactions remain consistent.
- For exported game-integration code, check public API compatibility, lifecycle
  cleanup, and that generated output remains self-contained where documented.
- Keep routine formatting, generated output, and build artifacts out of review
  comments unless they introduce a functional regression. Do not claim tests
  passed without execution evidence.
