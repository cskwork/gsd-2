// GSD2 — Exec (context-mode) tool registration.
//
// Exposes the `gsd_exec` tool over MCP. Opt-in: disabled unless
// `context_mode.enabled: true` is set in preferences.

import { Type } from "@sinclair/typebox";
import type { ExtensionAPI } from "@gsd/pi-coding-agent";

import { executeGsdExec } from "../tools/exec-tool.js";
import { loadEffectiveGSDPreferences } from "../preferences.js";
import { logWarning } from "../workflow-logger.js";

export function registerExecTools(pi: ExtensionAPI): void {
  pi.registerTool({
    name: "gsd_exec",
    label: "Exec (Sandboxed)",
    description:
      "Run a short script (bash/node/python) in a subprocess. Full stdout/stderr persist to " +
      ".gsd/exec/<id>.{stdout,stderr,meta.json}; only a short digest returns in context. Use " +
      "this instead of reading many files or emitting large tool outputs — e.g. have the script " +
      "count/grep/summarize and log the finding. Opt-in via preferences.context_mode.enabled.",
    promptSnippet:
      "Run a bash/node/python script in a sandbox; full output is saved to disk and only a digest returns",
    promptGuidelines: [
      "Prefer gsd_exec for analyses that would otherwise read >3 files or produce large tool output.",
      "Write scripts that log the finding (counts, matches, summaries) rather than raw dumps.",
      "The digest is the last ~300 chars of stdout — size your log output accordingly.",
      "Need the full output? Read the stdout_path returned in details (file on local disk).",
    ],
    parameters: Type.Object({
      runtime: Type.Union(
        [Type.Literal("bash"), Type.Literal("node"), Type.Literal("python")],
        { description: "Interpreter: bash (-c), node (-e), or python3 (-c)." },
      ),
      script: Type.String({ description: "Script body. Keep output small (log the finding, not the data)." }),
      purpose: Type.Optional(Type.String({ description: "Short label recorded in meta.json for later review." })),
      timeout_ms: Type.Optional(
        Type.Number({
          description: "Per-invocation timeout (ms). Capped at 600000. Default from preferences.",
          minimum: 1_000,
          maximum: 600_000,
        }),
      ),
    }),
    async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
      let prefs: Awaited<ReturnType<typeof loadEffectiveGSDPreferences>> | null = null;
      try {
        prefs = loadEffectiveGSDPreferences();
      } catch (err) {
        logWarning("tool", `gsd_exec could not load preferences: ${err instanceof Error ? err.message : String(err)}`);
      }
      return executeGsdExec(params as Parameters<typeof executeGsdExec>[0], {
        baseDir: process.cwd(),
        preferences: prefs?.preferences ?? null,
      });
    },
  });
}
