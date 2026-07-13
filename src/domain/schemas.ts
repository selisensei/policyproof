import { z } from "zod";

export const ControlStatusSchema = z.enum(["PASS", "FAIL", "MISSING", "WARNING"]);
export const SeveritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
export const ReviewDecisionStateSchema = z.enum([
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "ACCEPTED_EXCEPTION",
]);

const controlBase = {
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  severity: SeveritySchema,
  enabled: z.boolean(),
};

export const ControlDefinitionSchema = z.discriminatedUnion("kind", [
  z.object({
    ...controlBase,
    kind: z.literal("APPROVAL_THRESHOLD"),
    parameters: z.object({
      thresholdAmount: z.number().nonnegative(),
      currency: z.literal("EUR"),
      requiredApprovers: z.number().int().min(2),
    }),
  }),
  z.object({ ...controlBase, kind: z.literal("PO_BEFORE_INVOICE"), parameters: z.object({}) }),
  z.object({ ...controlBase, kind: z.literal("AMOUNT_MATCH"), parameters: z.object({}) }),
  z.object({ ...controlBase, kind: z.literal("CURRENCY_MATCH"), parameters: z.object({}) }),
  z.object({ ...controlBase, kind: z.literal("DELIVERY_EVIDENCE"), parameters: z.object({}) }),
  z.object({
    ...controlBase,
    kind: z.literal("BANK_CHANGE_VERIFICATION"),
    parameters: z.object({}),
  }),
  z.object({
    ...controlBase,
    kind: z.literal("SEGREGATION_OF_DUTIES"),
    parameters: z.object({}),
  }),
]);

export const PolicyDefinitionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  version: z.string().min(1),
  text: z.string().min(1),
  controlIds: z.array(z.string().min(1)).min(1),
});

export const ExtractedFactSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
  sourceLocator: z.string().min(1),
  excerpt: z.string().min(1),
  confidence: z.number().min(0).max(1).nullable().optional(),
  evidenceType: z.enum(["SUPPORTING", "CONTRADICTORY", "MISSING", "CONTEXT"]).nullable().optional(),
  relationToControl: z.string().min(1).nullable().optional(),
});

export const CaseDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["PURCHASE_ORDER", "INVOICE", "DELIVERY_NOTE", "WORKFLOW", "VENDOR_CHANGE"]),
  content: z.string().min(1),
  facts: z.array(ExtractedFactSchema),
});

export const EvidenceReferenceSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().min(1),
  documentTitle: z.string().min(1),
  factId: z.string().min(1),
  locator: z.string().min(1),
  excerpt: z.string().min(1),
  confidence: z.number().min(0).max(1).nullable(),
  evidenceType: z.enum(["SUPPORTING", "CONTRADICTORY", "MISSING", "CONTEXT"]).nullable(),
  relationToControl: z.string().min(1).nullable(),
});

export const MissingEvidenceSchema = z.object({
  description: z.string().min(1),
  expectedSource: z.string().min(1),
});

export const ReviewDecisionSchema = z.object({
  state: ReviewDecisionStateSchema,
  comment: z.string(),
});

export const ControlResultSchema = z.object({
  controlId: z.string().min(1),
  title: z.string().min(1),
  status: ControlStatusSchema,
  explanation: z.string().min(1),
  severity: SeveritySchema,
  supportingEvidence: z.array(EvidenceReferenceSchema),
  contradictoryEvidence: z.array(EvidenceReferenceSchema),
  missingEvidence: z.array(MissingEvidenceSchema),
  reviewerDecision: ReviewDecisionSchema,
});

export const ControlResultListSchema = z.array(ControlResultSchema);

export type PolicyDefinition = z.infer<typeof PolicyDefinitionSchema>;
export type ControlDefinition = z.infer<typeof ControlDefinitionSchema>;
export type CaseDocument = z.infer<typeof CaseDocumentSchema>;
export type ExtractedFact = z.infer<typeof ExtractedFactSchema>;
export type EvidenceReference = z.infer<typeof EvidenceReferenceSchema>;
export type ControlResult = z.infer<typeof ControlResultSchema>;
export type ReviewDecision = z.infer<typeof ReviewDecisionSchema>;
