import type { WorkflowStep } from "@/components/workspace/types";
import { useLocale } from "@/src/i18n/locale-context";

const steps: Array<{ id: WorkflowStep; number: number; key: "step.policy" | "step.controls" | "step.documents" | "step.review" | "step.decision" }> = [
  { id: "policy", number: 1, key: "step.policy" },
  { id: "controls", number: 2, key: "step.controls" },
  { id: "documents", number: 3, key: "step.documents" },
  { id: "review", number: 4, key: "step.review" },
  { id: "decision", number: 5, key: "step.decision" },
];

export function StepNavigation({ current, onChange }: { current: WorkflowStep; onChange: (step: WorkflowStep) => void }) {
  const { t } = useLocale();
  const currentIndex = steps.findIndex((step) => step.id === current);

  return (
    <nav aria-label={t("a11y.progress")} className="workflow-nav">
      <div className="workflow-nav-inner">
        <p className="workflow-nav-title">{t("a11y.progress")}</p>
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
                  <span className="step-number" aria-hidden="true">{isPast ? "✓" : String(step.number).padStart(2, "0")}</span>
                  <span className="step-copy">
                    <span>{t(step.key)}</span>
                    <small>{t("step.label", { number: step.number })}</small>
                  </span>
                  <svg aria-hidden="true" viewBox="0 0 20 20" className="step-arrow" fill="none">
                    <path d="m8 5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="workflow-boundary">
          <span aria-hidden="true">◎</span>
          <p>{t("intro.responsibility")}</p>
        </div>
      </div>
    </nav>
  );
}
