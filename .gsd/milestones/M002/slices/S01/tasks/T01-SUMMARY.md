---
id: T01
parent: S01
milestone: M002
provides:
  - SecretsManifestEntry and SecretsManifest types
  - parseSecretsManifest() parser
  - formatSecretsManifest() writer
  - secrets-manifest.md template
key_files:
  - src/resources/extensions/gsd/types.ts
  - src/resources/extensions/gsd/files.ts
  - src/resources/extensions/gsd/templates/secrets-manifest.md
  - src/resources/extensions/gsd/tests/parsers.test.ts
key_decisions:
  - Numbered list extraction via regex rather than reusing parseBullets (which strips numbers)
patterns_established:
  - Secrets manifest uses H3 headings per env var key with bold metadata fields
  - Parser defaults missing optional fields (dashboardUrl, formatHint → empty string; status → pending; destination → dotenv)
  - Invalid status values silently default to pending
observability_surfaces:
  - Parser tests exercise all code paths — 312 assertions across 7 manifest test groups
duration: 15min
verification_result: passed
completed_at: 2026-03-12T19:40:00Z
blocker_discovered: false
---

# T01: Manifest types, parser/writer, template, and tests

**Added SecretsManifest types, forgiving parser, canonical formatter, template file, and 7 test groups (312 assertions) to the GSD extension.**

## What Happened

Added `SecretsManifestEntryStatus`, `SecretsManifestEntry`, and `SecretsManifest` interfaces to `types.ts`. Implemented `parseSecretsManifest()` using existing `extractAllSections(content, 3)`, `extractBoldField`, and regex-based numbered list extraction. Implemented `formatSecretsManifest()` that produces canonical markdown with conditional Dashboard/Format hint fields. Created `templates/secrets-manifest.md` with the canonical format and inline comments. Added 7 test groups to `parsers.test.ts`: full 3-key manifest, single-key, empty/no-secrets, missing optional fields, all three status values, invalid status defaulting, and round-trip parse→format→re-parse.

## Verification

- `npm run build` — passes clean
- `npm run test` — parsers.test.ts: 312 passed, 0 failed. All 7 manifest test groups pass.
- Pre-existing 2 failures in `app-smoke.test.ts` (AGENTS.md sync) are unrelated

## Diagnostics

Parser tests are the inspection surface. Run `npm run test` and look for `parseSecretsManifest` test groups. Parser returns empty arrays for unparseable sections and defaults missing fields rather than throwing.

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/resources/extensions/gsd/types.ts` — added SecretsManifestEntryStatus, SecretsManifestEntry, SecretsManifest types
- `src/resources/extensions/gsd/files.ts` — added parseSecretsManifest() and formatSecretsManifest() with imports
- `src/resources/extensions/gsd/templates/secrets-manifest.md` — new canonical manifest template
- `src/resources/extensions/gsd/tests/parsers.test.ts` — added 7 manifest parser/formatter test groups
