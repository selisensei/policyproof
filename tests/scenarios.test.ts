import { describe, expect, it } from "vitest";
import {
  buildScenarioControls,
  buildScenarioDocuments,
  createScenarioResetState,
  deriveScenarioContext,
  loadScenario,
  safeValidateScenario,
  validateScenario,
} from "@/src/domain/scenario-schema";
import { atlasScenario, meridianScenario, northstarScenario, reviewScenarios } from "@/src/fixtures/scenarios";
import { createDecisionReceipt } from "@/src/lib/decision-receipt";
import { buildEvidenceCoverage, buildReviewerQueue, extractChronology } from "@/src/lib/review-intelligence";
import { runDeterministicReview } from "@/src/lib/review-engine";
import { summarizeResults } from "@/src/lib/review-summary";

describe("review scenario architecture", () => {
  it("validates Northstar and derives its context", () => {
    expect(validateScenario(northstarScenario)).toEqual(northstarScenario);
    expect(deriveScenarioContext(northstarScenario)).toEqual({
      scenarioId: "northstar-mixed-risk",
      caseReference: "CASE-NORTHSTAR-2026-07",
      policyId: "policy-procurement-2026",
      policyVersion: "Demo 1.0",
      documentCount: 5,
      controlCount: 7,
      defaultThreshold: 10_000,
    });
  });

  it("loads defensive copies and rejects unknown scenarios", () => {
    const first = loadScenario("northstar-mixed-risk", reviewScenarios);
    const second = loadScenario("northstar-mixed-risk", reviewScenarios);
    first.controls[0].enabled = false;
    expect(second.controls[0].enabled).toBe(true);
    expect(() => loadScenario("unknown", reviewScenarios)).toThrow("Unknown review scenario");
  });

  it("rejects duplicate document IDs, unknown control references, and non-verbatim excerpts", () => {
    const duplicateDocument = structuredClone(northstarScenario);
    duplicateDocument.documents[1].id = duplicateDocument.documents[0].id;
    expect(safeValidateScenario(duplicateDocument)).toBeNull();

    const unknownControl = structuredClone(northstarScenario);
    unknownControl.expectedOutcomes[0].controlId = "CTRL-UNKNOWN";
    expect(safeValidateScenario(unknownControl)).toBeNull();

    const inventedExcerpt = structuredClone(northstarScenario);
    inventedExcerpt.documents[0].facts[0].excerpt = "Invented source text.";
    expect(safeValidateScenario(inventedExcerpt)).toBeNull();
  });

  it("rejects ambiguous numbers, ambiguous dates, non-finite values, and missing control parameters", () => {
    const ambiguousNumber = structuredClone(northstarScenario);
    ambiguousNumber.documents[1].facts.find(({ key }) => key === "invoiceAmount")!.value = "12.480,00";
    expect(safeValidateScenario(ambiguousNumber)).toBeNull();

    const ambiguousDate = structuredClone(northstarScenario);
    ambiguousDate.documents[1].facts.find(({ key }) => key === "invoiceDate")!.value = "04/05/26";
    expect(safeValidateScenario(ambiguousDate)).toBeNull();

    const infiniteAmount = structuredClone(northstarScenario);
    infiniteAmount.documents[1].facts.find(({ key }) => key === "invoiceAmount")!.value = Number.POSITIVE_INFINITY;
    expect(safeValidateScenario(infiniteAmount)).toBeNull();

    const missingParameter = structuredClone(northstarScenario) as unknown as { controls: Array<{ kind: string; parameters: Record<string, unknown> }> };
    const approval = missingParameter.controls.find(({ kind }) => kind === "APPROVAL_THRESHOLD")!;
    delete approval.parameters.thresholdAmount;
    expect(safeValidateScenario(missingParameter)).toBeNull();
  });

  it("produces Northstar outcomes from cloned scenario data and the shared engine", () => {
    const controls = buildScenarioControls(northstarScenario);
    const documents = buildScenarioDocuments(northstarScenario);
    const results = runDeterministicReview(controls, documents);

    expect(results.map(({ controlId, status }) => ({ controlId, status }))).toEqual(northstarScenario.expectedOutcomes);
    expect(summarizeResults(results)).toMatchObject(northstarScenario.expectedOutcomeCounts);
    expect(results.find((result) => result.controlId === "CTRL-CURRENCY")?.contradictoryEvidence.map((item) => item.excerpt)).toEqual([
      "Purchase order amount: 12,480 EUR.",
      "Invoice amount: 12,480 USD.",
    ]);
  });

  it.each([northstarScenario, meridianScenario, atlasScenario])("validates and evaluates $id with the shared engine", (scenario) => {
    const validated = validateScenario(scenario);
    const results = runDeterministicReview(buildScenarioControls(validated), buildScenarioDocuments(validated));
    expect(results.map(({ controlId, status }) => ({ controlId, status }))).toEqual(scenario.expectedOutcomes);
    expect(summarizeResults(results)).toMatchObject(scenario.expectedOutcomeCounts);
    expect(buildEvidenceCoverage(results, scenario.documents)).toHaveLength(7);
    expect(extractChronology(scenario.documents).length).toBeGreaterThanOrEqual(2);
  });

  it("resets stale state while preserving the selected language", () => {
    const reset = createScenarioResetState(atlasScenario, "fr");
    expect(reset.locale).toBe("fr");
    expect(reset.scenario.id).toBe("atlas-incomplete-evidence");
    expect(reset.selectedControlId).toBeNull();
    expect(reset.filter).toBe("ALL");
    expect(reset.threshold).toBe("10000");
    expect(reset.controls).not.toBe(atlasScenario.controls);
    expect(reset.documents).not.toBe(atlasScenario.documents);
  });

  it("keeps Meridian evidence complete and Atlas missing evidence explicit", () => {
    const meridianResults = runDeterministicReview(buildScenarioControls(meridianScenario), buildScenarioDocuments(meridianScenario));
    expect(meridianResults.every((result) => result.status === "PASS" && result.missingEvidence.length === 0)).toBe(true);

    const atlasResults = runDeterministicReview(buildScenarioControls(atlasScenario), buildScenarioDocuments(atlasScenario));
    expect(atlasResults.find((result) => result.controlId === "CTRL-DELIVERY")?.missingEvidence).toHaveLength(1);
    expect(atlasResults.find((result) => result.controlId === "CTRL-BANK")?.missingEvidence).toHaveLength(1);
    expect(buildReviewerQueue(atlasResults).slice(0, 3).map((item) => item.controlId)).toEqual(expect.arrayContaining(["CTRL-APPROVAL", "CTRL-DELIVERY", "CTRL-BANK"]));
  });

  it.each([meridianScenario, atlasScenario])("creates a scenario-specific receipt for $id", (scenario) => {
    const results = runDeterministicReview(buildScenarioControls(scenario), buildScenarioDocuments(scenario));
    const receipt = createDecisionReceipt({
      results,
      policyName: scenario.policy.title,
      policyVersion: scenario.policy.version,
      caseName: scenario.caseName.en,
      selectedLanguage: "en",
      runMode: "DETERMINISTIC_DEMO",
      generatedAt: "2026-07-14T08:00:00.000Z",
      enabledControlCount: scenario.controls.length,
    });
    expect(receipt.caseName).toBe(scenario.caseName.en);
    expect(receipt.summary).toMatchObject(scenario.expectedOutcomeCounts);
  });
});
