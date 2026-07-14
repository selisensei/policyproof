import { useRef, useState } from "react";
import type { CaseDocument, ControlResult, ReviewDecision } from "@/src/domain/schemas";
import type { DecisionReceipt } from "@/src/lib/decision-receipt";
import { createConciseReviewSummary, serializeDecisionReceipt, serializeDecisionReceiptMarkdown } from "@/src/lib/receipt-export";
import type { ResultSummary } from "@/src/lib/review-summary";
import { controlRef, decisionGlyph, decisionRef, requirementRef } from "@/components/workspace/presentation";
import { SectionShell } from "@/components/workspace/section-shell";
import { StatusBadge } from "@/components/workspace/status-badge";
import { useLocale } from "@/src/i18n/locale-context";
import { localizedControl, localizedResultExplanation } from "@/src/i18n/translations";
import { assessEvidenceIntegrity, buildReviewerQueue } from "@/src/lib/review-intelligence";

export function DecisionPanel({ results, documents, selectedResult, summary, receipt, reviewError, threshold, onSelectResult, onCommentChange, onDecision, onReopenEvidence }: {
  results: ControlResult[];
  documents: CaseDocument[];
  selectedResult: ControlResult | null;
  summary: ResultSummary;
  receipt: DecisionReceipt | null;
  reviewError: string;
  threshold: string;
  onSelectResult: (controlId: string) => void;
  onCommentChange: (comment: string) => void;
  onDecision: (state: ReviewDecision["state"]) => void;
  onReopenEvidence: () => void;
}) {
  const { locale, t } = useLocale();
  const [exportNotice, setExportNotice] = useState("");
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const selectedTitle = selectedResult ? localizedControl(selectedResult.controlId, locale, selectedResult.title).title : "";
  const queue = buildReviewerQueue(results).map((item) => results.find((result) => result.controlId === item.controlId)!).filter(Boolean);
  const selectedQueueIndex = queue.findIndex((result) => result.controlId === selectedResult?.controlId);
  const integrity = selectedResult ? assessEvidenceIntegrity(selectedResult, documents) : null;
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
      window.setTimeout(() => setExportNotice(""), 1600);
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

  function downloadMarkdownReceipt() {
    if (!receipt) return;
    const url = URL.createObjectURL(new Blob([serializeDecisionReceiptMarkdown(receipt)], { type: "text/markdown" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receipt.reviewId}.md`;
    link.click();
    URL.revokeObjectURL(url);
    setExportNotice(locale === "fr" ? "Reçu Markdown téléchargé." : "Markdown receipt downloaded.");
  }

  function moveInQueue(direction: -1 | 1, unresolvedOnly = false) {
    if (!queue.length) return;
    const candidates = unresolvedOnly ? queue.filter((result) => result.reviewerDecision.state === "PENDING") : queue;
    if (!candidates.length) return;
    const index = candidates.findIndex((result) => result.controlId === selectedResult?.controlId);
    const nextIndex = index === -1 ? 0 : (index + direction + candidates.length) % candidates.length;
    onSelectResult(candidates[nextIndex].controlId);
  }

  function applyDecision(state: ReviewDecision["state"]) {
    onDecision(state);
    if ((state === "REJECTED" || state === "ACCEPTED_EXCEPTION") && !selectedResult?.reviewerDecision.comment.trim()) {
      window.setTimeout(() => commentRef.current?.focus(), 0);
    }
  }

  return (
    <SectionShell id="decision" step={t("step.label", { number: 5 })} title={t("decision.title")} description={t("decision.help")}>
      {!receipt ? (
        <div className="empty-state"><strong>{t("decision.empty")}</strong><p>{t("decision.emptyHelp")}</p></div>
      ) : (
        <>
          <div className="decision-workspace">
            <aside className="decision-queue" aria-label={t("review.human")}>
              <header><span>{locale === "fr" ? "DÉCISIONS" : "DECISIONS"}</span><b>{summary.pending}/{summary.total}</b></header>
              <div>
                {queue.map((result) => {
                  const title = localizedControl(result.controlId, locale, result.title).title;
                  const selected = selectedResult?.controlId === result.controlId;
                  return <button key={result.controlId} type="button" onClick={() => onSelectResult(result.controlId)} aria-label={t("review.inspect", { title })} aria-pressed={selected} className={selected ? "is-selected" : ""}>
                    <span>{decisionRef(result.controlId)}</span><strong>{title}</strong><small><StatusBadge status={result.status} /> · <span data-state={result.reviewerDecision.state}>{decisionGlyph(result.reviewerDecision.state)} {t(`decision.${result.reviewerDecision.state}`)}</span></small>
                  </button>;
                })}
              </div>
              <footer><span>{summary.pending} {locale === "fr" ? "ouvertes" : "open"}</span><button type="button" onClick={() => moveInQueue(1, true)} disabled={!summary.pending}>{locale === "fr" ? "Prochaine non résolue" : "Next unresolved"} →</button></footer>
            </aside>

            {selectedResult ? (
              <article className="decision-paper">
                <nav className="decision-navigation" aria-label={locale === "fr" ? "Navigation dans la file de revue" : "Reviewer queue navigation"}>
                  <button type="button" onClick={() => moveInQueue(-1)}>← {locale === "fr" ? "Précédente" : "Previous"}</button>
                  <span>{selectedQueueIndex + 1} / {queue.length} · {summary.pending} {locale === "fr" ? "ouvertes" : "open"}</span>
                  <button type="button" onClick={() => moveInQueue(1, true)} disabled={!summary.pending}>{locale === "fr" ? "Prochaine non résolue" : "Next unresolved"} →</button>
                </nav>
                <div className="decision-chain"><span>{requirementRef(selectedResult.controlId)}</span><i /><span>{controlRef(selectedResult.controlId)}</span><i /><StatusBadge status={selectedResult.status} /><i /><span>{decisionRef(selectedResult.controlId)}</span></div>
                <header><div><p className="eyebrow">{locale === "fr" ? "JUGEMENT HUMAIN" : "HUMAN JUDGMENT"}</p><h3>{selectedTitle}</h3></div><span>{decisionRef(selectedResult.controlId)}</span></header>
                <p className="automated-conclusion">{locale === "fr" ? "Conclusion automatisée" : "Automated conclusion"}: <StatusBadge status={selectedResult.status} /> — {localizedResultExplanation(selectedResult.controlId, selectedResult.status, selectedResult.explanation, locale, threshold)} <strong>{locale === "fr" ? "La conclusion est conservée quelle que soit votre décision." : "The conclusion is preserved whatever you decide."}</strong></p>
                <div className="decision-evidence-recap"><span>{selectedResult.controlId === "CTRL-CURRENCY" ? "12,480 EUR ≠ 12,480 USD" : `${selectedResult.supportingEvidence.length + selectedResult.contradictoryEvidence.length + selectedResult.missingEvidence.length} ${locale === "fr" ? "éléments probants" : "evidence items"}`}</span><button type="button" onClick={onReopenEvidence}>← {locale === "fr" ? "Rouvrir les preuves" : "Reopen evidence"}</button></div>
                {integrity && <div className="decision-integrity" data-state={integrity.state}><strong>{integrity.state === "VERIFIED" ? (locale === "fr" ? "✓ Sources exactes vérifiées" : "✓ Exact sources verified") : integrity.state === "MISSING" ? (locale === "fr" ? "○ Preuve requise manquante" : "○ Required evidence missing") : (locale === "fr" ? "× Référence rejetée" : "× Reference rejected")}</strong><span>{integrity.verifiedReferences} {locale === "fr" ? "extraits exacts" : "exact excerpts"}</span></div>}
                <div className="decision-form-grid">
                  <div className="decision-actions">
                    <button type="button" onClick={() => applyDecision("CONFIRMED")} aria-label={t("decision.confirm")} className="confirm-decision">{locale === "fr" ? `Confirmer la conclusion ${t(`status.${selectedResult.status}`)}` : `Confirm ${selectedResult.status} conclusion`}</button>
                    <p>{locale === "fr" ? "Parcours standard — la conclusion automatique reste inchangée." : "Standard path — the automated conclusion remains unchanged."}</p>
                    <div className="override-rule"><span>{locale === "fr" ? "DÉROGATIONS — JUSTIFICATION REQUISE" : "OVERRIDE PATHS — JUSTIFICATION REQUIRED"}</span></div>
                    <button type="button" aria-label={t("decision.reject")} onClick={() => applyDecision("REJECTED")} className="override-decision is-reject"><span>{t("decision.reject")}</span><small>✎ {locale === "fr" ? "commentaire requis" : "comment required"}</small></button>
                    <button type="button" aria-label={t("decision.exception")} onClick={() => applyDecision("ACCEPTED_EXCEPTION")} className="override-decision"><span>{t("decision.exception")}</span><small>✎ {locale === "fr" ? "commentaire requis" : "comment required"}</small></button>
                  </div>
                  <div className="reviewer-comment">
                    <label htmlFor="review-comment" className="field-label">{t("decision.comment")}<span>{locale === "fr" ? "REQUIS POUR LES DÉROGATIONS" : "REQUIRED FOR OVERRIDES"}</span></label>
                    <textarea ref={commentRef} id="review-comment" rows={7} value={selectedResult.reviewerDecision.comment} onChange={(event) => onCommentChange(event.target.value)} placeholder={t("decision.commentPlaceholder")} aria-label={t("decision.comment")} aria-invalid={Boolean(reviewError)} aria-describedby="review-comment-help review-comment-error" className="field-control" />
                    <p id="review-comment-help">{t("decision.commentHelp")}</p>
                    {reviewError && <p id="review-comment-error" role="alert" className="validation-error">× {reviewError}</p>}
                    <div className="decision-current" data-state={selectedResult.reviewerDecision.state}>{t("decision.current", { decision: t(`decision.${selectedResult.reviewerDecision.state}`) })}</div>
                  </div>
                </div>
              </article>
            ) : <div className="empty-state">{t("decision.select")}</div>}
          </div>

          {summary.reviewed > 0 && <section className="receipt-section">
            <div className="receipt-toolbar">
              <button type="button" onClick={() => window.print()} className="receipt-primary-action">{t("action.print")}</button>
              <button type="button" onClick={downloadReceipt}>{t("action.downloadJson")}</button>
              <button type="button" onClick={downloadMarkdownReceipt}>{locale === "fr" ? "Télécharger Markdown" : "Download Markdown"}</button>
              <button type="button" onClick={() => copyReceiptContent(receipt.reviewId)}>{t("action.copyReceiptId")}</button>
              <button type="button" onClick={() => copyReceiptContent(createConciseReviewSummary(receipt))}>{t("action.copySummary")}</button>
              <span>{receipt.reviewId}.json</span>
            </div>
            <p aria-live="polite" className="receipt-export-notice">{exportNotice}</p>
            <DecisionReceiptSheet receipt={receipt} results={results} summary={summary} decisionCounts={decisionCounts} />
          </section>}
        </>
      )}
    </SectionShell>
  );
}

function DecisionReceiptSheet({ receipt, results, summary, decisionCounts }: { receipt: DecisionReceipt; results: ControlResult[]; summary: ResultSummary; decisionCounts: { confirmed: number; rejected: number; exceptions: number } }) {
  const { locale, t } = useLocale();
  const exceptions = receipt.outcomes.filter((outcome) => outcome.reviewerDecision === "ACCEPTED_EXCEPTION");
  const unresolved = receipt.outcomes.filter((outcome) => outcome.reviewerDecision === "PENDING");
  return (
    <article aria-label={t("a11y.receipt")} className="decision-receipt">
      <header className="receipt-masthead"><div className="receipt-brand"><span aria-hidden="true" className="brand-mark">P</span><div><strong>PolicyProof — {t("receipt.title")}</strong><p>{locale === "fr" ? "Preuves automatisées et décisions humaines consignées ensemble" : "Automated evidence and human decisions recorded together"}</p></div></div><div><strong>{receipt.reviewId}</strong><span>{t("receipt.generated", { date: new Date(receipt.generatedAt).toLocaleString(locale === "fr" ? "fr-FR" : "en-GB", { dateStyle: "medium", timeStyle: "short" }) })}</span></div></header>
      <dl className="receipt-meta">
        <div><dt>{t("receipt.policy")}</dt><dd>{receipt.policyName}</dd></div><div><dt>{t("receipt.policyVersion")}</dt><dd>{receipt.policyVersion} · POL-2026-004</dd></div><div><dt>{t("receipt.case")}</dt><dd>{receipt.caseName === "Northstar Facilities vendor change" ? t("receipt.caseDemo") : receipt.caseName === "Local fictional document review" ? t("receipt.caseLocal") : receipt.caseName}</dd></div><div><dt>{t("receipt.mode")} · {t("receipt.language")}</dt><dd>{receipt.runMode === "DETERMINISTIC_DEMO" ? t("mode.demo") : t("mode.live")} · {receipt.selectedLanguage === "fr" ? t("language.french") : t("language.english")}</dd></div>
      </dl>
      <div className="receipt-summary"><p><span data-status="PASS">✓ {receipt.summary.PASS} {t("status.PASS")}</span><span data-status="FAIL">× {receipt.summary.FAIL} {t("status.FAIL")}</span><span data-status="MISSING">⌀ {receipt.summary.MISSING} {t("status.MISSING")}</span><span data-status="WARNING">! {receipt.summary.WARNING} {t("status.WARNING")}</span></p><strong>{t("receipt.decisionSummary", { ...decisionCounts, pending: receipt.summary.pending })}</strong></div>
      <div className="receipt-outcomes" role="table" aria-label={t("receipt.summary")}>
        <div className="receipt-outcome-head" role="row"><span>REF</span><span>{locale === "fr" ? "CONTRÔLE" : "CONTROL"}</span><span>{locale === "fr" ? "CONCLUSION" : "CONCLUSION"}</span><span>{locale === "fr" ? "DÉCISION" : "DECISION"}</span><span>{locale === "fr" ? "COMMENTAIRE" : "REVIEWER COMMENT"}</span></div>
        {receipt.outcomes.map((outcome) => {
          const result = results.find((candidate) => candidate.controlId === outcome.controlId);
          const title = localizedControl(outcome.controlId, locale, outcome.title).title;
          return <div key={outcome.controlId} className="receipt-outcome-row" role="row" data-override={outcome.reviewerDecision === "REJECTED" || outcome.reviewerDecision === "ACCEPTED_EXCEPTION" || undefined}><span>{controlRef(outcome.controlId)}</span><strong>{title}</strong><span data-status={outcome.status}>{outcome.status === "PASS" ? "✓" : outcome.status === "FAIL" ? "×" : outcome.status === "MISSING" ? "⌀" : "!"} {t(`status.${outcome.status}`)}</span><span><i aria-hidden="true">{decisionGlyph(result?.reviewerDecision.state ?? "PENDING")}</i> <span>{t(`decision.${outcome.reviewerDecision}`)}</span></span><p>{outcome.reviewerComment ? <span>{outcome.reviewerComment}</span> : "—"}</p></div>;
        })}
      </div>
      <div className="receipt-followup"><div><strong>{locale === "fr" ? "DÉROGATIONS ACCEPTÉES" : "ACCEPTED EXCEPTIONS"}</strong><p>{exceptions.length ? exceptions.map((item) => decisionRef(item.controlId)).join(" · ") : "—"}</p></div><div><strong>{locale === "fr" ? "DÉCISIONS NON RÉSOLUES" : "UNRESOLVED DECISIONS"}</strong><p>{unresolved.length ? unresolved.map((item) => decisionRef(item.controlId)).join(" · ") : "—"}</p></div></div>
      <footer><p>{t("receipt.disclaimer")}</p><span>DETERMINISTIC REPLAY · FIXTURE v1.0 · {summary.total} CONTROLS</span></footer>
    </article>
  );
}
