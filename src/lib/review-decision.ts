import {
  ReviewDecisionSchema,
  type ControlResult,
  type ReviewDecision,
} from "@/src/domain/schemas";

export function recordReviewDecision(
  result: ControlResult,
  state: ReviewDecision["state"],
  comment: string,
): ControlResult {
  const isOverride = state === "REJECTED" || state === "ACCEPTED_EXCEPTION";
  if (isOverride && !comment.trim()) {
    throw new Error("Add a reviewer comment before recording an override or exception.");
  }

  return {
    ...result,
    reviewerDecision: ReviewDecisionSchema.parse({ state, comment }),
  };
}
