import { describe, expect, it } from "vitest";
import { demoControls, demoDocuments } from "@/src/fixtures/demo-case";
import { runDeterministicReview } from "@/src/lib/review-engine";
import { summarizeResults } from "@/src/lib/review-summary";
import {
  assessEvidenceIntegrity,
  buildEvidenceCoverage,
  buildOutcomeComposition,
  buildReviewerQueue,
  buildThresholdSensitivity,
  changedControls,
  createRunSnapshot,
  extractChronology,
  searchReviewWorkspace,
} from "@/src/lib/review-intelligence";
import { advanceRunHistory, loadRunHistory, parseRunHistory, persistRunHistory, removeRunHistory, serializeRunHistory } from "@/src/lib/review-run-history";

const resultsAt = (threshold: number) => runDeterministicReview(
  demoControls.map((control) => control.kind === "APPROVAL_THRESHOLD" ? { ...control, parameters: { ...control.parameters, thresholdAmount: threshold } } : control),
  demoDocuments,
);

describe("review intelligence", () => {
  it("builds the exact outcome composition", () => {
    expect(buildOutcomeComposition(resultsAt(10_000))).toEqual([
      { status: "PASS", count: 3, percentage: 3 / 7 * 100 },
      { status: "FAIL", count: 2, percentage: 2 / 7 * 100 },
      { status: "MISSING", count: 1, percentage: 1 / 7 * 100 },
      { status: "WARNING", count: 1, percentage: 1 / 7 * 100 },
    ]);
    expect(buildOutcomeComposition([]).every((item) => item.percentage === 0)).toBe(true);
  });

  it("maps supporting, contradictory, missing and not-applicable coverage", () => {
    const coverage = buildEvidenceCoverage(resultsAt(10_000), demoDocuments);
    const currency = coverage.find((row) => row.controlId === "CTRL-CURRENCY");
    expect(currency?.cells.find((cell) => cell.documentId === "DOC-PO-1042")?.state).toBe("CONTRADICTORY");
    expect(currency?.cells.find((cell) => cell.documentId === "DOC-INV-8821")?.state).toBe("CONTRADICTORY");
    expect(currency?.cells.find((cell) => cell.documentId === "DOC-DEL-447")?.state).toBe("NOT_APPLICABLE");
    const bank = coverage.find((row) => row.controlId === "CTRL-BANK");
    expect(bank?.cells.find((cell) => cell.documentId === "DOC-VC-031")?.state).toBe("MISSING");
  });

  it("extracts the exact Northstar chronology", () => {
    expect(extractChronology(demoDocuments).map((event) => [event.factKey, event.date])).toEqual([
      ["purchaseOrderDate", "2026-07-03"],
      ["deliveryDate", "2026-07-04"],
      ["invoiceDate", "2026-07-05"],
    ]);
  });

  it("explains threshold sensitivity at EUR 10,000 and EUR 15,000", () => {
    expect(buildThresholdSensitivity(demoDocuments, 10_000, resultsAt(10_000))).toMatchObject({ amount: 12_480, threshold: 10_000, recordedApprovers: 1, requiredApprovers: 2, exceedsThreshold: true, approvalSatisfied: false, status: "FAIL" });
    expect(buildThresholdSensitivity(demoDocuments, 15_000, resultsAt(15_000))).toMatchObject({ exceedsThreshold: false, approvalSatisfied: true, status: "PASS" });
    expect(buildThresholdSensitivity([], 10_000, [])).toBeNull();
  });

  it("prioritizes unresolved exceptions and validates exact evidence", () => {
    const results = resultsAt(10_000);
    expect(buildReviewerQueue(results).slice(0, 3).map((item) => item.status)).toEqual(["FAIL", "FAIL", "MISSING"]);
    expect(assessEvidenceIntegrity(results.find((result) => result.controlId === "CTRL-CURRENCY")!, demoDocuments)).toMatchObject({ state: "VERIFIED", verifiedReferences: 2, rejectedReferences: 0 });
    expect(assessEvidenceIntegrity(results.find((result) => result.controlId === "CTRL-BANK")!, demoDocuments).state).toBe("MISSING");
    const invalid = structuredClone(results[0]);
    invalid.supportingEvidence[0].excerpt = "Invented excerpt";
    expect(assessEvidenceIntegrity(invalid, demoDocuments).state).toBe("REJECTED");
  });

  it("searches controls, documents, evidence and reviewer state", () => {
    const results = resultsAt(10_000);
    expect(searchReviewWorkspace("USD", results, demoDocuments, {}).map((match) => match.id)).toEqual(expect.arrayContaining(["CTRL-CURRENCY", "DOC-INV-8821"]));
    expect(searchReviewWorkspace("pending", results, demoDocuments, {}).filter((match) => match.kind === "CONTROL")).toHaveLength(7);
    expect(searchReviewWorkspace("", results, demoDocuments, {})).toEqual([]);
  });

  it("stores only a validated one-run comparison snapshot", () => {
    const firstResults = resultsAt(10_000);
    const secondResults = resultsAt(15_000);
    const first = createRunSnapshot("2026-07-14T10:00:00.000Z", 10_000, firstResults, summarizeResults(firstResults));
    const second = createRunSnapshot("2026-07-14T10:05:00.000Z", 15_000, secondResults, summarizeResults(secondResults));
    const firstHistory = advanceRunHistory(parseRunHistory(null), first);
    const secondHistory = advanceRunHistory(firstHistory, second);
    expect(changedControls(secondHistory.previous, secondHistory.latest)).toEqual(["CTRL-APPROVAL"]);
    expect(parseRunHistory(serializeRunHistory(secondHistory))).toEqual(secondHistory);
    expect(parseRunHistory("not-json")).toEqual({ version: 1, previous: null, latest: null });
  });

  it("fails closed when browser storage is unavailable", () => {
    const unavailable = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
      removeItem: () => { throw new Error("blocked"); },
    };
    expect(loadRunHistory(unavailable)).toEqual({ version: 1, previous: null, latest: null });
    expect(persistRunHistory(unavailable, { version: 1, previous: null, latest: null })).toBe(false);
    expect(removeRunHistory(unavailable)).toBe(false);
  });
});
