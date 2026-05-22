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
