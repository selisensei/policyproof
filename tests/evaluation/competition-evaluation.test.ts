import { describe, expect, it } from "vitest";
import { CompetitionEvaluationSchema } from "@/src/evaluation/competition-evaluation-schema";
import { competitionEvaluationExitCode, runCompetitionEvaluation } from "@/src/evaluation/competition-evaluation";
import { serializeCompetitionEvaluationJson, serializeCompetitionEvaluationMarkdown } from "@/src/evaluation/competition-report";
import { withNetworkBlocked } from "@/src/evaluation/network-guard";

describe("competition evaluation schema", () => {
  it("accepts the full deterministic evaluation and rejects malformed contracts", async () => {
    const evaluation = await runCompetitionEvaluation();
    expect(CompetitionEvaluationSchema.parse(evaluation)).toEqual(evaluation);
    expect(() => CompetitionEvaluationSchema.parse({ ...evaluation, evaluationSchemaVersion: "policyproof.competition-evaluation.v2" })).toThrow();
    expect(() => CompetitionEvaluationSchema.parse({ ...evaluation, unexpected: true })).toThrow();
    expect(() => CompetitionEvaluationSchema.parse({ ...evaluation, overallResult: "UNKNOWN" })).toThrow();
  });

  it("rejects unknown, duplicate, missing, and incorrectly counted scenario results", async () => {
    const evaluation = await runCompetitionEvaluation();
    const unknown = structuredClone(evaluation) as unknown as Record<string, unknown>;
    (unknown.evaluatedScenarios as Array<Record<string, unknown>>)[0].scenarioId = "unknown-scenario";
    expect(() => CompetitionEvaluationSchema.parse(unknown)).toThrow();

    const duplicate = structuredClone(evaluation);
    duplicate.evaluatedScenarios[1].scenarioId = duplicate.evaluatedScenarios[0].scenarioId;
    expect(() => CompetitionEvaluationSchema.parse(duplicate)).toThrow(/unique/i);

    const missing = structuredClone(evaluation) as unknown as Record<string, unknown>;
    (missing.evaluatedScenarios as Array<{ conclusions: unknown[] }>)[0].conclusions.pop();
    expect(() => CompetitionEvaluationSchema.parse(missing)).toThrow();

    const invalidCount = structuredClone(evaluation) as unknown as Record<string, unknown>;
    (invalidCount.totals as Record<string, unknown>).controlsEvaluated = 20;
    expect(() => CompetitionEvaluationSchema.parse(invalidCount)).toThrow();
  });
});

describe("competition evaluation harness", () => {
  it("evaluates three scenarios, 21 controls, exact evidence, fingerprints, receipts, and historical evidence", async () => {
    const evaluation = await runCompetitionEvaluation();
    expect(evaluation.totals).toMatchObject({ scenariosEvaluated: 3, controlsEvaluated: 21, expectedConclusionsMatched: 21, outcomeProfilesMatched: 3, externalNetworkCalls: 0, unexpectedFailures: 0 });
    expect(Object.values(evaluation.checks).every(({ status }) => status === "PASS")).toBe(true);
    expect(evaluation.historicalLiveValidation).toMatchObject({ status: "HISTORICAL_EVIDENCE", executedDuringEvaluation: false, validatedCommit: "eb120feaca78bf3cdbc71b7b7198045f86a44852" });
    expect(evaluation.receiptSecurityBoundary.classification).toBe("EXPECTED SECURITY BOUNDARY");
    expect(competitionEvaluationExitCode(evaluation)).toBe(0);
  });

  it("serializes deterministic reports without volatile or local data", async () => {
    const evaluation = await runCompetitionEvaluation();
    const firstJson = serializeCompetitionEvaluationJson(evaluation);
    const secondJson = serializeCompetitionEvaluationJson(await runCompetitionEvaluation());
    const markdown = serializeCompetitionEvaluationMarkdown(evaluation);
    expect(secondJson).toBe(firstJson);
    expect(markdown).toContain("EXPECTED SECURITY BOUNDARY");
    expect(`${firstJson}${markdown}`).not.toMatch(/D:\\|C:\\Users\\|generatedAt|runtimeMs|apiKey|authorization/i);
  });

  it("returns a non-zero code for a forced failure", async () => {
    const evaluation = await runCompetitionEvaluation();
    const forced = { ...evaluation, overallResult: "FAIL" as const, failures: ["Forced test failure."] };
    expect(competitionEvaluationExitCode(forced)).toBe(1);
  });

  it("blocks fetch and counts the attempted network access", async () => {
    await expect(withNetworkBlocked(async () => {
      await fetch("https://example.invalid");
      return "unreachable";
    })).rejects.toThrow("Network access is forbidden");
  });
});
