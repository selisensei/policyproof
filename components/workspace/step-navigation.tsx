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
    <nav aria-label={t("a11y.progress")} className="border-b border-slate-200 bg-white">
      <ol className="mx-auto grid max-w-[1600px] grid-cols-5 px-2 sm:px-6 xl:px-8">
        {steps.map((step, index) => {
          const isCurrent = current === step.id;
          const isPast = index < currentIndex;
          return (
            <li key={step.id} className="min-w-0">
              <button
                type="button"
                onClick={() => onChange(step.id)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={t(step.key)}
                className={`group flex min-h-16 w-full flex-col items-center justify-center gap-1 border-b-2 px-0.5 text-xs font-bold transition sm:flex-row sm:gap-2 sm:px-3 sm:text-sm ${
                  isCurrent
                    ? "border-teal-700 text-teal-900"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs ${
                  isCurrent ? "bg-teal-800 text-white" : isPast ? "bg-teal-50 text-teal-800" : "bg-slate-100 text-slate-500"
                }`}>
                  {isPast ? "✓" : step.number}
                </span>
                <span className="block w-full truncate text-center text-[9px] leading-tight sm:w-auto sm:text-sm">{t(step.key)}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
