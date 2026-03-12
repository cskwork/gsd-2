---
id: T01
parent: S03
milestone: M001
provides:
  - handleCreate commits dirty state before forking worktree
  - handleMerge uses deterministic squash-merge before LLM fallback
key_files:
  - src/resources/extensions/gsd/worktree-command.ts
key_decisions:
  - Deterministic merge builds commit message as `{inferCommitType(name)}({name}): merge worktree {name}` — uses worktree name both as scope and as input to type inference
  - Non-conflict merge errors surface directly to user and do not fall back to LLM (only conflicts trigger fallback)
patterns_established:
  - Deterministic-first with LLM fallback: try the fast/predictable path, catch specific failure class (conflicts), fall back to LLM only for that class
observability_surfaces:
  - ctx.ui.notify messages distinguish deterministic merge success, conflict-triggered LLM fallback, and non-conflict errors
duration: 12m
verification_result: passed
completed_at: 2026-03-12
blocker_discovered: false
---

# T01: Fix worktree create ordering and add deterministic merge dispatch

**Fixed handleCreate to commit before forking and handleMerge to use deterministic squash-merge with conflict-aware LLM fallback.**

## What Happened

1. Added imports: `mergeWorktreeToMain` from worktree-manager.js, `inferCommitType` from git-service.js, `execSync` from node:child_process.
2. In `handleCreate()`, moved `autoCommitCurrentBranch()` call (now line 357) before `createWorktree()` call (now line 361). This ensures dirty working state is committed before the new worktree forks from HEAD.
3. In `handleMerge()`, after the confirmation prompt and CWD switch to basePath, inserted a deterministic merge attempt using `mergeWorktreeToMain(basePath, name, commitMessage)`. The commit message is built as `{inferCommitType(name)}({name}): merge worktree {name}`.
4. On success, the user is notified with file/line stats and the merge returns early (skipping LLM dispatch entirely).
5. On conflict (error message matches `/conflict/i`), `git merge --abort` cleans up the failed merge, a warning notification explains the fallback, and execution continues to the existing LLM dispatch path.
6. On non-conflict errors, the error is surfaced directly to the user and the function returns without LLM fallback.

## Verification

- `npm run build` — passes clean
- `npm run test` — 114 pass, 4 fail (pre-existing, unrelated)
- `grep -n` confirms `autoCommitCurrentBranch` at line 357 precedes `createWorktree` at line 361 in handleCreate
- `grep -n` confirms `mergeWorktreeToMain` called at line 676 inside handleMerge
- All 6 must-haves from the task plan verified

### Slice-level checks (T01 scope):
- ✅ `npm run build` passes
- ✅ `npm run test` — 114/118 pass (4 pre-existing failures)
- ✅ autoCommitCurrentBranch line < createWorktree line in handleCreate
- ✅ mergeWorktreeToMain appears in handleMerge
- ⏳ `grep -c 'preserved' README.md` — not yet addressed (T02 scope)
- ⏳ `grep -c 'checkpoint' src/resources/GSD-WORKFLOW.md` — not yet addressed (T02 scope)
- ⏳ `grep -c 'Branch kept' src/resources/GSD-WORKFLOW.md` — not yet addressed (T02 scope)

## Diagnostics

After a `/worktree merge` operation, inspect the TUI notification messages:
- **Deterministic success**: shows "✓ Merged {name} → {mainBranch} (deterministic squash)" with commit message
- **Conflict fallback**: shows "Deterministic merge hit conflicts — falling back to LLM-guided merge."
- **Non-conflict error**: shows "Failed to merge: {error message}"

## Deviations

None.

## Known Issues

None.

## Files Created/Modified

- `src/resources/extensions/gsd/worktree-command.ts` — Reordered handleCreate (autoCommit before createWorktree), added deterministic merge path in handleMerge with conflict-aware LLM fallback, added imports for mergeWorktreeToMain, inferCommitType, and execSync
