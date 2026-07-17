import { BrandLogo } from "@/components/brand/brand-logo";
import { useLocale } from "@/src/i18n/locale-context";

export function IntroPanel({ onStartDemo }: { onStartDemo: () => void; compact?: boolean }) {
  const { t } = useLocale();

  return (
    <section aria-labelledby="product-introduction" className="intro-panel">
      <div className="intro-identity"><BrandLogo decorative variant="mark" /><strong>PolicyProof</strong></div>
      <p className="eyebrow">{t("intro.eyebrow")}</p>
      <h1 id="product-introduction">{t("intro.title")}</h1>
      <p className="intro-workflow">{t("intro.workflow")}</p>
      <div className="intro-actions">
        <button type="button" onClick={onStartDemo} className="primary-button">{t("action.loadDemo")}</button>
        <p><strong>{t("intro.responsibility")}</strong><span>{t("intro.safety")}</span></p>
      </div>
    </section>
  );
}
