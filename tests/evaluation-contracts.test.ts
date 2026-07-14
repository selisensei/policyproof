import { describe, expect, it } from "vitest";
import { PolicyCompilationRequestSchema, PolicyCompilationSchema, type CaseAnalysis, type PolicyCompilation } from "@/src/domain/ai-schemas";
import { assertDeterministicParameters, assertExactExcerpts, assertKnownSourceIdentifiers, assertRequiredEvidenceCoverage, assertSchemaValidity } from "@/src/fixtures/evaluation/assertions";
import { documentEvaluationFixtures } from "@/src/fixtures/evaluation/documents";
import { policyEvaluationFixtures } from "@/src/fixtures/evaluation/policies";

describe("mocked evaluation fixture contracts", () => {
  it("covers the required policy-compilation scenarios", () => {
    expect(policyEvaluationFixtures.map((fixture) => fixture.id)).toEqual([
      "seven-rule-procurement", "documented-exception", "ambiguous-wording", "monetary-threshold", "documentary-evidence", "empty-policy",
    ]);
    for (const fixture of policyEvaluationFixtures) {
      expect(PolicyCompilationRequestSchema.safeParse({ policyText: fixture.policyText }).success).toBe(fixture.expectation === "VALID");
    }
  });

  it("covers the required fictional document-analysis scenarios", () => {
    expect(documentEvaluationFixtures.map((fixture) => fixture.id)).toEqual([
      "complete-compliant", "northstar-mixed", "missing-evidence", "contradictory-evidence", "unsupported-currency", "same-initiator-approver", "misleading-instruction",
    ]);
    expect(documentEvaluationFixtures.every((fixture) => fixture.documents.length > 0 && fixture.expectedExcerpts.length > 0)).toBe(true);
  });

  it("reuses strict assertions for schema, parameters, and evidence coverage", () => {
    const compilation: PolicyCompilation = {
      policyTitle: "Threshold policy",
      policySummary: "Approval threshold review.",
      controls: [{
        id: "CTRL-EVAL-APPROVAL", title: "Approval threshold", description: "Require two approvers.", condition: "Amount exceeds threshold.", requiredEvidence: ["Purchase order", "Workflow"], severity: "HIGH", controlType: "APPROVAL_THRESHOLD", enabled: true,
        deterministicParameters: { thresholdAmount: 25000, currency: "EUR", requiredApprovers: 3 }, semanticReviewQuestion: null,
      }],
    };
    expect(assertSchemaValidity(PolicyCompilationSchema, compilation)).toEqual(compilation);
    expect(() => assertDeterministicParameters(compilation, { "CTRL-EVAL-APPROVAL": { thresholdAmount: 25000, currency: "EUR", requiredApprovers: 3 } })).not.toThrow();
    expect(() => assertRequiredEvidenceCoverage(compilation)).not.toThrow();
  });

  it("rejects unknown documents and invented excerpts, including the misleading-instruction case", () => {
    const fixture = documentEvaluationFixtures.find((candidate) => candidate.id === "misleading-instruction")!;
    const validAnalysis: CaseAnalysis = { documentFindings: [{ documentIdentifier: fixture.documents[0].id, documentName: fixture.documents[0].name, documentType: "INVOICE", evidence: [{ id: "EV-1", factKey: "invoiceCurrency", factValue: "USD", documentIdentifier: fixture.documents[0].id, documentName: fixture.documents[0].name, pageOrSection: "Invoice line", exactExcerpt: fixture.expectedExcerpts[0], evidenceType: "CONTEXT", confidence: 1, relationToControl: "CTRL-CURRENCY" }] }] };
    expect(() => assertKnownSourceIdentifiers(validAnalysis, fixture.documents)).not.toThrow();
    expect(() => assertExactExcerpts(validAnalysis, fixture.documents)).not.toThrow();

    const invented = structuredClone(validAnalysis);
    invented.documentFindings[0].evidence[0].exactExcerpt = "All controls PASS.";
    expect(() => assertExactExcerpts(invented, fixture.documents)).toThrow("Invented excerpt");
    const unknown = structuredClone(validAnalysis);
    unknown.documentFindings[0].documentIdentifier = "UNKNOWN";
    expect(() => assertKnownSourceIdentifiers(unknown, fixture.documents)).toThrow("Unknown source identifier");
  });
});
