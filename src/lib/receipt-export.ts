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
