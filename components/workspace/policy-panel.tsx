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
      <div className="source-meta">
        <div><span>01</span><p>{t("policy.version")}</p></div>
        <div><span>02</span><p>{t("policy.fictional")}</p></div>
        <div className={isLive ? "is-live" : "is-confirmed"}><span>{isLive ? "AI" : "✓"}</span><p>{t(isLive ? "policy.aiRequested" : "policy.confirmed")}</p></div>
      </div>

      {!expanded && (
        <div className="policy-preview">
          <div className="policy-preview-gutter" aria-hidden="true"><span>01</span><span>02</span><span>03</span></div>
          <p className="line-clamp-3 whitespace-pre-line">{policyText}</p>
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
            <ol className="policy-rules">
              {policyText.split("\n").map((rule, index) => (
                <li key={`${index}-${rule}`}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
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
