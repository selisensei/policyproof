import type { GuidedDemoMilestone } from "@/components/workspace/types";
import { useLocale } from "@/src/i18n/locale-context";
import type { TranslationKey } from "@/src/i18n/translations";

const milestones: Array<{ id: GuidedDemoMilestone; key: TranslationKey }> = [
  { id: "CASE_LOADED", key: "guide.case" },
  { id: "POLICY_REVIEWED", key: "guide.policy" },
  { id: "CONTROLS_REVIEWED", key: "guide.controls" },
  { id: "INITIAL_REVIEW_RUN", key: "guide.run" },
  { id: "CONTRADICTION_INSPECTED", key: "guide.contradiction" },
  { id: "DECISION_RECORDED", key: "guide.decision" },
  { id: "RECEIPT_REVIEWED", key: "guide.receipt" },
  { id: "THRESHOLD_UPDATED", key: "guide.threshold" },
  { id: "THRESHOLD_RERUN", key: "guide.rerun" },
];

export function GuidedDemo({ completed, onDismiss, onStart }: {
  completed: ReadonlySet<GuidedDemoMilestone>;
  onDismiss: () => void;
  onStart: () => void;
}) {
  const { t } = useLocale();
  const completedCount = milestones.filter((item) => completed.has(item.id)).length;
  const next = milestones.find((item) => !completed.has(item.id));
  const percent = Math.round((completedCount / milestones.length) * 100);

  return (
    <aside aria-labelledby="guided-demo-title" className="guide-panel">
      <div className="guide-summary-row">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span className="guide-progress-ring" style={{ "--guide-progress": `${percent * 3.6}deg` } as React.CSSProperties}><span>{completedCount}</span></span>
            <div className="min-w-0">
              <p className="eyebrow">{t("guide.eyebrow")}</p>
              <h2 id="guided-demo-title" className="text-sm font-bold leading-4 text-slate-900">{t("guide.title")}</h2>
            </div>
          </div>
        </div>
        {completedCount === 0 && <button type="button" onClick={onStart} className="guide-start hidden sm:block">{t("action.startDemo")}</button>}
        <button type="button" onClick={onDismiss} className="guide-dismiss" aria-label={t("guide.dismissLabel")}>{t("guide.dismiss")}</button>
      </div>
      <details className="guide-details">
        <summary>
          <span>{t("guide.progress", { completed: completedCount, total: milestones.length })}</span>
          <span aria-hidden="true">⌄</span>
        </summary>
        <ol>
          {milestones.map((item) => {
            const done = completed.has(item.id);
            const current = next?.id === item.id;
            return (
              <li key={item.id} className={`flex gap-2 text-xs leading-5 ${current ? "text-teal-950" : "text-slate-600"}`} aria-current={current ? "step" : undefined}>
                <span aria-hidden="true" className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-bold ${done ? "bg-teal-700 text-white" : "border border-slate-300 bg-white text-slate-500"}`}>{done ? "✓" : ""}</span>
                <span className={done ? "line-through decoration-slate-300" : ""}>{t(item.key)}</span>
              </li>
            );
          })}
        </ol>
        {completedCount === milestones.length && <p role="status" className="mt-3 rounded-lg bg-teal-50 p-2 text-xs font-semibold text-teal-900">{t("guide.complete")}</p>}
      </details>
    </aside>
  );
}
