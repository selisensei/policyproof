import type { CaseDocument } from "@/src/domain/schemas";
import type { LocalDocument } from "@/src/lib/local-documents";
import type { AppMode } from "@/components/workspace/types";
import { SectionShell } from "@/components/workspace/section-shell";
import { useLocale } from "@/src/i18n/locale-context";

export function DocumentsPanel({
  mode,
  demoDocuments,
  localDocuments,
  documentError,
  onSelectFiles,
  onRemoveDocument,
  onUpdateLabel,
  onLoadDemo,
  onResetDemo,
}: {
  mode: AppMode;
  demoDocuments: CaseDocument[];
  localDocuments: LocalDocument[];
  documentError: string;
  onSelectFiles: (files: File[]) => void;
  onRemoveDocument: (id: string) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onLoadDemo: () => void;
  onResetDemo: () => void;
}) {
  const { t } = useLocale();
  const isLive = mode === "LIVE_GPT_5_6";
  return (
    <SectionShell
      id="documents"
      step={t("step.label", { number: 3 })}
      title={t("documents.title")}
      description={t(isLive ? "documents.help.live" : "documents.help.demo")}
      action={
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onLoadDemo} className="primary-button">{t("action.loadDemo")}</button>
          {!isLive && <button type="button" onClick={onResetDemo} className="secondary-button">{t("action.resetDemo")}</button>}
        </div>
      }
    >
      {isLive ? (
        <div>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <label htmlFor="local-documents" className="field-label text-slate-900">{t("documents.select")}</label>
            <p id="local-documents-help" className="mt-1 text-sm text-slate-500">{t("documents.accepted")}</p>
            <input id="local-documents" type="file" multiple accept=".txt,.md,.json,text/plain,text/markdown,application/json" aria-describedby="local-documents-help" onChange={(event) => onSelectFiles(Array.from(event.target.files ?? []))} className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-teal-800 file:px-4 file:py-2.5 file:font-semibold file:text-white" />
          </div>
          {documentError && <p role="alert" className="error-callout mt-3">{documentError}</p>}
          {localDocuments.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {localDocuments.map((document) => (
                <article key={document.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <label className="field-label text-slate-500">{t("documents.label")}<input aria-label={t("documents.labelFor", { name: document.name })} value={document.label} onChange={(event) => onUpdateLabel(document.id, event.target.value)} className="field-control mt-1 font-semibold" /></label>
                      <p className="mt-2 break-all text-xs text-slate-500">{document.name}</p>
                      <p className="mt-1 text-xs font-medium text-teal-800">{document.inferredType.replaceAll("_", " ")} · {Math.max(1, Math.ceil(document.size / 1024))} KB</p>
                    </div>
                    <button type="button" onClick={() => onRemoveDocument(document.id)} className="icon-button" aria-label={t("documents.remove", { name: document.name })} title={t("action.remove")}>×</button>
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="mt-4 text-sm text-slate-500">{t("documents.none")}</p>}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {demoDocuments.map((document) => (
            <details key={document.id} className="group rounded-xl border border-slate-200 bg-white p-4 open:md:col-span-2">
              <summary className="list-none">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">{document.type.replaceAll("_", " ")}</p>
                    <h3 className="mt-1 font-semibold text-slate-950">{document.title}</h3>
                    <p className="mt-2 text-xs text-slate-500">{t("documents.facts", { count: document.facts.length })}</p>
                  </div>
                  <span aria-hidden="true" className="text-slate-400 transition group-open:rotate-45">+</span>
                </div>
              </summary>
              <p className="mt-4 whitespace-pre-line rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">{document.content}</p>
            </details>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
