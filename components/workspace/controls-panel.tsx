import type { AiControlProposal } from "@/src/domain/ai-schemas";
import type { ControlDefinition } from "@/src/domain/schemas";
import type { AppMode } from "@/components/workspace/types";
import { SectionShell } from "@/components/workspace/section-shell";

export function ControlsPanel({
  mode,
  controls,
  proposals,
  proposalsApproved,
  threshold,
  thresholdError,
  onThresholdChange,
  onToggleControl,
  onResetControls,
  onProposalChange,
  onApproveProposals,
}: {
  mode: AppMode;
  controls: ControlDefinition[];
  proposals: AiControlProposal[];
  proposalsApproved: boolean;
  threshold: string;
  thresholdError: string;
  onThresholdChange: (value: string) => void;
  onToggleControl: (id: string, enabled: boolean) => void;
  onResetControls: () => void;
  onProposalChange: (id: string, patch: Partial<AiControlProposal>) => void;
  onApproveProposals: () => void;
}) {
  const isLive = mode === "LIVE_GPT_5_6";
  const enabledCount = isLive
    ? proposals.filter((control) => control.enabled).length
    : controls.filter((control) => control.enabled).length;

  return (
    <SectionShell
      id="controls"
      step="Step 2"
      title="Reviewable controls"
      description={
        isLive
          ? "Edit GPT-5.6 proposals and approve them explicitly before analysis."
          : "Enable only the controls relevant to this review and adjust the approval threshold safely."
      }
      action={
        !isLive ? (
          <button type="button" onClick={onResetControls} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Reset controls
          </button>
        ) : undefined
      }
    >
      <div className="mb-4 flex items-center justify-between text-sm">
        <span className="text-slate-600">{enabledCount} enabled</span>
        {isLive && proposals.length > 0 && (
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${proposalsApproved ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
            {proposalsApproved ? "Human approved" : "Awaiting human approval"}
          </span>
        )}
      </div>

      {isLive ? (
        proposals.length ? (
          <div className="space-y-3">
            {proposals.map((control) => (
              <article key={control.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    aria-label={`Enable ${control.title}`}
                    checked={control.enabled}
                    onChange={(event) => onProposalChange(control.id, { enabled: event.target.checked })}
                    className="mt-1 size-5 accent-emerald-800"
                  />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
                      <label className="text-xs font-semibold text-slate-600">
                        Control title
                        <input
                          aria-label={`Title for ${control.id}`}
                          value={control.title}
                          onChange={(event) => onProposalChange(control.id, { title: event.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                        />
                      </label>
                      <label className="text-xs font-semibold text-slate-600">
                        Severity
                        <select
                          aria-label={`Severity for ${control.id}`}
                          value={control.severity}
                          onChange={(event) => onProposalChange(control.id, { severity: event.target.value as AiControlProposal["severity"] })}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                        >
                          {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((severity) => <option key={severity}>{severity}</option>)}
                        </select>
                      </label>
                    </div>
                    <label className="block text-xs font-semibold text-slate-600">
                      Description
                      <textarea
                        aria-label={`Description for ${control.id}`}
                        rows={2}
                        value={control.description}
                        onChange={(event) => onProposalChange(control.id, { description: event.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm leading-5 text-slate-900"
                      />
                    </label>
                    <p className="text-xs text-slate-500">{control.controlType.replaceAll("_", " ")} · {control.requiredEvidence.join(", ")}</p>
                  </div>
                </div>
              </article>
            ))}
            <div className="flex justify-end">
              <button type="button" onClick={onApproveProposals} className="min-h-10 rounded-lg bg-emerald-950 px-4 text-sm font-semibold text-white hover:bg-emerald-900">
                Approve proposed controls
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <p className="font-semibold text-slate-800">No live control proposals</p>
            <p className="mt-1 text-sm text-slate-500">Expand the policy and request GPT-5.6 proposals when Live mode is configured.</p>
          </div>
        )
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {controls.map((control) => (
            <article key={control.id} className={`rounded-xl border p-4 ${control.enabled ? "border-slate-200" : "border-slate-200 bg-slate-50 opacity-70"}`}>
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  aria-label={`Enable ${control.title}`}
                  checked={control.enabled}
                  onChange={(event) => onToggleControl(control.id, event.target.checked)}
                  className="mt-1 size-5 accent-emerald-800"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-950">{control.title}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-600">{control.severity}</span>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{control.description}</p>
                  <p className="mt-2 text-xs font-medium text-slate-400">{control.id}</p>
                  {control.kind === "APPROVAL_THRESHOLD" && (
                    <div className="mt-3 rounded-lg bg-emerald-50 p-3">
                      <label htmlFor="approval-threshold" className="text-xs font-bold text-emerald-950">Approval threshold (EUR)</label>
                      <input
                        id="approval-threshold"
                        type="number"
                        min="0"
                        max="1000000000"
                        step="500"
                        value={threshold}
                        onChange={(event) => onThresholdChange(event.target.value)}
                        aria-invalid={Boolean(thresholdError)}
                        className="mt-1 w-full rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm text-slate-950"
                      />
                      {thresholdError && <p role="alert" className="mt-1 text-xs font-medium text-red-700">{thresholdError}</p>}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
