import { useState } from "react";
import type { ControlResult } from "@/src/domain/schemas";
import type { AppMode } from "@/components/workspace/types";
import type { ResultFilter, ResultSummary } from "@/src/lib/review-summary";
import { SectionShell } from "@/components/workspace/section-shell";
import { StatusBadge } from "@/components/workspace/status-badge";
import { useLocale } from "@/src/i18n/locale-context";
import { localizedControl, localizedMissingEvidence, localizedResultExplanation } from "@/src/i18n/translations";

const statusOrder = ["PASS", "FAIL", "MISSING", "WARNING"] as const;

export function ReviewPanel({ results, visibleResults, summary, filter, selectedResult, threshold, mode, documentTypes, onFilterChange, onSelectResult }: {
  results: ControlResult[];
  visibleResults: ControlResult[];
  summary: ResultSummary;
  filter: ResultFilter;
  selectedResult: ControlResult | null;
  threshold: string;
  mode: AppMode;
  documentTypes: Record<string, string>;
  onFilterChange: (filter: ResultFilter) => void;
  onSelectResult: (controlId: string) => void;
}) {
  const { locale, t } = useLocale();
  return (
    <SectionShell id="review" step={t("step.label", { number: 4 })} title={t("review.title")} description={t("review.help")}>
      {!results.length ? (
        <div className="empty-state"><p className="font-semibold text-slate-800">{t("review.empty")}</p><p className="mt-1 text-sm text-slate-500">{t("review.emptyHelp")}</p></div>
      ) : (
        <>
          <div className="review-summary-strip">
            {statusOrder.map((status) => (
              <button key={status} type="button" aria-label={t("review.showStatus", { count: summary[status], status: t(`status.${status}`) })} aria-pressed={filter === status} onClick={() => onFilterChange(filter === status ? "ALL" : status)} className={filter === status ? "is-active" : ""} data-status={status}>
                <span className="review-summary-count">{summary[status]}</span>
                <span>{t(`status.${status}`)}</span>
              </button>
            ))}
            <div className="review-shown"><span>{t("review.shown", { visible: visibleResults.length, total: summary.total })}</span>{filter !== "ALL" && <button type="button" onClick={() => onFilterChange("ALL")}>{t("review.clearFilter")}</button>}</div>
          </div>

          <div className="review-workbench">
            <div className="result-register">
              <div className="result-register-heading">
                <span>{t("review.control")}</span><span>{t("review.human")}</span>
              </div>
              <div className="result-register-list">
                {visibleResults.map((result) => {
                  const title = localizedControl(result.controlId, locale, result.title).title;
                  const selected = selectedResult?.controlId === result.controlId;
                  return (
                    <button key={result.controlId} type="button" onClick={() => onSelectResult(result.controlId)} aria-label={t("review.inspect", { title })} aria-pressed={selected} className={`result-row ${selected ? "is-selected" : ""}`}>
                      <span className="result-status-mark" data-status={result.status} aria-hidden="true" />
                      <span className="result-copy"><span>{title}</span><small>{result.controlId} · {result.supportingEvidence.length + result.contradictoryEvidence.length + result.missingEvidence.length} {t("evidence.details").toLocaleLowerCase()}</small></span>
                      <span className="result-meta"><StatusBadge status={result.status} /><small>{t(`severity.${result.severity}`)} · {t(`decision.${result.reviewerDecision.state}`)}</small></span>
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="m8 5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                  );
                })}
                {!visibleResults.length && <p className="px-4 py-8 text-center text-sm text-slate-500">{t("review.noMatch")}</p>}
              </div>
            </div>
            <EvidenceDetails result={selectedResult} threshold={threshold} mode={mode} documentTypes={documentTypes} />
          </div>
        </>
      )}
    </SectionShell>
  );
}

function EvidenceDetails({ result, threshold, mode, documentTypes }: { result: ControlResult | null; threshold: string; mode: AppMode; documentTypes: Record<string, string> }) {
  const { locale, t } = useLocale();
  const [copyNotice, setCopyNotice] = useState("");
  if (!result) return <aside className="empty-state self-start">{t("evidence.select")}</aside>;
  const title = localizedControl(result.controlId, locale, result.title).title;
  const evidenceCount = result.supportingEvidence.length + result.contradictoryEvidence.length + result.missingEvidence.length;
  async function copy(value: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      setCopyNotice(t("evidence.copySuccess"));
    } catch {
      setCopyNotice(t("action.copyFailed"));
    }
  }
  return (
    <aside aria-label={t("a11y.evidence")} className="evidence-canvas">
      <div className="evidence-heading"><div><p className="eyebrow text-teal-800">{t("evidence.details")}</p><h3>{title}</h3></div><StatusBadge status={result.status} /></div>
      <p className="evidence-explanation">{localizedResultExplanation(result.controlId, result.status, result.explanation, locale, threshold)}</p>
      <dl className="evidence-provenance">
        <div><dt className="font-semibold text-slate-500">{t("evidence.method")}</dt><dd className="mt-1 text-slate-800">{t(mode === "DETERMINISTIC_DEMO" ? "evidence.method.demo" : "evidence.method.live")}</dd></div>
        <div><dt className="font-semibold text-slate-500">{t("evidence.details")}</dt><dd className="mt-1 text-slate-800">{t("evidence.count", { count: evidenceCount })}</dd></div>
      </dl>
      <p aria-live="polite" className="min-h-5 px-5 pt-2 text-xs font-medium text-teal-800">{copyNotice}</p>
      <div className="evidence-groups">
        <EvidenceList kind="supporting" title={t("evidence.supporting")} items={result.supportingEvidence} empty={t("evidence.noSupporting")} documentTypes={documentTypes} onCopy={copy} />
        <EvidenceList kind="contradictory" title={t("evidence.contradictory")} items={result.contradictoryEvidence} empty={t("evidence.noContradictory")} documentTypes={documentTypes} onCopy={copy} />
        <div><h4 className="text-sm font-semibold text-slate-950">{t("evidence.missing")}</h4>
          {result.missingEvidence.length ? <ul className="mt-2 space-y-2">{result.missingEvidence.map((item) => {
            const copy = localizedMissingEvidence(result.controlId, locale, item.description, item.expectedSource);
            return <li key={item.description} className="missing-record"><span className="font-semibold">{copy.description}</span><span>{t("evidence.expected", { source: copy.source })}</span></li>;
          })}</ul> : <p className="mt-2 text-sm text-slate-500">{t("evidence.noMissing")}</p>}
        </div>
      </div>
    </aside>
  );
}

function EvidenceList({ title, items, empty, kind, documentTypes, onCopy }: { title: string; items: ControlResult["supportingEvidence"]; empty: string; kind: "supporting" | "contradictory"; documentTypes: Record<string, string>; onCopy: (value: string) => Promise<void> }) {
  const { t } = useLocale();
  return <div className="evidence-group"><h4>{title}</h4>{items.length ? (
    <ul>{items.map((item) => <li key={item.id} className="evidence-record" data-kind={kind}>
      <div className="evidence-record-source"><span className="source-document-mark" aria-hidden="true">{kind === "supporting" ? "✓" : "!"}</span><div><p>{item.documentTitle}</p><small>{t("evidence.documentType", { type: (documentTypes[item.documentId] ?? "OTHER").replaceAll("_", " ") })}</small></div>{item.confidence !== null && <span>{t("evidence.confidence", { value: Math.round(item.confidence * 100) })}</span>}</div>
      <blockquote>“{item.excerpt}”</blockquote>
      <p className="evidence-locator">{item.locator} <span>·</span> {item.factId}</p>
      {item.evidenceType && <p className="evidence-relation">{item.evidenceType}{item.relationToControl ? ` · ${item.relationToControl}` : ""}</p>}
      <div className="evidence-actions"><button type="button" onClick={() => onCopy(item.excerpt)}>{t("evidence.copyExcerpt")}</button><button type="button" onClick={() => onCopy(`${item.documentTitle} — ${item.locator} — ${item.factId}`)}>{t("evidence.copyReference")}</button></div>
    </li>)}</ul>
  ) : <p className="mt-2 text-sm text-slate-500">{empty}</p>}</div>;
}
