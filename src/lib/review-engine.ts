import {
  CaseDocumentSchema,
  ControlDefinitionSchema,
  ControlResultListSchema,
  type CaseDocument,
  type ControlDefinition,
  type ControlResult,
  type EvidenceReference,
  type ExtractedFact,
} from "@/src/domain/schemas";
import { z } from "zod";

const pendingDecision = { state: "PENDING" as const, comment: "" };

type LocatedFact = { document: CaseDocument; fact: ExtractedFact };

function findFact(documents: CaseDocument[], key: string): LocatedFact {
  for (const document of documents) {
    const fact = document.facts.find((candidate) => candidate.key === key);
    if (fact) {
      if (!document.content.includes(fact.excerpt)) {
        throw new Error(`Evidence excerpt for ${fact.id} is not present in ${document.id}.`);
      }
      return { document, fact };
    }
  }
  throw new Error(`Required fixture fact '${key}' was not found.`);
}

function evidence({ document, fact }: LocatedFact): EvidenceReference {
  return {
    id: `EVIDENCE-${fact.id}`,
    documentId: document.id,
    documentTitle: document.title,
    factId: fact.id,
    locator: fact.sourceLocator,
    excerpt: fact.excerpt,
    confidence: fact.confidence ?? 1,
    evidenceType: fact.evidenceType ?? "CONTEXT",
    relationToControl: fact.relationToControl ?? null,
  };
}

function numberValue(located: LocatedFact): number {
  return z.number().parse(located.fact.value);
}

function stringValue(located: LocatedFact): string {
  return z.string().parse(located.fact.value);
}

function booleanValue(located: LocatedFact): boolean {
  return z.boolean().parse(located.fact.value);
}

function stringArrayValue(located: LocatedFact): string[] {
  return z.array(z.string()).parse(located.fact.value);
}

function result(
  control: ControlDefinition,
  fields: Omit<ControlResult, "controlId" | "title" | "severity" | "reviewerDecision">,
): ControlResult {
  return {
    controlId: control.id,
    title: control.title,
    severity: control.severity,
    reviewerDecision: pendingDecision,
    ...fields,
  };
}

function evaluateControl(control: ControlDefinition, documents: CaseDocument[]): ControlResult {
  switch (control.kind) {
    case "APPROVAL_THRESHOLD": {
      const amount = findFact(documents, "purchaseOrderAmount");
      const approvers = findFact(documents, "approvers");
      const amountValue = numberValue(amount);
      const distinctApprovers = new Set(stringArrayValue(approvers)).size;
      const thresholdExceeded = amountValue > control.parameters.thresholdAmount;
      const approvalSatisfied = !thresholdExceeded || distinctApprovers >= control.parameters.requiredApprovers;

      return result(control, {
        status: approvalSatisfied ? "PASS" : "FAIL",
        explanation: approvalSatisfied
          ? thresholdExceeded
            ? `${distinctApprovers} distinct approvers satisfy the requirement for an amount above EUR ${control.parameters.thresholdAmount.toLocaleString("en-US")}.`
            : `The EUR ${amountValue.toLocaleString("en-US")} transaction does not exceed the EUR ${control.parameters.thresholdAmount.toLocaleString("en-US")} approval threshold.`
          : `The EUR ${amountValue.toLocaleString("en-US")} transaction exceeds the threshold, but only ${distinctApprovers} distinct approver is recorded; ${control.parameters.requiredApprovers} are required.`,
        supportingEvidence: [evidence(amount)],
        contradictoryEvidence: approvalSatisfied ? [] : [evidence(approvers)],
        missingEvidence: [],
      });
    }

    case "PO_BEFORE_INVOICE": {
      const purchaseOrderDate = findFact(documents, "purchaseOrderDate");
      const invoiceDate = findFact(documents, "invoiceDate");
      const valid = stringValue(purchaseOrderDate) < stringValue(invoiceDate);
      return result(control, {
        status: valid ? "PASS" : "FAIL",
        explanation: valid
          ? `The purchase order dated ${stringValue(purchaseOrderDate)} predates the invoice dated ${stringValue(invoiceDate)}.`
          : `The purchase order does not predate the invoice.`,
        supportingEvidence: valid ? [evidence(purchaseOrderDate), evidence(invoiceDate)] : [],
        contradictoryEvidence: valid ? [] : [evidence(purchaseOrderDate), evidence(invoiceDate)],
        missingEvidence: [],
      });
    }

    case "AMOUNT_MATCH": {
      const purchaseOrderAmount = findFact(documents, "purchaseOrderAmount");
      const invoiceAmount = findFact(documents, "invoiceAmount");
      const valid = numberValue(purchaseOrderAmount) === numberValue(invoiceAmount);
      return result(control, {
        status: valid ? "PASS" : "FAIL",
        explanation: valid
          ? `The purchase order and invoice amounts both equal ${numberValue(purchaseOrderAmount).toLocaleString("en-US")}.`
          : `The purchase order amount ${numberValue(purchaseOrderAmount).toLocaleString("en-US")} does not match the invoice amount ${numberValue(invoiceAmount).toLocaleString("en-US")}.`,
        supportingEvidence: valid ? [evidence(purchaseOrderAmount), evidence(invoiceAmount)] : [],
        contradictoryEvidence: valid ? [] : [evidence(purchaseOrderAmount), evidence(invoiceAmount)],
        missingEvidence: [],
      });
    }

    case "CURRENCY_MATCH": {
      const purchaseOrderCurrency = findFact(documents, "purchaseOrderCurrency");
      const invoiceCurrency = findFact(documents, "invoiceCurrency");
      const valid = stringValue(purchaseOrderCurrency) === stringValue(invoiceCurrency);
      return result(control, {
        status: valid ? "PASS" : "FAIL",
        explanation: valid
          ? `Both documents use ${stringValue(purchaseOrderCurrency)}.`
          : `The purchase order uses ${stringValue(purchaseOrderCurrency)}, while the invoice uses ${stringValue(invoiceCurrency)}.`,
        supportingEvidence: valid ? [evidence(purchaseOrderCurrency), evidence(invoiceCurrency)] : [],
        contradictoryEvidence: valid
          ? []
          : [evidence(purchaseOrderCurrency), evidence(invoiceCurrency)],
        missingEvidence: [],
      });
    }

    case "DELIVERY_EVIDENCE": {
      const deliveryEvidence = findFact(documents, "deliveryEvidenceExists");
      const exists = booleanValue(deliveryEvidence);
      return result(control, {
        status: exists ? "PASS" : "MISSING",
        explanation: exists
          ? "A dated delivery note is present in the case file."
          : "No delivery evidence is present in the case file.",
        supportingEvidence: exists ? [evidence(deliveryEvidence)] : [],
        contradictoryEvidence: [],
        missingEvidence: exists
          ? []
          : [{ description: "Delivery evidence is required.", expectedSource: "Delivery note" }],
      });
    }

    case "BANK_CHANGE_VERIFICATION": {
      const bankChanged = findFact(documents, "bankDetailsChanged");
      const verification = findFact(documents, "independentBankVerificationExists");
      const changeRequiresVerification = booleanValue(bankChanged);
      const verificationExists = booleanValue(verification);
      const valid = !changeRequiresVerification || verificationExists;
      return result(control, {
        status: valid ? "PASS" : "MISSING",
        explanation: valid
          ? "No unverified bank-details change is present."
          : "Bank details changed, but no independent verification evidence is available.",
        supportingEvidence: [evidence(bankChanged)],
        contradictoryEvidence: [],
        missingEvidence: valid
          ? []
          : [
              {
                description: "Independent verification of the new bank details is required.",
                expectedSource: "Bank verification record or call-back log",
              },
            ],
      });
    }

    case "SEGREGATION_OF_DUTIES": {
      const initiator = findFact(documents, "initiator");
      const approvers = findFact(documents, "approvers");
      const initiatorName = stringValue(initiator);
      const samePerson = stringArrayValue(approvers).includes(initiatorName);
      return result(control, {
        status: samePerson ? "WARNING" : "PASS",
        explanation: samePerson
          ? `${initiatorName} is recorded as both initiator and approver. Human review is required.`
          : "The initiator is not listed among the approvers.",
        supportingEvidence: samePerson ? [] : [evidence(initiator), evidence(approvers)],
        contradictoryEvidence: samePerson ? [evidence(initiator), evidence(approvers)] : [],
        missingEvidence: [],
      });
    }
  }
}

export function runDeterministicReview(
  controlsInput: ControlDefinition[],
  documentsInput: CaseDocument[],
): ControlResult[] {
  const controls = z.array(ControlDefinitionSchema).parse(controlsInput);
  const documents = z.array(CaseDocumentSchema).parse(documentsInput);
  return ControlResultListSchema.parse(
    controls.filter((control) => control.enabled).map((control) => evaluateControl(control, documents)),
  );
}
