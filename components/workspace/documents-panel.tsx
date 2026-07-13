import type { CaseDocument } from "@/src/domain/schemas";
import type { LocalDocument } from "@/src/lib/local-documents";
import type { AppMode } from "@/components/workspace/types";
import { SectionShell } from "@/components/workspace/section-shell";

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
  const isLive = mode === "LIVE_GPT_5_6";
  return (
    <SectionShell
      id="documents"
      step="Step 3"
      title="Case documents"
      description={
        isLive
          ? "Select fictional text-based documents locally. Files stay in the browser until you explicitly run Live analysis."
          : "The guaranteed demo uses five version-controlled fictional records with stable evidence locators."
      }
      action={
        <div className="flex gap-2">
          <button type="button" onClick={onLoadDemo} className="min-h-10 rounded-lg bg-emerald-950 px-3 text-sm font-semibold text-white hover:bg-emerald-900">
            Load demo case
          </button>
          {!isLive && (
            <button type="button" onClick={onResetDemo} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Reset demo
            </button>
          )}
        </div>
      }
    >
      {isLive ? (
        <div>
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
            <label htmlFor="local-documents" className="block text-sm font-semibold text-slate-900">Select local documents</label>
            <p className="mt-1 text-sm text-slate-500">Accepted: .txt, .md, .json · Maximum 1 MB each · Up to 10 files</p>
            <input
              id="local-documents"
              type="file"
              multiple
              accept=".txt,.md,.json,text/plain,text/markdown,application/json"
              onChange={(event) => onSelectFiles(Array.from(event.target.files ?? []))}
              className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-950 file:px-4 file:py-2.5 file:font-semibold file:text-white"
            />
          </div>
          {documentError && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{documentError}</p>}
          {localDocuments.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {localDocuments.map((document) => (
                <article key={document.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <label className="text-xs font-semibold text-slate-500">
                        Document label
                        <input
                          aria-label={`Label for ${document.name}`}
                          value={document.label}
                          onChange={(event) => onUpdateLabel(document.id, event.target.value)}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                        />
                      </label>
                      <p className="mt-2 truncate text-xs text-slate-500">{document.name}</p>
                      <p className="mt-1 text-xs font-medium text-emerald-800">{document.inferredType.replaceAll("_", " ")} · {Math.ceil(document.size / 1024)} KB</p>
                    </div>
                    <button type="button" onClick={() => onRemoveDocument(document.id)} className="rounded-lg border border-slate-300 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50" aria-label={`Remove ${document.name}`}>
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No local documents selected.</p>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {demoDocuments.map((document) => (
            <details key={document.id} className="group rounded-xl border border-slate-200 p-4 open:md:col-span-2 open:xl:col-span-2">
              <summary className="cursor-pointer list-none">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">{document.type.replaceAll("_", " ")}</p>
                <h3 className="mt-1 font-semibold text-slate-950">{document.title}</h3>
                <p className="mt-2 text-xs text-slate-500">{document.facts.length} extracted facts · Select to inspect</p>
              </summary>
              <p className="mt-4 whitespace-pre-line rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{document.content}</p>
            </details>
          ))}
        </div>
      )}
    </SectionShell>
  );
}
