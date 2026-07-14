import { describe, expect, it } from "vitest";
import {
  buildScenarioControls,
  buildScenarioDocuments,
  deriveScenarioContext,
  loadScenario,
  safeValidateScenario,
  validateScenario,
} from "@/src/domain/scenario-schema";
import { northstarScenario, reviewScenarios } from "@/src/fixtures/scenarios";
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
});
