import { useState } from "react";
import type { ControlResult } from "@/src/domain/schemas";
import type { ReviewFingerprintComparison } from "@/src/lib/review-fingerprint";
import { controlRef } from "@/components/workspace/presentation";
import { useLocale } from "@/src/i18n/locale-context";

function abbreviatedFingerprint(value: string): string {
  return `${value.slice(0, 8)}…${value.slice(-8)}`;
}

function localizedStatus(status: string | null, locale: "en" | "fr"): string {
  if (!status) return locale === "fr" ? "Non disponible" : "Not available";
  if (locale === "en") return status;
  return ({ PASS: "CONFORME", FAIL: "ÉCHEC", MISSING: "MANQUANT", WARNING: "ALERTE" } as Record<string, string>)[status] ?? status;
}

export function ReviewFingerprintPanel({ fingerprint, comparison, results, candidateResults, isVerifying, onRerun, compact = false }: {
  fingerprint: string;
  comparison: ReviewFingerprintComparison | null;
  results: ControlResult[];
  candidateResults: ControlResult[];
  isVerifying: boolean;
  onRerun: () => void;
  compact?: boolean;
}) {
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);

  async function copyFingerprint() {
    try {
      await navigator.clipboard.writeText(fingerprint);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="review-fingerprint" data-state={comparison?.kind ?? "READY"} data-compact={compact || undefined} aria-labelledby={compact ? "focused-fingerprint-title" : "workspace-fingerprint-title"}>
      <header>
        <div>
          <p className="eyebrow">{locale === "fr" ? "VÉRIFICATION DE RELANCE" : "RE-RUN CHECK"}</p>
          <h3 id={compact ? "focused-fingerprint-title" : "workspace-fingerprint-title"}>{locale === "fr" ? "Empreinte de revue" : "Review fingerprint"}</h3>
        </div>
        <code>{abbreviatedFingerprint(fingerprint)}</code>
      </header>
      <p>{locale === "fr" ? "Calculée à partir des entrées de revue et des conclusions automatisées." : "Generated from review inputs and automated conclusions."}</p>
      <div className="fingerprint-actions">
        <button type="button" className="primary-button" onClick={onRerun} disabled={isVerifying}>{isVerifying ? (locale === "fr" ? "Vérification…" : "Verifying…") : (locale === "fr" ? "Relancer les contrôles" : "Re-run checks")}</button>
        <button type="button" onClick={() => void copyFingerprint()}>{copied ? (locale === "fr" ? "Copiée" : "Copied") : (locale === "fr" ? "Copier l’empreinte" : "Copy fingerprint")}</button>
        <details><summary>{locale === "fr" ? "Voir l’empreinte complète" : "View full fingerprint"}</summary><code>{fingerprint}</code></details>
      </div>

      {comparison?.kind === "IDENTICAL" && (
        <div className="fingerprint-verification" role="status" data-tone="success">
          <strong>{locale === "fr" ? "Entrées et conclusions reproduites à l’identique" : "Same inputs and conclusions reproduced"}</strong>
          <span>{locale === "fr" ? `${comparison.unchangedControlCount} conclusions sur ${comparison.unchangedControlCount} reproduites à l’identique` : `${comparison.unchangedControlCount} of ${comparison.unchangedControlCount} conclusions reproduced identically`}</span>
          <span>{locale === "fr" ? "Empreinte de revue inchangée" : "Review fingerprint unchanged"}</span>
        </div>
      )}

      {comparison?.kind === "CHANGED" && (
        <div className="fingerprint-verification" role="status" data-tone="changed">
          <strong>{locale === "fr" ? "Le contenu de la revue a changé" : "Review content changed"}</strong>
          <span>{locale === "fr" ? `Entrée modifiée : seuil d’approbation ${comparison.previousThreshold.toLocaleString("fr-FR")} EUR → ${comparison.candidateThreshold.toLocaleString("fr-FR")} EUR` : `Changed input: approval threshold EUR ${comparison.previousThreshold.toLocaleString("en-US")} → EUR ${comparison.candidateThreshold.toLocaleString("en-US")}`}</span>
          {comparison.changedConclusions.map((change) => <span key={change.controlId}>{locale === "fr" ? `Conclusion modifiée : ${controlRef(change.controlId)} : ${localizedStatus(change.previousStatus, locale)} → ${localizedStatus(change.candidateStatus, locale)}` : `Changed conclusion: ${controlRef(change.controlId)}: ${localizedStatus(change.previousStatus, locale)} → ${localizedStatus(change.candidateStatus, locale)}`}</span>)}
          <span>{locale === "fr" ? `Inchangés : ${comparison.unchangedControlCount} contrôles` : `Unchanged: ${comparison.unchangedControlCount} controls`}</span>
        </div>
      )}

      {comparison?.kind === "DIVERGED" && (
        <div className="fingerprint-verification" role="alert" data-tone="error">
          <strong>{locale === "fr" ? "Divergence déterministe inattendue" : "Unexpected deterministic divergence"}</strong>
          <span>{locale === "fr" ? "Les mêmes entrées normalisées ont produit des conclusions différentes. Examinez les contrôles modifiés avant de continuer." : "The same normalized inputs produced different conclusions. Review the changed controls before continuing."}</span>
          <ul>{comparison.changedControlIds.map((controlId) => {
            const previous = results.find((result) => result.controlId === controlId)?.status ?? "NOT AVAILABLE";
            const candidate = candidateResults.find((result) => result.controlId === controlId)?.status ?? "NOT AVAILABLE";
            return <li key={controlId}>{controlRef(controlId)} · {previous} → {candidate}</li>;
          })}</ul>
        </div>
      )}

      {compact ? (
        <details className="fingerprint-limitation">
          <summary>{locale === "fr" ? "Limites de l’empreinte" : "Fingerprint limits"}</summary>
          <small>{locale === "fr" ? "L’empreinte de revue est un condensat SHA-256 des entrées, preuves et conclusions déterministes normalisées. Elle ne prouve ni l’identité, ni l’auteur, ni une signature juridique." : "The review fingerprint is a SHA-256 digest of normalized review inputs, evidence and deterministic conclusions. It does not prove identity, authorship or legal signature."}</small>
        </details>
      ) : (
        <small>{locale === "fr" ? "L’empreinte de revue est un condensat SHA-256 des entrées, preuves et conclusions déterministes normalisées. Elle ne prouve ni l’identité, ni l’auteur, ni une signature juridique." : "The review fingerprint is a SHA-256 digest of normalized review inputs, evidence and deterministic conclusions. It does not prove identity, authorship or legal signature."}</small>
      )}
    </section>
  );
}
