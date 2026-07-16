import { describe, expect, it } from "vitest";
import { validateScenarioResultEvidence } from "@/src/evaluation/evidence-validation";
import { northstarScenario } from "@/src/fixtures/scenarios";
import { runDeterministicReview } from "@/src/lib/review-engine";

function results() {
  return runDeterministicReview(structuredClone(northstarScenario.controls), structuredClone(northstarScenario.documents));
}

describe("evaluation evidence relationship validator", () => {
  it("accepts all exact controlled Northstar references", () => {
    expect(validateScenarioResultEvidence(northstarScenario, results())).toMatchObject({
      referencesValid: true,
      exactExcerptsValid: true,
      relationshipsValid: true,
      failures: [],
    });
  });

  it("rejects duplicate evidence IDs, unknown controls, and whitespace-only excerpts", () => {
    const duplicate = results();
    duplicate[0].supportingEvidence.push(structuredClone(duplicate[0].supportingEvidence[0]));
    expect(validateScenarioResultEvidence(northstarScenario, duplicate).referencesValid).toBe(false);

    const unknownControl = results();
    unknownControl[0].controlId = "CTRL-UNKNOWN";
    expect(validateScenarioResultEvidence(northstarScenario, unknownControl).relationshipsValid).toBe(false);

    const whitespace = structuredClone(northstarScenario);
    whitespace.documents[0].facts[0].excerpt = " ";
    expect(() => runDeterministicReview(whitespace.controls, whitespace.documents)).toThrow();
  });
});
