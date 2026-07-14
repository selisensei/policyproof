import { useLocale } from "@/src/i18n/locale-context";

export function IntroPanel({ onStartDemo }: { onStartDemo: () => void; compact?: boolean }) {
  const { t } = useLocale();

  return (
    <section aria-labelledby="product-introduction" className="intro-panel">
      <div className="intro-copy">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="intro-rule" />
          <p className="eyebrow text-teal-800">{t("intro.eyebrow")}</p>
        </div>
        <h1 id="product-introduction">{t("intro.title")}</h1>
        <p className="intro-workflow">{t("intro.workflow")}</p>
      </div>
      <div className="intro-action">
        <div className="intro-responsibility">
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none">
            <path d="M12 3.5 19 6v5.3c0 4.2-2.8 7.5-7 9.2-4.2-1.7-7-5-7-9.2V6l7-2.5Z" stroke="currentColor" strokeWidth="1.5" />
            <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div><strong>{t("intro.responsibility")}</strong><span>{t("intro.safety")}</span></div>
        </div>
        <button type="button" onClick={onStartDemo} className="primary-button w-full sm:w-auto">{t("action.startDemo")}</button>
      </div>
    </section>
  );
}
