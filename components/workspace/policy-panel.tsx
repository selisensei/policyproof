import type { AppMode, AiAvailability } from "@/components/workspace/types";
import { SectionShell } from "@/components/workspace/section-shell";
import { useLocale } from "@/src/i18n/locale-context";

export function PolicyPanel({
  mode,
  ai,
  policyText,
  expanded,
  isCompiling,
  compilationError,
  onPolicyTextChange,
  onToggleExpanded,
  onCompile,
}: {
  mode: AppMode;
  ai: AiAvailability;
  policyText: string;
  expanded: boolean;
  isCompiling: boolean;
  compilationError: string;
  onPolicyTextChange: (value: string) => void;
  onToggleExpanded: () => void;
  onCompile: () => void;
}) {
  const { locale, t } = useLocale();
  const isLive = mode === "LIVE_GPT_5_6";
  return (
    <SectionShell
      id="policy"
      step={t("step.label", { number: 1 })}
      title={t(isLive ? "policy.title.live" : "policy.title.demo")}
      description={t(isLive ? "policy.help.live" : "policy.help.demo")}
      action={
        <button type="button" onClick={onToggleExpanded} aria-expanded={expanded} className="secondary-button">
          {t(expanded ? "policy.collapse" : "policy.expand")}
        </button>
      }
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
        <span className="metadata-pill">{t("policy.version")}</span>
        <span className="metadata-pill">{t("policy.fictional")}</span>
        <span className={`metadata-pill ${isLive ? "bg-indigo-50 text-indigo-700" : "bg-teal-50 text-teal-800"}`}>
          {t(isLive ? "policy.aiRequested" : "policy.confirmed")}
        </span>
      </div>

      {!expanded && (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
          <p className="line-clamp-3 whitespace-pre-line text-sm leading-6 text-slate-700">{policyText}</p>
        </div>
      )}

      {expanded && (
        <div className="mt-5">
          {isLive ? (
            <>
              <label htmlFor="policy-text" className="field-label">{t("policy.text")}</label>
              <textarea id="policy-text" rows={11} value={policyText} onChange={(event) => onPolicyTextChange(event.target.value)} className="field-control mt-2 resize-y leading-6" />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">{t("policy.characters", { count: policyText.length.toLocaleString(locale === "fr" ? "fr-FR" : "en-US") })}</p>
                <button type="button" onClick={onCompile} disabled={!ai.available || isCompiling || policyText.trim().length < 50} className="primary-button bg-indigo-700 hover:bg-indigo-600">
                  {t(isCompiling ? "policy.compiling" : "policy.compile")}
                </button>
              </div>
              {!ai.available && !ai.checking && <p className="info-callout mt-4">{t("policy.liveHelp")}</p>}
              {compilationError && <p role="alert" className="error-callout mt-4">{compilationError}</p>}
            </>
          ) : (
            <ol className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200">
              {policyText.split("\n").map((rule, index) => (
                <li key={`${index}-${rule}`} className="flex gap-3 bg-white px-4 py-3 text-sm leading-6 text-slate-700">
                  <span aria-hidden="true" className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-teal-50 text-xs font-bold text-teal-800">{index + 1}</span>
                  <span>{rule.replace(/^\d+\.\s*/, "")}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </SectionShell>
  );
}
