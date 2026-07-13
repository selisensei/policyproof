import { describe, expect, it } from "vitest";
import { demoControls, demoDocuments } from "@/src/fixtures/demo-case";
import { recordReviewDecision } from "@/src/lib/review-decision";
import { runDeterministicReview } from "@/src/lib/review-engine";

const currencyResult = runDeterministicReview(demoControls, demoDocuments).find(
  (result) => result.controlId === "CTRL-CURRENCY",
);

if (!currencyResult) throw new Error("Currency fixture result is missing.");

describe("human review decisions", () => {
  it("confirms a result without changing the deterministic conclusion", () => {
    const reviewed = recordReviewDecision(currencyResult, "CONFIRMED", "Confirmed against both documents.");
    expect(reviewed.status).toBe("FAIL");
    expect(reviewed.reviewerDecision.state).toBe("CONFIRMED");
  });

  it("requires a comment when rejecting a result", () => {
    expect(() => recordReviewDecision(currencyResult, "REJECTED", "  ")).toThrow(
      "Add a reviewer comment",
    );
  });

  it("records an accepted exception while preserving the original result", () => {
    const reviewed = recordReviewDecision(
      currencyResult,
      "ACCEPTED_EXCEPTION",
      "Approved for this fictional demonstration only.",
    );
    expect(reviewed.status).toBe("FAIL");
    expect(reviewed.reviewerDecision).toEqual({
      state: "ACCEPTED_EXCEPTION",
      comment: "Approved for this fictional demonstration only.",
    });
  });
});
