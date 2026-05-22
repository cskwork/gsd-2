// Project/App: GSD-2
// File Purpose: Regression tests for pending stop-capture auto-mode pauses.

import test, { mock } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { AutoSession } from "../auto/session.ts";
import { postUnitPostVerification, type PostUnitContext } from "../auto-post-unit.ts";
import { appendCapture, loadAllCaptures, loadPendingCaptures } from "../captures.ts";

function makeTempDir(prefix: string): string {
  const dir = join(
    tmpdir(),
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  mkdirSync(join(dir, ".gsd"), { recursive: true });
  execFileSync("git", ["init"], { cwd: dir, stdio: "ignore" });
  return dir;
}

function makePostUnitContext(basePath: string): {
  pctx: PostUnitContext;
  pauseAuto: ReturnType<typeof mock.fn>;
} {
  const session = new AutoSession();
  session.basePath = basePath;
  session.active = true;
  session.currentUnit = {
    type: "quick-task",
    id: "M001/CAP-test",
    startedAt: Date.now(),
  };

  const pauseAuto = mock.fn(async () => {});

  return {
    pauseAuto,
    pctx: {
      s: session,
      ctx: {
        ui: {
          notify: mock.fn(),
          setStatus: mock.fn(),
          setWidget: mock.fn(),
          setFooter: mock.fn(),
        },
        model: { id: "test-model" },
      } as unknown as PostUnitContext["ctx"],
      pi: {
        sendMessage: mock.fn(),
        setModel: mock.fn(async () => true),
      } as unknown as PostUnitContext["pi"],
      buildSnapshotOpts: () => ({}),
      lockBase: () => basePath,
      stopAuto: mock.fn(async () => {}) as unknown as PostUnitContext["stopAuto"],
      pauseAuto: pauseAuto as unknown as PostUnitContext["pauseAuto"],
      updateProgressWidget: mock.fn() as unknown as PostUnitContext["updateProgressWidget"],
    },
  };
}

test("postUnitPostVerification consumes pending stop capture after pausing once", async (t) => {
  const basePath = makeTempDir("gsd-fast-stop-capture");
  t.after(() => rmSync(basePath, { recursive: true, force: true }));

  const captureId = appendCapture(basePath, "pause after this task");
  const { pctx, pauseAuto } = makePostUnitContext(basePath);

  const result = await postUnitPostVerification(pctx);

  assert.equal(result, "stopped");
  assert.equal(pauseAuto.mock.callCount(), 1);
  assert.deepEqual(pauseAuto.mock.calls[0].arguments[2], {
    message: `Stop directive detected in pending capture ${captureId}: "pause after this task".`,
    category: "aborted",
    stopReason: "stop-directive-capture",
  });
  assert.equal(loadPendingCaptures(basePath).length, 0);

  const [capture] = loadAllCaptures(basePath);
  assert.equal(capture.id, captureId);
  assert.equal(capture.status, "resolved");
  assert.equal(capture.classification, "stop");
  assert.equal(capture.executed, true);
});
