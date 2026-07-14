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
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {statusOrder.map((status) => (
              <button key={status} type="button" aria-label={t("review.showStatus", { count: summary[status], status: t(`status.${status}`) })} aria-pressed={filter === status} onClick={() => onFilterChange(filter === status ? "ALL" : status)} className={`status-stat ${filter === status ? "border-teal-700 bg-teal-50 ring-1 ring-teal-100" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                <span className="text-2xl font-semibold text-slate-950">{summary[status]}</span>
                <span className="ml-2 text-[11px] font-bold text-slate-500">{t(`status.${status}`)}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{t("review.shown", { visible: visibleResults.length, total: summary.total })}</span>
            {filter !== "ALL" && <button type="button" onClick={() => onFilterChange("ALL")} className="font-semibold text-teal-800 underline underline-offset-2">{t("review.clearFilter")}</button>}
          </div>

          <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.82fr)]">
            <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200">
              <div className="hidden grid-cols-[minmax(0,1.5fr)_7rem_7rem_9rem] gap-3 bg-slate-950 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-300 md:grid">
                <span>{t("review.control")}</span><span>{t("review.status")}</span><span>{t("review.severity")}</span><span>{t("review.human")}</span>
              </div>
              <div className="divide-y divide-slate-200">
                {visibleResults.map((result) => {
                  const title = localizedControl(result.controlId, locale, result.title).title;
                  const selected = selectedResult?.controlId === result.controlId;
                  return (
                    <button key={result.controlId} type="button" onClick={() => onSelectResult(result.controlId)} aria-label={t("review.inspect", { title })} aria-pressed={selected} className={`grid w-full gap-3 border-l-4 px-4 py-4 text-left transition hover:bg-slate-50 md:grid-cols-[minmax(0,1.5fr)_7rem_7rem_9rem] md:items-center ${selected ? "border-l-teal-700 bg-teal-50/80" : "border-l-transparent bg-white"}`}>
                      <span className="min-w-0"><span className="block font-semibold text-slate-950">{title}</span><span className="mt-1 block font-mono text-[11px] text-slate-400">{result.controlId} · {result.supportingEvidence.length + result.contradictoryEvidence.length + result.missingEvidence.length} {t("evidence.details").toLocaleLowerCase()}</span></span>
                      <span><StatusBadge status={result.status} /></span>
                      <span className="text-sm font-medium text-slate-600">{t(`severity.${result.severity}`)}</span>
                      <span className="text-sm text-slate-600">{t(`decision.${result.reviewerDecision.state}`)}</span>
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
    <aside aria-label={t("a11y.evidence")} className="min-w-0 self-start rounded-xl border border-slate-200 bg-slate-50 p-5 xl:sticky xl:top-4">
      <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{t("evidence.details")}</p><h3 className="mt-1 text-lg font-semibold text-slate-950">{title}</h3></div><StatusBadge status={result.status} /></div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{localizedResultExplanation(result.controlId, result.status, result.explanation, locale, threshold)}</p>
      <dl className="mt-4 grid gap-2 rounded-lg border border-slate-200 bg-white p-3 text-xs sm:grid-cols-2">
        <div><dt className="font-semibold text-slate-500">{t("evidence.method")}</dt><dd className="mt-1 text-slate-800">{t(mode === "DETERMINISTIC_DEMO" ? "evidence.method.demo" : "evidence.method.live")}</dd></div>
        <div><dt className="font-semibold text-slate-500">{t("evidence.details")}</dt><dd className="mt-1 text-slate-800">{t("evidence.count", { count: evidenceCount })}</dd></div>
      </dl>
      <p aria-live="polite" className="mt-2 min-h-5 text-xs font-medium text-teal-800">{copyNotice}</p>
      <div className="mt-5 space-y-5">
        <EvidenceList kind="supporting" title={t("evidence.supporting")} items={result.supportingEvidence} empty={t("evidence.noSupporting")} documentTypes={documentTypes} onCopy={copy} />
        <EvidenceList kind="contradictory" title={t("evidence.contradictory")} items={result.contradictoryEvidence} empty={t("evidence.noContradictory")} documentTypes={documentTypes} onCopy={copy} />
        <div><h4 className="text-sm font-semibold text-slate-950">{t("evidence.missing")}</h4>
          {result.missingEvidence.length ? <ul className="mt-2 space-y-2">{result.missingEvidence.map((item) => {
            const copy = localizedMissingEvidence(result.controlId, locale, item.description, item.expectedSource);
            return <li key={item.description} className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm leading-5 text-slate-700"><span className="font-semibold">{copy.description}</span><span className="mt-1 block text-xs text-slate-500">{t("evidence.expected", { source: copy.source })}</span></li>;
          })}</ul> : <p className="mt-2 text-sm text-slate-500">{t("evidence.noMissing")}</p>}
        </div>
      </div>
    </aside>
  );
}

function EvidenceList({ title, items, empty, kind, documentTypes, onCopy }: { title: string; items: ControlResult["supportingEvidence"]; empty: string; kind: "supporting" | "contradictory"; documentTypes: Record<string, string>; onCopy: (value: string) => Promise<void> }) {
  const { t } = useLocale();
  return <div><h4 className="text-sm font-semibold text-slate-950">{title}</h4>{items.length ? (
    <ul className="mt-2 space-y-2">{items.map((item) => <li key={item.id} className={`min-w-0 rounded-lg border bg-white p-3 ${kind === "supporting" ? "border-emerald-200" : "border-red-200"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><p className={`text-[11px] font-bold uppercase tracking-wide ${kind === "supporting" ? "text-emerald-800" : "text-red-800"}`}>{item.documentTitle}</p>{item.confidence !== null && <span className="text-xs text-slate-500">{t("evidence.confidence", { value: Math.round(item.confidence * 100) })}</span>}</div>
      <p className="mt-1 text-xs text-slate-500">{t("evidence.documentType", { type: (documentTypes[item.documentId] ?? "OTHER").replaceAll("_", " ") })}</p>
      <blockquote className={`mt-2 break-words border-l-2 pl-3 text-sm leading-6 text-slate-700 ${kind === "supporting" ? "border-emerald-300" : "border-red-300"}`}>“{item.excerpt}”</blockquote>
      <p className="mt-2 break-words text-xs text-slate-500">{item.locator} · {item.factId}</p>
      {item.evidenceType && <p className="mt-1 text-xs font-medium text-slate-500">{item.evidenceType}{item.relationToControl ? ` · ${item.relationToControl}` : ""}</p>}
      <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => onCopy(item.excerpt)} className="text-xs font-semibold text-teal-800 underline-offset-2 hover:underline">{t("evidence.copyExcerpt")}</button><button type="button" onClick={() => onCopy(`${item.documentTitle} — ${item.locator} — ${item.factId}`)} className="text-xs font-semibold text-slate-600 underline-offset-2 hover:underline">{t("evidence.copyReference")}</button></div>
    </li>)}</ul>
  ) : <p className="mt-2 text-sm text-slate-500">{empty}</p>}</div>;
}
