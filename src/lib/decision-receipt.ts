import { z } from "zod";
import { ControlStatusSchema, ReviewDecisionStateSchema, type ControlResult } from "@/src/domain/schemas";

export const REVIEW_DISCLAIMER =
  "PolicyProof is a review aid. This receipt is not legal advice, a compliance certification, or payment approval.";

export const DecisionReceiptSchema = z.object({
  reviewId: z.string().min(1),
  policyVersion: z.string().min(1),
  caseName: z.string().min(1),
  runMode: z.enum(["DETERMINISTIC_DEMO", "LIVE_GPT_5_6"]),
  generatedAt: z.iso.datetime(),
  outcomes: z.array(
    z.object({
      controlId: z.string().min(1),
      title: z.string().min(1),
      status: ControlStatusSchema,
      reviewerDecision: ReviewDecisionStateSchema,
      reviewerComment: z.string(),
    }),
  ),
  disclaimer: z.literal(REVIEW_DISCLAIMER),
});

export type DecisionReceipt = z.infer<typeof DecisionReceiptSchema>;

function receiptId(generatedAt: string): string {
  return `PP-${generatedAt.replace(/[-:.]/g, "").replace("Z", "Z")}`;
}

export function createDecisionReceipt(input: {
  results: ControlResult[];
  policyVersion: string;
  caseName: string;
  runMode: DecisionReceipt["runMode"];
  generatedAt: string;
}): DecisionReceipt {
  return DecisionReceiptSchema.parse({
    reviewId: receiptId(input.generatedAt),
    policyVersion: input.policyVersion,
    caseName: input.caseName,
    runMode: input.runMode,
    generatedAt: input.generatedAt,
    outcomes: input.results.map((result) => ({
      controlId: result.controlId,
      title: result.title,
      status: result.status,
      reviewerDecision: result.reviewerDecision.state,
      reviewerComment: result.reviewerDecision.comment,
    })),
    disclaimer: REVIEW_DISCLAIMER,
  });
}
