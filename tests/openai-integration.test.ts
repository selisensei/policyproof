import type OpenAI from "openai";
import { describe, expect, it, vi } from "vitest";
import {
  AiEvidenceReferenceSchema,
  PolicyCompilationSchema,
  type AiControlProposal,
  type CaseAnalysisRequest,
  type PolicyCompilation,
} from "@/src/domain/ai-schemas";
import { createCaseAnalysisHandler, createPolicyCompilationHandler } from "@/src/openai/api-handlers";
import { analyzeCaseWithOpenAI } from "@/src/openai/case-analyzer";
import { OPENAI_MODEL } from "@/src/openai/config";
import { compilePolicyWithOpenAI } from "@/src/openai/policy-compiler";

const proposedControl: AiControlProposal = {
  id: "CTRL-001",
  title: "Invoice currency",
  description: "Compare invoice and purchase order currencies.",
  condition: "The currencies must match.",
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

const compilation: PolicyCompilation = {
  policyTitle: "Procurement policy",
  policySummary: "Review purchasing and vendor changes.",
  controls: [proposedControl],
};

const caseRequest: CaseAnalysisRequest = {
  documents: [
    {
      id: "LOCAL-1",
      name: "invoice.txt",
      label: "Invoice",
      format: "TEXT",
      inferredType: "INVOICE",
      size: 31,
      content: "Invoice amount: 12,480 USD.",
    },
  ],
  controls: [proposedControl],
};

function mockClient(outputParsed: unknown): OpenAI {
  return {
    responses: {
      parse: vi.fn().mockResolvedValue({ output_parsed: outputParsed }),
    },
  } as unknown as OpenAI;
}

describe("OpenAI structured integration", () => {
  it("validates a successful mocked policy compilation", async () => {
    const client = mockClient(compilation);
    const result = await compilePolicyWithOpenAI(
      client,
      "Two business documents must use the same currency before a payment review can continue.",
    );
    expect(result).toEqual(compilation);
    expect(client.responses.parse).toHaveBeenCalledWith(
      expect.objectContaining({ model: OPENAI_MODEL, store: false }),
      expect.objectContaining({ timeout: 30_000 }),
    );
  });

  it("rejects malformed structured policy output", async () => {
    const client = mockClient({ policyTitle: "Missing controls" });
    await expect(
      compilePolicyWithOpenAI(
        client,
        "Two business documents must use the same currency before a payment review can continue.",
      ),
    ).rejects.toThrow();
    expect(PolicyCompilationSchema.safeParse({ policyTitle: "Missing controls" }).success).toBe(false);
  });

  it("validates evidence-reference confidence and exact excerpt fields", () => {
    expect(
      AiEvidenceReferenceSchema.safeParse({
        id: "E-1",
        factKey: "invoiceCurrency",
        factValue: "USD",
        documentIdentifier: "LOCAL-1",
        documentName: "invoice.txt",
        pageOrSection: "Invoice total",
        exactExcerpt: "Invoice amount: 12,480 USD.",
        evidenceType: "CONTRADICTORY",
        confidence: 1.2,
        relationToControl: "CTRL-001",
      }).success,
    ).toBe(false);
  });

  it("accepts a mocked case extraction only when excerpts exist in source content", async () => {
    const validAnalysis = {
      documentFindings: [
        {
          documentIdentifier: "LOCAL-1",
          documentName: "invoice.txt",
          documentType: "INVOICE",
          evidence: [
            {
              id: "E-1",
              factKey: "invoiceCurrency",
              factValue: "USD",
              documentIdentifier: "LOCAL-1",
              documentName: "invoice.txt",
              pageOrSection: "Invoice total",
              exactExcerpt: "Invoice amount: 12,480 USD.",
              evidenceType: "CONTEXT",
              confidence: 0.99,
              relationToControl: "CTRL-001",
            },
          ],
        },
      ],
    };
    await expect(analyzeCaseWithOpenAI(mockClient(validAnalysis), caseRequest)).resolves.toEqual(validAnalysis);

    const invalidAnalysis = structuredClone(validAnalysis);
    invalidAnalysis.documentFindings[0].evidence[0].exactExcerpt = "Invented excerpt";
    await expect(analyzeCaseWithOpenAI(mockClient(invalidAnalysis), caseRequest)).rejects.toThrow(
      "is not present",
    );
  });
});

describe("OpenAI API handlers", () => {
  it("fails safely when OPENAI_API_KEY is unavailable", async () => {
    const handler = createPolicyCompilationHandler({
      isConfigured: () => false,
      compile: vi.fn(),
    });
    const response = await handler(
      new Request("http://localhost/api/ai/policy", { method: "POST", body: "{}" }),
    );
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toMatchObject({ error: { code: "AI_NOT_CONFIGURED" } });
  });

  it("returns a validation error for malformed policy requests", async () => {
    const handler = createPolicyCompilationHandler({
      isConfigured: () => true,
      compile: vi.fn(),
    });
    const response = await handler(
      new Request("http://localhost/api/ai/policy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ policyText: "too short" }),
      }),
    );
    expect(response.status).toBe(400);
  });

  it("returns a successful mocked compilation without exposing configuration", async () => {
    const handler = createPolicyCompilationHandler({
      isConfigured: () => true,
      compile: vi.fn().mockResolvedValue(compilation),
    });
    const response = await handler(
      new Request("http://localhost/api/ai/policy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          policyText:
            "Two business documents must use the same currency before a payment review can continue.",
        }),
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ compilation });
  });

  it("converts OpenAI failures into a safe user-facing error", async () => {
    const handler = createCaseAnalysisHandler({
      isConfigured: () => true,
      analyze: vi.fn().mockRejectedValue(new Error("provider detail must not escape")),
    });
    const response = await handler(
      new Request("http://localhost/api/ai/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(caseRequest),
      }),
    );
    expect(response.status).toBe(502);
    const body = await response.json();
    expect(body).toMatchObject({ error: { code: "AI_REQUEST_FAILED" } });
    expect(JSON.stringify(body)).not.toContain("provider detail");
  });
});
