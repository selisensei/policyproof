import { describe, expect, it } from "vitest";
import { businessRuleMutationCases, runBusinessRuleMutations, runThresholdBoundary } from "@/src/evaluation/business-rule-mutations";
import { withNetworkBlocked } from "@/src/evaluation/network-guard";

describe("business-rule mutation framework", () => {
  it("defines the seven stable Northstar mutations", () => {
    expect(businessRuleMutationCases.map(({ mutationId }) => mutationId)).toEqual([
      "MUT-CURRENCY-001", "MUT-AMOUNT-001", "MUT-TIMING-001", "MUT-DELIVERY-001",
      "MUT-SOD-001", "MUT-BANK-001", "MUT-THRESHOLD-001",
    ]);
  });

  it("changes exactly the expected control for every mutation", async () => {
    const guarded = await withNetworkBlocked(runBusinessRuleMutations);
    expect(guarded.attempts).toBe(0);
    const results = guarded.value;
    expect(results).toHaveLength(7);
    for (const result of results) {
      expect(result.passed, `${result.mutationId}: ${result.failures.join(" ")}`).toBe(true);
      expect(result.changedControlIds).toEqual([result.expectedChangedControlId]);
      expect(result.previousStatus).toBe(result.expectedPreviousStatus);
      expect(result.newStatus).toBe(result.expectedNewStatus);
      expect(result.unchangedControlCount).toBe(6);
      expect(result.fingerprintChanged).toBe(true);
      expect(result.evidenceValid).toBe(true);
      expect(result.scenarioIdentityPreserved).toBe(true);
      expect(result.humanDecisionLeakage).toBe(false);
    }
  });

  it.each([
    [9_999.99, "PASS"],
    [10_000, "PASS"],
    [10_000.01, "FAIL"],
  ] as const)("protects strict amount > threshold behavior at EUR %s", (amount, expected) => {
    expect(runThresholdBoundary(amount)).toBe(expected);
  });
});
