import { z } from "zod";
import { ControlStatusSchema, ReviewDecisionStateSchema, type ControlResult } from "@/src/domain/schemas";
import { AuditEventSchema, type AuditEvent } from "@/src/lib/audit-trail";
import { resolveControlReference } from "@/src/domain/control-references";

export const REVIEW_DISCLAIMER =
  "PolicyProof is a review aid. This receipt is not legal advice, a compliance certification, or payment approval.";

export const DecisionReceiptSchema = z.object({
  reviewId: z.string().min(1),
  policyName: z.string().min(1),
  policyVersion: z.string().min(1),
  caseName: z.string().min(1),
  selectedLanguage: z.enum(["en", "fr"]),
  runMode: z.enum(["DETERMINISTIC_DEMO", "LIVE_GPT_5_6"]),
  generatedAt: z.iso.datetime(),
  enabledControlCount: z.number().int().nonnegative(),
  summary: z.object({
    total: z.number().int().nonnegative(),
    PASS: z.number().int().nonnegative(),
    FAIL: z.number().int().nonnegative(),
    MISSING: z.number().int().nonnegative(),
    WARNING: z.number().int().nonnegative(),
    reviewed: z.number().int().nonnegative(),
    pending: z.number().int().nonnegative(),
  }),
  outcomes: z.array(
    z.object({
      controlId: z.string().min(1),
      displayReference: z.string().min(1),
      title: z.string().min(1),
      status: ControlStatusSchema,
      reviewerDecision: ReviewDecisionStateSchema,
      reviewerComment: z.string(),
    }),
  ),
  auditTrail: z.array(AuditEventSchema).max(100),
  disclaimer: z.literal(REVIEW_DISCLAIMER),
});

export type DecisionReceipt = z.infer<typeof DecisionReceiptSchema>;

function receiptId(generatedAt: string): string {
  return `PP-${generatedAt.replace(/[-:.]/g, "").replace("Z", "Z")}`;
}

export function createDecisionReceipt(input: {
  results: ControlResult[];
  policyName: string;
  policyVersion: string;
  caseName: string;
  selectedLanguage: DecisionReceipt["selectedLanguage"];
  runMode: DecisionReceipt["runMode"];
  generatedAt: string;
  enabledControlCount: number;
  auditTrail?: AuditEvent[];
}): DecisionReceipt {
  const counts = input.results.reduce(
    (summary, result) => {
      summary[result.status] += 1;
      if (result.reviewerDecision.state === "PENDING") summary.pending += 1;
      else summary.reviewed += 1;
      return summary;
    },
    { total: input.results.length, PASS: 0, FAIL: 0, MISSING: 0, WARNING: 0, reviewed: 0, pending: 0 },
  );

  return DecisionReceiptSchema.parse({
    reviewId: receiptId(input.generatedAt),
    policyName: input.policyName,
    policyVersion: input.policyVersion,
    caseName: input.caseName,
    selectedLanguage: input.selectedLanguage,
    runMode: input.runMode,
    generatedAt: input.generatedAt,
    enabledControlCount: input.enabledControlCount,
    summary: counts,
    outcomes: input.results.map((result) => ({
      controlId: result.controlId,
      displayReference: resolveControlReference(result.controlId).displayReference,
      title: result.title,
      status: result.status,
      reviewerDecision: result.reviewerDecision.state,
      reviewerComment: result.reviewerDecision.comment,
    })),
    auditTrail: input.auditTrail ?? [],
    disclaimer: REVIEW_DISCLAIMER,
  });
}
