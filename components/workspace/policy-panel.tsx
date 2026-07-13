import type { AppMode, AiAvailability } from "@/components/workspace/types";
import { SectionShell } from "@/components/workspace/section-shell";

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
  const isLive = mode === "LIVE_GPT_5_6";
  return (
    <SectionShell
      id="policy"
      step="Step 1"
      title={isLive ? "Policy source" : "Demo procurement policy"}
      description={
        isLive
          ? "Provide fictional policy text. GPT-5.6 will propose controls for human review; it will not approve them."
          : "A version-controlled fictional policy anchors the guaranteed demonstration path."
      }
      action={
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          {expanded ? "Collapse policy" : "Expand policy"}
        </button>
      }
    >
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className="rounded-full bg-slate-100 px-2.5 py-1">Demo 1.0</span>
        <span className="rounded-full bg-slate-100 px-2.5 py-1">Fictional data</span>
        <span className={`rounded-full px-2.5 py-1 ${isLive ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-800"}`}>
          {isLive ? "AI compilation requested" : "Confirmed demo source"}
        </span>
      </div>

      {expanded && (
        <div className="mt-4">
          {isLive ? (
            <>
              <label htmlFor="policy-text" className="text-sm font-semibold text-slate-900">Policy text</label>
              <textarea
                id="policy-text"
                rows={10}
                value={policyText}
                onChange={(event) => onPolicyTextChange(event.target.value)}
                className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-800"
              />
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-500">{policyText.length.toLocaleString("en-US")} / 50,000 characters</p>
                <button
                  type="button"
                  onClick={onCompile}
                  disabled={!ai.available || isCompiling || policyText.trim().length < 50}
                  className="min-h-10 rounded-lg bg-indigo-700 px-4 text-sm font-semibold text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCompiling ? "Compiling with GPT-5.6…" : "Propose controls with GPT-5.6"}
                </button>
              </div>
              {!ai.available && !ai.checking && (
                <p className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-sm leading-6 text-indigo-900">
                  Live mode is disabled. Add <code className="font-semibold">OPENAI_API_KEY</code> to <code className="font-semibold">.env.local</code>, then restart the server. Do not place the key in source code.
                </p>
              )}
              {compilationError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{compilationError}</p>}
            </>
          ) : (
            <ol className="grid gap-2 md:grid-cols-2">
              {policyText.split("\n").map((rule) => (
                <li key={rule} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  {rule}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </SectionShell>
  );
}
