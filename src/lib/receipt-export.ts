import type { DecisionReceipt } from "@/src/lib/decision-receipt";
import type { ControlResult } from "@/src/domain/schemas";
import { resolveControlReference } from "@/src/domain/control-references";

export function serializeDecisionReceipt(receipt: DecisionReceipt): string {
  return `${JSON.stringify(receipt, null, 2)}\n`;
}

export function createConciseReviewSummary(receipt: DecisionReceipt): string {
  const { PASS, FAIL, MISSING, WARNING, reviewed, total } = receipt.summary;
  if (receipt.selectedLanguage === "fr") {
    return `Revue PolicyProof ${receipt.reviewId} : ${PASS} conforme, ${FAIL} échec, ${MISSING} manquant, ${WARNING} alerte ; ${reviewed}/${total} décisions humaines enregistrées.`;
  }
  return `PolicyProof review ${receipt.reviewId}: ${PASS} PASS, ${FAIL} FAIL, ${MISSING} MISSING, ${WARNING} WARNING; ${reviewed}/${total} human decisions recorded.`;
}

function markdownCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function serializeDecisionReceiptMarkdown(receipt: DecisionReceipt): string {
  const french = receipt.selectedLanguage === "fr";
  const lines = [
    `# PolicyProof: ${french ? "Reçu de décision" : "Decision receipt"}`,
    "",
    `- **${french ? "Référence" : "Reference"}:** ${receipt.reviewId}`,
    `- **${french ? "Politique" : "Policy"}:** ${receipt.policyName} (${receipt.policyVersion})`,
    `- **${french ? "Cas" : "Case"}:** ${receipt.caseName}`,
    `- **${french ? "Généré" : "Generated"}:** ${receipt.generatedAt}`,
    `- **${french ? "Mode" : "Mode"}:** ${receipt.runMode}`,
    "",
    `## ${french ? "Résumé" : "Summary"}`,
    "",
    `${receipt.summary.PASS} PASS · ${receipt.summary.FAIL} FAIL · ${receipt.summary.MISSING} MISSING · ${receipt.summary.WARNING} WARNING · ${receipt.summary.reviewed}/${receipt.summary.total} ${french ? "décisions enregistrées" : "decisions recorded"}`,
    "",
    `## ${french ? "Résultats et décisions" : "Outcomes and decisions"}`,
    "",
    `| ${french ? "Référence" : "Reference"} | ${french ? "ID technique" : "Technical ID"} | ${french ? "Contrôle" : "Control"} | ${french ? "Conclusion" : "Conclusion"} | ${french ? "Décision" : "Decision"} | ${french ? "Commentaire" : "Comment"} |`,
    "| --- | --- | --- | --- | --- | --- |",
    ...receipt.outcomes.map((outcome) => `| ${outcome.displayReference} | ${outcome.controlId} | ${markdownCell(outcome.title)} | ${outcome.status} | ${outcome.reviewerDecision} | ${markdownCell(outcome.reviewerComment || (french ? "Aucun" : "None"))} |`),
    "",
    `> ${receipt.disclaimer}`,
    "",
  ];
  return lines.join("\n");
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function serializeEvidenceMatrixCsv(input: { caseName: string; results: ControlResult[]; locale: "en" | "fr" }): string {
  const french = input.locale === "fr";
  const headers = french
    ? ["Cas", "Référence du contrôle", "ID technique du contrôle", "Titre du contrôle", "Statut", "Gravité", "Type de preuve", "Document", "Localisation", "Extrait exact", "Décision du réviseur", "Commentaire du réviseur"]
    : ["Case", "Control reference", "Technical control ID", "Control title", "Status", "Severity", "Evidence type", "Document", "Locator", "Exact excerpt", "Reviewer decision", "Reviewer comment"];
  const rows: Array<Array<string | number>> = [];
  for (const result of input.results) {
    const reference = resolveControlReference(result.controlId);
    const common = [input.caseName, reference.displayReference, reference.controlId, result.title, result.status, result.severity];
    for (const evidence of result.supportingEvidence) rows.push([...common, "SUPPORTING", `${evidence.documentId}: ${evidence.documentTitle}`, evidence.locator, evidence.excerpt, result.reviewerDecision.state, result.reviewerDecision.comment]);
    for (const evidence of result.contradictoryEvidence) rows.push([...common, "CONTRADICTORY", `${evidence.documentId}: ${evidence.documentTitle}`, evidence.locator, evidence.excerpt, result.reviewerDecision.state, result.reviewerDecision.comment]);
    for (const missing of result.missingEvidence) rows.push([...common, "MISSING", missing.expectedSource, "", missing.description, result.reviewerDecision.state, result.reviewerDecision.comment]);
    if (!result.supportingEvidence.length && !result.contradictoryEvidence.length && !result.missingEvidence.length) rows.push([...common, "NONE", "", "", "", result.reviewerDecision.state, result.reviewerDecision.comment]);
  }
  return `\uFEFF${[headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")}\r\n`;
}
