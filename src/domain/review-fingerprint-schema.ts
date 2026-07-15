import { z } from "zod";
import { ControlStatusSchema, SeveritySchema } from "@/src/domain/schemas";

export const REVIEW_FINGERPRINT_SCHEMA_VERSION = "policyproof.review-fingerprint.v1" as const;

const enabledControlBase = {
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  severity: SeveritySchema,
  enabled: z.literal(true),
};

const EmptyParametersSchema = z.object({}).strict();

export const FingerprintControlSchema = z.discriminatedUnion("kind", [
  z.object({
    ...enabledControlBase,
    kind: z.literal("APPROVAL_THRESHOLD"),
    parameters: z.object({
      thresholdAmount: z.number().finite().nonnegative(),
      currency: z.literal("EUR"),
      requiredApprovers: z.number().int().min(2),
    }).strict(),
  }).strict(),
  z.object({ ...enabledControlBase, kind: z.literal("PO_BEFORE_INVOICE"), parameters: EmptyParametersSchema }).strict(),
  z.object({ ...enabledControlBase, kind: z.literal("AMOUNT_MATCH"), parameters: EmptyParametersSchema }).strict(),
  z.object({ ...enabledControlBase, kind: z.literal("CURRENCY_MATCH"), parameters: EmptyParametersSchema }).strict(),
  z.object({ ...enabledControlBase, kind: z.literal("DELIVERY_EVIDENCE"), parameters: EmptyParametersSchema }).strict(),
  z.object({ ...enabledControlBase, kind: z.literal("BANK_CHANGE_VERIFICATION"), parameters: EmptyParametersSchema }).strict(),
  z.object({ ...enabledControlBase, kind: z.literal("SEGREGATION_OF_DUTIES"), parameters: EmptyParametersSchema }).strict(),
]);

const FingerprintFactValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.boolean(),
  z.array(z.string()),
]);

export const FingerprintFactSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  value: FingerprintFactValueSchema,
  sourceLocator: z.string().min(1),
  excerpt: z.string().min(1),
  evidenceType: z.enum(["SUPPORTING", "CONTRADICTORY", "MISSING", "CONTEXT"]).nullable(),
  relationToControl: z.string().min(1).nullable(),
}).strict();

export const FingerprintDocumentSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["PURCHASE_ORDER", "INVOICE", "DELIVERY_NOTE", "WORKFLOW", "VENDOR_CHANGE"]),
  content: z.string().min(1),
  facts: z.array(FingerprintFactSchema),
}).strict();

export const FingerprintEvidenceSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().min(1),
  factId: z.string().min(1),
  locator: z.string().min(1),
  excerpt: z.string().min(1),
  relationship: z.enum(["SUPPORTING", "CONTRADICTORY"]),
  validationState: z.enum(["VERIFIED", "REJECTED"]),
}).strict();

export const FingerprintResultSchema = z.object({
  controlId: z.string().min(1),
  title: z.string().min(1),
  status: ControlStatusSchema,
  explanation: z.string().min(1),
  severity: SeveritySchema,
  evidence: z.array(FingerprintEvidenceSchema),
  missingEvidence: z.array(z.object({
    description: z.string().min(1),
    expectedSource: z.string().min(1),
  }).strict()),
}).strict();

export const ReviewFingerprintPayloadSchema = z.object({
  schemaVersion: z.literal(REVIEW_FINGERPRINT_SCHEMA_VERSION),
  scenarioId: z.string().min(1),
  caseReference: z.string().min(1),
  policy: z.object({
    id: z.string().min(1),
    version: z.string().min(1),
    content: z.string().min(1),
  }).strict(),
  approvalParameters: z.object({
    thresholdAmount: z.number().finite().nonnegative(),
    currency: z.literal("EUR"),
    requiredApprovers: z.number().int().min(2),
  }).strict(),
  controls: z.array(FingerprintControlSchema).min(1),
  documents: z.array(FingerprintDocumentSchema).min(1),
  results: z.array(FingerprintResultSchema).min(1),
}).strict();

export type ReviewFingerprintPayload = z.infer<typeof ReviewFingerprintPayloadSchema>;
export type FingerprintResult = z.infer<typeof FingerprintResultSchema>;
