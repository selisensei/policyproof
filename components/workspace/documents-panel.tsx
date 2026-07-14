import type { CaseDocument } from "@/src/domain/schemas";
import type { LocalDocument } from "@/src/lib/local-documents";
import type { AppMode } from "@/components/workspace/types";
import { SectionShell } from "@/components/workspace/section-shell";
import { useLocale } from "@/src/i18n/locale-context";

function documentDate(document: CaseDocument): string {
  const fact = document.facts.find((candidate) => candidate.key.toLocaleLowerCase().includes("date"));
  return typeof fact?.value === "string" ? fact.value : "—";
}

function documentParty(document: CaseDocument): string {
  const fact = document.facts.find((candidate) => candidate.key === "supplierName");
  return typeof fact?.value === "string" ? fact.value : document.type === "WORKFLOW" ? "Internal" : "Northstar Facilities Ltd.";
}

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
  const { locale, t } = useLocale();
  const isLive = mode === "LIVE_GPT_5_6";
  const factCount = demoDocuments.reduce((total, document) => total + document.facts.length, 0);

  return (
    <SectionShell
      id="documents"
      step={t("step.label", { number: 3 })}
      title={locale === "fr" ? "Dossier — changement de fournisseur Northstar Facilities" : "Case file — Northstar Facilities vendor change"}
      description={isLive ? t("documents.help.live") : `${demoDocuments.length} ${locale === "fr" ? "documents fictifs" : "fixture documents"} · ${factCount} ${locale === "fr" ? "faits extraits" : "extracted facts"}`}
      action={<div className="heading-actions">{isLive && <button type="button" onClick={onLoadDemo} className="primary-button">{t("action.loadDemo")}</button>}{!isLive && <button type="button" onClick={onResetDemo} className="secondary-button">{t("action.resetDemo")}</button>}</div>}
    >
      {isLive ? (
        <div className="local-document-workspace">
          <div className="file-dropzone">
            <div><label htmlFor="local-documents" className="field-label">{t("documents.select")}</label><p id="local-documents-help">{t("documents.accepted")}</p></div>
            <input id="local-documents" type="file" multiple accept=".txt,.md,.json,text/plain,text/markdown,application/json" aria-describedby="local-documents-help" onChange={(event) => onSelectFiles(Array.from(event.target.files ?? []))} />
          </div>
          {documentError && <div role="alert" className="safe-error document-error"><strong>{locale === "fr" ? "Document rejeté" : "Document rejected"}</strong><p>{documentError}</p></div>}
          {localDocuments.length ? (
            <div className="local-document-register">
              <div className="document-register-head" aria-hidden="true"><span>REF</span><span>{locale === "fr" ? "DOCUMENT" : "DOCUMENT"}</span><span>TYPE</span><span>{locale === "fr" ? "ORIGINE" : "ORIGIN"}</span><span>{locale === "fr" ? "VALIDATION" : "VALIDATION"}</span><span /></div>
              {localDocuments.map((document, index) => (
                <article key={document.id} className="local-document-row">
                  <span className="document-ref">DOC-{String(index + 1).padStart(2, "0")}</span>
                  <label className="document-label"><span className="sr-only">{t("documents.label")}</span><input aria-label={t("documents.labelFor", { name: document.name })} value={document.label} onChange={(event) => onUpdateLabel(document.id, event.target.value)} /><small>{document.name}</small></label>
                  <span>{document.inferredType.replaceAll("_", " ")}</span><span className="data-label">UPLOAD</span><span className="validation-pass">✓ {locale === "fr" ? "Validé" : "Validated"}</span>
                  <button type="button" onClick={() => onRemoveDocument(document.id)} className="text-action is-danger" aria-label={t("documents.remove", { name: document.name })}>{t("action.remove")}</button>
                </article>
              ))}
            </div>
          ) : <div className="empty-state"><strong>{t("documents.none")}</strong><p>{t("documents.help.live")}</p></div>}
        </div>
      ) : (
        <div className="document-register">
          <div className="document-register-head" aria-hidden="true"><span>REF</span><span>{locale === "fr" ? "DOCUMENT" : "DOCUMENT"}</span><span>TYPE</span><span>DATE</span><span>{locale === "fr" ? "PARTIE" : "PARTY"}</span><span>{locale === "fr" ? "ORIGINE" : "ORIGIN"}</span><span>{locale === "fr" ? "VALIDATION" : "VALIDATION"}</span></div>
          {demoDocuments.map((document, index) => (
            <details key={document.id} className="document-row">
              <summary>
                <span className="document-ref">DOC-{String(index + 1).padStart(2, "0")}<small>{document.id}</small></span>
                <span className="document-copy"><strong>{document.title}</strong><small>{document.facts.length} facts · {document.facts.map((fact) => fact.id).slice(0, 2).join(" · ")}{document.facts.length > 2 ? " ···" : ""}</small></span>
                <span>{document.type.replaceAll("_", " ")}</span><span className="data-label">{documentDate(document)}</span><span>{documentParty(document)}</span><span className="data-label">FIXTURE</span><span className="validation-pass">✓ {locale === "fr" ? "Validé" : "Validated"}</span>
              </summary>
              <div className="document-source"><p className="eyebrow">{locale === "fr" ? "EXTRAIT SOURCE (EN)" : "SOURCE CONTENT"}</p><pre>{document.content}</pre></div>
            </details>
          ))}
          <footer className="register-footer">{demoDocuments.length} {locale === "fr" ? "documents versionnés · contenu affiché comme texte inerte" : "version-controlled documents · content rendered as inert text"}</footer>
        </div>
      )}
      {!isLive && <div className="file-dropzone is-disabled-note"><div><strong>{locale === "fr" ? "Ajouter des preuves au dossier" : "Add evidence to this case file"}</strong><p>{locale === "fr" ? "Passez au mode GPT-5.6 en direct pour sélectionner des fichiers fictifs locaux." : "Switch to Live GPT-5.6 to select fictional local files."}</p><span>TXT · MD · JSON — MAX 1 MB</span></div></div>}
    </SectionShell>
  );
}
