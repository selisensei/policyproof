import type OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  CaseAnalysisRequestSchema,
  CaseAnalysisSchema,
  type CaseAnalysis,
  type CaseAnalysisRequest,
} from "@/src/domain/ai-schemas";
import { OPENAI_MODEL, OPENAI_REASONING_EFFORT, OPENAI_REQUEST_TIMEOUT_MS } from "@/src/openai/config";
import { OpenAIIntegrationError } from "@/src/openai/errors";

const CASE_ANALYZER_INSTRUCTIONS = `Extract facts and exact evidence from fictional business case documents.
Return only structured output. Never approve a payment or issue legal or compliance certification.
Use these factKey values when supported by the source: supplierName, purchaseOrderAmount,
purchaseOrderCurrency, purchaseOrderDate, invoiceAmount, invoiceCurrency, invoiceDate,
deliveryEvidenceExists, deliveryDate, initiator, approvers, bankDetailsChanged,
independentBankVerificationExists. Encode amounts as decimal strings, booleans as true or false,
and approvers as a JSON string array. Exact excerpts must appear verbatim in the source document.
Do not invent missing evidence; omit the fact and let deterministic code report it as unavailable.`;

export async function analyzeCaseWithOpenAI(
  client: OpenAI,
  requestInput: CaseAnalysisRequest,
): Promise<CaseAnalysis> {
  const request = CaseAnalysisRequestSchema.parse(requestInput);
  const response = await client.responses.parse(
    {
      model: OPENAI_MODEL,
      reasoning: { effort: OPENAI_REASONING_EFFORT },
      instructions: CASE_ANALYZER_INSTRUCTIONS,
      input: JSON.stringify(request),
      store: false,
      text: { format: zodTextFormat(CaseAnalysisSchema, "case_analysis") },
    },
    { timeout: OPENAI_REQUEST_TIMEOUT_MS },
  );

  if (!response.output_parsed) {
    throw new OpenAIIntegrationError("GPT-5.6 returned no validated case analysis.");
  }

  const analysis = CaseAnalysisSchema.parse(response.output_parsed);
  for (const finding of analysis.documentFindings) {
    const source = request.documents.find((document) => document.id === finding.documentIdentifier);
    if (!source) throw new OpenAIIntegrationError(`Unknown document reference: ${finding.documentIdentifier}.`);
    for (const item of finding.evidence) {
      if (!source.content.includes(item.exactExcerpt)) {
        throw new OpenAIIntegrationError(`Evidence excerpt ${item.id} is not present in ${source.name}.`);
      }
    }
  }

  return analysis;
}
