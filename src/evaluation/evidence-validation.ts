import type { ReviewScenario } from "@/src/domain/scenario-schema";
import type { ControlResult, EvidenceReference } from "@/src/domain/schemas";

export type EvidenceValidation = {
  referencesValid: boolean;
  exactExcerptsValid: boolean;
  relationshipsValid: boolean;
  failures: string[];
};

function validateReference(
  scenario: ReviewScenario,
  controlId: string,
  reference: EvidenceReference,
): string[] {
  const failures: string[] = [];
  const document = scenario.documents.find(({ id }) => id === reference.documentId);
  if (!document) return [`${controlId}: unknown document ${reference.documentId}.`];
  const fact = document.facts.find(({ id }) => id === reference.factId);
  if (!fact) failures.push(`${controlId}: unknown fact ${reference.factId}.`);
  if (!document.content.includes(reference.excerpt) || fact?.excerpt !== reference.excerpt) {
    failures.push(`${controlId}: excerpt ${reference.id} is not exact source text.`);
  }
  if (fact && fact.sourceLocator !== reference.locator) {
    failures.push(`${controlId}: locator mismatch for ${reference.id}.`);
  }
  const relationship = scenario.evidenceRelationships.find(({ controlId: expectedId }) => expectedId === controlId);
  if (!relationship || !relationship.documentIds.includes(reference.documentId)) {
    failures.push(`${controlId}: document ${reference.documentId} is not an allowed evidence relationship.`);
  }
  return failures;
}

export function validateScenarioResultEvidence(scenario: ReviewScenario, results: ControlResult[]): EvidenceValidation {
  const failures = results.flatMap((result) => [
    ...result.supportingEvidence.flatMap((reference) => validateReference(scenario, result.controlId, reference)),
    ...result.contradictoryEvidence.flatMap((reference) => validateReference(scenario, result.controlId, reference)),
  ]);
  const referenceFailures = failures.filter((failure) => /unknown document|unknown fact/.test(failure));
  const excerptFailures = failures.filter((failure) => /excerpt|locator/.test(failure));
  const relationshipFailures = failures.filter((failure) => /allowed evidence relationship/.test(failure));
  return {
    referencesValid: referenceFailures.length === 0,
    exactExcerptsValid: excerptFailures.length === 0,
    relationshipsValid: relationshipFailures.length === 0,
    failures,
  };
}
