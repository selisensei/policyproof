import { describe, expect, it } from "vitest";
import { demoControls, demoDocuments, demoPolicy } from "@/src/fixtures/demo-case";
import { createDecisionReceipt, DecisionReceiptSchema, REVIEW_DISCLAIMER } from "@/src/lib/decision-receipt";
import { createConciseReviewSummary, serializeDecisionReceipt, serializeDecisionReceiptMarkdown } from "@/src/lib/receipt-export";
import { recordReviewDecision } from "@/src/lib/review-decision";
import { runDeterministicReview } from "@/src/lib/review-engine";
import { createAuditEvent } from "@/src/lib/audit-trail";

describe("decision receipt", () => {
  it("creates a validated, reproducible receipt with reviewer decisions", () => {
    const results = runDeterministicReview(demoControls, demoDocuments);
    results[0] = recordReviewDecision(results[0], "CONFIRMED", "Evidence checked.");
    const input = {
      results,
      policyName: demoPolicy.title,
      policyVersion: demoPolicy.version,
      caseName: "Northstar Facilities vendor change",
      selectedLanguage: "en" as const,
      runMode: "DETERMINISTIC_DEMO" as const,
      generatedAt: "2026-07-13T20:00:00.000Z",
      enabledControlCount: 7,
    };

    const first = createDecisionReceipt(input);
    const second = createDecisionReceipt(input);

    expect(first).toEqual(second);
    expect(first.reviewId).toBe("PP-20260713T200000000Z");
    expect(first.outcomes[0].reviewerDecision).toBe("CONFIRMED");
    expect(first.summary).toMatchObject({ total: 7, PASS: 3, FAIL: 2, MISSING: 1, WARNING: 1, reviewed: 1, pending: 6 });
    expect(first.policyName).toBe(demoPolicy.title);
    expect(first.enabledControlCount).toBe(7);
    expect(first.disclaimer).toBe(REVIEW_DISCLAIMER);
    expect(() => DecisionReceiptSchema.parse(first)).not.toThrow();
    expect(serializeDecisionReceipt(first)).toContain('"reviewId": "PP-20260713T200000000Z"');
    expect(serializeDecisionReceiptMarkdown(first)).toContain("# PolicyProof: Decision receipt");
    expect(serializeDecisionReceiptMarkdown(first)).toContain("| CTRL-01 | CTRL-APPROVAL | Approval threshold | FAIL | CONFIRMED | Evidence checked. |");
    expect(serializeDecisionReceiptMarkdown(first)).toContain(REVIEW_DISCLAIMER);
    expect(createConciseReviewSummary(first)).toContain("3 PASS, 2 FAIL, 1 MISSING, 1 WARNING");
  });

  it("includes only schema-validated audit metadata in the JSON receipt", () => {
    const results = runDeterministicReview(demoControls, demoDocuments);
    const auditTrail = [createAuditEvent({ action: "REVIEW_RUN", scenarioId: "northstar-mixed-risk", description: "Evaluated seven controls.", timestamp: "2026-07-14T08:00:00.000Z" })];
    const receipt = createDecisionReceipt({ results, policyName: demoPolicy.title, policyVersion: demoPolicy.version, caseName: "Northstar Facilities — Mixed-Risk Case", selectedLanguage: "en", runMode: "DETERMINISTIC_DEMO", generatedAt: "2026-07-14T08:00:01.000Z", enabledControlCount: 7, auditTrail });
    const json = serializeDecisionReceipt(receipt);
    expect(receipt.auditTrail).toEqual(auditTrail);
    expect(json).toContain('"action": "REVIEW_RUN"');
    expect(json).not.toContain("Purchase order amount: 12,480 EUR");
  });
});
