import type { AiControlProposal } from "@/src/domain/ai-schemas";
import type { ControlResult } from "@/src/domain/schemas";
import type { ResultSummary } from "@/src/lib/review-summary";
import type { AppMode, GuidedDemoMilestone, ProposalReviewState, WorkflowStep } from "@/components/workspace/types";
import { GuidedDemo } from "@/components/workspace/guided-demo";
import { useLocale } from "@/src/i18n/locale-context";

const steps: WorkflowStep[] = ["policy", "controls", "documents", "review", "decision"];

export function WorkspaceSummary({ enabledControlCount, documentCount, summary, results, currentStep, onLoadDemo, guideDismissed, guideMilestones, onDismissGuide, mode, aiAvailable, isCompiling, compilationError, proposals, proposalStates, proposalsApproved, proposalValidationFailed, isRunning, workspaceError }: {
  enabledControlCount: number;
  documentCount: number;
  summary: ResultSummary;
  results: ControlResult[];
  currentStep: WorkflowStep;
  onLoadDemo: () => void;
  guideDismissed: boolean;
  guideMilestones: ReadonlySet<GuidedDemoMilestone>;
  onDismissGuide: () => void;
  mode: AppMode;
  aiAvailable: boolean;
  isCompiling: boolean;
  compilationError: string;
  proposals: AiControlProposal[];
  proposalStates: Record<string, ProposalReviewState>;
  proposalsApproved: boolean;
  proposalValidationFailed: boolean;
  isRunning: boolean;
  workspaceError: string;
}) {
  const { t } = useLocale();
  const proposalState = isCompiling ? "pending" : compilationError || proposalValidationFailed ? "failed" : proposalsApproved ? "approved" : Object.values(proposalStates).includes("EDITED") ? "edited" : proposals.length && proposals.every((proposal) => proposalStates[proposal.id] === "REJECTED") ? "rejected" : proposals.length ? "received" : "waiting";
  const extractionState = isRunning ? "pending" : results.length ? "received" : workspaceError ? "failed" : "waiting";

  return (
    <section aria-label={t("a11y.summary")} className="mt-3 space-y-2">
      <div className={`case-strip ${results.length ? "has-results" : ""}`}>
        <div className="case-identity">
          <span aria-hidden="true" className="case-icon">N</span>
          <div>
            <p className="eyebrow text-teal-800">{t("summary.case")}</p>
            <p className="text-sm font-bold text-slate-950">Northstar Facilities</p>
          </div>
        </div>
        <dl className="case-metrics">
          <CaseMetric label={t("summary.controls")} value={enabledControlCount} />
          <CaseMetric label={t("summary.documents")} value={documentCount} />
          <CaseMetric label={t("summary.pending")} value={results.length ? summary.pending : "—"} />
        </dl>
        {results.length > 0 && (
          <div className="case-outcomes" aria-label={t("receipt.summary")}>
            <span><b>{summary.PASS}</b> {t("status.PASS")}</span>
            <span><b>{summary.FAIL}</b> {t("status.FAIL")}</span>
            <span><b>{summary.MISSING}</b> {t("status.MISSING")}</span>
            <span><b>{summary.WARNING}</b> {t("status.WARNING")}</span>
          </div>
        )}
        <div className="case-mode">
          <span className={mode === "DETERMINISTIC_DEMO" ? "is-demo" : "is-live"}>{t(mode === "DETERMINISTIC_DEMO" ? "mode.demo" : "mode.live")}</span>
          <p>{t(mode === "DETERMINISTIC_DEMO" ? "mode.demo.description" : "mode.live.description")}</p>
          {!aiAvailable && <p>{t("mode.live.disabled")}</p>}
          {mode === "LIVE_GPT_5_6" && <p>{t("liveStatus.proposal")}: {t(`liveStatus.${proposalState}`)} · {t("liveStatus.extraction")}: {t(`liveStatus.${extractionState}`)}</p>}
        </div>
        <div className="case-actions">
          <span>{t("step.label", { number: steps.indexOf(currentStep) + 1 })}</span>
          <button type="button" onClick={onLoadDemo}>{t("action.loadDemo")}</button>
        </div>
      </div>
      {!guideDismissed && <GuidedDemo completed={guideMilestones} onDismiss={onDismissGuide} onStart={onLoadDemo} />}
    </section>
  );
}

function CaseMetric({ label, value }: { label: string; value: string | number }) {
  return <div><dt>{label}</dt><dd>{value}</dd></div>;
}
