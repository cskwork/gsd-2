# 2026-05-23

## Korean fork defaults

- Set the effective default model to `openai-codex/gpt-5.5` so general Korean-user workflows start on the current Codex frontier model family.
- Set the default user-facing response language to Korean in the GSD system prompt and generated preferences template.
- Added a UI/UX routing policy that prefers `claude-code/claude-opus-4-7`, then `google-gemini-cli/gemini-3.5-flash`, while preserving Codex as the default for non-design work.
- Added `gemini-3.5-flash` to the repo-local Gemini CLI catalog because the generated catalog in this clone was stale for the requested fork behavior.

## Verification

- `node --import ./src/resources/extensions/gsd/tests/resolve-ts.mjs --experimental-strip-types --test src/resources/extensions/gsd/tests/model-router.test.ts`
- `node --import ./src/resources/extensions/gsd/tests/resolve-ts.mjs --experimental-strip-types --test src/resources/extensions/gsd/tests/complexity-classifier.test.ts`
- `node --import ./src/resources/extensions/gsd/tests/resolve-ts.mjs --experimental-strip-types --test src/resources/extensions/gsd/tests/prompt-contracts.test.ts`
- `node --import ./src/resources/extensions/gsd/tests/resolve-ts.mjs --experimental-strip-types --test packages/pi-coding-agent/src/core/settings-manager-security.test.ts`

## Tool-input recovery

- Normalized milestone and slice title delimiters at the MCP executor boundary so model output like `Client/API` and `UI/UX` becomes safe GSD state text before the strict DB-backed handler validates it.
- Made `gsd_task_complete.verification` optional at the schema boundary when `verificationEvidence` is present, deriving the verification summary from evidence while still rejecting completions that provide neither.

## Verification

- `node --import ./src/resources/extensions/gsd/tests/resolve-ts.mjs --experimental-strip-types --test src/resources/extensions/gsd/tests/workflow-tool-executors.test.ts`

## Auto pause reason surface

- Changed `pauseAuto` so a missing pause context renders a diagnostic reason instead of falsely labeling the pause as user-requested.
- Passed explicit pause contexts through manual pause commands and common automatic pause paths: idle timeout, hard timeout, hook timeout, user-input wait, worktree integrity failure, tool invocation failure, verification marker, and cost guards.
- Reason: auto-mode had multiple internal `pauseAuto(ctx, pi)` callers; when those paused the run, the outcome card could show `Paused by user request.` even though the real trigger was automatic.

## Verification

- `node --import ./src/resources/extensions/gsd/tests/resolve-ts.mjs --experimental-strip-types --test src/resources/extensions/gsd/tests/auto-pause-double-entry-guard.test.ts`
- `node --import ./src/resources/extensions/gsd/tests/resolve-ts.mjs --experimental-strip-types --test src/resources/extensions/gsd/tests/auto-pause-double-entry-guard.test.ts src/resources/extensions/gsd/tests/auto-dashboard.test.ts src/resources/extensions/gsd/tests/post-unit-git-failure.test.ts`
- `npm run typecheck:extensions`
- `git diff --check`
