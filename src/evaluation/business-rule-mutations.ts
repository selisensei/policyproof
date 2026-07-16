import { z } from "zod";
import { BUSINESS_RULE_MUTATION_VERSION } from "@/src/evaluation/competition-evaluation-schema";
import { validateScenarioResultEvidence } from "@/src/evaluation/evidence-validation";
import { validateScenario, type ReviewScenario } from "@/src/domain/scenario-schema";
import type { ControlStatus } from "@/src/evaluation/types";
import { northstarScenario } from "@/src/fixtures/scenarios";
import { runDeterministicReview } from "@/src/lib/review-engine";
import { buildReviewFingerprintPayload, computeReviewFingerprint } from "@/src/lib/review-fingerprint";

export const BusinessRuleMutationCaseSchema = z.object({
  schemaVersion: z.literal(BUSINESS_RULE_MUTATION_VERSION),
  mutationId: z.enum([
    "MUT-CURRENCY-001",
    "MUT-AMOUNT-001",
    "MUT-TIMING-001",
    "MUT-DELIVERY-001",
    "MUT-SOD-001",
    "MUT-BANK-001",
    "MUT-THRESHOLD-001",
  ]),
  title: z.string().min(1),
  baseScenarioId: z.literal("northstar-mixed-risk"),
  changedFact: z.string().min(1),
  expectedChangedControlId: z.string().min(1),
  expectedPreviousStatus: z.enum(["PASS", "FAIL", "MISSING", "WARNING"]),
  expectedNewStatus: z.enum(["PASS", "FAIL", "MISSING", "WARNING"]),
  expectedUnchangedControlCount: z.literal(6),
  expectedFingerprintChange: z.literal(true),
  reason: z.string().min(1),
}).strict();

export type BusinessRuleMutationCase = z.infer<typeof BusinessRuleMutationCaseSchema>;
export type BusinessRuleMutationResult = BusinessRuleMutationCase & {
  changedControlIds: string[];
  unchangedControlCount: number;
  previousStatus: ControlStatus;
  newStatus: ControlStatus;
  fingerprintChanged: boolean;
  evidenceValid: boolean;
  scenarioIdentityPreserved: boolean;
  humanDecisionLeakage: boolean;
  passed: boolean;
  failures: string[];
};

type MutableFact = ReviewScenario["documents"][number]["facts"][number];
type MutationImplementation = {
  definition: BusinessRuleMutationCase;
  apply: (scenario: ReviewScenario) => void;
};

function fact(scenario: ReviewScenario, key: string): { document: ReviewScenario["documents"][number]; fact: MutableFact } {
  for (const document of scenario.documents) {
    const candidate = document.facts.find((item) => item.key === key);
    if (candidate) return { document, fact: candidate };
  }
  throw new Error(`Mutation fact not found: ${key}.`);
}

function replaceExact(document: ReviewScenario["documents"][number], previous: string, next: string): void {
  if (!document.content.includes(previous)) throw new Error(`Mutation source text not found: ${previous}.`);
  document.content = document.content.replace(previous, next);
  for (const item of document.facts) {
    if (item.excerpt === previous) item.excerpt = next;
  }
}

function definition(input: Omit<BusinessRuleMutationCase, "schemaVersion" | "baseScenarioId" | "expectedUnchangedControlCount" | "expectedFingerprintChange">): BusinessRuleMutationCase {
  return BusinessRuleMutationCaseSchema.parse({
    schemaVersion: BUSINESS_RULE_MUTATION_VERSION,
    baseScenarioId: northstarScenario.id,
    expectedUnchangedControlCount: 6,
    expectedFingerprintChange: true,
    ...input,
  });
}

const mutationImplementations: readonly MutationImplementation[] = [
  {
    definition: definition({
      mutationId: "MUT-CURRENCY-001",
      title: "Correct invoice currency",
      changedFact: "Invoice currency USD to EUR",
      expectedChangedControlId: "CTRL-CURRENCY",
      expectedPreviousStatus: "FAIL",
      expectedNewStatus: "PASS",
      reason: "Proves that the currency rule responds only to the controlled currency fact.",
    }),
    apply: (scenario) => {
      const invoice = fact(scenario, "invoiceCurrency");
      replaceExact(invoice.document, "Invoice amount: 12,480 USD.", "Invoice amount: 12,480 EUR.");
      invoice.fact.value = "EUR";
    },
  },
  {
    definition: definition({
      mutationId: "MUT-AMOUNT-001",
      title: "Create invoice amount mismatch",
      changedFact: "Invoice amount 12,480 to 12,481",
      expectedChangedControlId: "CTRL-AMOUNT",
      expectedPreviousStatus: "PASS",
      expectedNewStatus: "FAIL",
      reason: "Proves that the amount rule detects an exact one-euro difference without changing currency logic.",
    }),
    apply: (scenario) => {
      const invoice = fact(scenario, "invoiceAmount");
      replaceExact(invoice.document, "Invoice amount: 12,480 USD.", "Invoice amount: 12,481 USD.");
      invoice.fact.value = 12_481;
    },
  },
  {
    definition: definition({
      mutationId: "MUT-TIMING-001",
      title: "Move invoice before purchase order",
      changedFact: "Invoice date 2026-07-05 to 2026-07-02",
      expectedChangedControlId: "CTRL-TIMING",
      expectedPreviousStatus: "PASS",
      expectedNewStatus: "FAIL",
      reason: "Proves that the chronology rule responds to controlled ISO dates.",
    }),
    apply: (scenario) => {
      const invoice = fact(scenario, "invoiceDate");
      replaceExact(invoice.document, "Invoice date: 2026-07-05.", "Invoice date: 2026-07-02.");
      invoice.fact.value = "2026-07-02";
    },
  },
  {
    definition: definition({
      mutationId: "MUT-DELIVERY-001",
      title: "Remove valid delivery evidence",
      changedFact: "Delivery evidence true to false",
      expectedChangedControlId: "CTRL-DELIVERY",
      expectedPreviousStatus: "PASS",
      expectedNewStatus: "MISSING",
      reason: "Proves that the delivery rule fails closed when the controlled evidence fact is absent.",
    }),
    apply: (scenario) => {
      const delivery = fact(scenario, "deliveryEvidenceExists");
      replaceExact(delivery.document, "Delivery note exists.", "Delivery evidence is not available.");
      delivery.fact.value = false;
    },
  },
  {
    definition: definition({
      mutationId: "MUT-SOD-001",
      title: "Separate initiator and approver",
      changedFact: "Approver Emma Reed to Alex Morgan",
      expectedChangedControlId: "CTRL-SOD",
      expectedPreviousStatus: "WARNING",
      expectedNewStatus: "PASS",
      reason: "Proves that segregation compares fictional identities without changing approval count.",
    }),
    apply: (scenario) => {
      const approvers = fact(scenario, "approvers");
      replaceExact(approvers.document, "Approvers recorded: Emma Reed.", "Approvers recorded: Alex Morgan.");
      approvers.fact.value = ["Alex Morgan"];
    },
  },
  {
    definition: definition({
      mutationId: "MUT-BANK-001",
      title: "Add independent bank verification",
      changedFact: "Independent bank verification false to true",
      expectedChangedControlId: "CTRL-BANK",
      expectedPreviousStatus: "MISSING",
      expectedNewStatus: "PASS",
      reason: "Proves that the bank-change rule accepts controlled exact verification evidence.",
    }),
    apply: (scenario) => {
      const verification = fact(scenario, "independentBankVerificationExists");
      replaceExact(
        verification.document,
        "No independent bank-verification evidence was attached.",
        "Independent bank verification completed by Olivia Chen.",
      );
      verification.fact.value = true;
      verification.fact.evidenceType = "SUPPORTING";
      verification.fact.relationToControl = "CTRL-BANK";
    },
  },
  {
    definition: definition({
      mutationId: "MUT-THRESHOLD-001",
      title: "Raise approval threshold",
      changedFact: "Approval threshold EUR 10,000 to EUR 15,000",
      expectedChangedControlId: "CTRL-APPROVAL",
      expectedPreviousStatus: "FAIL",
      expectedNewStatus: "PASS",
      reason: "Protects the validated threshold-sensitivity behavior.",
    }),
    apply: (scenario) => {
      const control = scenario.controls.find((candidate) => candidate.kind === "APPROVAL_THRESHOLD");
      if (!control || control.kind !== "APPROVAL_THRESHOLD") throw new Error("Approval control not found.");
      control.parameters.thresholdAmount = 15_000;
    },
  },
];

export const businessRuleMutationCases = mutationImplementations.map(({ definition: item }) => item);

function statusMap(results: ReturnType<typeof runDeterministicReview>): Map<string, ControlStatus> {
  return new Map(results.map(({ controlId, status }) => [controlId, status]));
}

async function fingerprintFor(scenario: ReviewScenario, results: ReturnType<typeof runDeterministicReview>): Promise<string> {
  return computeReviewFingerprint(buildReviewFingerprintPayload({
    scenarioId: scenario.id,
    caseReference: scenario.caseReference,
    policy: scenario.policy,
    controls: scenario.controls,
    documents: scenario.documents,
    results,
  }));
}

export async function runBusinessRuleMutations(): Promise<BusinessRuleMutationResult[]> {
  const base = validateScenario(structuredClone(northstarScenario));
  const baseResults = runDeterministicReview(base.controls, base.documents);
  const baseStatuses = statusMap(baseResults);
  const baseFingerprint = await fingerprintFor(base, baseResults);

  return Promise.all(mutationImplementations.map(async ({ definition: item, apply }) => {
    const mutated = structuredClone(base);
    apply(mutated);
    const validated = validateScenario(mutated);
    const results = runDeterministicReview(validated.controls, validated.documents);
    const statuses = statusMap(results);
    const changedControlIds = [...baseStatuses.keys()].filter((id) => baseStatuses.get(id) !== statuses.get(id));
    const previousStatus = baseStatuses.get(item.expectedChangedControlId);
    const newStatus = statuses.get(item.expectedChangedControlId);
    if (!previousStatus || !newStatus) throw new Error(`Mutation control missing: ${item.expectedChangedControlId}.`);
    const fingerprintChanged = baseFingerprint !== await fingerprintFor(validated, results);
    const evidence = validateScenarioResultEvidence(validated, results);
    const humanDecisionLeakage = results.some(({ reviewerDecision }) => reviewerDecision.state !== "PENDING" || reviewerDecision.comment !== "");
    const scenarioIdentityPreserved = validated.id === base.id && validated.caseReference === base.caseReference;
    const failures = [
      changedControlIds.length === 1 && changedControlIds[0] === item.expectedChangedControlId ? null : `Unexpected changed controls: ${changedControlIds.join(", ") || "none"}.`,
      previousStatus === item.expectedPreviousStatus ? null : `Unexpected previous status ${previousStatus}.`,
      newStatus === item.expectedNewStatus ? null : `Unexpected new status ${newStatus}.`,
      results.length - changedControlIds.length === item.expectedUnchangedControlCount ? null : "Unexpected unchanged-control count.",
      fingerprintChanged ? null : "Review Fingerprint did not change.",
      evidence.referencesValid && evidence.exactExcerptsValid && evidence.relationshipsValid ? null : evidence.failures.join(" "),
      scenarioIdentityPreserved ? null : "Scenario identity changed.",
      !humanDecisionLeakage ? null : "Human decision leaked into mutation run.",
    ].filter((failure): failure is string => Boolean(failure));
    return {
      ...item,
      changedControlIds,
      unchangedControlCount: results.length - changedControlIds.length,
      previousStatus,
      newStatus,
      fingerprintChanged,
      evidenceValid: evidence.referencesValid && evidence.exactExcerptsValid && evidence.relationshipsValid,
      scenarioIdentityPreserved,
      humanDecisionLeakage,
      passed: failures.length === 0,
      failures,
    };
  }));
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2 });
}

export function runThresholdBoundary(amount: number): ControlStatus {
  const scenario = structuredClone(northstarScenario);
  const formatted = formatAmount(amount);
  const po = fact(scenario, "purchaseOrderAmount");
  const invoice = fact(scenario, "invoiceAmount");
  replaceExact(po.document, "Purchase order amount: 12,480 EUR.", `Purchase order amount: ${formatted} EUR.`);
  replaceExact(invoice.document, "Invoice amount: 12,480 USD.", `Invoice amount: ${formatted} USD.`);
  po.fact.value = amount;
  invoice.fact.value = amount;
  const validated = validateScenario(scenario);
  const result = runDeterministicReview(validated.controls, validated.documents).find(({ controlId }) => controlId === "CTRL-APPROVAL");
  if (!result) throw new Error("Approval boundary result missing.");
  return result.status;
}
