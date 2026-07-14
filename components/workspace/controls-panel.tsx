import { useState } from "react";
import type { AiControlProposal } from "@/src/domain/ai-schemas";
import type { ControlDefinition } from "@/src/domain/schemas";
import type { AppMode, ProposalReviewState } from "@/components/workspace/types";
import { controlRef, methodLabel, requirementRef, sequenceForControl } from "@/components/workspace/presentation";
import { SectionShell } from "@/components/workspace/section-shell";
import { demoDocuments, demoPolicy } from "@/src/fixtures/demo-case";
import { useLocale } from "@/src/i18n/locale-context";
import { localizedControl } from "@/src/i18n/translations";

function evidenceRequirementCount(kind: ControlDefinition["kind"]): number {
  return kind === "DELIVERY_EVIDENCE" ? 1 : 2;
}

export function ControlsPanel({
  mode,
  controls,
  proposals,
  proposalsApproved,
  proposalStates,
  threshold,
  thresholdError,
  onThresholdChange,
  onToggleControl,
  onResetControls,
  onProposalChange,
  onApproveProposals,
  onRejectProposal,
}: {
  mode: AppMode;
  controls: ControlDefinition[];
  proposals: AiControlProposal[];
  proposalsApproved: boolean;
  proposalStates: Record<string, ProposalReviewState>;
  threshold: string;
  thresholdError: string;
  onThresholdChange: (value: string) => void;
  onToggleControl: (id: string, enabled: boolean) => void;
  onResetControls: () => void;
  onProposalChange: (id: string, patch: Partial<AiControlProposal>) => void;
  onApproveProposals: () => void;
  onRejectProposal: (id: string) => void;
}) {
  const { locale, t } = useLocale();
  const [expandedControl, setExpandedControl] = useState<string | null>("CTRL-APPROVAL");
  const isLive = mode === "LIVE_GPT_5_6";
  const enabledCount = isLive ? proposals.filter((control) => control.enabled).length : controls.filter((control) => control.enabled).length;
  const poAmount = Number(demoDocuments[0].facts.find((fact) => fact.key === "purchaseOrderAmount")?.value ?? 0);
  const approvers = demoDocuments.find((document) => document.type === "WORKFLOW")?.facts.find((fact) => fact.key === "approvers")?.value;
  const recordedApprovers = Array.isArray(approvers) ? new Set(approvers).size : 0;
  const currentThreshold = Number(threshold);
  const thresholdOutcome = Number.isFinite(currentThreshold) && poAmount <= currentThreshold ? "PASS" : "FAIL";

  return (
    <SectionShell
      id="controls"
      step={t("step.label", { number: 2 })}
      title={locale === "fr" ? "Registre des contrôles" : "Control register"}
      description={t(isLive ? "controls.help.live" : "controls.help.demo")}
      action={!isLive ? <button type="button" onClick={onResetControls} className="secondary-button">{t("action.resetControls")}</button> : undefined}
    >
      <div className="register-toolbar">
        <span>{enabledCount} / {isLive ? proposals.length : controls.length} {locale === "fr" ? "actifs" : "enabled"}</span>
        {isLive && proposals.length > 0 && <span className="register-state" data-approved={proposalsApproved}>{t(proposalsApproved ? "controls.approved" : "controls.awaiting")}</span>}
      </div>

      {isLive ? (
        proposals.length ? (
          <div className="proposal-register">
            {proposals.map((control, index) => (
              <article key={control.id} className="proposal-row" data-state={proposalStates[control.id] ?? "PROPOSED"}>
                <div className="proposal-ref"><span>{`CTRL-${String(index + 1).padStart(2, "0")}`}</span><small>{control.id}</small></div>
                <div className="proposal-fields">
                  <label className="field-label">{t("controls.titleLabel")}<input aria-label={`${t("controls.titleLabel")} ${control.id}`} value={control.title} onChange={(event) => onProposalChange(control.id, { title: event.target.value })} className="field-control" /></label>
                  <label className="field-label">{t("controls.description")}<textarea aria-label={`${t("controls.description")} ${control.id}`} rows={2} value={control.description} onChange={(event) => onProposalChange(control.id, { description: event.target.value })} className="field-control" /></label>
                </div>
                <div className="proposal-meta">
                  <label className="field-label">{t("controls.severity")}<select aria-label={`${t("controls.severity")} ${control.id}`} value={control.severity} onChange={(event) => onProposalChange(control.id, { severity: event.target.value as AiControlProposal["severity"] })} className="field-control">
                    {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((severity) => <option key={severity} value={severity}>{t(`severity.${severity}`)}</option>)}
                  </select></label>
                  <span className="proposal-state">{t(`controls.state.${proposalStates[control.id] ?? "PROPOSED"}`)}</span>
                  <label className="proposal-enabled"><input type="checkbox" aria-label={t("controls.enable", { title: control.title })} checked={control.enabled} onChange={(event) => onProposalChange(control.id, { enabled: event.target.checked })} />{t("controls.enabled", { count: control.enabled ? 1 : 0 })}</label>
                  <button type="button" onClick={() => onRejectProposal(control.id)} className="text-action is-danger">{t("controls.reject")}</button>
                </div>
              </article>
            ))}
            <footer className="register-footer"><button type="button" onClick={onApproveProposals} className="primary-button">{t("controls.approve")}</button></footer>
          </div>
        ) : <div className="empty-state"><strong>{t("controls.none")}</strong><p>{t("controls.noneHelp")}</p></div>
      ) : (
        <div className="control-register">
          <div className="control-register-head" aria-hidden="true"><span>REF</span><span>{locale === "fr" ? "CONTRÔLE" : "CONTROL"}</span><span>{locale === "fr" ? "GRAVITÉ" : "SEVERITY"}</span><span>{locale === "fr" ? "MÉTHODE" : "METHOD"}</span><span>{locale === "fr" ? "PREUVES" : "EVIDENCE"}</span><span>{locale === "fr" ? "ÉTAT" : "STATE"}</span><span>{locale === "fr" ? "ACTIF" : "ENABLED"}</span></div>
          {controls.map((control) => {
            const localized = localizedControl(control.id, locale, control.title, control.description);
            const sequence = sequenceForControl(control.id) ?? 1;
            const requirement = demoPolicy.text.split("\n")[sequence - 1]?.replace(/^\d+\.\s*/, "") ?? control.description;
            const expanded = expandedControl === control.id;
            return (
              <article key={control.id} className={`control-ledger-row ${control.enabled ? "" : "is-disabled"} ${expanded ? "is-expanded" : ""}`}>
                <div className="control-row-summary">
                  <span className="control-ref">{controlRef(control.id)}<small>{requirementRef(control.id)}</small></span>
                  <button type="button" className="control-title-button" aria-expanded={expanded} onClick={() => setExpandedControl(expanded ? null : control.id)}><strong>{localized.title}</strong><small>{expanded ? "▾" : "▸"} {t("controls.details")}</small></button>
                  <span className="severity-label" data-severity={control.severity}>{t(`severity.${control.severity}`)}</span>
                  <span className="method-label">{methodLabel(mode)}</span>
                  <span className="evidence-required">{evidenceRequirementCount(control.kind)} {locale === "fr" ? "requises" : "required"}</span>
                  <span className="control-state">✓ {t("controls.approved")}</span>
                  <label className="control-toggle"><input type="checkbox" aria-label={t("controls.enable", { title: localized.title })} checked={control.enabled} onChange={(event) => onToggleControl(control.id, event.target.checked)} /><span aria-hidden="true" /></label>
                </div>
                {expanded && (
                  <div className="control-detail">
                    <div className="control-detail-copy">
                      <p className="eyebrow">{locale === "fr" ? "CONDITION · SOURCE" : "CONDITION · SOURCE"}</p>
                      <p>{localized.description}</p>
                      <blockquote>“{requirement}”</blockquote>
                    </div>
                    {control.kind === "APPROVAL_THRESHOLD" ? (
                      <div className="parameter-editor">
                        <label htmlFor="approval-threshold" className="field-label">{t("controls.threshold")}</label>
                        <div className="threshold-stepper">
                          <button type="button" aria-label={locale === "fr" ? "Réduire le seuil" : "Decrease threshold"} onClick={() => onThresholdChange(String(Math.max(0, (Number(threshold) || 0) - 500)))}>−</button>
                          <div><input id="approval-threshold" type="number" min="0" max="1000000000" step="500" value={threshold} onChange={(event) => onThresholdChange(event.target.value)} aria-invalid={Boolean(thresholdError)} aria-describedby={thresholdError ? "approval-threshold-error" : "threshold-effect"} /><span>EUR</span></div>
                          <button type="button" aria-label={locale === "fr" ? "Augmenter le seuil" : "Increase threshold"} onClick={() => onThresholdChange(String((Number(threshold) || 0) + 500))}>+</button>
                        </div>
                        <button type="button" className="threshold-quick-action" onClick={() => onThresholdChange("15000")}>{locale === "fr" ? "Régler à 15 000 pour la démo" : "Set 15,000 for the demo"} →</button>
                        <p id="threshold-effect" className="threshold-effect" data-status={thresholdOutcome}>{locale === "fr" ? "EFFET" : "EFFECT"}: 10,000 → FAIL · 15,000 → PASS · {locale === "fr" ? "actuel" : "current"} → {thresholdOutcome}</p>
                        <p className="threshold-facts">{locale === "fr" ? "TRANSACTION" : "TRANSACTION"} {poAmount.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} EUR · {locale === "fr" ? "REQUIS" : "REQUIRED"} {control.parameters.requiredApprovers} · {locale === "fr" ? "ENREGISTRÉ" : "RECORDED"} {recordedApprovers}</p>
                        {thresholdError && <p id="approval-threshold-error" role="alert" className="validation-error">{thresholdError}</p>}
                      </div>
                    ) : <div className="control-detail-method"><span>{methodLabel(mode)}</span><p>{evidenceRequirementCount(control.kind)} {locale === "fr" ? "éléments probants requis pour le calcul" : "evidence items required for evaluation"}</p></div>}
                  </div>
                )}
              </article>
            );
          })}
          <footer className="register-footer">{enabledCount} {locale === "fr" ? "contrôles actifs · moteur déterministe prêt" : "enabled controls · deterministic engine ready"}</footer>
        </div>
      )}
    </SectionShell>
  );
}
