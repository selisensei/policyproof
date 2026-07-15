import { describe, expect, it } from "vitest";
import { ReviewFingerprintPayloadSchema } from "@/src/domain/review-fingerprint-schema";
import { northstarScenario } from "@/src/fixtures/scenarios";
import { runDeterministicReview } from "@/src/lib/review-engine";
import {
  buildReviewFingerprintPayload,
  canonicalizeDeterministicValue,
  canonicalizeReviewFingerprintPayload,
  compareReviewFingerprintPayloads,
  computeReviewFingerprint,
  serializeCanonicalReview,
} from "@/src/lib/review-fingerprint";
import type { ControlDefinition, ControlResult } from "@/src/domain/schemas";

function buildNorthstar(threshold = 10_000, resultsOverride?: ControlResult[]) {
  const controls = structuredClone(northstarScenario.controls).map((control) =>
    control.kind === "APPROVAL_THRESHOLD"
      ? { ...control, parameters: { ...control.parameters, thresholdAmount: threshold } }
      : control,
  ) as ControlDefinition[];
  const documents = structuredClone(northstarScenario.documents);
  const results = resultsOverride ?? runDeterministicReview(controls, documents);
  return buildReviewFingerprintPayload({
    scenarioId: northstarScenario.id,
    caseReference: northstarScenario.caseReference,
    policy: structuredClone(northstarScenario.policy),
    controls,
    documents,
    results,
  });
}

describe("canonical deterministic values", () => {
  it("ignores object insertion order, including nested objects", () => {
    const left = canonicalizeDeterministicValue({ z: 1, nested: { b: true, a: "value" }, a: 2 });
    const right = canonicalizeDeterministicValue({ a: 2, nested: { a: "value", b: true }, z: 1 });
    expect(JSON.stringify(left)).toBe(JSON.stringify(right));
  });

  it("normalizes dates, line endings, and negative zero while preserving Unicode code points", () => {
    const value = canonicalizeDeterministicValue({
      date: new Date("2026-07-15T10:30:00+02:00"),
      lineEndings: "a\r\nb\rc",
      number: -0,
      unicode: "Évidence — 東京",
      enumValue: "WARNING",
    });
    expect(value).toEqual({
      date: "2026-07-15T08:30:00.000Z",
      enumValue: "WARNING",
      lineEndings: "a\nb\nc",
      number: 0,
      unicode: "Évidence — 東京",
    });
  });

  it.each([
    ["undefined", undefined],
    ["function", () => undefined],
    ["symbol", Symbol("unsupported")],
    ["bigint", BigInt(1)],
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
  ])("rejects unsupported %s values", (_label, value) => {
    expect(() => canonicalizeDeterministicValue({ value })).toThrow();
  });

  it("rejects cyclic objects", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => canonicalizeDeterministicValue(cyclic)).toThrow(/cycles/i);
  });
});

describe("review fingerprint payload", () => {
  it("uses stable semantic collection ordering and UTF-8 serialization", () => {
    const payload = buildNorthstar();
    const reordered = structuredClone(payload);
    reordered.controls.reverse();
    reordered.documents.reverse();
    reordered.documents.forEach((document) => document.facts.reverse());
    reordered.results.reverse();
    reordered.results.forEach((result) => result.evidence.reverse());
    const canonical = serializeCanonicalReview(payload);
    expect(serializeCanonicalReview(reordered)).toBe(canonical);
    expect(new TextDecoder().decode(new TextEncoder().encode(canonical))).toBe(canonical);
  });

  it("requires the versioned strict schema and rejects malformed payloads", () => {
    const payload = buildNorthstar();
    const missingVersion: Record<string, unknown> = structuredClone(payload);
    delete missingVersion.schemaVersion;
    expect(() => ReviewFingerprintPayloadSchema.parse(missingVersion)).toThrow();
    expect(() => ReviewFingerprintPayloadSchema.parse({ ...payload, unexpected: true })).toThrow();
    expect(() => canonicalizeReviewFingerprintPayload({ ...payload, results: [] })).toThrow();
  });

  it("excludes human decisions, comments, and presentation-only state", async () => {
    const baselineControls = structuredClone(northstarScenario.controls);
    const documents = structuredClone(northstarScenario.documents);
    const baselineResults = runDeterministicReview(baselineControls, documents);
    const reviewedResults = structuredClone(baselineResults);
    reviewedResults[0].reviewerDecision = { state: "ACCEPTED_EXCEPTION", comment: "Documented human rationale." };
    const baseInput = {
      scenarioId: northstarScenario.id,
      caseReference: northstarScenario.caseReference,
      policy: structuredClone(northstarScenario.policy),
      controls: baselineControls,
      documents,
    };
    const baseline = buildReviewFingerprintPayload({ ...baseInput, results: baselineResults });
    const reviewed = buildReviewFingerprintPayload({
      ...baseInput,
      results: reviewedResults,
      locale: "fr",
      selectedControlId: "CTRL-CURRENCY",
      filter: "FAIL",
      search: "invoice",
    } as Parameters<typeof buildReviewFingerprintPayload>[0]);
    expect(await computeReviewFingerprint(reviewed)).toBe(await computeReviewFingerprint(baseline));
  });
});

describe("SHA-256 review fingerprint", () => {
  it("returns the same lowercase 64-character digest for identical semantics", async () => {
    const first = await computeReviewFingerprint(buildNorthstar());
    const second = await computeReviewFingerprint(buildNorthstar());
    expect(second).toBe(first);
    expect(first).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is independent of object insertion order", async () => {
    const payload = buildNorthstar();
    const reordered = Object.fromEntries(Object.entries(payload).reverse());
    expect(await computeReviewFingerprint(ReviewFingerprintPayloadSchema.parse(reordered))).toBe(await computeReviewFingerprint(payload));
  });

  it.each([
    ["threshold", (payload: ReturnType<typeof buildNorthstar>) => { payload.approvalParameters.thresholdAmount = 15_000; const control = payload.controls.find((item) => item.kind === "APPROVAL_THRESHOLD"); if (control?.kind === "APPROVAL_THRESHOLD") control.parameters.thresholdAmount = 15_000; }],
    ["policy content", (payload: ReturnType<typeof buildNorthstar>) => { payload.policy.content += "\nStable policy amendment."; }],
    ["document content", (payload: ReturnType<typeof buildNorthstar>) => { payload.documents[0].content += "\nStable source amendment."; }],
    ["evidence excerpt", (payload: ReturnType<typeof buildNorthstar>) => { payload.results[0].evidence[0].excerpt += " changed"; }],
    ["evidence locator", (payload: ReturnType<typeof buildNorthstar>) => { payload.results[0].evidence[0].locator += " changed"; }],
    ["control result", (payload: ReturnType<typeof buildNorthstar>) => { const result = payload.results.find((item) => item.controlId === "CTRL-APPROVAL"); if (result) result.status = "PASS"; }],
  ])("changes when %s changes", async (_label, mutate) => {
    const baseline = buildNorthstar();
    const changed = structuredClone(baseline);
    mutate(changed);
    expect(await computeReviewFingerprint(changed)).not.toBe(await computeReviewFingerprint(baseline));
  });

  it("classifies same-input success, threshold change, and unexpected divergence", async () => {
    const baseline = buildNorthstar();
    const baselineHash = await computeReviewFingerprint(baseline);
    const identical = buildNorthstar();
    expect(compareReviewFingerprintPayloads(baseline, identical, baselineHash, await computeReviewFingerprint(identical))).toMatchObject({
      kind: "IDENTICAL",
      changedControlIds: [],
      unchangedControlCount: 7,
    });

    const changed = buildNorthstar(15_000);
    const changedComparison = compareReviewFingerprintPayloads(baseline, changed, baselineHash, await computeReviewFingerprint(changed));
    expect(changedComparison).toMatchObject({
      kind: "CHANGED",
      changedControlIds: ["CTRL-APPROVAL"],
      unchangedControlCount: 6,
      previousThreshold: 10_000,
      candidateThreshold: 15_000,
    });

    const divergent = structuredClone(baseline);
    const approvalResult = divergent.results.find((result) => result.controlId === "CTRL-APPROVAL");
    if (approvalResult) approvalResult.status = "PASS";
    expect(compareReviewFingerprintPayloads(baseline, divergent, baselineHash, await computeReviewFingerprint(divergent))).toMatchObject({
      kind: "DIVERGED",
      changedControlIds: ["CTRL-APPROVAL"],
      unchangedControlCount: 6,
    });
  });
});
