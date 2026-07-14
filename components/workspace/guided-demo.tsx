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

  return (
    <aside aria-labelledby="guided-demo-title" className="guide-panel">
      <div className="guide-heading">
        <div><p className="eyebrow">{t("guide.eyebrow")}</p><h2 id="guided-demo-title">{t("guide.title")}</h2></div>
        <button type="button" onClick={onDismiss} aria-label={t("guide.dismissLabel")}>×</button>
      </div>
      <p className="guide-progress-copy">{t("guide.progress", { completed: completedCount, total: milestones.length })}</p>
      <div className="guide-progress" aria-hidden="true"><span style={{ width: `${(completedCount / milestones.length) * 100}%` }} /></div>
      <ol>
        {milestones.map((item, index) => {
          const done = completed.has(item.id);
          const current = next?.id === item.id;
          return (
            <li key={item.id} className={`guide-step ${done ? "is-done text-slate-600" : current ? "is-next" : ""}`} aria-current={current ? "step" : undefined}>
              <span aria-hidden="true">{done ? "✓" : String(index + 1).padStart(2, "0")}</span>
              <p>{t(item.key)}</p>
            </li>
          );
        })}
      </ol>
      {completedCount === 0 && <button type="button" onClick={onStart} className="guide-start">{t("action.startDemo")}</button>}
      {completedCount === milestones.length && <p role="status" className="guide-complete">{t("guide.complete")}</p>}
    </aside>
  );
}
