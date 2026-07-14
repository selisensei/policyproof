import { z } from "zod";
import {
  CaseAnalysisRequestSchema,
  CaseAnalysisSchema,
  PolicyCompilationSchema,
  type AiControlProposal,
  type CaseAnalysisRequest,
  type PolicyCompilation,
} from "@/src/domain/ai-schemas";
import type { ControlResult } from "@/src/domain/schemas";
import { summarizeResults } from "@/src/lib/review-summary";
import { runDeterministicReview } from "@/src/lib/review-engine";
import { toCaseDocuments, toDeterministicControls } from "@/src/openai/mappers";

const ApiCaseAnalysisResponseSchema = z.object({ analysis: CaseAnalysisSchema }).strict();

export const LiveAnalysisArtifactSchema = z.object({
  version: z.literal(1),
  capturedAt: z.iso.datetime(),
  endpoint: z.literal("/api/ai/analyze"),
  httpStatus: z.literal(200),
  latencyMs: z.number().int().nonnegative(),
  response: ApiCaseAnalysisResponseSchema,
}).strict();

export type LiveAnalysisArtifact = z.infer<typeof LiveAnalysisArtifactSchema>;

type LiveValidationFixture = {
  compilation: unknown;
  approvedControlIds: unknown;
  documents: unknown;
};

const expectedStatuses: Record<AiControlProposal["controlType"], ControlResult["status"] | null> = {
  APPROVAL_THRESHOLD: "FAIL",
  PO_BEFORE_INVOICE: "PASS",
  AMOUNT_MATCH: "PASS",
  CURRENCY_MATCH: "FAIL",
  DELIVERY_EVIDENCE: "PASS",
  BANK_CHANGE_VERIFICATION: "MISSING",
  SEGREGATION_OF_DUTIES: "WARNING",
  SEMANTIC_REVIEW: null,
};

const requiredFactValues: Record<string, (value: string) => boolean> = {
  purchaseOrderAmount: (value) => Number(value) === 12_480,
  purchaseOrderCurrency: (value) => value === "EUR",
  purchaseOrderDate: (value) => value === "2026-07-03",
  invoiceAmount: (value) => Number(value) === 12_480,
  invoiceCurrency: (value) => value === "USD",
  invoiceDate: (value) => value === "2026-07-05",
  deliveryEvidenceExists: (value) => value === "true",
  initiator: (value) => value === "Emma Reed",
  approvers: (value) => {
    try {
      const approvers = z.array(z.string()).parse(JSON.parse(value));
      return approvers.length === 1 && approvers[0] === "Emma Reed";
    } catch {
      return false;
    }
  },
  bankDetailsChanged: (value) => value === "true",
  independentBankVerificationExists: (value) => value === "false",
};

const relationPatterns: Record<string, RegExp> = {
  supplierName: /supplier/i,
  purchaseOrderAmount: /approval|threshold|amount/i,
  purchaseOrderCurrency: /approval|threshold|currency/i,
  purchaseOrderDate: /purchase order|invoice|date/i,
  invoiceAmount: /invoice|purchase order|amount/i,
  invoiceCurrency: /invoice|purchase order|currency|conflict/i,
  invoiceDate: /invoice|purchase order|date/i,
  deliveryEvidenceExists: /delivery|evidence/i,
  deliveryDate: /delivery|date/i,
  initiator: /initiator|segregation|duties/i,
  approvers: /approver|initiator|approval/i,
  bankDetailsChanged: /bank|change|verification/i,
  independentBankVerificationExists: /bank|change|verification|evidence/i,
};

function requireCondition(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

export function createApprovedLiveRequest(fixtureInput: LiveValidationFixture): {
  compilation: PolicyCompilation;
  request: CaseAnalysisRequest;
} {
  const compilation = PolicyCompilationSchema.parse(fixtureInput.compilation);
  const approvedControlIds = z.array(z.string()).length(7).parse(fixtureInput.approvedControlIds);
  const approvedIds = new Set(approvedControlIds);
  requireCondition(new Set(approvedControlIds).size === approvedControlIds.length, "Approved control identifiers must be unique.");
  requireCondition(compilation.controls.every((control) => approvedIds.has(control.id)), "Every compiled control must have explicit human approval.");

  const controls = compilation.controls.map((control) => ({ ...control, enabled: approvedIds.has(control.id) }));
  return {
    compilation,
    request: CaseAnalysisRequestSchema.parse({ documents: fixtureInput.documents, controls }),
  };
}

export function parseLiveAnalysisArtifact(serialized: string): LiveAnalysisArtifact {
  return LiveAnalysisArtifactSchema.parse(JSON.parse(serialized));
}

function validateEvidence(artifact: LiveAnalysisArtifact, request: CaseAnalysisRequest) {
  const analysis = artifact.response.analysis;
  const sourceById = new Map(request.documents.map((document) => [document.id, document]));
  const controlReferences = request.controls.flatMap((control) => [control.id, control.title, control.controlType])
    .map((reference) => reference.toLocaleLowerCase("en-US"));
  const seenDocumentIds = new Set<string>();
  const seenEvidenceIds = new Set<string>();
  const facts = new Map<string, string[]>();
  let evidenceCount = 0;

  requireCondition(analysis.documentFindings.length === request.documents.length, "The analysis must contain exactly one finding for every submitted document.");
  for (const finding of analysis.documentFindings) {
    const source = sourceById.get(finding.documentIdentifier);
    requireCondition(source, `Unknown document identifier: ${finding.documentIdentifier}.`);
    requireCondition(!seenDocumentIds.has(finding.documentIdentifier), `Duplicate document finding: ${finding.documentIdentifier}.`);
    seenDocumentIds.add(finding.documentIdentifier);
    requireCondition(finding.documentName === source.name, `Document name mismatch for ${finding.documentIdentifier}.`);
    requireCondition(finding.documentType === source.inferredType, `Document type mismatch for ${finding.documentIdentifier}.`);

    for (const item of finding.evidence) {
      evidenceCount += 1;
      requireCondition(!seenEvidenceIds.has(item.id), `Duplicate evidence identifier: ${item.id}.`);
      seenEvidenceIds.add(item.id);
      requireCondition(item.documentIdentifier === finding.documentIdentifier, `Evidence ${item.id} points outside its document finding.`);
      requireCondition(item.documentName === source.name, `Evidence ${item.id} has an incorrect document name.`);
      requireCondition(source.content.includes(item.exactExcerpt), `Invented excerpt: ${item.id}.`);
      requireCondition(
        item.pageOrSection === null
          || item.pageOrSection === "Document text"
          || source.content.includes(item.pageOrSection),
        `Unsupported source locator: ${item.id}.`,
      );
      const relation = item.relationToControl.toLocaleLowerCase("en-US");
      const knownControlNamed = controlReferences.some((reference) => relation.includes(reference));
      const relationPattern = relationPatterns[item.factKey];
      requireCondition(
        knownControlNamed || Boolean(relationPattern?.test(item.relationToControl)),
        `Unsupported control relation: ${item.relationToControl}.`,
      );
      const values = facts.get(item.factKey) ?? [];
      values.push(item.factValue);
      facts.set(item.factKey, values);
    }
  }

  for (const document of request.documents) {
    requireCondition(seenDocumentIds.has(document.id), `Missing document finding: ${document.id}.`);
  }
  for (const [factKey, validate] of Object.entries(requiredFactValues)) {
    const values = facts.get(factKey) ?? [];
    requireCondition(values.length > 0, `Missing required fact: ${factKey}.`);
    requireCondition(values.every(validate), `Unexpected value for required fact: ${factKey}.`);
  }

  return { evidenceCount, factKeys: [...facts.keys()].sort() };
}

export function validateAndRunLivePipeline(
  artifactInput: unknown,
  fixtureInput: LiveValidationFixture,
) {
  const artifact = LiveAnalysisArtifactSchema.parse(artifactInput);
  const { compilation, request } = createApprovedLiveRequest(fixtureInput);
  const evidence = validateEvidence(artifact, request);
  const deterministicControls = toDeterministicControls(request.controls);
  requireCondition(deterministicControls.length === 7, "Exactly seven deterministic controls are required.");
  const documents = toCaseDocuments(artifact.response.analysis, request.documents);
  const results = runDeterministicReview(deterministicControls, documents);
  requireCondition(results.length === 7, "Exactly seven deterministic results are required.");

  for (const control of request.controls) {
    const expected = expectedStatuses[control.controlType];
    requireCondition(expected, `Unsupported control type in final live validation: ${control.controlType}.`);
    const result = results.find((candidate) => candidate.controlId === control.id);
    requireCondition(result, `Missing deterministic result for ${control.id}.`);
    requireCondition(result.status === expected, `Unexpected status for ${control.id}: expected ${expected}, received ${result.status}.`);
  }

  const summary = summarizeResults(results);
  requireCondition(
    summary.PASS === 3 && summary.FAIL === 2 && summary.MISSING === 1 && summary.WARNING === 1,
    "The final status summary must be 3 PASS, 2 FAIL, 1 MISSING, and 1 WARNING.",
  );

  return { artifact, compilation, request, evidence, documents, results, summary };
}
