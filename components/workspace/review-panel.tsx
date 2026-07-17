import { useSyncExternalStore, useState, type KeyboardEvent } from "react";
import type { CaseDocument, ControlDefinition, ControlResult, EvidenceReference } from "@/src/domain/schemas";
import type { AppMode } from "@/components/workspace/types";
import type { ResultFilter, ResultSummary } from "@/src/lib/review-summary";
import { controlRef, decisionRef, evidenceCount, requirementRef } from "@/components/workspace/presentation";
import { SectionShell } from "@/components/workspace/section-shell";
import { StatusBadge } from "@/components/workspace/status-badge";
import { useLocale } from "@/src/i18n/locale-context";
import { localizedControl, localizedMissingEvidence, localizedResultExplanation } from "@/src/i18n/translations";
import { ReviewIntelligencePanels } from "@/components/workspace/review-intelligence-panels";
import { assessEvidenceIntegrity, type RunSnapshot } from "@/src/lib/review-intelligence";
import { ReviewFingerprintPanel } from "@/components/workspace/review-fingerprint-panel";
import type { ReviewFingerprintComparison } from "@/src/lib/review-fingerprint";

const filterOrder: ResultFilter[] = ["ALL", "PASS", "FAIL", "MISSING", "WARNING", "OPEN"];

function subscribeMobile(callback: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => undefined;
  const query = window.matchMedia("(max-width: 759px)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}

function getMobileSnapshot() {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(max-width: 759px)").matches);
}

function useMobileReview() {
  return useSyncExternalStore(subscribeMobile, getMobileSnapshot, () => false);
}

export function ReviewPanel({ results, visibleResults, summary, filter, selectedResult, threshold, mode, documents, controls, policyText, caseName, caseReference, documentTypes, changedControlId, currentRun, previousRun, fingerprint, fingerprintComparison, divergenceCandidateResults, isVerifying, onRerun, onFilterChange, onSelectResult, onClearHistory, onGoDecision }: {
  results: ControlResult[];
  visibleResults: ControlResult[];
  summary: ResultSummary;
  filter: ResultFilter;
  selectedResult: ControlResult | null;
  threshold: string;
  mode: AppMode;
  documents: CaseDocument[];
  controls: ControlDefinition[];
  policyText: string;
  caseName: string;
  caseReference: string;
  documentTypes: Record<string, string>;
  changedControlId: string | null;
  currentRun: RunSnapshot | null;
  previousRun: RunSnapshot | null;
  fingerprint: string;
  fingerprintComparison: ReviewFingerprintComparison | null;
  divergenceCandidateResults: ControlResult[];
  isVerifying: boolean;
  onRerun: () => void;
  onFilterChange: (filter: ResultFilter) => void;
  onSelectResult: (controlId: string) => void;
  onClearHistory: () => void;
  onGoDecision: () => void;
}) {
  const { locale, t } = useLocale();
  const isMobile = useMobileReview();

  function filterCount(candidate: ResultFilter) {
    if (candidate === "ALL") return summary.total;
    if (candidate === "OPEN") return summary.pending;
    return summary[candidate];
  }

  function filterLabel(candidate: ResultFilter) {
    if (candidate === "ALL") return locale === "fr" ? "Tous" : "All";
    if (candidate === "OPEN") return locale === "fr" ? "Ouvertes" : "Open";
    return t(`status.${candidate}`);
  }

  function onFilterKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: ResultFilter) {
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault();
    const index = filterOrder.indexOf(current);
    const nextIndex = event.key === "ArrowRight" || event.key === "ArrowDown" ? (index + 1) % filterOrder.length : (index - 1 + filterOrder.length) % filterOrder.length;
    const next = filterOrder[nextIndex];
    onFilterChange(next);
    event.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`button[data-filter="${next}"]`)?.focus();
  }

  function onResultKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const nextIndex = event.key === "ArrowDown" ? Math.min(visibleResults.length - 1, index + 1) : Math.max(0, index - 1);
    const next = visibleResults[nextIndex];
    if (!next) return;
    onSelectResult(next.controlId);
    event.currentTarget.closest(".result-register")?.querySelector<HTMLButtonElement>(`button[data-control-id="${next.controlId}"]`)?.focus();
  }

  const inspector = selectedResult ? (
    <EvidenceDetails
      key={`${selectedResult.controlId}-${locale}-${threshold}`}
      result={selectedResult}
      threshold={threshold}
      mode={mode}
      documents={documents}
      policyText={policyText}
      documentTypes={documentTypes}
      changed={changedControlId === selectedResult.controlId}
      onGoDecision={onGoDecision}
    />
  ) : null;

  return (
    <SectionShell id="review" step={t("step.label", { number: 4 })} title={t("review.title")} description={results.length ? `${results.length} ${locale === "fr" ? "contrôles évalués" : "controls evaluated"} · ${mode === "DETERMINISTIC_DEMO" ? (locale === "fr" ? "revue déterministe" : "deterministic review") : "GPT-5.6 + TypeScript"} · ${Number(threshold).toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} EUR` : t("review.help")}>
      {!results.length ? (
        <div className="empty-state"><strong>{t("review.empty")}</strong><p>{t("review.emptyHelp")}</p></div>
      ) : (
        <>
          <ReviewIntelligencePanels
            results={results}
            documents={documents}
            controls={controls}
            summary={summary}
            threshold={Number(threshold)}
            mode={mode}
            caseName={caseName}
            caseReference={caseReference}
            currentRun={currentRun}
            previousRun={previousRun}
            onFilterChange={onFilterChange}
            onInspectControl={(controlId) => { onFilterChange("ALL"); onSelectResult(controlId); }}
            onClearHistory={onClearHistory}
          />
          {mode === "DETERMINISTIC_DEMO" && fingerprint && <ReviewFingerprintPanel fingerprint={fingerprint} comparison={fingerprintComparison} results={results} candidateResults={divergenceCandidateResults} isVerifying={isVerifying} onRerun={onRerun} />}
          <div className="review-filter-row" role="radiogroup" aria-label={locale === "fr" ? "Filtrer les résultats" : "Filter results"}>
            {filterOrder.map((candidate) => (
              <button key={candidate} type="button" data-filter={candidate} data-status={candidate} aria-label={candidate === "ALL" ? (locale === "fr" ? `Afficher les ${summary.total} résultats` : `Show all ${summary.total} results`) : candidate === "OPEN" ? (locale === "fr" ? `Afficher ${summary.pending} décisions ouvertes` : `Show ${summary.pending} open decisions`) : t("review.showStatus", { count: summary[candidate], status: t(`status.${candidate}`) })} aria-pressed={filter === candidate} onKeyDown={(event) => onFilterKeyDown(event, candidate)} onClick={() => onFilterChange(candidate)} className={filter === candidate ? "is-active" : ""}>
                <span aria-hidden="true">{candidate === "PASS" ? "✓" : candidate === "FAIL" ? "×" : candidate === "MISSING" ? "⌀" : candidate === "WARNING" ? "!" : ""}</span>{filterLabel(candidate)} {filterCount(candidate)}
              </button>
            ))}
          </div>

          <div className="review-workbench" id="result-ledger">
            <div className="result-register">
              <div className="result-register-heading" aria-hidden="true"><span>REF</span><span>{locale === "fr" ? "CONTRÔLE" : "CONTROL"}</span><span>{locale === "fr" ? "CONCLUSION" : "CONCLUSION"}</span><span>{locale === "fr" ? "GRAVITÉ" : "SEVERITY"}</span><span>{locale === "fr" ? "MÉTHODE" : "METHOD"}</span><span>{locale === "fr" ? "PREUVES" : "EVIDENCE"}</span><span>{locale === "fr" ? "REVUE" : "REVIEW"}</span></div>
              <div className="result-register-list">
                {visibleResults.map((result, index) => {
                  const title = localizedControl(result.controlId, locale, result.title).title;
                  const selected = selectedResult?.controlId === result.controlId;
                  return (
                    <div key={result.controlId} className={`result-entry ${selected ? "is-selected" : ""}`} data-changed={changedControlId === result.controlId || undefined}>
                      <button type="button" data-control-id={result.controlId} onClick={() => onSelectResult(result.controlId)} onKeyDown={(event) => onResultKeyDown(event, index)} aria-label={t("review.inspect", { title })} aria-pressed={selected} className="result-row">
                        <span className="result-ref">{controlRef(result.controlId)}<small>{requirementRef(result.controlId)}</small></span>
                        <span className="result-copy"><strong>{title}</strong><small>{result.controlId}</small></span>
                        <StatusBadge status={result.status} />
                        <span className="severity-label" data-severity={result.severity}>{t(`severity.${result.severity}`)}</span>
                        <span className="method-label">{mode === "DETERMINISTIC_DEMO" ? (locale === "fr" ? "Contrôle déterministe" : "Deterministic check") : (locale === "fr" ? "Revue hybride" : "Hybrid review")}</span>
                        <span className="result-evidence-count">{evidenceCount(result)}</span>
                        <span className="result-decision">{selected ? (locale === "fr" ? "Décider →" : "Decide →") : t(`decision.${result.reviewerDecision.state}`)}</span>
                      </button>
                      {selected && <span aria-hidden="true" className="selection-bridge"><i /></span>}
                      {isMobile && selected && inspector}
                    </div>
                  );
                })}
                {!visibleResults.length && <div className="filtered-empty"><p>{t("review.noMatch")}</p><button type="button" onClick={() => onFilterChange("ALL")}>{t("review.clearFilter")}</button></div>}
              </div>
              <footer className="result-register-footer"><span>{summary.pending} {locale === "fr" ? "décisions humaines non résolues" : "unresolved human decisions"}</span><button type="button" onClick={onGoDecision}>{locale === "fr" ? "Résoudre à l’étape 05" : "Resolve in step 05"} →</button></footer>
            </div>
            {!isMobile && (inspector ?? <aside className="empty-state evidence-empty">{t("evidence.select")}</aside>)}
          </div>
        </>
      )}
    </SectionShell>
  );
}

function EvidenceDetails({ result, threshold, mode, documents, policyText, documentTypes, changed, onGoDecision }: { result: ControlResult; threshold: string; mode: AppMode; documents: CaseDocument[]; policyText: string; documentTypes: Record<string, string>; changed: boolean; onGoDecision: () => void }) {
  const { locale, t } = useLocale();
  const [copied, setCopied] = useState<string | null>(null);
  const title = localizedControl(result.controlId, locale, result.title).title;
  const sequence = Number(requirementRef(result.controlId).replace("R-", ""));
  const requirement = Number.isFinite(sequence) ? policyText.split("\n")[sequence - 1]?.replace(/^\d+\.\s*/, "") : null;
  const integrity = assessEvidenceIntegrity(result, documents);

  async function copy(key: string, value: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied((current) => current === key ? null : current), 1600);
    } catch {
      setCopied("failed");
    }
  }

  return (
    <aside aria-label={t("a11y.evidence")} className="evidence-canvas">
      <div className="evidence-chain"><span>{requirementRef(result.controlId)}</span><i /><span>{controlRef(result.controlId)}</span><i /><StatusBadge status={result.status} /><small>{locale === "fr" ? "DOSSIER DE PREUVES" : "EVIDENCE CASE FILE"}</small></div>
      <div className="evidence-heading"><div><h3>{title}</h3><p>{localizedResultExplanation(result.controlId, result.status, result.explanation, locale, threshold)}</p></div></div>
      {changed && <div className="conclusion-changed" role="status"><strong>{locale === "fr" ? `Conclusion modifiée : ${controlRef(result.controlId)} ÉCHEC → ${t(`status.${result.status}`).toLocaleUpperCase("fr-FR")}` : `Conclusion changed: ${controlRef(result.controlId)} FAIL → ${result.status}`}</strong><p>{locale === "fr" ? `La conclusion reflète maintenant le seuil actif de ${Number(threshold).toLocaleString("fr-FR")} EUR. Les décisions humaines précédentes ont été réinitialisées avant cette nouvelle exécution.` : `The conclusion now reflects the active ${Number(threshold).toLocaleString("en-US")} EUR threshold. Previous human decisions were reset before this new run.`}</p></div>}
      {requirement && <blockquote className="requirement-quote"><span>{locale === "fr" ? "EXTRAIT SOURCE (EN)" : "SOURCE REQUIREMENT"}</span>“{requirement}”</blockquote>}
      <div className="evidence-integrity" data-state={integrity.state} aria-label={locale === "fr" ? "Intégrité des preuves" : "Evidence integrity"}>
        <strong>{integrity.state === "VERIFIED" ? (locale === "fr" ? "✓ Sources exactes vérifiées" : "✓ Exact sources verified") : integrity.state === "MISSING" ? (locale === "fr" ? "○ Preuve exigée manquante" : "○ Required evidence missing") : (locale === "fr" ? "× Référence de preuve rejetée" : "× Evidence reference rejected")}</strong>
        <span>{integrity.verifiedReferences} {locale === "fr" ? "extrait(s) exact(s)" : "exact excerpt(s)"} · {integrity.missingRequirements} {locale === "fr" ? "exigence(s) absente(s)" : "missing requirement(s)"}</span>
      </div>
      <details className="evidence-trust">
        <summary>{locale === "fr" ? "Pourquoi ces preuves sont fiables" : "Why this evidence is trusted"}</summary>
        {integrity.state === "VERIFIED" ? <p>{locale === "fr" ? "L’identifiant du document est connu, chaque extrait existe exactement dans le texte fictif soumis, sa localisation et sa relation au contrôle sont validées. Les règles déterministes ou le jugement humain restent responsables de la conclusion finale." : "The document identifier is known, every excerpt exists exactly in the submitted fictional text, and its locator and relationship to the control are validated. Deterministic rules or human judgment remain responsible for the final conclusion."}</p> : integrity.state === "MISSING" ? <p>{locale === "fr" ? "La source requise n’existe pas dans le dossier. PolicyProof signale l’absence et n’invente ni document ni extrait." : "The required source is not present in the case. PolicyProof reports the gap and does not fabricate a document or excerpt."}</p> : <p>{locale === "fr" ? "Une référence est rejetée lorsqu’un document, un extrait exact ou une relation attendue ne peut pas être validé. Aucun contenu brut du fournisseur n’est affiché." : "A reference is rejected when its document, exact excerpt, or expected relationship cannot be validated. No raw provider payload is displayed."}</p>}
      </details>
      <p className="evidence-provenance">{locale === "fr" ? "MÉTHODE" : "METHOD"}: {mode === "DETERMINISTIC_DEMO" ? (locale === "fr" ? "Contrôle déterministe" : "Deterministic check") : (locale === "fr" ? "Revue hybride" : "Hybrid review")} · {evidenceCount(result)} {locale === "fr" ? "FAITS CITÉS" : "FACTS CITED"}</p>
      <div className="evidence-groups">
        <EvidenceList kind="contradictory" title={t("evidence.contradictory")} items={result.contradictoryEvidence} empty={t("evidence.noContradictory")} documentTypes={documentTypes} copied={copied} onCopy={copy} />
        {result.contradictoryEvidence.length >= 2 && <CurrencyComparison items={result.contradictoryEvidence} locale={locale} />}
        <EvidenceList kind="supporting" title={t("evidence.supporting")} items={result.supportingEvidence} empty={t("evidence.noSupporting")} documentTypes={documentTypes} copied={copied} onCopy={copy} />
        <section className="missing-evidence-section"><h4>{t("evidence.missing")}</h4>{result.missingEvidence.length ? <ul>{result.missingEvidence.map((item) => { const localized = localizedMissingEvidence(result.controlId, locale, item.description, item.expectedSource); return <li key={item.description}><strong>⌀ {localized.description}</strong><span>{t("evidence.expected", { source: localized.source })}</span></li>; })}</ul> : <p className="empty-evidence-row">{t("evidence.noMissing")}</p>}</section>
      </div>
      <footer className="evidence-footer"><span>{decisionRef(result.controlId)} · {t(`decision.${result.reviewerDecision.state}`).toLocaleUpperCase(locale === "fr" ? "fr-FR" : "en-US")}</span><button type="button" onClick={onGoDecision}>{locale === "fr" ? "Enregistrer la décision humaine" : "Record human decision"} →</button></footer>
      <p aria-live="polite" className="copy-feedback">{copied === "failed" ? t("action.copyFailed") : copied ? t("action.copied") : ""}</p>
    </aside>
  );
}

function EvidenceList({ title, items, empty, kind, documentTypes, copied, onCopy }: { title: string; items: EvidenceReference[]; empty: string; kind: "supporting" | "contradictory"; documentTypes: Record<string, string>; copied: string | null; onCopy: (key: string, value: string) => Promise<void> }) {
  const { locale, t } = useLocale();
  return <section className="evidence-group" data-kind={kind}><h4>{title} <span>{items.length}</span></h4>{items.length ? <div className="evidence-list">{items.map((item) => <article key={item.id} className="evidence-record" data-kind={kind}>
    <header><span>{item.documentId}</span><small>{t("evidence.documentType", { type: (documentTypes[item.documentId] ?? "OTHER").replaceAll("_", " ") })}</small></header>
    <strong>{item.documentTitle}</strong>
    <p className="evidence-relation">{item.locator}{item.relationToControl ? ` · ${item.relationToControl}` : ""}</p>
    <blockquote>“{item.excerpt}”</blockquote>
    <p className="evidence-fact">{item.factId} · {modeForEvidence(item)}</p>
    <div className="evidence-actions"><button type="button" onClick={() => onCopy(`${item.id}-excerpt`, item.excerpt)}>{copied === `${item.id}-excerpt` ? `${t("action.copied")} ✓` : t("evidence.copyExcerpt")}</button><button type="button" onClick={() => onCopy(`${item.id}-reference`, `${item.factId} · ${item.documentId} ${item.documentTitle} · ${item.locator}`)}>{copied === `${item.id}-reference` ? `${t("action.copied")} ✓` : t("evidence.copyReference")}</button></div>
    {locale === "fr" && <span className="source-language-tag">EXTRAIT SOURCE (EN)</span>}
  </article>)}</div> : <p className="empty-evidence-row">{empty}</p>}</section>;
}

function modeForEvidence(item: EvidenceReference): string {
  return item.confidence === null ? "DETERMINISTIC CHECK" : "SEMANTIC EXTRACTION";
}

function monetaryEvidence(item: EvidenceReference) {
  const match = item.excerpt.match(/([0-9][0-9, .]*)\s+(EUR|USD)\b/i);
  if (!match) return null;
  const amount = Number(match[1].replaceAll(",", "").replaceAll(" ", ""));
  return Number.isFinite(amount) ? { item, amount, currency: match[2].toUpperCase() } : null;
}

function CurrencyComparison({ items, locale }: { items: EvidenceReference[]; locale: "en" | "fr" }) {
  const values = items.map(monetaryEvidence).filter((value): value is NonNullable<ReturnType<typeof monetaryEvidence>> => Boolean(value));
  if (values.length < 2 || values[0].currency === values[1].currency) return null;
  const [left, right] = values;
  return <section className="currency-comparison" aria-label={locale === "fr" ? "Comparaison des devises" : "Currency comparison"}>
    <div className="comparison-head"><span>{locale === "fr" ? "CHAMP" : "FIELD"}</span><span>{left.item.documentTitle}</span><span /><span>{right.item.documentTitle}</span></div>
    <div><strong>{locale === "fr" ? "Montant" : "Amount"}</strong><span>{left.amount.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}</span><b>=</b><span>{right.amount.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}</span></div>
    <div className="currency-row"><strong>{locale === "fr" ? "Devise" : "Currency"}</strong><span>{left.currency}</span><b>≠</b><span>{right.currency}</span></div>
  </section>;
}
