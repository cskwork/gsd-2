---
estimated_steps: 5
estimated_files: 4
---

# T01: Manifest types, parser/writer, template, and tests

**Slice:** S01 — Secret Forecasting & Manifest
**Milestone:** M002

## Description

Establish the complete secrets manifest contract: TypeScript interfaces for manifest entries and the manifest itself, a forgiving regex-based parser, a canonical markdown writer, a template file defining the format, and comprehensive tests proving the parser handles LLM output variations. This is the foundation that S02 (collection UX) and S03 (auto-mode integration) depend on.

## Steps

1. **Add types to `types.ts`** — Define `SecretsManifestEntryStatus` literal union (`'pending' | 'collected' | 'skipped'`), `SecretsManifestEntry` interface (key, service, dashboardUrl, guidance: string[], formatHint, status, destination), and `SecretsManifest` interface (milestone, generatedAt, entries: SecretsManifestEntry[]). Place after the existing `Roadmap`/`SlicePlan` types section.

2. **Create `templates/secrets-manifest.md`** — Define the canonical manifest format with H1 title, bold metadata fields (Milestone, Generated), and H3 sections per key containing bold fields (Service, Dashboard, Format hint, Status, Destination) and a numbered Guidance list. Include comments explaining the format for both LLM and human readers.

3. **Implement `parseSecretsManifest()` in `files.ts`** — Use `extractAllSections(content, 3)` to find per-key sections. For each H3 section: extract the env var name from the heading (e.g. `### OPENAI_API_KEY`), use `extractBoldField` for service/dashboardUrl/formatHint/status/destination, and extract the Guidance subsection's numbered list. Default missing optional fields gracefully (empty string for dashboardUrl/formatHint, `'pending'` for status, `'dotenv'` for destination). Extract milestone and generatedAt from the top-level bold fields.

4. **Implement `formatSecretsManifest()` in `files.ts`** — Write the manifest back to canonical markdown format matching the template. H1 with "Secrets Manifest", bold Milestone and Generated fields, then H3 sections per entry with all fields and numbered guidance steps.

5. **Add parser tests to `parsers.test.ts`** — Following the existing `assert`/`assertEq` pattern: (a) full manifest with 3 keys — verify all fields parse, (b) single-key manifest — verify it works, (c) empty/no-secrets manifest with no H3 sections — returns empty entries array, (d) missing optional fields (no Dashboard, no Format hint) — defaults correctly, (e) all three status values parse, (f) round-trip test — `formatSecretsManifest(parseSecretsManifest(content))` then re-parse and compare fields.

## Must-Haves

- [ ] `SecretsManifestEntry` and `SecretsManifest` interfaces exported from `types.ts`
- [ ] `parseSecretsManifest()` exported from `files.ts` — forgiving, regex-based, uses existing helpers
- [ ] `formatSecretsManifest()` exported from `files.ts` — produces canonical markdown
- [ ] `templates/secrets-manifest.md` exists with the canonical format
- [ ] Parser handles missing optional fields without throwing
- [ ] Parser returns empty entries array for manifests with no keys
- [ ] All parser tests pass
- [ ] `npm run build` passes

## Verification

- `npm run build` — TypeScript compiles with new types and functions
- `npm run test` — all tests pass, including new manifest parser tests
- New test output shows: full manifest parse, single-key, empty, missing fields, status values, round-trip

## Observability Impact

- Signals added/changed: None — pure data contract, no runtime behavior
- How a future agent inspects this: Read `types.ts` for interfaces, read `templates/secrets-manifest.md` for format, run parser tests for validation
- Failure state exposed: Parser returns empty/default values for unparseable sections rather than throwing — consistent with `parseRoadmap` convention

## Inputs

- `src/resources/extensions/gsd/types.ts` — existing type definitions to extend
- `src/resources/extensions/gsd/files.ts` — existing parsing helpers to reuse (`extractSection`, `extractAllSections`, `extractBoldField`, `parseBullets`)
- `src/resources/extensions/gsd/tests/parsers.test.ts` — existing test file pattern to follow
- `src/resources/extensions/get-secrets-from-user.ts` — reference for key schema (`{ key, hint, required }`) for forward-compatibility

## Expected Output

- `src/resources/extensions/gsd/types.ts` — extended with `SecretsManifestEntryStatus`, `SecretsManifestEntry`, `SecretsManifest`
- `src/resources/extensions/gsd/files.ts` — extended with `parseSecretsManifest()` and `formatSecretsManifest()`
- `src/resources/extensions/gsd/templates/secrets-manifest.md` — new template file
- `src/resources/extensions/gsd/tests/parsers.test.ts` — extended with manifest parser test suite
