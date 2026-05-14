import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { closeDatabase, getAllMilestones, insertMilestone, isDbAvailable, openDatabase } from "../gsd-db.ts";
import { reconcileProjectMilestonesFromDisk } from "../auto-start.ts";

test.afterEach(() => {
  if (isDbAvailable()) closeDatabase();
});

test("#5389: bootstrap reconciles PROJECT.md milestones that are missing from DB", () => {
  const base = mkdtempSync(join(tmpdir(), "gsd-project-reconcile-"));
  try {
    mkdirSync(join(base, ".gsd"), { recursive: true });
    writeFileSync(
      join(base, ".gsd", "PROJECT.md"),
      `# Project

## Milestone Sequence
- [x] M001: Existing Milestone - Already complete
- [ ] M002: New Milestone - Should be queued
- [ ] M003: Another New Milestone - Should be queued
`,
      "utf-8",
    );

    openDatabase(join(base, ".gsd", "gsd.db"));
    insertMilestone({ id: "M001", title: "Existing Milestone", status: "complete" });

    const inserted = reconcileProjectMilestonesFromDisk(base);
    const ids = new Set(getAllMilestones().map((m) => m.id));

    assert.equal(inserted, 2);
    assert.equal(ids.has("M001"), true);
    assert.equal(ids.has("M002"), true);
    assert.equal(ids.has("M003"), true);
  } finally {
    if (isDbAvailable()) closeDatabase();
    rmSync(base, { recursive: true, force: true });
  }
});
