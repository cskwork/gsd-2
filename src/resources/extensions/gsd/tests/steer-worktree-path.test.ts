// GSD Extension - Steer Worktree Path Resolution Test
// Regression test for #3476: /gsd steer must write overrides to the worktree .gsd/,
// not the project root .gsd/, when a worktree is active.

import { describe, test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { appendOverride, loadActiveOverrides } from "../files.ts";

describe("steer worktree path resolution (#3476)", () => {
  let projectRoot: string;
  let worktreePath: string;

  beforeEach(() => {
    projectRoot = mkdtempSync(join(tmpdir(), "gsd-steer-wt-"));
    mkdirSync(join(projectRoot, ".gsd"), { recursive: true });

    // Simulate a worktree with its own .gsd directory
    worktreePath = join(projectRoot, ".gsd", "worktrees", "M001");
    mkdirSync(join(worktreePath, ".gsd"), { recursive: true });
  });

  afterEach(() => {
    rmSync(projectRoot, { recursive: true, force: true });
  });

  test("appendOverride writes to worktree .gsd/ when worktree path is used", async () => {
    await appendOverride(worktreePath, "Use Postgres instead of SQLite", "M001/S01/T01");

    // Override should be in the worktree .gsd/
    const wtOverrides = join(worktreePath, ".gsd", "OVERRIDES.md");
    assert.ok(existsSync(wtOverrides), "override file exists in worktree .gsd/");

    const content = readFileSync(wtOverrides, "utf-8");
    assert.ok(content.includes("Use Postgres instead of SQLite"), "override content is correct");

    // Override should NOT be in the project root .gsd/
    const rootOverrides = join(projectRoot, ".gsd", "OVERRIDES.md");
    assert.ok(!existsSync(rootOverrides), "no override file in project root .gsd/");
  });

  test("loadActiveOverrides reads from worktree .gsd/ when worktree path is used", async () => {
    await appendOverride(worktreePath, "Switch to JWT auth", "M001/S02/T01");

    // Loading from worktree should find the override
    const wtOverrides = await loadActiveOverrides(worktreePath);
    assert.equal(wtOverrides.length, 1, "one active override in worktree");
    assert.equal(wtOverrides[0].change, "Switch to JWT auth");

    // Loading from project root should find nothing
    const rootOverrides = await loadActiveOverrides(projectRoot);
    assert.equal(rootOverrides.length, 0, "no overrides in project root");
  });

  test("appendOverride falls back to project root when no worktree exists", async () => {
    await appendOverride(projectRoot, "Use Redis cache", "M001/S01/T01");

    const rootOverrides = join(projectRoot, ".gsd", "OVERRIDES.md");
    assert.ok(existsSync(rootOverrides), "override file exists in project root .gsd/");

    const content = readFileSync(rootOverrides, "utf-8");
    assert.ok(content.includes("Use Redis cache"), "override content is correct");
  });
});
