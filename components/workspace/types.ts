export type AppMode = "DETERMINISTIC_DEMO" | "LIVE_GPT_5_6";

export type WorkflowStep = "policy" | "controls" | "documents" | "review" | "decision";

export type ProposalReviewState = "PROPOSED" | "EDITED" | "APPROVED" | "REJECTED";

export type GuidedDemoMilestone =
  | "CASE_LOADED"
  | "POLICY_REVIEWED"
  | "CONTROLS_REVIEWED"
  | "INITIAL_REVIEW_RUN"
  | "CONTRADICTION_INSPECTED"
  | "DECISION_RECORDED"
  | "RECEIPT_REVIEWED"
  | "THRESHOLD_UPDATED"
  | "THRESHOLD_RERUN";

export type AiAvailability = {
  available: boolean;
  model: string;
  checking: boolean;
};
