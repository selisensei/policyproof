import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import liveFixture from "@/src/fixtures/evaluation/live-gpt56-northstar.json";
import { parseLiveAnalysisArtifact, validateAndRunLivePipeline } from "@/src/evaluation/live-validation";

const artifactPath = resolve("test-results/live-gpt56/final-case-analysis.json");

describe.skipIf(!existsSync(artifactPath))("captured live GPT-5.6 artifact", () => {
  it("reloads the saved response and validates evidence through the deterministic engine", () => {
    const serialized = readFileSync(artifactPath, "utf8");
    const artifact = parseLiveAnalysisArtifact(serialized);
    const validated = validateAndRunLivePipeline(artifact, liveFixture);

    expect(artifact.httpStatus).toBe(200);
    expect(artifact.response.analysis.documentFindings).toHaveLength(5);
    expect(validated.results).toHaveLength(7);
    expect(validated.summary).toMatchObject({ total: 7, PASS: 3, FAIL: 2, MISSING: 1, WARNING: 1 });
    expect(serialized).not.toMatch(/sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}/i);
    expect(serialized).not.toMatch(/Bearer\s+[A-Za-z0-9._-]{20,}/i);
    expect(serialized).not.toMatch(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/);
  });
});
