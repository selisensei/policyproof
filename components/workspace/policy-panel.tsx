import type { AppMode, AiAvailability } from "@/components/workspace/types";
import { SectionShell } from "@/components/workspace/section-shell";
import { demoPolicy } from "@/src/fixtures/demo-case";
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
  onOpenControls,
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
  onOpenControls: () => void;
}) {
  const { locale, t } = useLocale();
  const isLive = mode === "LIVE_GPT_5_6";
  const requirements = policyText.split("\n").filter(Boolean);
  const visibleRequirements = expanded ? requirements : requirements.slice(0, 3);

  return (
    <SectionShell
      id="policy"
      step={t("step.label", { number: 1 })}
      title={t(isLive ? "policy.title.live" : "policy.title.demo")}
      description={t(isLive ? "policy.help.live" : "policy.help.demo")}
      action={<button type="button" onClick={onToggleExpanded} aria-expanded={expanded} className="secondary-button">{t(expanded ? "policy.collapse" : "policy.expand")}</button>}
    >
      <div className="policy-layout">
        <article className="policy-folio">
          <dl className="folio-meta">
            <div><dt>{locale === "fr" ? "RÉF. POLITIQUE" : "POLICY REF"}</dt><dd>POL-2026-004</dd></div>
            <div><dt>{locale === "fr" ? "VERSION" : "VERSION"}</dt><dd>{demoPolicy.version}</dd></div>
            <div><dt>{locale === "fr" ? "SOURCE" : "SOURCE"}</dt><dd>{t("policy.fictional")}</dd></div>
            <div><dt>{locale === "fr" ? "STATUT" : "STATUS"}</dt><dd className="folio-status">{t("policy.confirmed")}</dd></div>
            <div><dt>{locale === "fr" ? "LANGUE" : "LANGUAGE"}</dt><dd>EN</dd></div>
          </dl>
          <div className="folio-title-row">
            <div><h3>{demoPolicy.title}</h3><p>{requirements.length} {locale === "fr" ? "exigences · source fictive versionnée" : "requirements · version-controlled fictional source"}</p></div>
            {locale === "fr" && <span className="source-language-tag">EXTRAIT SOURCE (EN)</span>}
          </div>

          {isLive && expanded ? (
            <div className="policy-editor">
              <label htmlFor="policy-text" className="field-label">{t("policy.text")}</label>
              <textarea id="policy-text" rows={12} value={policyText} onChange={(event) => onPolicyTextChange(event.target.value)} className="field-control" />
              <p>{t("policy.characters", { count: policyText.length.toLocaleString(locale === "fr" ? "fr-FR" : "en-US") })}</p>
            </div>
          ) : (
            <ol className="policy-rules">
              {visibleRequirements.map((rule, index) => (
                <li key={`${index}-${rule}`}><span>R-{String(index + 1).padStart(2, "0")}</span><p>{rule.replace(/^\d+\.\s*/, "")}</p></li>
              ))}
            </ol>
          )}
          {!expanded && requirements.length > visibleRequirements.length && <button type="button" className="folio-more" onClick={onToggleExpanded}>{locale === "fr" ? `Afficher ${requirements.length - visibleRequirements.length} exigences supplémentaires` : `Show ${requirements.length - visibleRequirements.length} more requirements`}</button>}
          <footer className="folio-footer">{locale === "fr" ? "Chaque exigence compile exactement un contrôle" : "Each requirement compiles into exactly one control"} : R-01 → CTRL-01 ··· R-07 → CTRL-07</footer>
        </article>

        <aside className="compilation-panel" aria-label={locale === "fr" ? "Compilation de la politique" : "Policy compilation"}>
          <div className="compilation-heading"><strong>{locale === "fr" ? "COMPILATION" : "COMPILATION"}</strong><span>POL → CTRL</span></div>
          <ol>
            <li><span>INTERPRET</span><p>{locale === "fr" ? "GPT-5.6 lit la politique et propose un contrôle par exigence." : "GPT-5.6 reads the policy and proposes one control per requirement."}</p></li>
            <li><span>CALCULATE</span><p>{locale === "fr" ? "TypeScript exécute les vérifications objectives." : "TypeScript performs every objective check."}</p></li>
            <li><span>DECIDE</span><p>{locale === "fr" ? "Un humain examine chaque conclusion." : "A human reviewer records every final decision."}</p></li>
          </ol>
          {isCompiling && <div className="progress-rule" role="status"><span />{t("policy.compiling")}</div>}
          <button type="button" onClick={isLive ? onCompile : onOpenControls} disabled={isLive && (!ai.available || isCompiling || policyText.trim().length < 50)} className="primary-button compilation-action">
            {isLive ? t(isCompiling ? "policy.compiling" : "policy.compile") : (locale === "fr" ? "Ouvrir le registre" : "Open control register")}
          </button>
          <p className="compilation-note">{isLive ? t("mode.live.description") : (locale === "fr" ? "Aucun appel IA · fixture v1.0" : "No AI request · fixture v1.0")}</p>
          {!isLive && <div className="success-notice"><strong>✓ {requirements.length} {locale === "fr" ? "contrôles proposés" : "controls proposed"}</strong><span>{locale === "fr" ? "Registre déterministe prêt à examiner." : "Deterministic register ready for review."}</span></div>}
          {isLive && !ai.available && !ai.checking && <div className="warning-notice"><strong>{t("mode.live.disabled")}</strong><span>{t("policy.liveHelp")}</span></div>}
          {compilationError && <div role="alert" className="safe-error"><strong>{t("error.policyCompilation")}</strong><p>{compilationError}</p><button type="button" onClick={onCompile}>{locale === "fr" ? "Réessayer" : "Retry"}</button></div>}
        </aside>
      </div>
    </SectionShell>
  );
}
