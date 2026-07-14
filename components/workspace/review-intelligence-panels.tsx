import { useMemo, useState } from "react";
import type { CaseDocument, ControlDefinition, ControlResult } from "@/src/domain/schemas";
import { controlRef, statusGlyph } from "@/components/workspace/presentation";
import { useLocale } from "@/src/i18n/locale-context";
import { localizedControl } from "@/src/i18n/translations";
import type { ResultFilter, ResultSummary } from "@/src/lib/review-summary";
import {
  buildEvidenceCoverage,
  buildOutcomeComposition,
  buildThresholdSensitivity,
  changedControls,
  extractChronology,
  searchReviewWorkspace,
  type EvidenceCoverageState,
  type RunSnapshot,
} from "@/src/lib/review-intelligence";

const coverageGlyph: Record<EvidenceCoverageState, string> = {
  SUPPORTING: "+",
  CONTRADICTORY: "×",
  MISSING: "○",
  NOT_APPLICABLE: "—",
};

function methodName(mode: "DETERMINISTIC_DEMO" | "LIVE_GPT_5_6", locale: "en" | "fr") {
  if (mode === "LIVE_GPT_5_6") return locale === "fr" ? "Revue hybride" : "Hybrid review";
  return locale === "fr" ? "Contrôle déterministe" : "Deterministic check";
}

export function ReviewIntelligencePanels({ results, documents, controls, summary, threshold, mode, caseName, caseReference, currentRun, previousRun, onFilterChange, onInspectControl, onClearHistory }: {
  results: ControlResult[];
  documents: CaseDocument[];
  controls: ControlDefinition[];
  summary: ResultSummary;
  threshold: number;
  mode: "DETERMINISTIC_DEMO" | "LIVE_GPT_5_6";
  caseName: string;
  caseReference: string;
  currentRun: RunSnapshot | null;
  previousRun: RunSnapshot | null;
  onFilterChange: (filter: ResultFilter) => void;
  onInspectControl: (controlId: string) => void;
  onClearHistory: () => void;
}) {
  const { locale, t } = useLocale();
  const outcomes = useMemo(() => buildOutcomeComposition(results), [results]);
  const coverage = useMemo(() => buildEvidenceCoverage(results, documents), [documents, results]);
  const chronology = useMemo(() => extractChronology(documents), [documents]);
  const sensitivity = useMemo(() => buildThresholdSensitivity(documents, threshold, results, controls), [controls, documents, results, threshold]);
  const localizedTitles = useMemo(() => Object.fromEntries(results.map((result) => [result.controlId, localizedControl(result.controlId, locale, result.title).title])), [locale, results]);
  const [query, setQuery] = useState("");
  const matches = useMemo(() => searchReviewWorkspace(query, results, documents, localizedTitles), [documents, localizedTitles, query, results]);
  const exceptionCount = summary.FAIL + summary.MISSING + summary.WARNING;

  function inspect(controlId: string) {
    onInspectControl(controlId);
    requestAnimationFrame(() => document.getElementById("result-ledger")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <div className="review-intelligence" aria-label={locale === "fr" ? "Vue d’ensemble du cas" : "Case overview"}>
      <section className="case-overview" aria-labelledby="case-overview-title">
        <div className="intelligence-heading">
          <div><p className="eyebrow">{caseReference}</p><h3 id="case-overview-title">{locale === "fr" ? "Vue d’ensemble du cas" : "Case overview"}</h3><p>{caseName}</p></div>
          <div className="review-search">
            <label htmlFor="review-search">{locale === "fr" ? "Rechercher dans la revue" : "Search this review"}</label>
            <input id="review-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={locale === "fr" ? "Contrôle, document ou preuve" : "Control, document, or evidence"} />
            {query && <div className="search-results" role="status">
              <strong>{matches.length ? (locale === "fr" ? `${matches.length} correspondance(s)` : `${matches.length} match(es)`) : (locale === "fr" ? "Aucune correspondance" : "No matches")}</strong>
              {matches.slice(0, 6).map((match) => {
                const label = match.kind === "CONTROL" ? localizedTitles[match.id] ?? match.id : documents.find((document) => document.id === match.id)?.title ?? match.id;
                const relatedControl = match.kind === "CONTROL" ? match.id : results.find((result) => [...result.supportingEvidence, ...result.contradictoryEvidence].some((item) => item.documentId === match.id))?.controlId;
                return relatedControl ? <button key={`${match.kind}-${match.id}`} type="button" onClick={() => { inspect(relatedControl); setQuery(""); }}><span>{match.kind === "CONTROL" ? controlRef(match.id) : match.id}</span>{label}</button> : null;
              })}
            </div>}
          </div>
        </div>
        <dl className="case-overview-facts">
          <div><dt>{locale === "fr" ? "État" : "State"}</dt><dd>{exceptionCount} {locale === "fr" ? "exceptions" : "exceptions"} · {summary.pending} {locale === "fr" ? "à décider" : "to decide"}</dd></div>
          <div><dt>{locale === "fr" ? "Périmètre" : "Scope"}</dt><dd>{summary.total} {locale === "fr" ? "contrôles" : "controls"} · {documents.length} {locale === "fr" ? "documents" : "documents"}</dd></div>
          <div><dt>{locale === "fr" ? "Méthode" : "Method"}</dt><dd>{methodName(mode, locale)}</dd></div>
          <div><dt>{locale === "fr" ? "Seuil" : "Threshold"}</dt><dd>{threshold.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} EUR</dd></div>
          <div><dt>{locale === "fr" ? "Exécution" : "Run"}</dt><dd>{currentRun ? new Date(currentRun.generatedAt).toLocaleTimeString(locale === "fr" ? "fr-FR" : "en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}</dd></div>
        </dl>
      </section>

      <div className="intelligence-grid intelligence-grid-primary">
        <section className="intelligence-panel outcome-composition" aria-labelledby="outcome-title">
          <header><div><p className="eyebrow">{locale === "fr" ? "ÉTAT DE LA REVUE" : "REVIEW STATE"}</p><h3 id="outcome-title">{locale === "fr" ? "Composition des résultats" : "Outcome composition"}</h3></div><span>{summary.total}</span></header>
          <div className="outcome-bar" role="img" aria-label={outcomes.map((item) => `${item.count} ${t(`status.${item.status}`)}`).join(", ")}>
            {outcomes.filter((item) => item.count > 0).map((item) => <button key={item.status} type="button" data-status={item.status} style={{ width: `${item.percentage}%` }} aria-label={locale === "fr" ? `Filtrer ${item.count} résultats ${t(`status.${item.status}`)}` : `Filter ${item.count} ${t(`status.${item.status}`)} results`} onClick={() => onFilterChange(item.status)}><span>{statusGlyph(item.status)}</span><strong>{item.count}</strong></button>)}
          </div>
          <ul>{outcomes.map((item) => <li key={item.status} data-status={item.status}><span aria-hidden="true">{statusGlyph(item.status)}</span><button type="button" onClick={() => onFilterChange(item.status)}>{item.count} {t(`status.${item.status}`)}</button></li>)}</ul>
        </section>

        <section className="intelligence-panel threshold-sensitivity" aria-labelledby="threshold-title">
          <header><div><p className="eyebrow">{locale === "fr" ? "RÈGLE D’APPROBATION" : "APPROVAL RULE"}</p><h3 id="threshold-title">{locale === "fr" ? "Sensibilité au seuil" : "Threshold sensitivity"}</h3></div>{sensitivity?.status && <span data-status={sensitivity.status}>{statusGlyph(sensitivity.status)} {t(`status.${sensitivity.status}`)}</span>}</header>
          {sensitivity ? <>
            <div className="threshold-visual" role="img" aria-label={locale === "fr" ? `Montant ${sensitivity.amount} ${sensitivity.currency}, seuil ${sensitivity.threshold} ${sensitivity.currency}, ${sensitivity.recordedApprovers} approbateur enregistré sur ${sensitivity.requiredApprovers} requis` : `Amount ${sensitivity.amount} ${sensitivity.currency}, threshold ${sensitivity.threshold} ${sensitivity.currency}, ${sensitivity.recordedApprovers} recorded approver of ${sensitivity.requiredApprovers} required`}>
              <div className="threshold-track"><span className="threshold-origin">0</span><span className="amount-marker" style={{ left: `${Math.min(90, sensitivity.amount / Math.max(sensitivity.amount, sensitivity.threshold) * 82)}%` }}><b>{sensitivity.amount.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} EUR</b><small>{locale === "fr" ? "montant" : "amount"}</small></span><span className="threshold-marker" style={{ left: `${Math.min(94, sensitivity.threshold / Math.max(sensitivity.amount, sensitivity.threshold) * 82)}%` }}><b>{sensitivity.threshold.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} EUR</b><small>{locale === "fr" ? "seuil" : "threshold"}</small></span></div>
            </div>
            <p className="threshold-explanation">{sensitivity.exceedsThreshold
              ? (locale === "fr" ? `Le montant dépasse le seuil. ${sensitivity.requiredApprovers} approbateurs sont requis, mais ${sensitivity.recordedApprovers} est enregistré.` : `The amount exceeds the threshold. ${sensitivity.requiredApprovers} approvers are required, but ${sensitivity.recordedApprovers} is recorded.`)
              : (locale === "fr" ? "Le montant ne dépasse pas le seuil actif ; l’exigence de double approbation n’est pas déclenchée." : "The amount does not exceed the active threshold, so the two-approver requirement is not triggered.")}</p>
            <button type="button" className="text-action" onClick={() => inspect("CTRL-APPROVAL")}>{locale === "fr" ? "Inspecter le contrôle d’approbation" : "Inspect approval control"} →</button>
          </> : <p className="intelligence-empty">{locale === "fr" ? "Les faits de montant ou d’approbation ne sont pas disponibles." : "Amount or approval facts are unavailable."}</p>}
        </section>
      </div>

      <div className="intelligence-grid intelligence-grid-secondary">
        <section className="intelligence-panel coverage-map" aria-labelledby="coverage-title">
          <header><div><p className="eyebrow">{locale === "fr" ? "TRAÇABILITÉ" : "TRACEABILITY"}</p><h3 id="coverage-title">{locale === "fr" ? "Carte de couverture des preuves" : "Evidence coverage map"}</h3></div></header>
          <div className="coverage-legend" aria-label={locale === "fr" ? "Légende" : "Legend"}>{(["SUPPORTING", "CONTRADICTORY", "MISSING", "NOT_APPLICABLE"] as const).map((state) => <span key={state} data-state={state}><i aria-hidden="true">{coverageGlyph[state]}</i>{locale === "fr" ? ({ SUPPORTING: "Appui", CONTRADICTORY: "Contradiction", MISSING: "Manquant", NOT_APPLICABLE: "Sans objet" } as const)[state] : state.replace("NOT_APPLICABLE", "Not applicable").toLocaleLowerCase()}</span>)}</div>
          <div className="coverage-table" role="table" aria-label={locale === "fr" ? "Contrôles par documents" : "Controls by documents"}>
            <div className="coverage-head" role="row"><span role="columnheader">{locale === "fr" ? "Contrôle" : "Control"}</span>{documents.map((document) => <span role="columnheader" key={document.id} title={document.title}>{document.id.replace("DOC-", "")}</span>)}</div>
            {coverage.map((row) => <div className="coverage-row" role="row" key={row.controlId}><button type="button" role="rowheader" onClick={() => inspect(row.controlId)}><span>{controlRef(row.controlId)}</span>{localizedTitles[row.controlId]}</button>{row.cells.map((cell) => <button key={cell.documentId} type="button" role="cell" data-state={cell.state} disabled={cell.state === "NOT_APPLICABLE"} onClick={() => inspect(row.controlId)} aria-label={`${localizedTitles[row.controlId]}, ${documents.find((document) => document.id === cell.documentId)?.title}: ${cell.state.replaceAll("_", " ").toLocaleLowerCase()}`}><span aria-hidden="true">{coverageGlyph[cell.state]}</span></button>)}</div>)}
          </div>
          <p className="panel-caption">{locale === "fr" ? "Chaque cellule provient des références de preuve du résultat. ○ signale une preuve exigée mais absente du dossier lié." : "Every cell comes from result evidence references. ○ marks required evidence absent from the linked case record."}</p>
        </section>

        <section className="intelligence-panel chronology" aria-labelledby="chronology-title">
          <header><div><p className="eyebrow">{locale === "fr" ? "SÉQUENCE DU CAS" : "CASE SEQUENCE"}</p><h3 id="chronology-title">{locale === "fr" ? "Chronologie" : "Chronology"}</h3></div></header>
          {chronology.length ? <ol>{chronology.map((event, index) => <li key={event.factKey}><button type="button" onClick={() => inspect("CTRL-TIMING")} aria-label={`${event.documentTitle}, ${event.date}`}><span>{String(index + 1).padStart(2, "0")}</span><time dateTime={event.date}>{new Date(`${event.date}T00:00:00Z`).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" })}</time><strong>{event.factKey === "purchaseOrderDate" ? (locale === "fr" ? "Bon de commande" : "Purchase order") : event.factKey === "deliveryDate" ? (locale === "fr" ? "Livraison" : "Delivery") : (locale === "fr" ? "Facture" : "Invoice")}</strong><small>{event.documentId}</small></button></li>)}</ol> : <p className="intelligence-empty">{locale === "fr" ? "Aucune date structurée disponible." : "No structured dates are available."}</p>}
          <p className="chronology-conclusion"><span aria-hidden="true">✓</span>{chronology.some((event) => event.factKey === "deliveryDate") ? (locale === "fr" ? "Le bon de commande précède la livraison et la facture." : "The purchase order precedes delivery and invoice.") : (locale === "fr" ? "Le bon de commande précède la facture ; aucune date de livraison n’est disponible." : "The purchase order precedes the invoice; no delivery date is available.")}</p>
        </section>
      </div>

      <RunComparison previousRun={previousRun} currentRun={currentRun} localizedTitles={localizedTitles} locale={locale} onInspect={inspect} onClearHistory={onClearHistory} />
    </div>
  );
}

function RunComparison({ previousRun, currentRun, localizedTitles, locale, onInspect, onClearHistory }: {
  previousRun: RunSnapshot | null;
  currentRun: RunSnapshot | null;
  localizedTitles: Record<string, string>;
  locale: "en" | "fr";
  onInspect: (controlId: string) => void;
  onClearHistory: () => void;
}) {
  const changed = changedControls(previousRun, currentRun);
  return <section className="intelligence-panel run-comparison" aria-labelledby="comparison-title">
    <header><div><p className="eyebrow">{locale === "fr" ? "AVANT / APRÈS" : "BEFORE / AFTER"}</p><h3 id="comparison-title">{locale === "fr" ? "Comparaison des exécutions" : "Run comparison"}</h3></div>{(previousRun || currentRun) && <button type="button" className="text-action" onClick={onClearHistory}>{locale === "fr" ? "Effacer l’historique" : "Clear history"}</button>}</header>
    {!previousRun || !currentRun ? <p className="intelligence-empty">{locale === "fr" ? "Aucune exécution précédente à comparer. Modifiez le seuil puis relancez la revue." : "No previous run to compare. Change the threshold and rerun the review."}</p> : <div className="run-comparison-grid">
      <div><span>{locale === "fr" ? "Précédente" : "Previous"}</span><strong>{previousRun.threshold.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} EUR</strong><small>{previousRun.summary.PASS} PASS · {previousRun.summary.FAIL} FAIL · {previousRun.summary.MISSING} MISSING · {previousRun.summary.WARNING} WARNING</small></div>
      <div className="run-change-arrow" aria-hidden="true">→</div>
      <div><span>{locale === "fr" ? "Actuelle" : "Current"}</span><strong>{currentRun.threshold.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} EUR</strong><small>{currentRun.summary.PASS} PASS · {currentRun.summary.FAIL} FAIL · {currentRun.summary.MISSING} MISSING · {currentRun.summary.WARNING} WARNING</small></div>
      <div className="changed-controls"><span>{locale === "fr" ? "Contrôles modifiés" : "Changed controls"}</span>{changed.length ? changed.map((controlId) => <button type="button" key={controlId} onClick={() => onInspect(controlId)}><strong>{controlRef(controlId)}</strong> {localizedTitles[controlId]}: {previousRun.statuses[controlId]} → {currentRun.statuses[controlId]}</button>) : <p>{locale === "fr" ? "Aucun résultat n’a changé." : "No result changed."}</p>}</div>
    </div>}
  </section>;
}
