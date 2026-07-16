import type { ReviewScenario } from "@/src/domain/scenario-schema";
import type { ControlResult, EvidenceReference, ReviewDecision } from "@/src/domain/schemas";
import type { ResultSummary } from "@/src/lib/review-summary";
import { assessEvidenceIntegrity } from "@/src/lib/review-intelligence";
import { localizedControl, localizedResultExplanation } from "@/src/i18n/translations";
import { useLocale } from "@/src/i18n/locale-context";
import { StatusBadge } from "@/components/workspace/status-badge";
import { ReviewFingerprintPanel } from "@/components/workspace/review-fingerprint-panel";
import type { ReviewFingerprintComparison } from "@/src/lib/review-fingerprint";
import { ReceiptIntegrityPanel } from "@/components/workspace/receipt-integrity-panel";
import type { ReceiptVerificationResult, VerifiableDecisionReceipt } from "@/src/lib/receipt-integrity";

function evidenceForDocument(evidence: EvidenceReference[], fragment: string) {
  return evidence.find((item) => item.documentId.includes(fragment)) ?? null;
}

function visibleCaseName(value: string) {
  return value.replaceAll("\u2014", ":").replaceAll("\u2013", ":");
}

export function FocusedDemo({ scenario, results, summary, threshold, enabledControlCount, isRunning, isVerifying, reviewError, fingerprint, fingerprintComparison, divergenceCandidateResults, verifiableReceipt, receiptVerification, isGeneratingReceipt, onRunReview, onRerun, onThresholdChange, onOpenFullWorkspace, onOpenDecision, onCommentChange, onDecision, onGenerateReceipt, onVerifyReceipt, onExportReceipt }: {
  scenario: ReviewScenario;
  results: ControlResult[];
  summary: ResultSummary;
  threshold: string;
  enabledControlCount: number;
  isRunning: boolean;
  isVerifying: boolean;
  reviewError: string;
  fingerprint: string;
  fingerprintComparison: ReviewFingerprintComparison | null;
  divergenceCandidateResults: ControlResult[];
  verifiableReceipt: VerifiableDecisionReceipt | null;
  receiptVerification: ReceiptVerificationResult | null;
  isGeneratingReceipt: boolean;
  onRunReview: () => void;
  onRerun: () => void;
  onThresholdChange: (value: string) => void;
  onOpenFullWorkspace: () => void;
  onOpenDecision: () => void;
  onCommentChange: (controlId: string, comment: string) => void;
  onDecision: (controlId: string, state: ReviewDecision["state"]) => void;
  onGenerateReceipt: () => void;
  onVerifyReceipt: () => void;
  onExportReceipt: () => void;
}) {
  const { locale, t } = useLocale();
  const currencyResult = results.find((result) => result.controlId === "CTRL-CURRENCY") ?? null;
  const evidence = currencyResult ? [...currencyResult.supportingEvidence, ...currencyResult.contradictoryEvidence] : [];
  const purchaseOrder = evidenceForDocument(evidence, "PO");
  const invoice = evidenceForDocument(evidence, "INV");
  const integrity = currencyResult ? assessEvidenceIntegrity(currencyResult, scenario.documents) : null;
  const title = currencyResult ? localizedControl(currencyResult.controlId, locale, currencyResult.title).title : "";

  return (
    <section className="focused-demo" data-has-results={results.length > 0 || undefined} aria-label={locale === "fr" ? "Démonstration ciblée" : "Focused Demo"}>
      <header className="focused-hero">
        <div>
          <p className="eyebrow">{locale === "fr" ? "REVUE DU CAS NORTHSTAR" : "NORTHSTAR CASE REVIEW"}</p>
          <h1>{locale === "fr" ? "Examiner le changement fournisseur Northstar" : "Review the Northstar vendor change"}</h1>
          <p>{locale === "fr"
            ? "Comparez cinq pièces fictives à sept contrôles approuvés. Le réviseur consigne la décision finale après avoir examiné les preuves."
            : "Compare five fictional records with seven approved controls. The reviewer records the final decision after inspecting the evidence."}</p>
        </div>
        <button type="button" className="focused-workspace-link" onClick={onOpenFullWorkspace}>{locale === "fr" ? "Ouvrir l’espace de travail complet" : "Open full workspace"}</button>
      </header>

      <div className="focused-case-strip">
        <div><span>{scenario.caseReference}</span><strong>{visibleCaseName(scenario.caseName[locale])}</strong><small>{scenario.caseDescription[locale]}</small></div>
        <dl>
          <div><dt>{locale === "fr" ? "Politique" : "Policy"}</dt><dd>{scenario.policy.version}</dd></div>
          <div><dt>{locale === "fr" ? "Contrôles" : "Controls"}</dt><dd>{enabledControlCount} {locale === "fr" ? "actifs" : "enabled"}</dd></div>
          <div><dt>{locale === "fr" ? "Pièces" : "Records"}</dt><dd>{scenario.documents.length}</dd></div>
          <div><dt>{locale === "fr" ? "Données" : "Data"}</dt><dd>{locale === "fr" ? "Fictives et contrôlées" : "Fictional and controlled"}</dd></div>
        </dl>
      </div>

      {!results.length ? (
        <div className="focused-run-card">
          <div><span aria-hidden="true">01</span><div><strong>{locale === "fr" ? "Lancer la revue Northstar" : "Run the Northstar review"}</strong><p>{locale === "fr" ? "Sept contrôles TypeScript approuvés comparent cinq pièces fictives. Ce parcours ne sollicite aucun modèle." : "Seven approved TypeScript controls compare five fictional records. This path makes no model request."}</p></div></div>
          <button type="button" className="primary-button focused-primary-action" onClick={onRunReview} disabled={isRunning}>{isRunning ? t("action.running") : t("action.run")}</button>
        </div>
      ) : (
        <>
          <section className="focused-results" aria-labelledby="focused-results-title">
            <header><div><p className="eyebrow">{locale === "fr" ? "CONCLUSIONS AUTOMATISÉES" : "AUTOMATED RESULTS"}</p><h2 id="focused-results-title">{locale === "fr" ? "Résultats de la revue" : "Review results"}</h2></div><span>{Number(threshold).toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} EUR</span></header>
            <div className="focused-outcomes" role="list" aria-label={locale === "fr" ? "Composition des résultats" : "Outcome composition"}>
              <div role="listitem" data-status="PASS"><strong>{summary.PASS}</strong><span>{t("status.PASS")}</span></div>
              <div role="listitem" data-status="FAIL"><strong>{summary.FAIL}</strong><span>{t("status.FAIL")}</span></div>
              <div role="listitem" data-status="MISSING"><strong>{summary.MISSING}</strong><span>{t("status.MISSING")}</span></div>
              <div role="listitem" data-status="WARNING"><strong>{summary.WARNING}</strong><span>{t("status.WARNING")}</span></div>
            </div>
          </section>

          {currencyResult && (
            <section className="focused-exception" aria-labelledby="focused-exception-title">
              <header><div><p className="eyebrow">{locale === "fr" ? "CONSTAT PRINCIPAL" : "PRINCIPAL FINDING"}</p><h2 id="focused-exception-title">{title}</h2></div><StatusBadge status={currencyResult.status} /></header>
              <p className="focused-conclusion">{localizedResultExplanation(currencyResult.controlId, currencyResult.status, currencyResult.explanation, locale, threshold)}</p>
              <div className="focused-currency-comparison" aria-label={locale === "fr" ? "Comparaison des devises" : "Currency comparison"}>
                <EvidenceCard label={locale === "fr" ? "Bon de commande" : "Purchase Order"} evidence={purchaseOrder} />
                <span aria-hidden="true">≠</span>
                <EvidenceCard label={locale === "fr" ? "Facture" : "Invoice"} evidence={invoice} />
              </div>
              <div className="focused-integrity" data-state={integrity?.state}>
                <strong>{integrity?.state === "VERIFIED" ? (locale === "fr" ? "✓ Extraits exacts vérifiés" : "✓ Exact excerpts verified") : (locale === "fr" ? "Preuves à examiner" : "Evidence needs review")}</strong>
                <span>{locale === "fr" ? "Chaque extrait correspond à la source et au repère indiqués." : "Each excerpt matches the cited source and locator."}</span>
              </div>
            </section>
          )}

          {fingerprint && (
            <section className="focused-reproducibility" aria-labelledby="focused-reproducibility-title">
              <div className="focused-threshold-control">
                <div><p className="eyebrow">02 · {locale === "fr" ? "REPRODUIRE" : "REPRODUCE"}</p><h2 id="focused-reproducibility-title">{locale === "fr" ? "Relancer les contrôles" : "Re-run the checks"}</h2></div>
                <label>{locale === "fr" ? "Seuil d’approbation" : "Approval threshold"}<span><input type="number" min="0" step="1000" value={threshold} onChange={(event) => onThresholdChange(event.target.value)} aria-label={locale === "fr" ? "Seuil d’approbation en EUR" : "Approval threshold in EUR"} /> EUR</span></label>
              </div>
              <ReviewFingerprintPanel fingerprint={fingerprint} comparison={fingerprintComparison} results={results} candidateResults={divergenceCandidateResults} isVerifying={isVerifying} onRerun={onRerun} compact />
            </section>
          )}

          {currencyResult && (
            <section className="focused-human-decision" aria-labelledby="focused-decision-title">
              <div><p className="eyebrow">03 · {locale === "fr" ? "DÉCISION DU RÉVISEUR" : "REVIEWER DECISION"}</p><h2 id="focused-decision-title">{locale === "fr" ? "Consigner la décision du réviseur" : "Record the reviewer decision"}</h2><p>{locale === "fr" ? "La conclusion automatisée reste visible à côté de la décision consignée." : "The automated result remains visible beside the recorded decision."}</p></div>
              <label>{locale === "fr" ? "Commentaire du réviseur" : "Reviewer comment"}<textarea value={currencyResult.reviewerDecision.comment} onChange={(event) => onCommentChange(currencyResult.controlId, event.target.value)} placeholder={t("decision.commentPlaceholder")} /></label>
              {reviewError && <p role="alert" className="focused-decision-error">{reviewError}</p>}
              <div className="focused-decision-actions">
                <button type="button" aria-pressed={currencyResult.reviewerDecision.state === "CONFIRMED"} onClick={() => onDecision(currencyResult.controlId, "CONFIRMED")}>{t("decision.confirm")}</button>
                <button type="button" aria-pressed={currencyResult.reviewerDecision.state === "REJECTED"} onClick={() => onDecision(currencyResult.controlId, "REJECTED")}>{t("decision.reject")}</button>
                <button type="button" aria-pressed={currencyResult.reviewerDecision.state === "ACCEPTED_EXCEPTION"} onClick={() => onDecision(currencyResult.controlId, "ACCEPTED_EXCEPTION")}>{t("decision.exception")}</button>
                <button type="button" className="primary-button" onClick={onOpenDecision}>{currencyResult.reviewerDecision.state === "PENDING" ? (locale === "fr" ? "Ouvrir la décision" : "Open decision") : (locale === "fr" ? "Ouvrir le reçu" : "Open receipt")}</button>
              </div>
            </section>
          )}

          {summary.reviewed > 0 && fingerprint && (
            <ReceiptIntegrityPanel
              compact
              receipt={verifiableReceipt}
              reviewFingerprint={fingerprint}
              verification={receiptVerification}
              isGenerating={isGeneratingReceipt}
              onGenerate={onGenerateReceipt}
              onVerifyCurrent={onVerifyReceipt}
              onExport={onExportReceipt}
            />
          )}
        </>
      )}
    </section>
  );
}

function EvidenceCard({ label, evidence }: { label: string; evidence: EvidenceReference | null }) {
  return <article><span>{label}</span>{evidence ? <><strong>{evidence.excerpt.replace(/^(Purchase order|Invoice) amount:\s*/i, "").replace(/\.$/, "")}</strong><small>{evidence.documentId} · {evidence.locator}</small><blockquote>“{evidence.excerpt}”</blockquote></> : <p>Not available</p>}</article>;
}
