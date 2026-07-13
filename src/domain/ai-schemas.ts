import { z } from "zod";
import { LocalDocumentSchema } from "@/src/lib/local-documents";
import { SeveritySchema } from "@/src/domain/schemas";

export const AiControlTypeSchema = z.enum([
  "APPROVAL_THRESHOLD",
  "PO_BEFORE_INVOICE",
  "AMOUNT_MATCH",
  "CURRENCY_MATCH",
  "DELIVERY_EVIDENCE",
  "BANK_CHANGE_VERIFICATION",
  "SEGREGATION_OF_DUTIES",
  "SEMANTIC_REVIEW",
]);

export const AiControlProposalSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  condition: z.string().min(1),
  requiredEvidence: z.array(z.string().min(1)),
  severity: SeveritySchema,
  controlType: AiControlTypeSchema,
  enabled: z.boolean(),
  deterministicParameters: z.object({
    thresholdAmount: z.number().nonnegative().nullable(),
    currency: z.string().min(1).nullable(),
    requiredApprovers: z.number().int().positive().nullable(),
  }),
  semanticReviewQuestion: z.string().min(1).nullable(),
});

export const PolicyCompilationSchema = z.object({
  policyTitle: z.string().min(1),
  policySummary: z.string().min(1),
  controls: z.array(AiControlProposalSchema).min(1).max(30),
});

export const PolicyCompilationRequestSchema = z.object({
  policyText: z.string().trim().min(50).max(50_000),
});

export const AiEvidenceReferenceSchema = z.object({
  id: z.string().min(1),
  factKey: z.string().min(1),
  factValue: z.string(),
  documentIdentifier: z.string().min(1),
  documentName: z.string().min(1),
  pageOrSection: z.string().min(1).nullable(),
  exactExcerpt: z.string().min(1),
  evidenceType: z.enum(["SUPPORTING", "CONTRADICTORY", "MISSING", "CONTEXT"]),
  confidence: z.number().min(0).max(1),
  relationToControl: z.string().min(1),
});

export const CaseAnalysisSchema = z.object({
  documentFindings: z.array(
    z.object({
      documentIdentifier: z.string().min(1),
      documentName: z.string().min(1),
      documentType: z.enum([
        "PURCHASE_ORDER",
        "INVOICE",
        "DELIVERY_NOTE",
        "WORKFLOW",
        "VENDOR_CHANGE",
      ]),
      evidence: z.array(AiEvidenceReferenceSchema),
    }),
  ),
});

export const CaseAnalysisRequestSchema = z.object({
  documents: z.array(LocalDocumentSchema).min(1).max(10),
  controls: z.array(AiControlProposalSchema).min(1).max(30),
});

export type AiControlProposal = z.infer<typeof AiControlProposalSchema>;
export type PolicyCompilation = z.infer<typeof PolicyCompilationSchema>;
export type CaseAnalysis = z.infer<typeof CaseAnalysisSchema>;
export type CaseAnalysisRequest = z.infer<typeof CaseAnalysisRequestSchema>;
