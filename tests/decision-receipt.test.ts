import { describe, expect, it } from "vitest";
import { demoControls, demoDocuments, demoPolicy } from "@/src/fixtures/demo-case";
import { createDecisionReceipt, DecisionReceiptSchema, REVIEW_DISCLAIMER } from "@/src/lib/decision-receipt";
import { recordReviewDecision } from "@/src/lib/review-decision";
import { runDeterministicReview } from "@/src/lib/review-engine";

describe("decision receipt", () => {
  it("creates a validated, reproducible receipt with reviewer decisions", () => {
    const results = runDeterministicReview(demoControls, demoDocuments);
    results[0] = recordReviewDecision(results[0], "CONFIRMED", "Evidence checked.");
    const input = {
      results,
      policyVersion: demoPolicy.version,
      caseName: "Northstar Facilities vendor change",
      runMode: "DETERMINISTIC_DEMO" as const,
      generatedAt: "2026-07-13T20:00:00.000Z",
    };

    const first = createDecisionReceipt(input);
    const second = createDecisionReceipt(input);

    expect(first).toEqual(second);
    expect(first.reviewId).toBe("PP-20260713T200000000Z");
    expect(first.outcomes[0].reviewerDecision).toBe("CONFIRMED");
    expect(first.disclaimer).toBe(REVIEW_DISCLAIMER);
    expect(() => DecisionReceiptSchema.parse(first)).not.toThrow();
  });
});
