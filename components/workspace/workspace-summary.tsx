import type { AiControlProposal } from "@/src/domain/ai-schemas";
import type { ControlResult } from "@/src/domain/schemas";
import type { ResultSummary } from "@/src/lib/review-summary";
import type { AppMode, GuidedDemoMilestone, ProposalReviewState, WorkflowStep } from "@/components/workspace/types";
import { GuidedDemo } from "@/components/workspace/guided-demo";
import { useLocale } from "@/src/i18n/locale-context";

const steps: WorkflowStep[] = ["policy", "controls", "documents", "review", "decision"];

export function WorkspaceSummary({ enabledControlCount, documentCount, summary, results, currentStep, onLoadDemo, guideDismissed, guideMilestones, onDismissGuide, mode, isCompiling, compilationError, proposals, proposalStates, proposalsApproved, proposalValidationFailed, isRunning, workspaceError }: {
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
    <aside aria-label={t("a11y.summary")} className="space-y-4 xl:sticky xl:top-4 xl:self-start">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 text-white shadow-sm">
        <div className="border-b border-slate-800 px-4 py-4"><p className="eyebrow text-teal-300">{t("summary.case")}</p><p className="mt-1 font-semibold">Northstar Facilities</p><p className="mt-1 text-xs text-slate-400">{t("summary.help")}</p></div>
        <dl className="grid grid-cols-3 divide-x divide-slate-800 xl:grid-cols-1 xl:divide-x-0 xl:divide-y">
          <SummaryItem label={t("summary.controls")} value={enabledControlCount} />
          <SummaryItem label={t("summary.documents")} value={documentCount} />
          <SummaryItem label={t("summary.pending")} value={results.length ? summary.pending : "—"} />
        </dl>
        {results.length > 0 && <div className="grid grid-cols-4 gap-px bg-slate-800"><SummaryStatus value={summary.PASS} label={t("status.PASS")} /><SummaryStatus value={summary.FAIL} label={t("status.FAIL")} /><SummaryStatus value={summary.MISSING} label={t("status.MISSING")} /><SummaryStatus value={summary.WARNING} label={t("status.WARNING")} /></div>}
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500">{t("step.label", { number: steps.indexOf(currentStep) + 1 })}</p>
        <button type="button" onClick={onLoadDemo} className="primary-button mt-3 w-full">{t("action.loadDemo")}</button>
      </div>
      {mode === "LIVE_GPT_5_6" && <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4"><p className="eyebrow text-indigo-700">{t("liveStatus.title")}</p><dl className="mt-3 space-y-3 text-xs"><div><dt className="font-semibold text-slate-600">{t("liveStatus.proposal")}</dt><dd className="mt-1 text-slate-900">{t(`liveStatus.${proposalState}`)}</dd></div><div><dt className="font-semibold text-slate-600">{t("liveStatus.extraction")}</dt><dd className="mt-1 text-slate-900">{t(`liveStatus.${extractionState}`)}</dd></div></dl></div>}
      {!guideDismissed && <GuidedDemo completed={guideMilestones} onDismiss={onDismissGuide} onStart={onLoadDemo} />}
    </aside>
  );
}

function SummaryItem({ label, value }: { label: string; value: string | number }) {
  return <div className="px-3 py-3 xl:flex xl:items-center xl:justify-between xl:px-4"><dt className="text-[11px] text-slate-400">{label}</dt><dd className="mt-1 text-lg font-semibold text-white xl:mt-0">{value}</dd></div>;
}

function SummaryStatus({ value, label }: { value: number; label: string }) {
  return <div className="bg-slate-950 px-1 py-3 text-center"><p className="text-lg font-semibold">{value}</p><p className="truncate text-[9px] font-bold text-slate-400">{label}</p></div>;
}
