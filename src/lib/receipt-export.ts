import type { DecisionReceipt } from "@/src/lib/decision-receipt";

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
    `# PolicyProof — ${french ? "Reçu de décision" : "Decision receipt"}`,
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
    `| ${french ? "Contrôle" : "Control"} | ${french ? "Conclusion" : "Conclusion"} | ${french ? "Décision" : "Decision"} | ${french ? "Commentaire" : "Comment"} |`,
    "| --- | --- | --- | --- |",
    ...receipt.outcomes.map((outcome) => `| ${markdownCell(outcome.title)} (${outcome.controlId}) | ${outcome.status} | ${outcome.reviewerDecision} | ${markdownCell(outcome.reviewerComment || "—")} |`),
    "",
    `> ${receipt.disclaimer}`,
    "",
  ];
  return lines.join("\n");
}
