# S03: Bug fixes and doc corrections

**Goal:** Worktree create commits before fork, worktree merge uses deterministic helper by default (LLM fallback on conflict only), and README/GSD-WORKFLOW docs match actual branch deletion and commit behavior.
**Demo:** `npm run build` passes. `handleCreate()` calls `autoCommitCurrentBranch` before `createWorktree`. `handleMerge()` attempts `mergeWorktreeToMain()` first and only dispatches to LLM on conflict. README and GSD-WORKFLOW no longer claim branches are preserved or that checkpoint commits exist.

## Must-Haves

- `autoCommitCurrentBranch()` executes before `createWorktree()` in handleCreate (R007)
- `handleMerge()` attempts deterministic `mergeWorktreeToMain()` first; falls back to LLM dispatch only on merge conflict (R008)
- Deterministic merge path builds a conventional commit message using `inferCommitType()` (R008)
- On non-conflict errors in deterministic path, surface error to user rather than silently falling back to LLM (R008)
- README.md: branch example shows `(deleted after merge)` not `(preserved)`, removes "Per-task history preserved on branches" claim (R010)
- GSD-WORKFLOW.md: "Branch kept" → "Branch deleted after merge", checkpoint commit examples replaced with actual `chore(...)` auto-commit pattern, checkpoint row removed from commit conventions table, rollback table updated to remove checkpoint reference (R010)

## Proof Level

- This slice proves: integration
- Real runtime required: no (build + grep verification sufficient)
- Human/UAT required: no

## Verification

- `npm run build` — must pass (code changes compile)
- `npm run test` — existing tests still pass (4 pre-existing failures unrelated to this slice are acceptable)
- `grep -n 'autoCommitCurrentBranch' src/resources/extensions/gsd/worktree-command.ts` — autoCommit call appears before createWorktree call (lower line number)
- `grep -n 'mergeWorktreeToMain' src/resources/extensions/gsd/worktree-command.ts` — deterministic merge function is called in handleMerge
- `grep -c 'preserved' README.md` — returns 0 (no "preserved" claims about branches)
- `grep -c 'checkpoint' src/resources/GSD-WORKFLOW.md` — returns 0 (no checkpoint references)
- `grep -c 'Branch kept' src/resources/GSD-WORKFLOW.md` — returns 0

## Observability / Diagnostics

- Runtime signals: None — these are bug fixes to CLI command handlers and doc corrections. No new runtime signals needed.
- Inspection surfaces: `git log --oneline` on main after a merge will show correct commit types (not always `feat`). The deterministic merge path produces a notification via `ctx.ui.notify`.
- Failure visibility: Deterministic merge failure surfaces error message to user via `ctx.ui.notify`. Conflict detection triggers LLM fallback with a notification explaining why.
- Redaction constraints: None

## Integration Closure

- Upstream surfaces consumed: `worktree-manager.ts` → `mergeWorktreeToMain()`, `worktree.ts` → `autoCommitCurrentBranch()`, `git-service.ts` → `inferCommitType()`
- New wiring introduced in this slice: `handleMerge()` now calls `mergeWorktreeToMain()` directly (deterministic path) before LLM fallback; `handleCreate()` ordering corrected
- What remains before the milestone is truly usable end-to-end: S04 (remove git commands from prompts), S05 (enhanced features — merge guards, snapshots, auto-push, rich commits), S06 (cleanup and archive)

## Tasks

- [x] **T01: Fix worktree create ordering and add deterministic merge dispatch** `est:25m`
  - Why: R007 — new worktrees fork from uncommitted state (create before commit). R008 — merges always go through LLM even when deterministic helper exists and would succeed.
  - Files: `src/resources/extensions/gsd/worktree-command.ts`
  - Do: (1) In `handleCreate()`, move `autoCommitCurrentBranch()` call before `createWorktree()` call. (2) In `handleMerge()`, after confirmation and CWD switch to basePath, attempt `mergeWorktreeToMain(basePath, name, commitMessage)` first. Build commit message using `inferCommitType(name)` and worktree name. On success, notify user and return. On merge conflict (catch error, check for conflict indicators), fall back to existing LLM dispatch. On other errors, surface to user. (3) Import `mergeWorktreeToMain` from worktree-manager.ts and `inferCommitType` from git-service.ts.
  - Verify: `npm run build` passes. `grep -n` confirms ordering. `grep` confirms `mergeWorktreeToMain` called in handleMerge.
  - Done when: Build passes, autoCommit precedes createWorktree, deterministic merge attempted before LLM dispatch.

- [x] **T02: Fix README and GSD-WORKFLOW doc claims** `est:15m`
  - Why: R010 — docs claim branches are "preserved" and checkpoint commits exist, but actual code deletes branches after merge and produces `chore(...)` auto-commits instead of checkpoints.
  - Files: `README.md`, `src/resources/GSD-WORKFLOW.md`
  - Do: (1) README.md: change `gsd/M001/S01 (preserved)` to `gsd/M001/S01 (deleted after merge)`, remove "Per-task history preserved on branches" claim, update the main branch example to show inferred commit types not always `feat`. (2) GSD-WORKFLOW.md: change "Branch kept" to "Branch deleted after merge — squash commit is the permanent record", replace checkpoint commit examples with actual `chore(unitId): auto-commit after unitType` pattern, remove checkpoint row from commit conventions table, update rollback table to remove checkpoint reference, update squash merge commit example to show inferred types.
  - Verify: `grep -c 'preserved' README.md` returns 0. `grep -c 'checkpoint' src/resources/GSD-WORKFLOW.md` returns 0. `grep -c 'Branch kept' src/resources/GSD-WORKFLOW.md` returns 0.
  - Done when: All doc claims match actual code behavior. No "preserved", "checkpoint", or "Branch kept" in the corrected files.

## Files Likely Touched

- `src/resources/extensions/gsd/worktree-command.ts`
- `README.md`
- `src/resources/GSD-WORKFLOW.md`
