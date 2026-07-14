import { useLocale } from "@/src/i18n/locale-context";

export function IntroPanel({ onStartDemo, compact = false }: { onStartDemo: () => void; compact?: boolean }) {
  const { t } = useLocale();

  if (compact) {
    return (
      <section aria-label={t("intro.eyebrow")} className="flex flex-col gap-2 rounded-xl bg-slate-950 px-5 py-4 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-4xl text-sm font-semibold leading-5">{t("intro.title")}</p>
        <p className="shrink-0 text-xs font-medium text-teal-200">{t("intro.safety")}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="product-introduction" className="overflow-hidden rounded-2xl bg-slate-950 text-white shadow-[0_18px_45px_-30px_rgba(15,23,42,0.8)]">
      <div className="grid gap-5 px-5 py-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.6fr)] lg:items-center lg:px-7">
        <div>
          <p className="eyebrow text-teal-300">{t("intro.eyebrow")}</p>
          <h1 id="product-introduction" className="mt-2 max-w-4xl text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("intro.title")}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{t("intro.workflow")}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
          <p className="text-sm font-semibold text-white">{t("intro.responsibility")}</p>
          <p className="mt-2 text-xs leading-5 text-slate-300">{t("intro.safety")}</p>
          <button type="button" onClick={onStartDemo} className="primary-button mt-4 w-full">
            {t("action.startDemo")}
          </button>
        </div>
      </div>
    </section>
  );
}
