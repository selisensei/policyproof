// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReviewFingerprintPanel } from "@/components/workspace/review-fingerprint-panel";
import { LocaleProvider } from "@/src/i18n/locale-context";
import type { ControlResult } from "@/src/domain/schemas";
import type { ReviewFingerprintComparison } from "@/src/lib/review-fingerprint";

function result(status: ControlResult["status"]): ControlResult {
  return {
    controlId: "CTRL-APPROVAL",
    title: "Approval threshold",
    status,
    explanation: "Fictional deterministic conclusion.",
    severity: "HIGH",
    supportingEvidence: [],
    contradictoryEvidence: [],
    missingEvidence: [],
    reviewerDecision: { state: "PENDING", comment: "" },
  };
}

describe("ReviewFingerprintPanel", () => {
  afterEach(cleanup);

  it("surfaces an unexpected divergence while showing both conclusion states", () => {
    const comparison: ReviewFingerprintComparison = {
      kind: "DIVERGED",
      inputsMatch: true,
      resultsMatch: false,
      fingerprintsMatch: false,
      changedControlIds: ["CTRL-APPROVAL"],
      changedConclusions: [{ controlId: "CTRL-APPROVAL", previousStatus: "FAIL", candidateStatus: "PASS" }],
      unchangedControlCount: 6,
      previousFingerprint: "a".repeat(64),
      candidateFingerprint: "b".repeat(64),
      previousThreshold: 10_000,
      candidateThreshold: 10_000,
    };
    render(<LocaleProvider><ReviewFingerprintPanel fingerprint={comparison.previousFingerprint} comparison={comparison} results={[result("FAIL")]} candidateResults={[result("PASS")]} isVerifying={false} onRerun={vi.fn()} /></LocaleProvider>);
    expect(screen.getByRole("alert").textContent).toContain("Unexpected deterministic divergence");
    expect(screen.getByRole("alert").textContent).toContain("CTRL-01 · FAIL → PASS");
    expect(screen.getByText(/does not prove identity, authorship or legal signature/i)).toBeTruthy();
  });
});
