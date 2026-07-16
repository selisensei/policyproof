import { useRef, useState } from "react";
import { useLocale } from "@/src/i18n/locale-context";
import {
  abbreviateReceiptHash,
  serializeVerifiableReceipt,
  verifyReceiptIntegrityJson,
  type ReceiptVerificationResult,
  type VerifiableDecisionReceipt,
} from "@/src/lib/receipt-integrity";

function statusCopy(status: ReceiptVerificationResult["status"], locale: "en" | "fr") {
  const copy = {
    VALID: { en: ["Receipt integrity verified", "The structure and versions are supported, and the recalculated hash exactly matches the stored hash."], fr: ["Intégrité du reçu vérifiée", "La structure et les versions sont prises en charge, et l’empreinte recalculée correspond exactement à l’empreinte enregistrée."] },
    MODIFIED: { en: ["Receipt content has changed", "The recalculated hash does not match. This receipt must not be treated as integrity-verified."], fr: ["Le contenu du reçu a été modifié", "L’empreinte recalculée ne correspond pas. Ce reçu ne doit pas être considéré comme vérifié."] },
    UNSUPPORTED_VERSION: { en: ["Unsupported receipt version", "PolicyProof did not attempt an unsafe migration."], fr: ["Version du reçu non prise en charge", "PolicyProof n’a tenté aucune migration non sûre."] },
    MALFORMED: { en: ["Invalid receipt structure", "The local content is not valid supported PolicyProof receipt JSON."], fr: ["Structure du reçu invalide", "Le contenu local n’est pas un JSON de reçu PolicyProof valide et pris en charge."] },
    MISSING_INTEGRITY: { en: ["Receipt integrity block is missing", "This receipt cannot be integrity-verified; it is not being labelled as modified."], fr: ["Le bloc d’intégrité du reçu est absent", "Ce reçu ne peut pas être vérifié ; il n’est pas présenté comme modifié."] },
  } as const;
  return copy[status][locale];
}

export function ReceiptIntegrityPanel({ receipt, reviewFingerprint, verification, isGenerating, compact = false, onGenerate, onVerifyCurrent, onExport }: {
  receipt: VerifiableDecisionReceipt | null;
  reviewFingerprint: string;
  verification: ReceiptVerificationResult | null;
  isGenerating: boolean;
  compact?: boolean;
  onGenerate: () => void;
  onVerifyCurrent: () => void;
  onExport: () => void;
}) {
  const { locale } = useLocale();
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<ReceiptVerificationResult | null>(null);
  const [localNotice, setLocalNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const hash = receipt?.integrity.hash ?? "";
  const limitation = locale === "fr"
    ? "Cela confirme que le contenu inclus dans ce reçu n’a pas changé depuis sa génération. Cela ne prouve ni l’identité, ni l’auteur, ni une signature juridique, ni un horodatage qualifié."
    : "This confirms that the content included in this receipt has not changed since the receipt was generated. It does not prove authorship, identity, legal signature or trusted timestamping.";

  async function copyHash() {
    try {
      if (!hash || !navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(hash);
      setLocalNotice(locale === "fr" ? "Empreinte complète copiée." : "Full hash copied.");
    } catch {
      setLocalNotice(locale === "fr" ? "Copie indisponible. Sélectionnez l’empreinte manuellement." : "Copy unavailable. Select the hash manually.");
    }
  }

  async function verifyImported() {
    const result = await verifyReceiptIntegrityJson(importText);
    setImportResult(result);
  }

  async function readFile(file: File | undefined) {
    if (!file) return;
    if (file.size > 2_000_000) {
      setImportResult({ status: "MALFORMED", receiptId: null, storedHash: null, calculatedHash: null });
      return;
    }
    setImportText(await file.text());
    setImportResult(null);
  }

  function downloadJson() {
    if (!receipt) return;
    const url = URL.createObjectURL(new Blob([serializeVerifiableReceipt(receipt)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${receipt.receipt.receiptId}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setLocalNotice(locale === "fr" ? "Reçu JSON téléchargé." : "Receipt JSON downloaded.");
    onExport();
  }

  const resultCopy = verification ? statusCopy(verification.status, locale) : null;
  const importedCopy = importResult ? statusCopy(importResult.status, locale) : null;

  return (
    <section className="receipt-integrity-panel" data-compact={compact || undefined} aria-labelledby={compact ? "focused-receipt-integrity-title" : "receipt-integrity-title"}>
      <header>
        <div><p className="eyebrow">04 · {locale === "fr" ? "REÇU VÉRIFIABLE" : "VERIFIABLE RECEIPT"}</p><h2 id={compact ? "focused-receipt-integrity-title" : "receipt-integrity-title"}>{locale === "fr" ? "Décision consignée, contenu vérifiable" : "Decision recorded, content verifiable"}</h2></div>
        {receipt && <code aria-label={locale === "fr" ? "Empreinte abrégée" : "Abbreviated hash"}>{abbreviateReceiptHash(hash)}</code>}
      </header>
      {!receipt ? (
        <div className="receipt-generate-row"><p>{locale === "fr" ? "Générez un instantané exact de la revue et des décisions humaines actuelles." : "Generate an exact snapshot of the current review and human decisions."}</p><button type="button" className="primary-button" onClick={onGenerate} disabled={isGenerating}>{isGenerating ? (locale === "fr" ? "Génération…" : "Generating…") : (locale === "fr" ? "Générer le reçu" : "Generate receipt")}</button></div>
      ) : (
        <>
          <dl className="receipt-integrity-summary">
            <div><dt>Review Fingerprint</dt><dd><code>{abbreviateReceiptHash(reviewFingerprint)}</code></dd></div>
            <div><dt>{locale === "fr" ? "Empreinte d’intégrité du reçu" : "Receipt integrity hash"}</dt><dd><code>{abbreviateReceiptHash(hash)}</code></dd></div>
            <div><dt>{locale === "fr" ? "État de décision" : "Decision status"}</dt><dd>{receipt.receipt.decisionStatus === "COMPLETE" ? (locale === "fr" ? "Complet" : "Complete") : (locale === "fr" ? "En cours" : "In progress")}</dd></div>
          </dl>
          <div className="receipt-integrity-actions">
            <button type="button" onClick={() => setTechnicalOpen((current) => !current)} aria-expanded={technicalOpen}>{locale === "fr" ? "Voir le reçu" : "View receipt"}</button>
            <button type="button" className="primary-button" onClick={onVerifyCurrent}>{locale === "fr" ? "Vérifier l’intégrité du reçu" : "Verify receipt integrity"}</button>
            <button type="button" onClick={downloadJson}>{locale === "fr" ? "Exporter le reçu JSON" : "Export receipt JSON"}</button>
            <button type="button" onClick={() => window.print()}>{locale === "fr" ? "Imprimer" : "Print"}</button>
          </div>
          {resultCopy && <div className="receipt-verification-state" data-status={verification?.status} role="status"><strong>{resultCopy[0]}</strong><span>{resultCopy[1]}</span></div>}
          {technicalOpen && <div className="receipt-technical-details">
            <dl><div><dt>{locale === "fr" ? "Version d’intégrité" : "Integrity version"}</dt><dd>{receipt.integrity.version}</dd></div><div><dt>{locale === "fr" ? "Format du reçu" : "Receipt format"}</dt><dd>{receipt.receipt.receiptFormatVersion}</dd></div><div><dt>{locale === "fr" ? "Algorithme" : "Algorithm"}</dt><dd>{receipt.integrity.algorithm}</dd></div></dl>
            <label>{locale === "fr" ? "Empreinte complète" : "Full hash"}<code>{hash}</code></label>
            <button type="button" onClick={() => void copyHash()}>{locale === "fr" ? "Copier l’empreinte complète" : "Copy full hash"}</button>
          </div>}
          <details className="receipt-local-verifier">
            <summary>{locale === "fr" ? "Vérifier un reçu JSON local" : "Verify a local JSON receipt"}</summary>
            <p>{locale === "fr" ? "Le fichier reste dans ce navigateur et ne remplace pas le dossier actif." : "The file stays in this browser and does not replace the active case."}</p>
            <input ref={fileInput} type="file" accept="application/json,.json" onChange={(event) => void readFile(event.target.files?.[0])} aria-label={locale === "fr" ? "Sélectionner un reçu JSON local" : "Select a local JSON receipt"} />
            <label>{locale === "fr" ? "Ou coller le JSON" : "Or paste JSON"}<textarea value={importText} onChange={(event) => { setImportText(event.target.value); setImportResult(null); }} rows={5} /></label>
            <button type="button" onClick={() => void verifyImported()} disabled={!importText.trim()}>{locale === "fr" ? "Vérifier le JSON local" : "Verify local JSON"}</button>
            {importedCopy && <div className="receipt-verification-state" data-status={importResult?.status} role="status"><strong>{importedCopy[0]}</strong><span>{importedCopy[1]}</span></div>}
          </details>
          <p className="receipt-integrity-limitation">{limitation}</p>
        </>
      )}
      <p aria-live="polite" className="receipt-export-notice">{localNotice}</p>
    </section>
  );
}
