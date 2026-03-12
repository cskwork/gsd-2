---
estimated_steps: 4
estimated_files: 2
---

# T02: Fix README and GSD-WORKFLOW doc claims

**Slice:** S03 — Bug fixes and doc corrections
**Milestone:** M001

## Description

README.md and GSD-WORKFLOW.md contain incorrect claims about git branch lifecycle and commit patterns. README says branches are "preserved" — they're deleted after squash merge. GSD-WORKFLOW says "Branch kept", shows `checkpoint(...)` commit examples, and references checkpoint-based rollback — none of these exist in the actual code. Fix all doc claims to match actual behavior: branches deleted, auto-commits use `chore(...)` format, commit types are inferred (not always `feat`).

## Steps

1. **Fix README.md git strategy section**: (a) Change `gsd/M001/S01 (preserved)` to `gsd/M001/S01 (deleted after merge)`. (b) Replace "Per-task history preserved on branches" with accurate text about squash commits being the permanent record. (c) Update the main branch commit example to show varied commit types (not all `feat`) — e.g., `fix(M001/S03)`, `docs(M001/S04)` to demonstrate inference.
2. **Fix GSD-WORKFLOW.md branch lifecycle**: (a) Change step 4 "Branch kept — not deleted, available for per-task history" to "Branch deleted — squash commit on main is the permanent record". (b) Update the branch commit example to remove `checkpoint(...)` entries and replace with `chore(...)` auto-commit entries matching actual `autoCommit()` output.
3. **Fix GSD-WORKFLOW.md commit conventions table**: (a) Remove the `checkpoint(S01/T02): pre-task` row. (b) Add a row for auto-commits: `chore(S01/T02): auto-commit after task`. (c) Change the squash merge row from hardcoded `feat` to show that type is inferred: `type(M001/S01): <slice title>` with a note that type is inferred from title.
4. **Fix GSD-WORKFLOW.md rollback table**: Replace "Bad task → `git reset --hard` to checkpoint on the branch" with accurate rollback guidance that doesn't reference checkpoints — e.g., "Bad task → `git reset --hard HEAD~1` to previous commit on the branch".

## Must-Haves

- [ ] README.md: no occurrences of "preserved" in the git strategy section
- [ ] README.md: main branch example shows varied inferred commit types
- [ ] GSD-WORKFLOW.md: "Branch deleted" replaces "Branch kept"
- [ ] GSD-WORKFLOW.md: zero occurrences of "checkpoint" in any context
- [ ] GSD-WORKFLOW.md: commit conventions table uses `chore(...)` for auto-commits, inferred type for squash merge
- [ ] GSD-WORKFLOW.md: rollback table has no checkpoint reference

## Verification

- `grep -c 'preserved' README.md` returns 0 (in git strategy context — verify no false positives from other sections)
- `grep -c 'checkpoint' src/resources/GSD-WORKFLOW.md` returns 0
- `grep -c 'Branch kept' src/resources/GSD-WORKFLOW.md` returns 0
- `grep 'Branch deleted' src/resources/GSD-WORKFLOW.md` returns a match
- `grep 'chore(' src/resources/GSD-WORKFLOW.md` returns at least one match
- `npm run build` still passes (docs are bundled resources)

## Observability Impact

- Signals added/changed: None — pure documentation changes
- How a future agent inspects this: Read the doc files; grep for removed terms
- Failure state exposed: None

## Inputs

- `README.md` — current git strategy section at lines 253-270
- `src/resources/GSD-WORKFLOW.md` — current git strategy section at lines 548-610
- `git-service.ts` — actual behavior: `mergeSliceToMain` deletes branch, `autoCommit` produces `chore(...)` messages, `inferCommitType` determines squash merge type
- S03-RESEARCH.md — confirmed wrong claims and their line numbers

## Expected Output

- `README.md` — git strategy section reflects actual behavior (branches deleted, types inferred)
- `src/resources/GSD-WORKFLOW.md` — branch lifecycle, commit conventions, and rollback sections all match actual code behavior with zero checkpoint references
