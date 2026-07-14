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
    <aside aria-labelledby="guided-demo-title" className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{t("guide.eyebrow")}</p>
          <h2 id="guided-demo-title" className="mt-1 font-semibold text-slate-950">{t("guide.title")}</h2>
        </div>
        <button type="button" onClick={onDismiss} className="text-xs font-semibold text-slate-500 underline-offset-2 hover:underline" aria-label={t("guide.dismissLabel")}>{t("guide.dismiss")}</button>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full rounded-full bg-teal-700 transition-[width]" style={{ width: `${percent}%` }} /></div>
      <p className="mt-2 text-xs text-slate-500">{t("guide.progress", { completed: completedCount, total: milestones.length })}</p>
      <ol className="mt-3 max-h-60 space-y-2 overflow-y-auto pr-1">
        {milestones.map((item) => {
          const done = completed.has(item.id);
          const current = next?.id === item.id;
          return (
            <li key={item.id} className={`flex gap-2 rounded-lg px-2 py-1.5 text-xs leading-5 ${current ? "bg-teal-50 text-teal-950" : "text-slate-600"}`} aria-current={current ? "step" : undefined}>
              <span aria-hidden="true" className={`mt-0.5 grid size-4 shrink-0 place-items-center rounded-full text-[9px] font-bold ${done ? "bg-teal-700 text-white" : "border border-slate-300 bg-white text-slate-500"}`}>{done ? "✓" : ""}</span>
              <span className={done ? "line-through decoration-slate-300" : ""}>{t(item.key)}</span>
            </li>
          );
        })}
      </ol>
      {completedCount === 0 && <button type="button" onClick={onStart} className="secondary-button mt-3 w-full">{t("action.startDemo")}</button>}
      {completedCount === milestones.length && <p role="status" className="mt-3 rounded-lg bg-teal-50 p-2 text-xs font-semibold text-teal-900">{t("guide.complete")}</p>}
    </aside>
  );
}
