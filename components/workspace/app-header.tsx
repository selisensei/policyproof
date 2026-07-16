import type { AiAvailability, AppMode } from "@/components/workspace/types";
import { useLocale } from "@/src/i18n/locale-context";

export function AppHeader({
  mode,
  ai,
  onModeChange,
  primaryLabel,
  onPrimaryAction,
  primaryDisabled,
  showPrimaryAction = true,
  onShowGuide,
}: {
  mode: AppMode;
  ai: AiAvailability;
  onModeChange: (mode: AppMode) => void;
  primaryLabel: string;
  onPrimaryAction: () => void;
  primaryDisabled: boolean;
  showPrimaryAction?: boolean;
  onShowGuide: () => void;
}) {
  const { locale, setLocale, t } = useLocale();

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="product-identity">
          <span aria-hidden="true" className="brand-mark">P</span>
          <strong>PolicyProof</strong>
          <span aria-hidden="true" className="identity-rule" />
          <span className="brand-tagline">{t("brand.tagline")}</span>
        </div>

        <div className="header-tools">
          <fieldset className="language-switch" aria-label={t("a11y.language")}>
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

          <fieldset className="mode-switch" aria-label={t("a11y.mode")}>
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
              className={mode === "LIVE_GPT_5_6" ? "is-active" : ""}
              title={ai.available ? `Use ${ai.model}` : t("mode.live.title")}
            >
              {t("mode.live")}
            </button>
          </fieldset>

          <p className="human-review-indicator"><span aria-hidden="true" />{t("header.humanReview")}</p>
          <button type="button" className="help-button" onClick={onShowGuide} aria-label={t("guide.title")} title={t("guide.title")}>?</button>
          {showPrimaryAction && <button type="button" onClick={onPrimaryAction} disabled={primaryDisabled} className="run-button">
            {primaryLabel}
          </button>}
        </div>
      </div>
    </header>
  );
}
