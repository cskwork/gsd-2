---
estimated_steps: 5
estimated_files: 4
---

# T02: Planning prompt modifications and auto.ts wiring

**Slice:** S01 — Secret Forecasting & Manifest
**Milestone:** M002

## Description

Modify the milestone planning prompts to instruct the LLM to forecast which external API keys a milestone will need and write a secrets manifest file. Wire the `secretsOutputPath` template variable through `buildPlanMilestonePrompt()` so the prompt can tell the LLM where to write the manifest. This delivers R001 (secret forecasting) and R009 (planning prompts instruct forecasting).

## Steps

1. **Append secret forecasting section to `plan-milestone.md`** — Add a new section after the existing Planning Doctrine section (before the final `When done` line). The section should: instruct the LLM to analyze each slice and its boundary map for external service dependencies; tell it to write a `{{secretsOutputPath}}` file using the format from `~/.gsd/agent/extensions/gsd/templates/secrets-manifest.md`; include clear skip instruction ("If this milestone does not require any external API keys or secrets, skip this step entirely — do not create an empty manifest"); reference the template for format guidance; and emphasize that guidance should include dashboard URL, numbered navigation steps, and format hints.

2. **Append equivalent instructions to `guided-plan-milestone.md`** — Same forecasting instructions adapted for the guided flow format (single paragraph, no inlined context). Include the `{{secretsOutputPath}}` variable. Keep the instruction self-contained.

3. **Update `buildPlanMilestonePrompt()` in `auto.ts`** — Compute `secretsOutputPath` using `relMilestoneFile(base, mid, "SECRETS")`. The file won't exist yet (it's being created by the LLM during planning), so use the relative path format `milestoneId + "-SECRETS.md"` resolved to the milestone directory. Add `secretsOutputPath` to the vars object passed to `loadPrompt("plan-milestone", {...})`.

4. **Update guided flow in `guided-flow.ts`** — The guided flow's `loadPrompt("guided-plan-milestone", {...})` call at ~line 612 currently passes only `milestoneId` and `milestoneTitle`. Add `secretsOutputPath` to this vars object, computed the same way as in auto.ts. This ensures the guided `/gsd` wizard also tells the LLM to write the manifest.

5. **Verify full build and test suite** — Run `npm run build` to confirm TypeScript compiles with all changes. Run `npm run test` to confirm no regressions. Manually verify `loadPrompt("plan-milestone", {...})` won't throw by confirming all `{{vars}}` in the template have matching keys in the vars object.

## Must-Haves

- [ ] `plan-milestone.md` contains secret forecasting instructions with `{{secretsOutputPath}}` variable
- [ ] `guided-plan-milestone.md` contains equivalent secret forecasting instructions with `{{secretsOutputPath}}`
- [ ] `buildPlanMilestonePrompt()` computes and passes `secretsOutputPath` to `loadPrompt`
- [ ] Instructions clearly say to skip manifest creation when no external APIs are needed
- [ ] Instructions reference the `secrets-manifest.md` template
- [ ] `guided-flow.ts` passes `secretsOutputPath` to the guided plan-milestone prompt
- [ ] `npm run build` passes
- [ ] `npm run test` passes (no new failures)

## Verification

- `npm run build` — TypeScript compiles cleanly
- `npm run test` — all existing + new parser tests pass
- Grep `plan-milestone.md` for `{{secretsOutputPath}}` — present
- Grep `guided-plan-milestone.md` for `{{secretsOutputPath}}` — present
- Grep `auto.ts` `buildPlanMilestonePrompt` for `secretsOutputPath` — present in vars object

## Observability Impact

- Signals added/changed: None — prompt template changes have no runtime signals
- How a future agent inspects this: Read the prompt templates to see forecasting instructions; read `auto.ts` to see the variable wiring
- Failure state exposed: `loadPrompt` throws with a clear error message if `{{secretsOutputPath}}` is declared in the template but not provided in vars — this is the existing prompt-loader safeguard

## Inputs

- `src/resources/extensions/gsd/prompts/plan-milestone.md` — existing prompt to extend
- `src/resources/extensions/gsd/prompts/guided-plan-milestone.md` — existing guided prompt to extend
- `src/resources/extensions/gsd/auto.ts` — `buildPlanMilestonePrompt()` at ~line 1347
- `src/resources/extensions/gsd/guided-flow.ts` — guided flow `loadPrompt` call at ~line 612
- `src/resources/extensions/gsd/templates/secrets-manifest.md` — template created in T01 (referenced by prompt instructions)
- T01 output: types and parser are in place, template exists

## Expected Output

- `src/resources/extensions/gsd/prompts/plan-milestone.md` — extended with secret forecasting section
- `src/resources/extensions/gsd/prompts/guided-plan-milestone.md` — extended with secret forecasting instructions
- `src/resources/extensions/gsd/auto.ts` — `buildPlanMilestonePrompt()` passes `secretsOutputPath` variable
- `src/resources/extensions/gsd/guided-flow.ts` — guided flow passes `secretsOutputPath` to prompt
