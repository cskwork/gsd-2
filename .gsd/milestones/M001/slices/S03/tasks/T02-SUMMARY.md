---
id: T02
parent: S03
milestone: M001
provides:
  - README.md git strategy section reflects actual behavior (branches deleted, commit types inferred)
  - GSD-WORKFLOW.md branch lifecycle, commit conventions, and rollback sections match actual code
key_files:
  - README.md
  - src/resources/GSD-WORKFLOW.md
key_decisions:
  - README "preserved" on line 125 refers to conversation state, not git branches — left untouched (not a false positive)
patterns_established: []
observability_surfaces:
  - none
duration: 5m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T02: Fix README and GSD-WORKFLOW doc claims

**Corrected all incorrect git strategy claims in README.md and GSD-WORKFLOW.md to match actual code behavior: branches deleted after merge, auto-commits use `chore(...)` format, commit types are inferred, no checkpoint commits exist.**

## What Happened

Four targeted doc corrections across two files:

1. **README.md git strategy section**: Changed branch example from `(preserved)` to `(deleted after merge)`. Replaced "Per-task history preserved on branches" with accurate squash-commit-as-permanent-record language. Updated main branch example to show varied inferred commit types (`fix`, `docs`) instead of all `feat`.

2. **GSD-WORKFLOW.md branch lifecycle**: Changed step 4 from "Branch kept" to "Branch deleted". Replaced `checkpoint(...)` commit examples with `chore(...)` auto-commit entries matching actual `autoCommit()` output.

3. **GSD-WORKFLOW.md commit conventions table**: Removed `checkpoint(S01/T02): pre-task` row. Added `chore(S01/T02): auto-commit after task` row. Changed squash merge type from hardcoded `feat` to `type(M001/S01)` with note that type is inferred from title.

4. **GSD-WORKFLOW.md rollback table**: Replaced checkpoint-based `git reset --hard` guidance with `git reset --hard HEAD~1` to previous commit.

## Verification

All must-haves confirmed:

- `grep -n 'preserved' README.md` — only hit is line 125 (conversation context, not git strategy) ✅
- README main branch example shows `fix(M001/S03)`, `docs(M001/S04)` — varied inferred types ✅
- `grep -c 'checkpoint' src/resources/GSD-WORKFLOW.md` — returns 0 ✅
- `grep -c 'Branch kept' src/resources/GSD-WORKFLOW.md` — returns 0 ✅
- `grep 'Branch deleted' src/resources/GSD-WORKFLOW.md` — match found ✅
- `grep 'chore(' src/resources/GSD-WORKFLOW.md` — 4 matches (3 branch examples + 1 conventions table) ✅
- `npm run build` — passes ✅

Slice-level verification (final task):
- `npm run build` — passes ✅
- autoCommit (line 357) before createWorktree (line 361) ✅
- `mergeWorktreeToMain` called in handleMerge ✅
- No "preserved" in git strategy context ✅
- Zero "checkpoint" in GSD-WORKFLOW.md ✅
- Zero "Branch kept" in GSD-WORKFLOW.md ✅

## Diagnostics

None — pure documentation changes. Verify by reading the doc files or grepping for removed terms.

## Deviations

None.

## Known Issues

- Slice plan's `grep -c 'preserved' README.md` returns 1 not 0 because the word appears in an unrelated context (line 125: "conversation is preserved"). The task plan explicitly notes this as acceptable (not a false positive). The git strategy section itself has zero occurrences.

## Files Created/Modified

- `README.md` — Fixed git strategy section: branches deleted after merge, varied commit types
- `src/resources/GSD-WORKFLOW.md` — Fixed branch lifecycle, commit conventions, and rollback sections
