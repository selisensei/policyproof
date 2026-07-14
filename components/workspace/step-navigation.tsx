import type { WorkflowStep } from "@/components/workspace/types";
import { useLocale } from "@/src/i18n/locale-context";
import type { ResultSummary } from "@/src/lib/review-summary";

const steps: Array<{ id: WorkflowStep; number: number; key: "step.policy" | "step.controls" | "step.documents" | "step.review" | "step.decision" }> = [
  { id: "policy", number: 1, key: "step.policy" },
  { id: "controls", number: 2, key: "step.controls" },
  { id: "documents", number: 3, key: "step.documents" },
  { id: "review", number: 4, key: "step.review" },
  { id: "decision", number: 5, key: "step.decision" },
];

export function StepNavigation({ current, onChange, enabledControls, documentCount, summary, caseReference, policyReference, policyVersion }: {
  current: WorkflowStep;
  onChange: (step: WorkflowStep) => void;
  enabledControls: number;
  documentCount: number;
  summary: ResultSummary;
  caseReference: string;
  policyReference: string;
  policyVersion: string;
}) {
  const { t } = useLocale();
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <nav aria-label={t("a11y.progress")} className="workflow-nav">
      <div className="workflow-nav-inner">
        <ol>
          {steps.map((step, index) => {
            const isCurrent = current === step.id;
            const isPast = index < currentIndex;
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => onChange(step.id)}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={t(step.key)}
                  className={isCurrent ? "is-current" : isPast ? "is-complete" : ""}
                >
                  <span className="step-number" aria-hidden="true">{String(step.number).padStart(2, "0")}</span>
                  <span className="step-copy">{t(step.key)}{isPast && <span aria-hidden="true" className="step-check">✓</span>}</span>
                  {step.id === "decision" && summary.pending > 0 && summary.total > 0 && <span className="step-open-count">{summary.pending}</span>}
                </button>
              </li>
            );
          })}
        </ol>
        <p className="context-summary" aria-label={t("a11y.summary")}>
          {caseReference} <span>·</span> {policyReference} {policyVersion} <span>·</span> CTRL {enabledControls} <span>·</span> DOC {documentCount}
          {summary.total > 0 && <> <span>·</span> <b data-status="PASS">{summary.PASS}✓</b> <b data-status="FAIL">{summary.FAIL}×</b> <b data-status="MISSING">{summary.MISSING}⌀</b> <b data-status="WARNING">{summary.WARNING}!</b> <span>·</span> DEC {summary.reviewed}/{summary.total}</>}
        </p>
      </div>
    </nav>
  );
}
