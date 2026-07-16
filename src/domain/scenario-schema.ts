import { z } from "zod";
import {
  CaseDocumentSchema,
  ControlDefinitionSchema,
  ControlStatusSchema,
  PolicyDefinitionSchema,
  type CaseDocument,
  type ControlDefinition,
} from "@/src/domain/schemas";

export const LocalizedScenarioTextSchema = z.object({
  en: z.string().min(1),
  fr: z.string().min(1),
});

export const ScenarioProfileSchema = z.enum([
  "MIXED_RISK",
  "MOSTLY_COMPLIANT",
  "EVIDENCE_DEFICIENT",
]);

const outcomeCountsSchema = z.object({
  PASS: z.number().int().nonnegative(),
  FAIL: z.number().int().nonnegative(),
  MISSING: z.number().int().nonnegative(),
  WARNING: z.number().int().nonnegative(),
  total: z.number().int().positive(),
});

export const ReviewScenarioSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  caseName: LocalizedScenarioTextSchema,
  caseDescription: LocalizedScenarioTextSchema,
  purpose: LocalizedScenarioTextSchema,
  profile: ScenarioProfileSchema,
  caseReference: z.string().min(1),
  policyReference: z.string().min(1),
  policy: PolicyDefinitionSchema,
  controls: z.array(ControlDefinitionSchema).min(1),
  documents: z.array(CaseDocumentSchema).min(1),
  expectedOutcomes: z.array(z.object({
    controlId: z.string().min(1),
    status: ControlStatusSchema,
  })).min(1),
  expectedOutcomeCounts: outcomeCountsSchema,
  evidenceRelationships: z.array(z.object({
    controlId: z.string().min(1),
    documentIds: z.array(z.string().min(1)),
    relationship: z.enum(["SUPPORTING", "CONTRADICTORY", "MISSING"]),
  })),
  thresholdParameters: z.object({
    defaultAmount: z.number().nonnegative(),
    comparisonAmount: z.number().nonnegative().nullable(),
    currency: z.literal("EUR"),
  }),
  guidedDemo: z.object({
    defaultSelectedControlId: z.string().min(1),
    highlights: z.array(z.object({
      id: z.string().min(1),
      controlId: z.string().min(1).nullable(),
      copy: LocalizedScenarioTextSchema,
    })),
  }),
  assumptions: z.object({
    demonstrates: z.array(LocalizedScenarioTextSchema).min(1),
    simplifications: z.array(LocalizedScenarioTextSchema).min(1),
    intentionallyMissing: z.array(LocalizedScenarioTextSchema),
    expectedDetection: z.array(LocalizedScenarioTextSchema).min(1),
  }),
  limitations: z.array(LocalizedScenarioTextSchema).min(1),
  provenance: z.object({
    fixtureType: z.literal("DETERMINISTIC_FIXTURE"),
    fictional: z.literal(true),
    containsRealOrganizationData: z.literal(false),
  }),
}).superRefine((scenario, context) => {
  const controlIds = scenario.controls.map((control) => control.id);
  const uniqueControlIds = new Set(controlIds);
  if (uniqueControlIds.size !== controlIds.length) {
    context.addIssue({ code: "custom", path: ["controls"], message: "Scenario control IDs must be unique." });
  }

  const documentIds = scenario.documents.map((document) => document.id);
  const uniqueDocumentIds = new Set(documentIds);
  if (uniqueDocumentIds.size !== documentIds.length) {
    context.addIssue({ code: "custom", path: ["documents"], message: "Scenario document IDs must be unique." });
  }

  const factIds = scenario.documents.flatMap((document) => document.facts.map((fact) => fact.id));
  if (new Set(factIds).size !== factIds.length) {
    context.addIssue({ code: "custom", path: ["documents"], message: "Scenario fact IDs must be unique." });
  }

  scenario.documents.forEach((document, documentIndex) => {
    document.facts.forEach((fact, factIndex) => {
      if (!document.content.includes(fact.excerpt)) {
        context.addIssue({
          code: "custom",
          path: ["documents", documentIndex, "facts", factIndex, "excerpt"],
          message: "Fact excerpt must occur verbatim in its source document.",
        });
      }
      const valuePath = ["documents", documentIndex, "facts", factIndex, "value"];
      if (["purchaseOrderAmount", "invoiceAmount"].includes(fact.key) &&
          (typeof fact.value !== "number" || !Number.isFinite(fact.value))) {
        context.addIssue({ code: "custom", path: valuePath, message: `${fact.key} must be a finite numeric value.` });
      }
      if (["deliveryEvidenceExists", "bankDetailsChanged", "independentBankVerificationExists"].includes(fact.key) &&
          typeof fact.value !== "boolean") {
        context.addIssue({ code: "custom", path: valuePath, message: `${fact.key} must be a boolean value.` });
      }
      if (fact.key === "approvers" &&
          (!Array.isArray(fact.value) || fact.value.some((value) => typeof value !== "string" || !value.trim()))) {
        context.addIssue({ code: "custom", path: valuePath, message: "approvers must be an array of non-empty names." });
      }
      if (["purchaseOrderDate", "invoiceDate", "deliveryDate"].includes(fact.key)) {
        const value = fact.value;
        const validIsoDate = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
          new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
        if (!validIsoDate) {
          context.addIssue({ code: "custom", path: valuePath, message: `${fact.key} must be an unambiguous ISO 8601 calendar date.` });
        }
      }
    });
  });

  if (new Set(scenario.policy.controlIds).size !== scenario.policy.controlIds.length ||
      scenario.policy.controlIds.some((id) => !uniqueControlIds.has(id)) ||
      controlIds.some((id) => !scenario.policy.controlIds.includes(id))) {
    context.addIssue({ code: "custom", path: ["policy", "controlIds"], message: "Policy and scenario control IDs must match." });
  }

  const expectedIds = scenario.expectedOutcomes.map((outcome) => outcome.controlId);
  if (new Set(expectedIds).size !== expectedIds.length || expectedIds.some((id) => !uniqueControlIds.has(id)) || expectedIds.length !== controlIds.length) {
    context.addIssue({ code: "custom", path: ["expectedOutcomes"], message: "Expected outcomes must reference every control exactly once." });
  }

  const calculatedCounts = scenario.expectedOutcomes.reduce(
    (counts, outcome) => ({ ...counts, [outcome.status]: counts[outcome.status] + 1 }),
    { PASS: 0, FAIL: 0, MISSING: 0, WARNING: 0 },
  );
  if (scenario.expectedOutcomeCounts.total !== scenario.expectedOutcomes.length ||
      Object.entries(calculatedCounts).some(([status, count]) => scenario.expectedOutcomeCounts[status as keyof typeof calculatedCounts] !== count)) {
    context.addIssue({ code: "custom", path: ["expectedOutcomeCounts"], message: "Expected outcome counts must match expected outcomes." });
  }

  if (!uniqueControlIds.has(scenario.guidedDemo.defaultSelectedControlId)) {
    context.addIssue({ code: "custom", path: ["guidedDemo", "defaultSelectedControlId"], message: "Default selected control must exist." });
  }

  scenario.evidenceRelationships.forEach((relationship, index) => {
    if (!uniqueControlIds.has(relationship.controlId) || relationship.documentIds.some((id) => !uniqueDocumentIds.has(id))) {
      context.addIssue({ code: "custom", path: ["evidenceRelationships", index], message: "Evidence relationships must reference known controls and documents." });
    }
  });
});

export type ReviewScenario = z.infer<typeof ReviewScenarioSchema>;
export type ScenarioProfile = z.infer<typeof ScenarioProfileSchema>;

export type ScenarioContext = {
  scenarioId: string;
  caseReference: string;
  policyId: string;
  policyVersion: string;
  documentCount: number;
  controlCount: number;
  defaultThreshold: number;
};

export type ScenarioResetState = {
  scenario: ReviewScenario;
  locale: "en" | "fr";
  policyText: string;
  controls: ControlDefinition[];
  documents: CaseDocument[];
  threshold: string;
  selectedControlId: null;
  filter: "ALL";
};

export function validateScenario(input: unknown): ReviewScenario {
  return ReviewScenarioSchema.parse(input);
}

export function safeValidateScenario(input: unknown): ReviewScenario | null {
  const result = ReviewScenarioSchema.safeParse(input);
  return result.success ? result.data : null;
}

export function loadScenario(id: string, scenarios: readonly ReviewScenario[]): ReviewScenario {
  const scenario = scenarios.find((candidate) => candidate.id === id);
  if (!scenario) throw new Error(`Unknown review scenario '${id}'.`);
  return ReviewScenarioSchema.parse(structuredClone(scenario));
}

export function deriveScenarioContext(scenario: ReviewScenario): ScenarioContext {
  return {
    scenarioId: scenario.id,
    caseReference: scenario.caseReference,
    policyId: scenario.policy.id,
    policyVersion: scenario.policy.version,
    documentCount: scenario.documents.length,
    controlCount: scenario.controls.length,
    defaultThreshold: scenario.thresholdParameters.defaultAmount,
  };
}

export function buildScenarioDocuments(scenario: ReviewScenario): CaseDocument[] {
  return structuredClone(scenario.documents);
}

export function buildScenarioControls(scenario: ReviewScenario): ControlDefinition[] {
  return structuredClone(scenario.controls);
}

export function createScenarioResetState(scenario: ReviewScenario, locale: "en" | "fr"): ScenarioResetState {
  const validated = ReviewScenarioSchema.parse(structuredClone(scenario));
  return {
    scenario: validated,
    locale,
    policyText: validated.policy.text,
    controls: buildScenarioControls(validated),
    documents: buildScenarioDocuments(validated),
    threshold: String(validated.thresholdParameters.defaultAmount),
    selectedControlId: null,
    filter: "ALL",
  };
}
