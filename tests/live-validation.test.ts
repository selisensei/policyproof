import { afterEach, describe, expect, it, vi } from "vitest";
import { CaseAnalysisSchema } from "@/src/domain/ai-schemas";
import liveFixture from "@/src/fixtures/evaluation/live-gpt56-northstar.json";
import { createDecisionReceipt } from "@/src/lib/decision-receipt";
import { recordReviewDecision } from "@/src/lib/review-decision";
import {
  createApprovedLiveRequest,
  parseLiveAnalysisArtifact,
  validateAndRunLivePipeline,
  type LiveAnalysisArtifact,
} from "@/src/evaluation/live-validation";
import { captureFinalCaseAnalysis } from "@/scripts/live-gpt56-final-analysis";

function apiBody() {
  return { analysis: CaseAnalysisSchema.parse(structuredClone(liveFixture.mockAnalysis)) };
}

function artifact(): LiveAnalysisArtifact {
  return {
    version: 1,
    capturedAt: "2026-07-14T12:00:00.000Z",
    endpoint: "/api/ai/analyze",
    httpStatus: 200,
    latencyMs: 30_000,
    response: apiBody(),
  };
}

function responseFor(body: unknown) {
  return { ok: true, status: 200, text: async () => JSON.stringify(body) };
}

describe("final live GPT-5.6 validation pipeline", () => {
  afterEach(() => vi.useRealTimers());

  it("persists the complete structured response before cleanup", async () => {
    const events: string[] = [];
    const captured = await captureFinalCaseAnalysis({
      request: async () => responseFor(apiBody()),
      persist: async () => { events.push("persist"); },
      cleanup: async () => { events.push("cleanup"); },
      now: () => 1_000,
      capturedAt: () => "2026-07-14T12:00:00.000Z",
    });

    expect(events).toEqual(["persist", "cleanup"]);
    expect(captured.response.analysis.documentFindings).toHaveLength(5);
  });

  it("waits for a slow 30-second response before persistence or cleanup", async () => {
    vi.useFakeTimers();
    const events: string[] = [];
    const pending = captureFinalCaseAnalysis({
      request: () => new Promise((resolve) => {
        setTimeout(() => { events.push("response"); resolve(responseFor(apiBody())); }, 30_000);
      }),
      persist: async () => { events.push("persist"); },
      cleanup: async () => { events.push("cleanup"); },
      capturedAt: () => "2026-07-14T12:00:00.000Z",
    });

    await vi.advanceTimersByTimeAsync(29_999);
    expect(events).toEqual([]);
    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(events).toEqual(["response", "persist", "cleanup"]);
  });

  it("reloads and validates a saved structured response independently", () => {
    const reloaded = parseLiveAnalysisArtifact(JSON.stringify(artifact()));
    const validated = validateAndRunLivePipeline(reloaded, liveFixture);
    expect(validated.artifact.response.analysis.documentFindings).toHaveLength(5);
    expect(validated.evidence.evidenceCount).toBe(11);
  });

  it("preserves every exact excerpt through mapping and deterministic evaluation", () => {
    const validated = validateAndRunLivePipeline(artifact(), liveFixture);
    for (const document of validated.documents) {
      for (const fact of document.facts) expect(document.content).toContain(fact.excerpt);
    }
    const excerpts = validated.results.flatMap((result) => [
      ...result.supportingEvidence,
      ...result.contradictoryEvidence,
    ]).map((evidence) => evidence.excerpt);
    for (const excerpt of excerpts) {
      expect(validated.request.documents.some((document) => document.content.includes(excerpt))).toBe(true);
    }
  });

  it("rejects unknown document identifiers", () => {
    const invalid = artifact();
    invalid.response.analysis.documentFindings[0].documentIdentifier = "UNKNOWN-DOCUMENT";
    expect(() => validateAndRunLivePipeline(invalid, liveFixture)).toThrow(/Unknown document identifier/);
  });

  it("rejects invented excerpts", () => {
    const invalid = artifact();
    invalid.response.analysis.documentFindings[0].evidence[0].exactExcerpt = "Invented approval evidence.";
    expect(() => validateAndRunLivePipeline(invalid, liveFixture)).toThrow(/Invented excerpt/);
  });

  it("rejects unknown or unrelated control relations", () => {
    const invalid = artifact();
    invalid.response.analysis.documentFindings[0].evidence[0].relationToControl = "UNRELATED-CONTROL-999";
    expect(() => validateAndRunLivePipeline(invalid, liveFixture)).toThrow(/Unsupported control relation/);
  });

  it("feeds parsed facts into the real engine and produces all seven expected results", () => {
    const validated = validateAndRunLivePipeline(artifact(), liveFixture);
    expect(Object.fromEntries(validated.results.map((result) => [result.controlId, result.status]))).toEqual({
      "PVC-001": "FAIL",
      "PVC-002": "PASS",
      "PVC-003": "PASS",
      "PVC-004": "FAIL",
      "PVC-005": "PASS",
      "PVC-006": "MISSING",
      "PVC-007": "WARNING",
    });
    expect(validated.summary).toMatchObject({ total: 7, PASS: 3, FAIL: 2, MISSING: 1, WARNING: 1 });
  });

  it("keeps human decisions and a Live-mode receipt available", () => {
    const validated = validateAndRunLivePipeline(artifact(), liveFixture);
    const currency = validated.results.find((result) => result.controlId === "PVC-004");
    expect(currency).toBeDefined();
    const reviewed = recordReviewDecision(currency!, "CONFIRMED", "EUR and USD excerpts verified.");
    const results = validated.results.map((result) => result.controlId === reviewed.controlId ? reviewed : result);
    const receipt = createDecisionReceipt({
      results,
      policyName: validated.compilation.policyTitle,
      policyVersion: "Live validation",
      caseName: "Northstar Facilities vendor change",
      selectedLanguage: "en",
      runMode: "LIVE_GPT_5_6",
      generatedAt: "2026-07-14T12:05:00.000Z",
      enabledControlCount: 7,
    });
    expect(receipt.summary).toMatchObject({ reviewed: 1, pending: 6 });
    expect(receipt.outcomes.find((outcome) => outcome.controlId === "PVC-004")).toMatchObject({
      status: "FAIL",
      reviewerDecision: "CONFIRMED",
      reviewerComment: "EUR and USD excerpts verified.",
    });
  });

  it("persists only allowlisted structured fields and no injected secret metadata", async () => {
    const body = apiBody() as Record<string, unknown>;
    body.apiKey = "PRIVATE_TEST_VALUE";
    const findings = (body.analysis as { documentFindings: Array<Record<string, unknown>> }).documentFindings;
    findings[0].privateProviderMetadata = "NESTED_PRIVATE_TEST_VALUE";
    (findings[0].evidence as Array<Record<string, unknown>>)[0].authorization = "AUTHORIZATION_TEST_VALUE";
    let serialized = "";
    await captureFinalCaseAnalysis({
      request: async () => responseFor(body),
      persist: async (value) => { serialized = JSON.stringify(value); },
      now: () => 1_000,
      capturedAt: () => "2026-07-14T12:00:00.000Z",
    });

    expect(serialized).not.toMatch(/PRIVATE_TEST_VALUE|apiKey|authorization|privateProviderMetadata/i);
    expect(() => parseLiveAnalysisArtifact(serialized)).not.toThrow();
  });

  it("reconstructs exactly seven explicitly approved controls without recompilation", () => {
    const { compilation, request } = createApprovedLiveRequest(liveFixture);
    expect(compilation.controls.every((control) => control.enabled === false)).toBe(true);
    expect(request.controls).toHaveLength(7);
    expect(request.controls.every((control) => control.enabled)).toBe(true);
  });
});
