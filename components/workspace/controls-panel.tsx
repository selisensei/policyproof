import type { AiControlProposal } from "@/src/domain/ai-schemas";
import type { ControlDefinition } from "@/src/domain/schemas";
import type { AppMode, ProposalReviewState } from "@/components/workspace/types";
import { SectionShell } from "@/components/workspace/section-shell";
import { useLocale } from "@/src/i18n/locale-context";
import { localizedControl } from "@/src/i18n/translations";

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
  const isLive = mode === "LIVE_GPT_5_6";
  const enabledCount = isLive ? proposals.filter((control) => control.enabled).length : controls.filter((control) => control.enabled).length;

  return (
    <SectionShell
      id="controls"
      step={t("step.label", { number: 2 })}
      title={t("controls.title")}
      description={t(isLive ? "controls.help.live" : "controls.help.demo")}
      action={!isLive ? <button type="button" onClick={onResetControls} className="secondary-button">{t("action.resetControls")}</button> : undefined}
    >
      <div className="register-toolbar">
        <span><b>{enabledCount}</b> {t("controls.enabled", { count: enabledCount }).replace(String(enabledCount), "").trim()}</span>
        {isLive && proposals.length > 0 && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${proposalsApproved ? "bg-teal-50 text-teal-800" : "bg-amber-50 text-amber-900"}`}>
            {t(proposalsApproved ? "controls.approved" : "controls.awaiting")}
          </span>
        )}
      </div>

      {isLive ? (
        proposals.length ? (
          <div className="space-y-3">
            {proposals.map((control) => (
              <article key={control.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <span className="font-mono text-[11px] text-slate-400">{control.id}</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${proposalStates[control.id] === "APPROVED" ? "bg-teal-50 text-teal-800" : proposalStates[control.id] === "REJECTED" ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-900"}`}>
                    {t(`controls.state.${proposalStates[control.id] ?? "PROPOSED"}`)}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <input type="checkbox" aria-label={t("controls.enable", { title: control.title })} checked={control.enabled} onChange={(event) => onProposalChange(control.id, { enabled: event.target.checked })} className="mt-1 size-5 accent-teal-700" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                      <label className="field-label">{t("controls.titleLabel")}<input aria-label={`${t("controls.titleLabel")} ${control.id}`} value={control.title} onChange={(event) => onProposalChange(control.id, { title: event.target.value })} className="field-control mt-1" /></label>
                      <label className="field-label">{t("controls.severity")}<select aria-label={`${t("controls.severity")} ${control.id}`} value={control.severity} onChange={(event) => onProposalChange(control.id, { severity: event.target.value as AiControlProposal["severity"] })} className="field-control mt-1">
                        {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((severity) => <option key={severity} value={severity}>{t(`severity.${severity}`)}</option>)}
                      </select></label>
                    </div>
                    <label className="field-label block">{t("controls.description")}<textarea aria-label={`${t("controls.description")} ${control.id}`} rows={2} value={control.description} onChange={(event) => onProposalChange(control.id, { description: event.target.value })} className="field-control mt-1 leading-5" /></label>
                    <p className="text-xs text-slate-500">{t("controls.type", { type: control.controlType.replaceAll("_", " "), evidence: control.requiredEvidence.join(", ") })}</p>
                    <button type="button" onClick={() => onRejectProposal(control.id)} className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline">{t("controls.reject")}</button>
                  </div>
                </div>
              </article>
            ))}
            <div className="flex justify-end"><button type="button" onClick={onApproveProposals} className="primary-button">{t("controls.approve")}</button></div>
          </div>
        ) : (
          <div className="empty-state"><p className="font-semibold text-slate-800">{t("controls.none")}</p><p className="mt-1 text-sm text-slate-500">{t("controls.noneHelp")}</p></div>
        )
      ) : (
        <div className="control-register">
          {controls.map((control) => {
            const localized = localizedControl(control.id, locale, control.title, control.description);
            return (
              <article key={control.id} className={`control-row ${control.enabled ? "" : "is-disabled"}`}>
                <label className="control-toggle">
                  <input type="checkbox" aria-label={t("controls.enable", { title: localized.title })} checked={control.enabled} onChange={(event) => onToggleControl(control.id, event.target.checked)} />
                  <span aria-hidden="true" />
                </label>
                <div className="control-copy">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <h3>{localized.title}</h3>
                    <span className={`severity-chip severity-${control.severity.toLocaleLowerCase()}`}>{t(`severity.${control.severity}`)}</span>
                  </div>
                  <p className="control-kind">{control.kind.replaceAll("_", " ")} · <span>{control.id}</span></p>
                  <details>
                    <summary>{t("controls.details")}</summary>
                    <p>{localized.description}</p>
                  </details>
                </div>
                <div className="control-parameter">
                  {control.kind === "APPROVAL_THRESHOLD" ? (
                    <div>
                      <label htmlFor="approval-threshold" className="field-label text-teal-950">{t("controls.threshold")}</label>
                      <div className="threshold-field"><span>€</span><input id="approval-threshold" type="number" min="0" max="1000000000" step="500" value={threshold} onChange={(event) => onThresholdChange(event.target.value)} aria-invalid={Boolean(thresholdError)} aria-describedby={thresholdError ? "approval-threshold-error" : undefined} /></div>
                      {thresholdError && <p id="approval-threshold-error" role="alert" className="mt-1 text-xs font-medium text-red-700">{thresholdError}</p>}
                    </div>
                  ) : <span className="control-method">{t("evidence.method.demo")}</span>}
                  </div>
              </article>
            );
          })}
        </div>
      )}
    </SectionShell>
  );
}
