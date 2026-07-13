import type { ControlResult } from "@/src/domain/schemas";
import type { ResultFilter, ResultSummary } from "@/src/lib/review-summary";
import { SectionShell } from "@/components/workspace/section-shell";
import { StatusBadge } from "@/components/workspace/status-badge";

const statusOrder = ["PASS", "FAIL", "MISSING", "WARNING"] as const;

export function ReviewPanel({
  results,
  visibleResults,
  summary,
  filter,
  selectedResult,
  onFilterChange,
  onSelectResult,
}: {
  results: ControlResult[];
  visibleResults: ControlResult[];
  summary: ResultSummary;
  filter: ResultFilter;
  selectedResult: ControlResult | null;
  onFilterChange: (filter: ResultFilter) => void;
  onSelectResult: (controlId: string) => void;
}) {
  return (
    <SectionShell
      id="review"
      step="Step 4"
      title="Evidence review"
      description="Filter control outcomes, select a result, and trace every conclusion to its source evidence."
    >
      {!results.length ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
          <p className="font-semibold text-slate-800">No review results yet</p>
          <p className="mt-1 text-sm text-slate-500">Configure controls and case documents, then select Run review.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
            {statusOrder.map((status) => (
              <button
                key={status}
                type="button"
                aria-label={`Show ${summary[status]} ${status} results`}
                aria-pressed={filter === status}
                onClick={() => onFilterChange(filter === status ? "ALL" : status)}
                className={`rounded-xl border p-3 text-left transition ${
                  filter === status ? "border-emerald-700 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span className="text-2xl font-semibold text-slate-950">{summary[status]}</span>
                <span className="ml-2 text-xs font-bold text-slate-500">{status}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{visibleResults.length} of {summary.total} results shown</span>
            {filter !== "ALL" && (
              <button type="button" onClick={() => onFilterChange("ALL")} className="font-semibold text-emerald-800 underline underline-offset-2">
                Clear filter
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.72fr)]">
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="hidden grid-cols-[minmax(0,1.5fr)_7rem_7rem_9rem] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid">
                <span>Control</span><span>Status</span><span>Severity</span><span>Human review</span>
              </div>
              <div className="divide-y divide-slate-200">
                {visibleResults.map((result) => (
                  <button
                    key={result.controlId}
                    type="button"
                    onClick={() => onSelectResult(result.controlId)}
                    aria-label={`Inspect ${result.title}`}
                    className={`grid w-full gap-3 px-4 py-4 text-left hover:bg-slate-50 md:grid-cols-[minmax(0,1.5fr)_7rem_7rem_9rem] md:items-center ${
                      selectedResult?.controlId === result.controlId ? "bg-emerald-50/70" : "bg-white"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block font-semibold text-slate-950">{result.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">{result.controlId}</span>
                    </span>
                    <span><StatusBadge status={result.status} /></span>
                    <span className="text-sm font-medium text-slate-600">{result.severity}</span>
                    <span className="text-sm text-slate-600">{result.reviewerDecision.state.replaceAll("_", " ")}</span>
                  </button>
                ))}
                {!visibleResults.length && <p className="px-4 py-8 text-center text-sm text-slate-500">No results match this filter.</p>}
              </div>
            </div>

            <EvidenceDetails result={selectedResult} />
          </div>
        </>
      )}
    </SectionShell>
  );
}

function EvidenceDetails({ result }: { result: ControlResult | null }) {
  if (!result) {
    return (
      <aside className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        Select a result to inspect its evidence.
      </aside>
    );
  }

  return (
    <aside aria-label="Evidence details" className="self-start rounded-xl border border-slate-200 bg-slate-50 p-5 xl:sticky xl:top-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Evidence details</p>
          <h3 className="mt-1 text-lg font-semibold text-slate-950">{result.title}</h3>
        </div>
        <StatusBadge status={result.status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-700">{result.explanation}</p>
      <div className="mt-5 space-y-5">
        <EvidenceList title="Supporting evidence" items={result.supportingEvidence} empty="No supporting excerpt recorded." />
        <EvidenceList title="Contradictory evidence" items={result.contradictoryEvidence} empty="No contradictory excerpt recorded." />
        <div>
          <h4 className="text-sm font-semibold text-slate-950">Missing evidence</h4>
          {result.missingEvidence.length ? (
            <ul className="mt-2 space-y-2">
              {result.missingEvidence.map((item) => (
                <li key={item.description} className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm leading-5 text-slate-700">
                  <span className="font-semibold">{item.description}</span>
                  <span className="mt-1 block text-xs text-slate-500">Expected: {item.expectedSource}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-slate-500">No missing evidence recorded.</p>}
        </div>
      </div>
    </aside>
  );
}

function EvidenceList({
  title,
  items,
  empty,
}: {
  title: string;
  items: ControlResult["supportingEvidence"];
  empty: string;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-950">{title}</h4>
      {items.length ? (
        <ul className="mt-2 space-y-2">
          {items.map((item) => (
            <li key={item.id} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-800">{item.documentTitle}</p>
                {item.confidence !== null && <span className="text-xs text-slate-500">{Math.round(item.confidence * 100)}% confidence</span>}
              </div>
              <blockquote className="mt-2 break-words text-sm leading-6 text-slate-700">“{item.excerpt}”</blockquote>
              <p className="mt-2 break-words text-xs text-slate-500">{item.locator} · {item.factId}</p>
              {item.evidenceType && <p className="mt-1 text-xs font-medium text-slate-500">{item.evidenceType}{item.relationToControl ? ` · ${item.relationToControl}` : ""}</p>}
            </li>
          ))}
        </ul>
      ) : <p className="mt-2 text-sm text-slate-500">{empty}</p>}
    </div>
  );
}
