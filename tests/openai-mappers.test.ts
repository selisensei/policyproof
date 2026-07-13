import { describe, expect, it } from "vitest";
import type { AiControlProposal, CaseAnalysis } from "@/src/domain/ai-schemas";
import type { LocalDocument } from "@/src/lib/local-documents";
import { toCaseDocuments, toDeterministicControls } from "@/src/openai/mappers";

const baseProposal: AiControlProposal = {
  id: "CTRL-CURRENCY",
  title: "Currency consistency",
  description: "Compare document currencies.",
  condition: "Currencies must match.",
  requiredEvidence: ["Purchase order", "Invoice"],
  severity: "HIGH",
  controlType: "CURRENCY_MATCH",
  enabled: true,
  deterministicParameters: {
    thresholdAmount: null,
    currency: null,
    requiredApprovers: null,
  },
  semanticReviewQuestion: null,
};

describe("OpenAI-to-deterministic mappers", () => {
  it("maps supported proposals and excludes semantic-only controls", () => {
    const semantic: AiControlProposal = {
      ...baseProposal,
      id: "CTRL-SEMANTIC",
      controlType: "SEMANTIC_REVIEW",
      semanticReviewQuestion: "Is the business rationale reasonable?",
    };
    const controls = toDeterministicControls([baseProposal, semantic]);
    expect(controls).toHaveLength(1);
    expect(controls[0]).toMatchObject({ id: "CTRL-CURRENCY", kind: "CURRENCY_MATCH", enabled: true });
  });

  it("converts extracted evidence into a validated case document with metadata", () => {
    const sources: LocalDocument[] = [
      {
        id: "LOCAL-1",
        name: "invoice.txt",
        label: "Supplier invoice",
        format: "TEXT",
        inferredType: "INVOICE",
        size: 31,
        content: "Invoice amount: 12,480 USD.",
      },
    ];
    const analysis: CaseAnalysis = {
      documentFindings: [
        {
          documentIdentifier: "LOCAL-1",
          documentName: "invoice.txt",
          documentType: "INVOICE",
          evidence: [
            {
              id: "FACT-INVOICE-CURRENCY",
              factKey: "invoiceCurrency",
              factValue: "USD",
              documentIdentifier: "LOCAL-1",
              documentName: "invoice.txt",
              pageOrSection: "Invoice total",
              exactExcerpt: "Invoice amount: 12,480 USD.",
              evidenceType: "CONTEXT",
              confidence: 0.98,
              relationToControl: "CTRL-CURRENCY",
            },
          ],
        },
      ],
    };

    const documents = toCaseDocuments(analysis, sources);
    expect(documents[0].facts[0]).toMatchObject({
      key: "invoiceCurrency",
      value: "USD",
      confidence: 0.98,
      relationToControl: "CTRL-CURRENCY",
    });
  });
});
