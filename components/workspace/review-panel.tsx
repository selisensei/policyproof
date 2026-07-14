import { useSyncExternalStore, useState, type KeyboardEvent } from "react";
import type { ControlResult, EvidenceReference } from "@/src/domain/schemas";
import type { AppMode } from "@/components/workspace/types";
import type { ResultFilter, ResultSummary } from "@/src/lib/review-summary";
import { controlRef, decisionRef, evidenceCount, methodLabel, requirementRef } from "@/components/workspace/presentation";
import { SectionShell } from "@/components/workspace/section-shell";
import { StatusBadge } from "@/components/workspace/status-badge";
import { demoPolicy } from "@/src/fixtures/demo-case";
import { useLocale } from "@/src/i18n/locale-context";
import { localizedControl, localizedMissingEvidence, localizedResultExplanation } from "@/src/i18n/translations";

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

export function ReviewPanel({ results, visibleResults, summary, filter, selectedResult, threshold, mode, documentTypes, changedControlId, onFilterChange, onSelectResult, onGoDecision }: {
  results: ControlResult[];
  visibleResults: ControlResult[];
  summary: ResultSummary;
  filter: ResultFilter;
  selectedResult: ControlResult | null;
  threshold: string;
  mode: AppMode;
  documentTypes: Record<string, string>;
  changedControlId: string | null;
  onFilterChange: (filter: ResultFilter) => void;
  onSelectResult: (controlId: string) => void;
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
          <div className="review-filter-row" role="radiogroup" aria-label={locale === "fr" ? "Filtrer les résultats" : "Filter results"}>
            {filterOrder.map((candidate) => (
              <button key={candidate} type="button" data-filter={candidate} data-status={candidate} aria-label={candidate === "ALL" ? (locale === "fr" ? `Afficher les ${summary.total} résultats` : `Show all ${summary.total} results`) : candidate === "OPEN" ? (locale === "fr" ? `Afficher ${summary.pending} décisions ouvertes` : `Show ${summary.pending} open decisions`) : t("review.showStatus", { count: summary[candidate], status: t(`status.${candidate}`) })} aria-pressed={filter === candidate} onKeyDown={(event) => onFilterKeyDown(event, candidate)} onClick={() => onFilterChange(candidate)} className={filter === candidate ? "is-active" : ""}>
                <span aria-hidden="true">{candidate === "PASS" ? "✓" : candidate === "FAIL" ? "×" : candidate === "MISSING" ? "⌀" : candidate === "WARNING" ? "!" : ""}</span>{filterLabel(candidate)} {filterCount(candidate)}
              </button>
            ))}
          </div>

          <div className="review-workbench">
            <div className="result-register">
              <div className="result-register-heading" aria-hidden="true"><span>REF</span><span>{locale === "fr" ? "CONTRÔLE" : "CONTROL"}</span><span>{locale === "fr" ? "CONCLUSION" : "CONCLUSION"}</span><span>{locale === "fr" ? "GRAVITÉ" : "SEVERITY"}</span><span>{locale === "fr" ? "MÉTHODE" : "METHOD"}</span><span>EV</span><span>{locale === "fr" ? "REVUE" : "REVIEW"}</span></div>
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
                        <span className="method-label">{mode === "DETERMINISTIC_DEMO" ? "TS" : "GPT"}</span>
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

function EvidenceDetails({ result, threshold, mode, documentTypes, changed, onGoDecision }: { result: ControlResult; threshold: string; mode: AppMode; documentTypes: Record<string, string>; changed: boolean; onGoDecision: () => void }) {
  const { locale, t } = useLocale();
  const [copied, setCopied] = useState<string | null>(null);
  const title = localizedControl(result.controlId, locale, result.title).title;
  const sequence = Number(requirementRef(result.controlId).replace("R-", ""));
  const requirement = Number.isFinite(sequence) ? demoPolicy.text.split("\n")[sequence - 1]?.replace(/^\d+\.\s*/, "") : null;

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
      {changed && <div className="conclusion-changed" role="status"><strong>{locale === "fr" ? "Conclusion modifiée — CTRL-01 ÉCHEC → CONFORME" : "Conclusion changed — CTRL-01 FAIL → PASS"}</strong><p>{locale === "fr" ? "12 480 EUR ne dépasse plus le seuil de 15 000 EUR. Tous les autres résultats sont inchangés et les décisions précédentes ont été réinitialisées." : "12,480 EUR no longer exceeds the 15,000 EUR threshold. All other results are unchanged and previous reviewer decisions were reset."}</p></div>}
      {requirement && <blockquote className="requirement-quote"><span>{locale === "fr" ? "EXTRAIT SOURCE (EN)" : "SOURCE REQUIREMENT"}</span>“{requirement}”</blockquote>}
      <p className="evidence-provenance">METHOD: {methodLabel(mode)} · {evidenceCount(result)} FACTS CITED</p>
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
    {item.confidence !== null && <p className="evidence-confidence">{t("evidence.confidence", { value: Math.round(item.confidence * 100) })}</p>}
    <div className="evidence-actions"><button type="button" onClick={() => onCopy(`${item.id}-excerpt`, item.excerpt)}>{copied === `${item.id}-excerpt` ? `${t("action.copied")} ✓` : t("evidence.copyExcerpt")}</button><button type="button" onClick={() => onCopy(`${item.id}-reference`, `${item.factId} · ${item.documentId} ${item.documentTitle} · ${item.locator}`)}>{copied === `${item.id}-reference` ? `${t("action.copied")} ✓` : t("evidence.copyReference")}</button></div>
    {locale === "fr" && <span className="source-language-tag">EXTRAIT SOURCE (EN)</span>}
  </article>)}</div> : <p className="empty-evidence-row">{empty}</p>}</section>;
}

function modeForEvidence(item: EvidenceReference): string {
  return item.confidence === null ? "DETERMINISTIC EXTRACTION" : "SEMANTIC EXTRACTION";
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
