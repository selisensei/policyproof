import type { AiAvailability, AppMode } from "@/components/workspace/types";

export function AppHeader({
  mode,
  ai,
  onModeChange,
  onRun,
  isRunning,
}: {
  mode: AppMode;
  ai: AiAvailability;
  onModeChange: (mode: AppMode) => void;
  onRun: () => void;
  isRunning: boolean;
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <div aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-950 text-sm font-bold text-white">
              PP
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight text-slate-950">PolicyProof</p>
              <p className="text-sm text-slate-500">Evidence-led control review for business operations</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <fieldset className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <legend className="sr-only">Review mode</legend>
            <button
              type="button"
              aria-pressed={mode === "DETERMINISTIC_DEMO"}
              onClick={() => onModeChange("DETERMINISTIC_DEMO")}
              className={`min-h-10 rounded-md px-3 text-sm font-semibold ${
                mode === "DETERMINISTIC_DEMO"
                  ? "bg-white text-emerald-950 shadow-sm"
                  : "text-slate-600 hover:text-slate-950"
              }`}
            >
              Deterministic demo
            </button>
            <button
              type="button"
              aria-pressed={mode === "LIVE_GPT_5_6"}
              disabled={!ai.available}
              onClick={() => onModeChange("LIVE_GPT_5_6")}
              className={`min-h-10 rounded-md px-3 text-sm font-semibold ${
                mode === "LIVE_GPT_5_6"
                  ? "bg-white text-indigo-800 shadow-sm"
                  : "text-slate-500 enabled:hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              }`}
              title={ai.available ? `Use ${ai.model}` : "Configure OPENAI_API_KEY to enable live mode"}
            >
              Live GPT-5.6
            </button>
          </fieldset>
          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className="min-h-11 rounded-lg bg-emerald-950 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-900 disabled:cursor-wait disabled:opacity-60"
          >
            {isRunning ? "Review in progress…" : "Run review"}
          </button>
        </div>
      </div>
    </header>
  );
}
