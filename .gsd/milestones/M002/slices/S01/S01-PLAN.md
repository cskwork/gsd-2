# S01: Secret Forecasting & Manifest

**Goal:** Establish the secrets manifest format, types, parser/writer, and planning prompt instructions so that milestone planning produces a parseable `M00x-SECRETS.md` file with predicted API keys and step-by-step guidance.
**Demo:** Running `plan-milestone` on a project involving external APIs produces a `.gsd/milestones/M00x/M00x-SECRETS.md` manifest file. The manifest parser handles well-formed, edge-case, and empty-secrets output. The template loads with the new `secretsOutputPath` variable. Build and all tests pass.

## Must-Haves

- `SecretsManifestEntry` and `SecretsManifest` interfaces in `types.ts` with key, service, dashboardUrl, guidance (string[]), formatHint, status (`pending`/`collected`/`skipped`), and destination fields
- `parseSecretsManifest()` in `files.ts` — forgiving regex-based parser using existing `extractSection`/`extractBoldField`/`parseBullets` helpers
- `formatSecretsManifest()` in `files.ts` — round-trip writer producing the canonical manifest markdown
- `templates/secrets-manifest.md` template defining the manifest format
- Parser tests covering: full manifest, single-key manifest, no-secrets manifest, missing optional fields, status values
- `plan-milestone.md` and `guided-plan-milestone.md` updated with secret forecasting instructions
- `buildPlanMilestonePrompt()` in `auto.ts` passes `secretsOutputPath` template variable
- `npm run build` passes
- `npm run test` passes (no new failures)

## Proof Level

- This slice proves: contract
- Real runtime required: no (parser/writer tested with fixture data; prompt instructions verified by template loading)
- Human/UAT required: no (prompt compliance tested in S04 end-to-end)

## Verification

- `npm run test` — all existing tests plus new manifest parser tests pass
- `npm run build` — TypeScript compilation succeeds with new types/functions
- Manifest parser tests in `src/resources/extensions/gsd/tests/parsers.test.ts` covering:
  - Full manifest with multiple keys parses correctly
  - Single-key manifest parses correctly
  - No-secrets / empty manifest returns zero entries
  - Missing optional fields (dashboardUrl, formatHint) default gracefully
  - Status field parses all three values (`pending`/`collected`/`skipped`)
  - Round-trip: `formatSecretsManifest(parseSecretsManifest(content))` preserves semantic content

## Observability / Diagnostics

- Runtime signals: none — this is a parser/formatter contract, no runtime behavior
- Inspection surfaces: parser tests exercise all code paths; `parseSecretsManifest` returns typed objects that are directly inspectable
- Failure visibility: parser returns empty arrays for unparseable sections rather than throwing, matching `parseRoadmap` convention; malformed entries are silently skipped
- Redaction constraints: none — manifest contains key names and guidance, not actual secret values

## Integration Closure

- Upstream surfaces consumed: `extractSection`, `extractAllSections`, `extractBoldField`, `parseBullets` from `files.ts`; `resolveMilestoneFile` from `paths.ts`; `loadPrompt` from `prompt-loader.ts`
- New wiring introduced in this slice: `buildPlanMilestonePrompt()` passes `secretsOutputPath` to the prompt template; prompt templates instruct LLM to write the manifest file
- What remains before the milestone is truly usable end-to-end: S02 (enhanced collection UX with guidance display), S03 (auto-mode dispatches collect-secrets phase), S04 (end-to-end verification with real LLM planning)

## Tasks

- [x] **T01: Manifest types, parser/writer, template, and tests** `est:45m`
  - Why: Establishes the contract that S02 and S03 depend on — types, parsing, formatting, and the template file. Tests prove the parser handles LLM output variations correctly.
  - Files: `src/resources/extensions/gsd/types.ts`, `src/resources/extensions/gsd/files.ts`, `src/resources/extensions/gsd/templates/secrets-manifest.md`, `src/resources/extensions/gsd/tests/parsers.test.ts`
  - Do: Add `SecretsManifestEntry` and `SecretsManifest` interfaces to `types.ts`. Implement `parseSecretsManifest()` and `formatSecretsManifest()` in `files.ts` using existing helpers. Create `templates/secrets-manifest.md`. Add comprehensive parser tests to `parsers.test.ts`. Parser must be forgiving — regex-based, tolerant of whitespace and missing optional fields.
  - Verify: `npm run build` passes, `npm run test` passes with new manifest parser tests
  - Done when: `parseSecretsManifest` correctly parses full, single-key, empty, and edge-case manifests; `formatSecretsManifest` produces valid markdown; round-trip preserves data; build succeeds

- [x] **T02: Planning prompt modifications and auto.ts wiring** `est:30m`
  - Why: Without prompt instructions, the LLM won't forecast secrets during planning. Without the template variable, the prompt can't tell the LLM where to write the manifest. This delivers R001 and R009.
  - Files: `src/resources/extensions/gsd/prompts/plan-milestone.md`, `src/resources/extensions/gsd/prompts/guided-plan-milestone.md`, `src/resources/extensions/gsd/auto.ts`, `src/resources/extensions/gsd/guided-flow.ts`
  - Do: Append secret forecasting instructions section to both prompt templates with `{{secretsOutputPath}}` variable. Update `buildPlanMilestonePrompt()` to compute and pass `secretsOutputPath`. Update guided flow's `loadPrompt` call to also pass `secretsOutputPath`. Instructions must be clearly separated from roadmap instructions, conditional on external APIs ("skip if no external services"), and reference the template format.
  - Verify: `npm run build` passes, `npm run test` passes, `loadPrompt("plan-milestone", {...})` succeeds with the new variable
  - Done when: Both prompt templates contain forecasting instructions, `buildPlanMilestonePrompt` and guided flow pass `secretsOutputPath`, build and all tests pass

## Files Likely Touched

- `src/resources/extensions/gsd/types.ts`
- `src/resources/extensions/gsd/files.ts`
- `src/resources/extensions/gsd/templates/secrets-manifest.md`
- `src/resources/extensions/gsd/tests/parsers.test.ts`
- `src/resources/extensions/gsd/prompts/plan-milestone.md`
- `src/resources/extensions/gsd/prompts/guided-plan-milestone.md`
- `src/resources/extensions/gsd/auto.ts`
- `src/resources/extensions/gsd/guided-flow.ts`
