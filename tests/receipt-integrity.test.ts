import { afterEach, describe, expect, it, vi } from "vitest";
import { northstarScenario } from "@/src/fixtures/scenarios";
import { buildScenarioControls, buildScenarioDocuments } from "@/src/domain/scenario-schema";
import { createAuditEvent } from "@/src/lib/audit-trail";
import { createDecisionReceipt } from "@/src/lib/decision-receipt";
import { recordReviewDecision } from "@/src/lib/review-decision";
import { runDeterministicReview } from "@/src/lib/review-engine";
import { buildReviewFingerprintPayload, computeReviewFingerprint } from "@/src/lib/review-fingerprint";
import {
  RECEIPT_FORMAT_VERSION,
  RECEIPT_INTEGRITY_VERSION,
  ReceiptIntegrityPayloadSchema,
  attachReceiptIntegrity,
  buildReceiptIntegrityPayload,
  canonicalizeReceiptIntegrityPayload,
  computeReceiptIntegrityHash,
  serializeCanonicalReceipt,
  serializeVerifiableReceipt,
  verifyReceiptIntegrity,
  verifyReceiptIntegrityJson,
  type ReceiptIntegrityPayload,
  type VerifiableDecisionReceipt,
} from "@/src/lib/receipt-integrity";

async function fixture(options: { decision?: "PENDING" | "CONFIRMED" | "REJECTED" | "ACCEPTED_EXCEPTION"; comment?: string; generatedAt?: string } = {}) {
  const controls = buildScenarioControls(northstarScenario);
  const documents = buildScenarioDocuments(northstarScenario);
  const baseResults = runDeterministicReview(controls, documents);
  const results = structuredClone(baseResults);
  if (options.decision && options.decision !== "PENDING") {
    results[0] = recordReviewDecision(results[0], options.decision, options.comment ?? "Evidence checked.");
  }
  const reviewPayload = buildReviewFingerprintPayload({
    scenarioId: northstarScenario.id,
    caseReference: northstarScenario.caseReference,
    policy: northstarScenario.policy,
    controls,
    documents,
    results,
  });
  const fingerprint = await computeReviewFingerprint(reviewPayload);
  const auditTrail = [createAuditEvent({
    action: "REVIEW_RUN",
    scenarioId: northstarScenario.id,
    description: "Evaluated seven controls.",
    timestamp: "2026-07-16T08:00:00.000Z",
  })];
  const decisionReceipt = createDecisionReceipt({
    results,
    policyName: northstarScenario.policy.title,
    policyVersion: northstarScenario.policy.version,
    caseName: northstarScenario.caseName.en,
    selectedLanguage: "en",
    runMode: "DETERMINISTIC_DEMO",
    generatedAt: options.generatedAt ?? "2026-07-16T08:01:00.000Z",
    enabledControlCount: controls.length,
    auditTrail,
  });
  const payload = buildReceiptIntegrityPayload({ decisionReceipt, reviewFingerprintPayload: reviewPayload, reviewFingerprint: fingerprint });
  return { baseResults, results, reviewPayload, fingerprint, decisionReceipt, payload, verifiable: await attachReceiptIntegrity(payload) };
}

function mutate<T>(value: T, change: (copy: T) => void): T {
  const copy = structuredClone(value);
  change(copy);
  return copy;
}

afterEach(() => vi.restoreAllMocks());

describe("receipt integrity schema and canonicalization", () => {
  it("builds a strict, versioned payload with both control identifiers", async () => {
    const { payload } = await fixture({ decision: "CONFIRMED" });
    expect(payload.receiptFormatVersion).toBe(RECEIPT_FORMAT_VERSION);
    expect(payload.reviewFingerprint.version).toBe("policyproof.review-fingerprint.v1");
    expect(payload.controls.find((control) => control.controlId === "CTRL-APPROVAL")).toMatchObject({ controlId: "CTRL-APPROVAL", displayReference: "CTRL-01" });
    expect(payload.humanDecisions.find((decision) => decision.controlId === "CTRL-APPROVAL")).toMatchObject({ controlId: "CTRL-APPROVAL", displayReference: "CTRL-01", state: "CONFIRMED" });
    expect(() => ReceiptIntegrityPayloadSchema.parse({ ...payload, authorization: "forbidden" })).toThrow();
  });

  it("uses semantic collection ordering and object-key independence", async () => {
    const { payload } = await fixture();
    const reordered = structuredClone(payload);
    reordered.controls.reverse();
    reordered.results.reverse();
    reordered.results.forEach((result) => result.evidence.reverse());
    reordered.humanDecisions.reverse();
    reordered.auditTrail.reverse();
    const reversedKeys = Object.fromEntries(Object.entries(reordered).reverse());
    expect(serializeCanonicalReceipt(reversedKeys as ReceiptIntegrityPayload)).toBe(serializeCanonicalReceipt(payload));
    expect(await computeReceiptIntegrityHash(reversedKeys as ReceiptIntegrityPayload)).toBe(await computeReceiptIntegrityHash(payload));
  });

  it("normalizes line endings and negative zero while preserving whitespace and Unicode", async () => {
    const { payload } = await fixture({ decision: "CONFIRMED", comment: "  Évidence — 東京\r\nkept  " });
    const changed = structuredClone(payload);
    const approval = changed.humanDecisions.find((decision) => decision.controlId === "CTRL-APPROVAL");
    if (approval) approval.comment = "  Évidence — 東京\nkept  ";
    expect(serializeCanonicalReceipt(changed)).toBe(serializeCanonicalReceipt(payload));
    expect(canonicalizeReceiptIntegrityPayload(payload).humanDecisions.find((decision) => decision.controlId === "CTRL-APPROVAL")?.comment).toBe("  Évidence — 東京\nkept  ");
  });

  it.each([
    ["NaN", Number.NaN],
    ["Infinity", Number.POSITIVE_INFINITY],
    ["undefined", undefined],
    ["bigint", BigInt(1)],
  ])("rejects unsupported %s values", async (_label, value) => {
    const { payload } = await fixture();
    expect(() => canonicalizeReceiptIntegrityPayload({ ...payload, unsupported: value })).toThrow();
  });

  it("rejects cyclic input", async () => {
    const { payload } = await fixture();
    const cyclic = payload as ReceiptIntegrityPayload & { self?: unknown };
    cyclic.self = cyclic;
    expect(() => canonicalizeReceiptIntegrityPayload(cyclic)).toThrow(/cycles/i);
    delete cyclic.self;
  });
});

describe("receipt SHA-256 and verification", () => {
  it("produces stable lowercase SHA-256 and verifies current and exported receipts without network", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { payload, verifiable } = await fixture({ decision: "CONFIRMED" });
    expect(await computeReceiptIntegrityHash(payload)).toBe(await computeReceiptIntegrityHash(payload));
    expect(verifiable.integrity).toMatchObject({ version: RECEIPT_INTEGRITY_VERSION, algorithm: "SHA-256" });
    expect(verifiable.integrity.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(await verifyReceiptIntegrity(verifiable)).toMatchObject({ status: "VALID", receiptId: verifiable.receipt.receiptId });
    expect(await verifyReceiptIntegrityJson(serializeVerifiableReceipt(verifiable))).toMatchObject({ status: "VALID" });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    ["decision", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.humanDecisions[0].state = "REJECTED"; }],
    ["comment", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.humanDecisions[0].comment += "x"; }],
    ["accepted exception", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.acceptedExceptions.push({ controlId: "CTRL-APPROVAL", displayReference: "CTRL-01", comment: "Approved exception." }); }],
    ["unresolved finding", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.unresolvedFindings[0].status = receipt.receipt.unresolvedFindings[0].status === "PASS" ? "FAIL" : "PASS"; }],
    ["audit event", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.auditTrail[0].description += " changed"; }],
    ["generation timestamp", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.generatedAt = "2026-07-16T08:01:01.000Z"; }],
    ["language", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.language = "fr"; }],
    ["review fingerprint", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.reviewFingerprint.value = "a".repeat(64); }],
    ["result status", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.results[0].status = receipt.receipt.results[0].status === "PASS" ? "FAIL" : "PASS"; }],
    ["evidence excerpt", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.results[0].evidence[0].excerpt += "x"; }],
    ["policy version", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.policy.version += ".1"; }],
    ["receipt identifier", (receipt: VerifiableDecisionReceipt) => { receipt.receipt.receiptId += "X"; }],
    ["stored hash", (receipt: VerifiableDecisionReceipt) => { receipt.integrity.hash = "0".repeat(64); }],
  ])("detects modified %s", async (_label, change) => {
    const { verifiable } = await fixture({ decision: "CONFIRMED" });
    expect((await verifyReceiptIntegrity(mutate(verifiable, change))).status).toBe("MODIFIED");
  });

  it("handles missing integrity, unsupported versions, malformed schemas, and malformed JSON safely", async () => {
    const { verifiable } = await fixture();
    expect((await verifyReceiptIntegrity({ receipt: verifiable.receipt })).status).toBe("MISSING_INTEGRITY");
    expect((await verifyReceiptIntegrity(mutate(verifiable as unknown as Record<string, unknown>, (copy) => {
      (copy.integrity as Record<string, unknown>).version = "policyproof.receipt-integrity.v2";
    }))).status).toBe("UNSUPPORTED_VERSION");
    expect((await verifyReceiptIntegrity(mutate(verifiable as unknown as Record<string, unknown>, (copy) => {
      (copy.receipt as Record<string, unknown>).receiptFormatVersion = "policyproof.decision-receipt.v2";
    }))).status).toBe("UNSUPPORTED_VERSION");
    expect((await verifyReceiptIntegrity({ integrity: verifiable.integrity, receipt: { unsafe: true } })).status).toBe("MALFORMED");
    expect((await verifyReceiptIntegrityJson("{not-json")).status).toBe("MALFORMED");
  });
});

describe("Review Fingerprint and receipt hash separation", () => {
  it("keeps semantic fingerprint stable while decisions and timestamps change the receipt hash", async () => {
    const baseline = await fixture({ generatedAt: "2026-07-16T08:01:00.000Z" });
    const decided = await fixture({ decision: "CONFIRMED", generatedAt: "2026-07-16T08:01:01.000Z" });
    expect(decided.fingerprint).toBe(baseline.fingerprint);
    expect(decided.verifiable.integrity.hash).not.toBe(baseline.verifiable.integrity.hash);
    const timestampOnly = await fixture({ generatedAt: "2026-07-16T08:01:02.000Z" });
    expect(timestampOnly.fingerprint).toBe(baseline.fingerprint);
    expect(timestampOnly.verifiable.integrity.hash).not.toBe(baseline.verifiable.integrity.hash);
  });
});
