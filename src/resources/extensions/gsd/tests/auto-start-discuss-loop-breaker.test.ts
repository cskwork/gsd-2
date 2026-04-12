/**
 * auto-start-discuss-loop-breaker.test.ts — Regression tests for stuck discuss state.
 *
 * When bootstrap auto-mode repeatedly re-enters with no active milestone and the
 * discuss flow doesn't create one, the loop-breaker warning should also clear the
 * pending discuss guard so `/gsd` is not stuck on "Discussion already in progress".
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = readFileSync(join(__dirname, "..", "auto-start.ts"), "utf-8");

test("complete-bootstrap loop-breaker clears pending discuss state (#stuck-discussion)", () => {
  const guard = "if (s.consecutiveCompleteBootstraps > MAX_CONSECUTIVE_COMPLETE_BOOTSTRAPS)";
  const guardIdx = source.indexOf(guard);
  assert.ok(guardIdx >= 0, "expected complete-bootstrap loop-breaker guard");

  const clearIdx = source.indexOf("clearPendingAutoStart(base)", guardIdx);
  assert.ok(clearIdx > guardIdx, "loop-breaker should clear pending discuss state for this project");

  const notifyIdx = source.indexOf(
    "All milestones are complete and the discussion didn't produce a new one.",
    guardIdx,
  );
  assert.ok(notifyIdx > guardIdx, "loop-breaker should emit warning message");
  assert.ok(clearIdx < notifyIdx, "pending discuss state should be cleared before warning/return");
});

test("loop-breaker uses guided-flow clearPendingAutoStart import", () => {
  const importIdx = source.indexOf('await import("./guided-flow.js")');
  assert.ok(importIdx >= 0, "expected guided-flow dynamic import for cleanup helper");
});
