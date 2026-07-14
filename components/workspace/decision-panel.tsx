import { useState } from "react";
import type { ControlResult, ReviewDecision } from "@/src/domain/schemas";
import type { DecisionReceipt } from "@/src/lib/decision-receipt";
import { createConciseReviewSummary, serializeDecisionReceipt } from "@/src/lib/receipt-export";
import type { ResultSummary } from "@/src/lib/review-summary";
import { SectionShell } from "@/components/workspace/section-shell";
import { StatusBadge } from "@/components/workspace/status-badge";
import { useLocale } from "@/src/i18n/locale-context";
import { localizedControl } from "@/src/i18n/translations";

export function DecisionPanel({ selectedResult, summary, receipt, reviewError, onCommentChange, onDecision }: {
  selectedResult: ControlResult | null;
  summary: ResultSummary;
  receipt: DecisionReceipt | null;
  reviewError: string;
  onCommentChange: (comment: string) => void;
  onDecision: (state: ReviewDecision["state"]) => void;
}) {
  const { locale, t } = useLocale();
  const [exportNotice, setExportNotice] = useState("");
  const selectedTitle = selectedResult ? localizedControl(selectedResult.controlId, locale, selectedResult.title).title : "";
  const decisionCounts = receipt?.outcomes.reduce((counts, outcome) => {
    if (outcome.reviewerDecision === "CONFIRMED") counts.confirmed += 1;
    if (outcome.reviewerDecision === "REJECTED") counts.rejected += 1;
    if (outcome.reviewerDecision === "ACCEPTED_EXCEPTION") counts.exceptions += 1;
    return counts;
  }, { confirmed: 0, rejected: 0, exceptions: 0 }) ?? { confirmed: 0, rejected: 0, exceptions: 0 };

  async function copyReceiptContent(value: string) {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(value);
      setExportNotice(t("receipt.copySuccess"));
    } catch {
      setExportNotice(t("action.copyFailed"));
    }
  }

  function downloadReceipt() {
    if (!receipt) return;
    const url = URL.createObjectURL(new Blob([serializeDecisionReceipt(receipt)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receipt.reviewId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setExportNotice(t("receipt.downloadSuccess"));
  }
  return (
    <SectionShell id="decision" step={t("step.label", { number: 5 })} title={t("decision.title")} description={t("decision.help")}>
      {!receipt ? (
        <div className="empty-state"><p className="font-semibold text-slate-800">{t("decision.empty")}</p><p className="mt-1 text-sm text-slate-500">{t("decision.emptyHelp")}</p></div>
      ) : (
        <div className="receipt-layout grid min-w-0 gap-5 xl:grid-cols-[minmax(19rem,0.7fr)_minmax(0,1.3fr)]">
          <div className="receipt-actions self-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            {selectedResult ? (
              <>
                <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">{t("decision.selected")}</p><h3 className="mt-1 font-semibold text-slate-950">{selectedTitle}</h3></div><StatusBadge status={selectedResult.status} /></div>
                <label htmlFor="review-comment" className="field-label mt-5 block">{t("decision.comment")}</label>
                <textarea id="review-comment" rows={4} value={selectedResult.reviewerDecision.comment} onChange={(event) => onCommentChange(event.target.value)} placeholder={t("decision.commentPlaceholder")} aria-invalid={Boolean(reviewError)} aria-describedby="review-comment-help review-comment-error" className="field-control mt-2 resize-y leading-6" />
                <p id="review-comment-help" className="mt-2 text-xs leading-5 text-slate-500">{t("decision.commentHelp")}</p>
                {reviewError && <p id="review-comment-error" role="alert" className="error-callout mt-3">{reviewError}</p>}
                <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
                  <button type="button" onClick={() => onDecision("CONFIRMED")} className="min-h-10 rounded-lg bg-teal-800 px-3 text-sm font-bold text-white hover:bg-teal-700">{t("decision.confirm")}</button>
                  <DecisionButton label={t("decision.reject")} onClick={() => onDecision("REJECTED")} />
                  <DecisionButton label={t("decision.exception")} onClick={() => onDecision("ACCEPTED_EXCEPTION")} />
                </div>
                <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{t("decision.current", { decision: t(`decision.${selectedResult.reviewerDecision.state}`) })}</p>
              </>
            ) : <p className="text-sm text-slate-500">{t("decision.select")}</p>}
          </div>

          <article aria-label={t("a11y.receipt")} className="decision-receipt min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-950 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-[11px] font-bold uppercase tracking-wide text-teal-300">PolicyProof</p><h3 className="mt-1 text-lg font-semibold text-white">{t("receipt.title")}</h3><p className="mt-1 break-all font-mono text-xs text-slate-300">{receipt.reviewId}</p></div>
              <div className="text-sm text-slate-300">{t("receipt.progress", { reviewed: summary.reviewed, pending: summary.pending })}</div>
            </div>
            <div className="receipt-toolbar flex flex-wrap gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
              <button type="button" onClick={() => window.print()} className="secondary-button">{t("action.print")}</button>
              <button type="button" onClick={downloadReceipt} className="secondary-button">{t("action.downloadJson")}</button>
              <button type="button" onClick={() => copyReceiptContent(receipt.reviewId)} className="secondary-button">{t("action.copyReceiptId")}</button>
              <button type="button" onClick={() => copyReceiptContent(createConciseReviewSummary(receipt))} className="secondary-button">{t("action.copySummary")}</button>
            </div>
            <p aria-live="polite" className="receipt-export-notice min-h-6 px-5 pt-2 text-xs font-medium text-teal-800">{exportNotice}</p>
            <dl className="grid gap-px bg-slate-200 text-sm sm:grid-cols-2 lg:grid-cols-3">
              <ReceiptField label={t("receipt.policy")} value={receipt.policyName} />
              <ReceiptField label={t("receipt.policyVersion")} value={receipt.policyVersion} />
              <ReceiptField label={t("receipt.case")} value={receipt.caseName === "Northstar Facilities vendor change" ? t("receipt.caseDemo") : receipt.caseName === "Local fictional document review" ? t("receipt.caseLocal") : receipt.caseName} />
              <ReceiptField label={t("receipt.mode")} value={receipt.runMode === "DETERMINISTIC_DEMO" ? t("mode.demo") : t("mode.live")} />
              <ReceiptField label={t("receipt.language")} value={receipt.selectedLanguage === "fr" ? t("language.french") : t("language.english")} />
              <ReceiptField label={t("receipt.controls")} value={String(receipt.enabledControlCount)} />
            </dl>
            <div className="grid grid-cols-2 gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-4">
              {(["PASS", "FAIL", "MISSING", "WARNING"] as const).map((status) => <div key={status} className="bg-white px-4 py-3 text-center"><p className="text-lg font-semibold text-slate-950">{receipt.summary[status]}</p><p className="text-[10px] font-bold text-slate-500">{t(`status.${status}`)}</p></div>)}
            </div>
            <p className="border-t border-slate-200 bg-white px-5 py-3 text-xs font-medium text-slate-600">{t("receipt.decisionSummary", { ...decisionCounts, pending: receipt.summary.pending })}</p>
            <div className="max-h-80 divide-y divide-slate-200 overflow-y-auto">
              {receipt.outcomes.map((outcome) => {
                const title = localizedControl(outcome.controlId, locale, outcome.title).title;
                return <div key={outcome.controlId} className="grid gap-2 px-5 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_7rem_10rem] sm:items-center">
                  <div className="min-w-0"><p className="font-medium text-slate-900">{title}</p>{outcome.reviewerComment && <p className="mt-1 break-words text-xs text-slate-500">{outcome.reviewerComment}</p>}</div>
                  <span className="font-semibold text-slate-700">{t(`status.${outcome.status}`)}</span>
                  <span className="text-slate-600">{t(`decision.${outcome.reviewerDecision}`)}</span>
                </div>;
              })}
            </div>
            <div className="border-t border-amber-200 bg-amber-50 px-5 py-4"><p className="text-xs leading-5 text-amber-950">{t("receipt.disclaimer")}</p><p className="mt-1 text-xs text-amber-800">{t("receipt.generated", { date: new Date(receipt.generatedAt).toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", { dateStyle: "medium", timeStyle: "short" }) })}</p></div>
          </article>
        </div>
      )}
    </SectionShell>
  );
}

function DecisionButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="min-h-10 rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:border-amber-500 hover:bg-amber-50 hover:text-amber-950">{label}</button>;
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 bg-white p-4"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-words font-semibold text-slate-900">{value}</dd></div>;
}
