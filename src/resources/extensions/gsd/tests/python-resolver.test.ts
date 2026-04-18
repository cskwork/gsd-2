import { describe, test } from "node:test";
import assert from "node:assert/strict";

// Regression tests for #4416: python invocation normalization for Windows.
// These tests import from python-resolver.ts which is created as part of the fix.
import { normalizePythonCommand, detectPythonExecutable } from "../python-resolver.ts";

describe("normalizePythonCommand", () => {
  test("passes through command that does not start with python", () => {
    assert.equal(normalizePythonCommand("npm run test"), "npm run test");
  });

  test("passes through empty string", () => {
    assert.equal(normalizePythonCommand(""), "");
  });

  test("passes through non-python shell commands unchanged", () => {
    assert.equal(normalizePythonCommand("node index.js"), "node index.js");
    assert.equal(normalizePythonCommand("npx tsc --noEmit"), "npx tsc --noEmit");
  });

  test("passes through command unchanged when no python is detected", () => {
    // We cannot fully mock detectPythonExecutable here without a mock framework,
    // but we can verify that a command without python tokens is always preserved.
    const cmd = "cargo test";
    assert.equal(normalizePythonCommand(cmd), cmd);
  });

  test("returns a string for python3 command on this system", () => {
    // After normalization the result must still be a valid shell command string.
    const result = normalizePythonCommand("python3 -m pytest");
    assert.equal(typeof result, "string");
    assert.ok(result.length > 0);
    // After rewrite the string must still contain the original arguments.
    assert.ok(result.includes("-m pytest"), `Expected arguments preserved in: ${result}`);
  });

  test("returns a string for python command on this system", () => {
    const result = normalizePythonCommand("python manage.py migrate");
    assert.equal(typeof result, "string");
    assert.ok(result.includes("manage.py migrate"), `Expected arguments preserved in: ${result}`);
  });

  test("preserves arguments after compound && chain", () => {
    const result = normalizePythonCommand("echo ok && python3 -m pytest --tb=short");
    assert.equal(typeof result, "string");
    assert.ok(result.includes("-m pytest --tb=short"), `Expected arguments preserved in: ${result}`);
  });
});

describe("detectPythonExecutable", () => {
  test("returns a string or null — never throws", () => {
    let result: string | null | undefined;
    assert.doesNotThrow(() => {
      result = detectPythonExecutable();
    });
    assert.ok(result === null || typeof result === "string");
  });

  test("return value is a known python invocation form or null", () => {
    const result = detectPythonExecutable();
    const valid = [null, "python3", "python", "py -3"];
    assert.ok(
      valid.includes(result as string | null),
      `Expected one of ${valid.join(", ")}, got: ${String(result)}`,
    );
  });

  test("returns the same value on repeated calls (cached)", () => {
    const first = detectPythonExecutable();
    const second = detectPythonExecutable();
    assert.equal(first, second, "detectPythonExecutable must return consistent cached result");
  });
});
