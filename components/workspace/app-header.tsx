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
    <header className="app-header">
      <div className="mx-auto flex min-h-[4.25rem] max-w-[1760px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div aria-hidden="true" className="brand-mark">
            <span>PP</span>
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-extrabold tracking-[-0.02em] text-slate-950">PolicyProof</p>
            <p className="hidden truncate text-[11px] font-medium text-slate-500 sm:block">{t("brand.tagline")}</p>
          </div>
        </div>

        <div className="hidden min-w-0 items-center gap-2 border-l border-slate-200 pl-5 lg:flex">
          <span aria-hidden="true" className="size-2 rounded-full bg-teal-500 shadow-[0_0_0_4px_rgba(20,184,166,0.10)]" />
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-800">Northstar Facilities</p>
            <p className="truncate text-[10px] text-slate-500">{t("summary.help")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <fieldset className="mode-switch app-mode-switch inline-flex">
            <legend className="sr-only">{t("a11y.mode")}</legend>
            <button
              type="button"
              aria-pressed={mode === "DETERMINISTIC_DEMO"}
              onClick={() => onModeChange("DETERMINISTIC_DEMO")}
              className={mode === "DETERMINISTIC_DEMO" ? "is-active" : ""}
            >
              {t("mode.demo")}
            </button>
            <button
              type="button"
              aria-pressed={mode === "LIVE_GPT_5_6"}
              disabled={!ai.available}
              onClick={() => onModeChange("LIVE_GPT_5_6")}
              className={mode === "LIVE_GPT_5_6" ? "is-active is-live" : ""}
              title={ai.available ? `Use ${ai.model}` : t("mode.live.title")}
            >
              {t("mode.live")}
            </button>
          </fieldset>

          <fieldset className="language-switch">
            <legend className="sr-only">{t("a11y.language")}</legend>
            {(["en", "fr"] as const).map((candidate) => (
              <button
                key={candidate}
                type="button"
                aria-pressed={locale === candidate}
                aria-label={candidate === "en" ? t("language.english") : t("language.french")}
                onClick={() => setLocale(candidate)}
                className={locale === candidate ? "is-active" : ""}
              >
                {candidate.toUpperCase()}
              </button>
            ))}
          </fieldset>

          <button type="button" onClick={onRun} disabled={isRunning} aria-label={isRunning ? t("action.running") : t("action.run")} className="run-button">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="none">
              <path d="M4.5 10h11M11.5 6l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">{isRunning ? t("action.running") : t("action.run")}</span>
            <span className="sm:hidden">{isRunning ? "…" : t("step.review")}</span>
          </button>
        </div>
      </div>

    </header>
  );
}
