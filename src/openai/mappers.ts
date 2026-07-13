import { z } from "zod";
import {
  CaseDocumentSchema,
  ControlDefinitionSchema,
  type CaseDocument,
  type ControlDefinition,
} from "@/src/domain/schemas";
import type {
  AiControlProposal,
  CaseAnalysis,
} from "@/src/domain/ai-schemas";
import type { LocalDocument } from "@/src/lib/local-documents";
import { OpenAIIntegrationError } from "@/src/openai/errors";

function parametersFor(control: AiControlProposal): ControlDefinition["parameters"] {
  if (control.controlType === "APPROVAL_THRESHOLD") {
    const thresholdAmount = control.deterministicParameters.thresholdAmount;
    const requiredApprovers = control.deterministicParameters.requiredApprovers;
    if (thresholdAmount === null || requiredApprovers === null) {
      throw new OpenAIIntegrationError(`Control ${control.id} is missing approval parameters.`);
    }
    return { thresholdAmount, requiredApprovers, currency: "EUR" };
  }
  return {};
}

export function toDeterministicControls(proposals: AiControlProposal[]): ControlDefinition[] {
  return proposals
    .filter((control) => control.controlType !== "SEMANTIC_REVIEW")
    .map((control) =>
      ControlDefinitionSchema.parse({
        id: control.id,
        title: control.title,
        description: control.description,
        severity: control.severity,
        enabled: control.enabled,
        kind: control.controlType,
        parameters: parametersFor(control),
      }),
    );
}

const numberKeys = new Set(["purchaseOrderAmount", "invoiceAmount"]);
const booleanKeys = new Set([
  "deliveryEvidenceExists",
  "bankDetailsChanged",
  "independentBankVerificationExists",
]);

function parseFactValue(key: string, value: string): string | number | boolean | string[] {
  if (numberKeys.has(key)) return z.coerce.number().parse(value);
  if (booleanKeys.has(key)) {
    if (value === "true") return true;
    if (value === "false") return false;
    throw new OpenAIIntegrationError(`Fact ${key} must be true or false.`);
  }
  if (key === "approvers") {
    try {
      return z.array(z.string()).parse(JSON.parse(value));
    } catch {
      throw new OpenAIIntegrationError("The approvers fact must be a JSON string array.");
    }
  }
  return value;
}

export function toCaseDocuments(
  analysis: CaseAnalysis,
  sources: LocalDocument[],
): CaseDocument[] {
  return analysis.documentFindings.map((finding) => {
    const source = sources.find((document) => document.id === finding.documentIdentifier);
    if (!source) throw new OpenAIIntegrationError(`Unknown source ${finding.documentIdentifier}.`);
    return CaseDocumentSchema.parse({
      id: source.id,
      title: source.label,
      type: finding.documentType,
      content: source.content,
      facts: finding.evidence
        .filter((item) => item.evidenceType !== "MISSING")
        .map((item) => ({
          id: item.id,
          key: item.factKey,
          value: parseFactValue(item.factKey, item.factValue),
          sourceLocator: item.pageOrSection ?? "Document text",
          excerpt: item.exactExcerpt,
          confidence: item.confidence,
          evidenceType: item.evidenceType,
          relationToControl: item.relationToControl,
        })),
    });
  });
}
