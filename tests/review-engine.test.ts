import { describe, expect, it } from "vitest";
import type { ControlDefinition } from "@/src/domain/schemas";
import { demoControls, demoDocuments } from "@/src/fixtures/demo-case";
import { runDeterministicReview } from "@/src/lib/review-engine";

function reviewWithThreshold(thresholdAmount: number) {
  const controls: ControlDefinition[] = demoControls.map((control) =>
    control.kind === "APPROVAL_THRESHOLD"
      ? { ...control, parameters: { ...control.parameters, thresholdAmount } }
      : control,
  );
  return runDeterministicReview(controls, demoDocuments);
}

function resultFor(controlId: string, thresholdAmount = 10_000) {
  const result = reviewWithThreshold(thresholdAmount).find((candidate) => candidate.controlId === controlId);
  if (!result) throw new Error(`Result not found for ${controlId}`);
  return result;
}

describe("deterministic review engine", () => {
  it("passes purchase-order date validation", () => {
    expect(resultFor("CTRL-TIMING").status).toBe("PASS");
  });

  it("passes when purchase order and invoice amounts match", () => {
    expect(resultFor("CTRL-AMOUNT").status).toBe("PASS");
  });

  it("fails when purchase order and invoice currencies differ", () => {
    const result = resultFor("CTRL-CURRENCY");
    expect(result.status).toBe("FAIL");
    expect(result.contradictoryEvidence).toHaveLength(2);
  });

  it("fails approval when EUR 12,480 exceeds a EUR 10,000 threshold", () => {
    expect(resultFor("CTRL-APPROVAL", 10_000).status).toBe("FAIL");
  });

  it("passes approval when EUR 12,480 is below a EUR 15,000 threshold", () => {
    expect(resultFor("CTRL-APPROVAL", 15_000).status).toBe("PASS");
  });

  it("passes when delivery evidence exists", () => {
    expect(resultFor("CTRL-DELIVERY").status).toBe("PASS");
  });

  it("marks independent bank verification as missing", () => {
    const result = resultFor("CTRL-BANK");
    expect(result.status).toBe("MISSING");
    expect(result.missingEvidence).toHaveLength(1);
  });

  it("warns when the initiator and approver are the same person", () => {
    const result = resultFor("CTRL-SOD");
    expect(result.status).toBe("WARNING");
    expect(result.contradictoryEvidence).toHaveLength(2);
  });

  it("keeps every result traceable to evidence or an explicit missing item", () => {
    for (const result of reviewWithThreshold(10_000)) {
      const evidenceCount =
        result.supportingEvidence.length +
        result.contradictoryEvidence.length +
        result.missingEvidence.length;
      expect(evidenceCount).toBeGreaterThan(0);
    }
  });

  it("does not evaluate a disabled control", () => {
    const controls = demoControls.map((control) =>
      control.id === "CTRL-CURRENCY" ? { ...control, enabled: false } : control,
    ) as ControlDefinition[];
    const results = runDeterministicReview(controls, demoDocuments);
    expect(results).toHaveLength(6);
    expect(results.some((result) => result.controlId === "CTRL-CURRENCY")).toBe(false);
  });
});
