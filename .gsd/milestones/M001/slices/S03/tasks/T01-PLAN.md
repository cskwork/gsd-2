---
estimated_steps: 5
estimated_files: 1
---

# T01: Fix worktree create ordering and add deterministic merge dispatch

**Slice:** S03 — Bug fixes and doc corrections
**Milestone:** M001

## Description

Fix two bugs in `worktree-command.ts`: (1) `handleCreate()` calls `createWorktree()` before `autoCommitCurrentBranch()`, meaning new worktrees fork from uncommitted HEAD — swap these so dirty state is committed first. (2) `handleMerge()` always dispatches to the LLM for merge even though `mergeWorktreeToMain()` exists as a deterministic helper — make the deterministic path the default, falling back to LLM only when a merge conflict occurs.

## Steps

1. **Add imports**: Import `mergeWorktreeToMain` from `./worktree-manager.js` and `inferCommitType` from `./git-service.js` at the top of `worktree-command.ts`.
2. **Fix handleCreate ordering (R007)**: Move the `autoCommitCurrentBranch(basePath, "worktree-switch", name)` call to occur BEFORE `createWorktree(mainBase, name)`. The `autoCommitCurrentBranch` uses `basePath` (current workspace), while `createWorktree` uses `mainBase` — no dependency conflict.
3. **Add deterministic merge path in handleMerge (R008)**: After the confirmation prompt and CWD switch (where `process.chdir(basePath)` already happens), insert a try/catch block that: (a) builds a conventional commit message using `inferCommitType(name)` and the worktree name as scope/description, (b) calls `mergeWorktreeToMain(basePath, name, commitMessage)`, (c) on success, notifies the user and returns early (skipping LLM dispatch).
4. **Add conflict fallback**: In the catch block for the deterministic merge, check if the error message indicates a merge conflict (contains "conflict" or "CONFLICT"). If so, run `git merge --abort` to clean up, then fall through to the existing LLM dispatch path with a notification that deterministic merge failed due to conflicts. If the error is NOT a conflict, surface it to the user and return (don't fall back to LLM for non-conflict errors).
5. **Verify**: Run `npm run build` to confirm compilation. Run `grep -n` to confirm ordering fix and presence of deterministic merge call.

## Must-Haves

- [ ] `autoCommitCurrentBranch()` call precedes `createWorktree()` call in `handleCreate()`
- [ ] `mergeWorktreeToMain()` attempted as first merge strategy in `handleMerge()`
- [ ] Commit message for deterministic merge uses `inferCommitType(name)` for the type
- [ ] Merge conflicts detected and handled: `git merge --abort` + LLM fallback
- [ ] Non-conflict errors surfaced to user, not silently swallowed
- [ ] `npm run build` passes

## Verification

- `npm run build` completes without errors
- `grep -n 'autoCommitCurrentBranch\|createWorktree' src/resources/extensions/gsd/worktree-command.ts` — autoCommit line number < createWorktree line number in handleCreate
- `grep -n 'mergeWorktreeToMain' src/resources/extensions/gsd/worktree-command.ts` — appears in handleMerge function
- `npm run test` — existing tests still pass (4 pre-existing failures acceptable)

## Observability Impact

- Signals added/changed: `ctx.ui.notify` messages for deterministic merge success, conflict fallback, and non-conflict errors
- How a future agent inspects this: Read the notification messages in the TUI after a merge operation
- Failure state exposed: Conflict detection triggers a visible notification before LLM fallback; non-conflict errors show the error message directly

## Inputs

- `src/resources/extensions/gsd/worktree-command.ts` — current handleCreate (lines 348-390) and handleMerge (lines 572-710) implementations
- `src/resources/extensions/gsd/worktree-manager.ts` — `mergeWorktreeToMain(basePath, name, commitMessage)` at line 379
- `src/resources/extensions/gsd/git-service.ts` — `inferCommitType(sliceTitle)` at line 354
- S03-RESEARCH.md — confirmed bug locations and existing function signatures

## Expected Output

- `src/resources/extensions/gsd/worktree-command.ts` — handleCreate has autoCommit before createWorktree; handleMerge attempts deterministic `mergeWorktreeToMain` before LLM dispatch with proper conflict handling
