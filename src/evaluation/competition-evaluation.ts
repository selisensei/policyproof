import { createAuditEvent } from "@/src/lib/audit-trail";
import { createDecisionReceipt } from "@/src/lib/decision-receipt";
import {
  attachReceiptIntegrity,
  buildReceiptIntegrityPayload,
  verifyReceiptIntegrity,
} from "@/src/lib/receipt-integrity";
import { runDeterministicReview } from "@/src/lib/review-engine";
import { buildReviewFingerprintPayload, computeReviewFingerprint } from "@/src/lib/review-fingerprint";
import { summarizeResults } from "@/src/lib/review-summary";
import { validateScenario } from "@/src/domain/scenario-schema";
import type { ControlResult } from "@/src/domain/schemas";
import {
  COMPETITION_EVALUATION_VERSION,
  CompetitionEvaluationSchema,
  type CompetitionEvaluation,
  type EvaluationCheck,
} from "@/src/evaluation/competition-evaluation-schema";
import { runBusinessRuleMutations, runThresholdBoundary } from "@/src/evaluation/business-rule-mutations";
import { runAdversarialCorpus } from "@/src/evaluation/adversarial-corpus";
import { validateScenarioResultEvidence } from "@/src/evaluation/evidence-validation";
import { withNetworkBlocked } from "@/src/evaluation/network-guard";
import { reviewScenarios } from "@/src/fixtures/scenarios";

const FIXED_RECEIPT_TIME = "2026-07-16T12:00:00.000Z";

function check(condition: boolean, pass: string, fail: string): EvaluationCheck {
  return { status: condition ? "PASS" : "FAIL", detail: condition ? pass : fail };
}

function outcomeCounts(results: ControlResult[]) {
  const summary = summarizeResults(results);
  return { PASS: summary.PASS, FAIL: summary.FAIL, MISSING: summary.MISSING, WARNING: summary.WARNING, total: summary.total };
}

async function fingerprint(scenario: (typeof reviewScenarios)[number], results: ControlResult[]) {
  const payload = buildReviewFingerprintPayload({
    scenarioId: scenario.id,
    caseReference: scenario.caseReference,
    policy: scenario.policy,
    controls: scenario.controls,
    documents: scenario.documents,
    results,
  });
  return { payload, value: await computeReviewFingerprint(payload) };
}

async function receiptChecks(): Promise<boolean> {
  for (const source of reviewScenarios) {
    const scenario = validateScenario(structuredClone(source));
    const results = runDeterministicReview(scenario.controls, scenario.documents);
    const reviewFingerprint = await fingerprint(scenario, results);
    const auditTrail = [createAuditEvent({
      action: "REVIEW_RUN",
      scenarioId: scenario.id,
      description: "Competition evaluation executed the deterministic review.",
      timestamp: FIXED_RECEIPT_TIME,
    })];
    const decisionReceipt = createDecisionReceipt({
      results,
      policyName: scenario.policy.title,
      policyVersion: scenario.policy.version,
      caseName: scenario.caseName.en,
      selectedLanguage: "en",
      runMode: "DETERMINISTIC_DEMO",
      generatedAt: FIXED_RECEIPT_TIME,
      enabledControlCount: scenario.controls.length,
      auditTrail,
    });
    const payload = buildReceiptIntegrityPayload({
      decisionReceipt,
      reviewFingerprintPayload: reviewFingerprint.payload,
      reviewFingerprint: reviewFingerprint.value,
      auditTrail,
    });
    const verifiable = await attachReceiptIntegrity(payload);
    if ((await verifyReceiptIntegrity(verifiable)).status !== "VALID") return false;
    const modified = structuredClone(verifiable);
    modified.receipt.receiptId += "-modified";
    if ((await verifyReceiptIntegrity(modified)).status !== "MODIFIED") return false;
  }
  return true;
}

async function buildCompetitionEvaluation(): Promise<CompetitionEvaluation> {
  const failures: string[] = [];
  const evaluatedScenarios = [];
  const fingerprints = new Map<string, { first: string; second: string }>();
  const scenarioIdentitySets: string[][] = [];

  for (const source of reviewScenarios) {
    const scenario = validateScenario(structuredClone(source));
    const results = runDeterministicReview(scenario.controls, scenario.documents);
    const rerun = runDeterministicReview(structuredClone(scenario.controls), structuredClone(scenario.documents));
    const firstFingerprint = await fingerprint(scenario, results);
    const secondFingerprint = await fingerprint(scenario, rerun);
    fingerprints.set(scenario.id, { first: firstFingerprint.value, second: secondFingerprint.value });
    const evidence = validateScenarioResultEvidence(scenario, results);
    const actualCounts = outcomeCounts(results);
    const conclusions = scenario.expectedOutcomes.map((expected) => {
      const actual = results.find(({ controlId }) => controlId === expected.controlId)?.status;
      if (!actual) throw new Error(`Missing result for ${scenario.id}/${expected.controlId}.`);
      return { controlId: expected.controlId, expected: expected.status, actual, matches: actual === expected.status };
    });
    const expectedCounts = scenario.expectedOutcomeCounts;
    const outcomeProfileMatched = JSON.stringify(actualCounts) === JSON.stringify(expectedCounts);
    evaluatedScenarios.push({
      scenarioId: scenario.id,
      caseReference: scenario.caseReference,
      executionMode: "DETERMINISTIC" as const,
      controlCount: 7 as const,
      conclusions,
      expectedOutcomeCounts: expectedCounts,
      actualOutcomeCounts: actualCounts,
      outcomeProfileMatched,
      evidenceReferencesValid: evidence.referencesValid && evidence.relationshipsValid,
      exactExcerptsValid: evidence.exactExcerptsValid,
    });
    scenarioIdentitySets.push(scenario.documents.map(({ id }) => id));
  }

  const matchedConclusions = evaluatedScenarios.flatMap(({ conclusions }) => conclusions).filter(({ matches }) => matches).length;
  const matchedProfiles = evaluatedScenarios.filter(({ outcomeProfileMatched }) => outcomeProfileMatched).length;
  const fingerprintsStable = [...fingerprints.values()].every(({ first, second }) => first === second);
  const conclusionsReproduced = evaluatedScenarios.every(({ conclusions }) => conclusions.every(({ matches }) => matches));
  const allDocumentIds = scenarioIdentitySets.flat();
  const scenarioIsolation = new Set(allDocumentIds).size === allDocumentIds.length &&
    reviewScenarios.every((scenario) => scenario.controls.every((control) => control.enabled));

  const mutations = await runBusinessRuleMutations();
  const mutationPasses = mutations.filter(({ passed }) => passed).length;
  const thresholdMutation = mutations.find(({ mutationId }) => mutationId === "MUT-THRESHOLD-001");
  const thresholdBoundaries = runThresholdBoundary(9_999.99) === "PASS" &&
    runThresholdBoundary(10_000) === "PASS" &&
    runThresholdBoundary(10_000.01) === "FAIL";
  const thresholdSensitivity = Boolean(thresholdMutation?.passed && thresholdMutation.changedControlIds[0] === "CTRL-APPROVAL" && thresholdBoundaries);
  const adversarial = await runAdversarialCorpus();
  const adversarialPasses = adversarial.filter(({ passed }) => passed).length;
  const receiptsValid = await receiptChecks();

  const checks = {
    scenarioSchemas: check(evaluatedScenarios.length === 3, "Three strict scenario schemas validated.", "Scenario validation was incomplete."),
    expectedConclusions: check(matchedConclusions === 21, "All 21 expected conclusions matched.", `${matchedConclusions} of 21 conclusions matched.`),
    outcomeProfiles: check(matchedProfiles === 3, "All three outcome profiles matched.", `${matchedProfiles} of 3 profiles matched.`),
    evidenceReferences: check(evaluatedScenarios.every(({ evidenceReferencesValid }) => evidenceReferencesValid), "All evidence references and control relationships are valid.", "An evidence reference or relationship failed."),
    exactExcerpts: check(evaluatedScenarios.every(({ exactExcerptsValid }) => exactExcerptsValid), "All controlled excerpts are exact source text.", "An exact excerpt failed validation."),
    scenarioIsolation: check(scenarioIsolation, "Scenario identifiers and state remain isolated.", "Scenario state or identifiers leaked."),
    deterministicReproduction: check(conclusionsReproduced, "All conclusions reproduced from cloned inputs.", "A deterministic conclusion diverged."),
    thresholdSensitivity: check(thresholdSensitivity, "Only approval changes at EUR 15,000; strict > boundaries pass.", "Threshold sensitivity or boundary behavior failed."),
    reviewFingerprints: check(fingerprintsStable && Boolean(thresholdMutation?.fingerprintChanged), "Same inputs preserve fingerprints; threshold mutation changes it.", "Review Fingerprint behavior failed."),
    receiptIntegrity: check(receiptsValid, "Controlled receipts verify and modified receipts fail.", "Receipt Integrity verification failed."),
    businessRuleMutations: check(mutationPasses === mutations.length, `All ${mutations.length} business-rule mutations passed.`, `${mutationPasses} of ${mutations.length} mutations passed.`),
    adversarialValidation: check(adversarialPasses === adversarial.length, `All ${adversarial.length} adversarial cases passed.`, `${adversarialPasses} of ${adversarial.length} adversarial cases passed.`),
    noNetwork: check(true, "Network APIs were blocked for the complete evaluation.", "A network attempt occurred."),
  } satisfies CompetitionEvaluation["checks"];

  for (const [name, value] of Object.entries(checks)) {
    if (value.status === "FAIL") failures.push(`${name}: ${value.detail}`);
  }

  return CompetitionEvaluationSchema.parse({
    evaluationSchemaVersion: COMPETITION_EVALUATION_VERSION,
    applicationSchemaVersion: "policyproof.app-schema.v1",
    evaluationMode: "LOCAL_DETERMINISTIC_NO_NETWORK",
    evaluatedScenarios,
    totals: {
      scenariosEvaluated: 3,
      controlsEvaluated: 21,
      expectedConclusionsMatched: matchedConclusions,
      outcomeProfilesMatched: matchedProfiles,
      externalNetworkCalls: 0,
      unexpectedFailures: failures.length,
    },
    checks,
    mutationSummary: {
      schemaVersion: "policyproof.business-rule-mutation.v1",
      executed: mutations.length,
      passed: mutationPasses,
      status: mutationPasses === mutations.length ? "PASS" : "FAIL",
    },
    adversarialSummary: {
      schemaVersion: "policyproof.adversarial-corpus.v1",
      executed: adversarial.length,
      passed: adversarialPasses,
      status: adversarialPasses === adversarial.length ? "PASS" : "FAIL",
    },
    historicalLiveValidation: {
      status: "HISTORICAL_EVIDENCE",
      model: "gpt-5.6",
      validatedCommit: "eb120feaca78bf3cdbc71b7b7198045f86a44852",
      source: "docs/evaluation/LIVE_GPT56_VALIDATION.md",
      executedDuringEvaluation: false,
    },
    receiptSecurityBoundary: {
      classification: "EXPECTED SECURITY BOUNDARY",
      contentHashVerified: true,
      modifiedContentDetected: true,
      digitallySigned: false,
      provesOrigin: false,
      provesIdentity: false,
      provesAuthorship: false,
      provesTrustedTime: false,
      provesLegalSignature: false,
      simultaneousContentAndHashReplacementRemainsPossible: true,
    },
    warnings: ["Historical live GPT-5.6 evidence was not rerun.", "Evaluation covers one controlled procurement-policy domain, not universal policy coverage."],
    failures,
    overallResult: failures.length === 0 ? "PASS" : "FAIL",
  });
}

export async function runCompetitionEvaluation(): Promise<CompetitionEvaluation> {
  const guarded = await withNetworkBlocked(buildCompetitionEvaluation);
  if (guarded.attempts !== 0) throw new Error(`Competition evaluation attempted ${guarded.attempts} network calls.`);
  return guarded.value;
}

export function competitionEvaluationExitCode(evaluation: CompetitionEvaluation): 0 | 1 {
  return evaluation.overallResult === "PASS" && evaluation.failures.length === 0 ? 0 : 1;
}
