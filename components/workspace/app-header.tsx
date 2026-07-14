import type { AiAvailability, AppMode } from "@/components/workspace/types";
import { useLocale } from "@/src/i18n/locale-context";

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
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="border-b border-slate-200 bg-[#fbfcfa]">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-3 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-xl bg-slate-950 text-sm font-black tracking-tight text-white shadow-sm">
            PP
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold tracking-tight text-slate-950">PolicyProof</p>
            <p className="truncate text-xs text-slate-500 sm:text-sm">{t("brand.tagline")}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <fieldset className="inline-flex w-fit rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <legend className="sr-only">{t("a11y.language")}</legend>
            {(["en", "fr"] as const).map((candidate) => (
              <button
                key={candidate}
                type="button"
                aria-pressed={locale === candidate}
                onClick={() => setLocale(candidate)}
                className={`min-h-9 rounded-md px-3 text-xs font-bold transition ${
                  locale === candidate ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {candidate === "en" ? t("language.english") : t("language.french")}
              </button>
            ))}
          </fieldset>

          <fieldset className="flex min-w-0 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
            <legend className="sr-only">{t("a11y.mode")}</legend>
            <button
              type="button"
              aria-pressed={mode === "DETERMINISTIC_DEMO"}
              onClick={() => onModeChange("DETERMINISTIC_DEMO")}
              className={`min-h-9 rounded-md px-3 text-xs font-bold transition sm:text-sm ${
                mode === "DETERMINISTIC_DEMO"
                  ? "bg-teal-50 text-teal-950 shadow-sm ring-1 ring-teal-100"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {t("mode.demo")}
            </button>
            <button
              type="button"
              aria-pressed={mode === "LIVE_GPT_5_6"}
              disabled={!ai.available}
              onClick={() => onModeChange("LIVE_GPT_5_6")}
              className={`min-h-9 rounded-md px-3 text-xs font-bold transition sm:text-sm ${
                mode === "LIVE_GPT_5_6"
                  ? "bg-indigo-50 text-indigo-900 shadow-sm ring-1 ring-indigo-100"
                  : "text-slate-500 enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-45"
              }`}
              title={ai.available ? `Use ${ai.model}` : t("mode.live.title")}
            >
              {t("mode.live")}
            </button>
          </fieldset>

          <button
            type="button"
            onClick={onRun}
            disabled={isRunning}
            className="min-h-11 rounded-lg bg-teal-800 px-5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-wait disabled:opacity-60"
          >
            {isRunning ? t("action.running") : t("action.run")}
          </button>
        </div>
      </div>
    </header>
  );
}
