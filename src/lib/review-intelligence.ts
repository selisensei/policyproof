import type { CaseDocument, ControlResult } from "@/src/domain/schemas";
import type { ResultSummary } from "@/src/lib/review-summary";

export const outcomeOrder = ["PASS", "FAIL", "MISSING", "WARNING"] as const;

export type OutcomeSegment = {
  status: ControlResult["status"];
  count: number;
  percentage: number;
};

export type EvidenceCoverageState = "SUPPORTING" | "CONTRADICTORY" | "MISSING" | "NOT_APPLICABLE";

export type EvidenceCoverageCell = {
  controlId: string;
  documentId: string;
  state: EvidenceCoverageState;
  evidenceIds: string[];
};

export type EvidenceCoverageRow = {
  controlId: string;
  status: ControlResult["status"];
  cells: EvidenceCoverageCell[];
};

export type ChronologyEvent = {
  factKey: "purchaseOrderDate" | "deliveryDate" | "invoiceDate";
  documentId: string;
  documentTitle: string;
  date: string;
  excerpt: string;
};

export type ThresholdSensitivity = {
  amount: number;
  threshold: number;
  currency: string;
  requiredApprovers: number;
  recordedApprovers: number;
  exceedsThreshold: boolean;
  approvalSatisfied: boolean;
  status: ControlResult["status"] | null;
};

export type EvidenceIntegrity = {
  state: "VERIFIED" | "MISSING" | "REJECTED";
  verifiedReferences: number;
  rejectedReferences: number;
  missingRequirements: number;
};

export type ReviewerQueueItem = {
  controlId: string;
  status: ControlResult["status"];
  severity: ControlResult["severity"];
  decisionState: ControlResult["reviewerDecision"]["state"];
  priority: number;
};

export type ReviewSearchMatch = {
  kind: "CONTROL" | "DOCUMENT";
  id: string;
};

export type RunSnapshot = {
  id: string;
  generatedAt: string;
  threshold: number;
  summary: ResultSummary;
  statuses: Record<string, ControlResult["status"]>;
};

const statusPriority: Record<ControlResult["status"], number> = {
  FAIL: 0,
  MISSING: 1,
  WARNING: 2,
  PASS: 3,
};

const severityPriority: Record<ControlResult["severity"], number> = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

export function buildOutcomeComposition(results: ControlResult[]): OutcomeSegment[] {
  const total = results.length;
  return outcomeOrder.map((status) => {
    const count = results.filter((result) => result.status === status).length;
    return { status, count, percentage: total ? (count / total) * 100 : 0 };
  });
}

export function buildEvidenceCoverage(results: ControlResult[], documents: CaseDocument[]): EvidenceCoverageRow[] {
  return results.map((result) => ({
    controlId: result.controlId,
    status: result.status,
    cells: documents.map((document) => {
      const contradictory = result.contradictoryEvidence.filter((item) => item.documentId === document.id);
      const supporting = result.supportingEvidence.filter((item) => item.documentId === document.id);
      const missing = result.missingEvidence.length > 0 && supporting.length > 0;
      const state: EvidenceCoverageState = contradictory.length
        ? "CONTRADICTORY"
        : missing
          ? "MISSING"
          : supporting.length
            ? "SUPPORTING"
            : "NOT_APPLICABLE";
      return {
        controlId: result.controlId,
        documentId: document.id,
        state,
        evidenceIds: [...contradictory, ...supporting].map((item) => item.id),
      };
    }),
  }));
}

export function extractChronology(documents: CaseDocument[]): ChronologyEvent[] {
  const keys = new Set<ChronologyEvent["factKey"]>(["purchaseOrderDate", "deliveryDate", "invoiceDate"]);
  return documents
    .flatMap((document) => document.facts
      .filter((fact): fact is typeof fact & { key: ChronologyEvent["factKey"]; value: string } => keys.has(fact.key as ChronologyEvent["factKey"]) && typeof fact.value === "string")
      .map((fact) => ({
        factKey: fact.key,
        documentId: document.id,
        documentTitle: document.title,
        date: fact.value,
        excerpt: fact.excerpt,
      })))
    .sort((left, right) => left.date.localeCompare(right.date));
}

export function buildThresholdSensitivity(documents: CaseDocument[], threshold: number, results: ControlResult[]): ThresholdSensitivity | null {
  const facts = documents.flatMap((document) => document.facts);
  const amount = facts.find((fact) => fact.key === "purchaseOrderAmount")?.value;
  const approvers = facts.find((fact) => fact.key === "approvers")?.value;
  if (typeof amount !== "number" || !Array.isArray(approvers) || !Number.isFinite(threshold)) return null;
  const requiredApprovers = 2;
  const exceedsThreshold = amount > threshold;
  const recordedApprovers = approvers.length;
  return {
    amount,
    threshold,
    currency: "EUR",
    requiredApprovers,
    recordedApprovers,
    exceedsThreshold,
    approvalSatisfied: !exceedsThreshold || recordedApprovers >= requiredApprovers,
    status: results.find((result) => result.controlId === "CTRL-APPROVAL")?.status ?? null,
  };
}

export function assessEvidenceIntegrity(result: ControlResult, documents: CaseDocument[]): EvidenceIntegrity {
  const documentById = new Map(documents.map((document) => [document.id, document]));
  const references = [...result.supportingEvidence, ...result.contradictoryEvidence];
  const rejectedReferences = references.filter((reference) => {
    const document = documentById.get(reference.documentId);
    return !document || !document.content.includes(reference.excerpt);
  }).length;
  const missingRequirements = result.missingEvidence.length;
  return {
    state: rejectedReferences ? "REJECTED" : missingRequirements ? "MISSING" : "VERIFIED",
    verifiedReferences: references.length - rejectedReferences,
    rejectedReferences,
    missingRequirements,
  };
}

export function buildReviewerQueue(results: ControlResult[]): ReviewerQueueItem[] {
  return results
    .map((result) => ({
      controlId: result.controlId,
      status: result.status,
      severity: result.severity,
      decisionState: result.reviewerDecision.state,
      priority: (result.reviewerDecision.state === "PENDING" ? 0 : 100) + statusPriority[result.status] * 10 + severityPriority[result.severity],
    }))
    .sort((left, right) => left.priority - right.priority || left.controlId.localeCompare(right.controlId));
}

export function searchReviewWorkspace(query: string, results: ControlResult[], documents: CaseDocument[], localizedTitles: Record<string, string>): ReviewSearchMatch[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return [];
  const controlMatches = results.filter((result) => [
    result.controlId,
    result.title,
    localizedTitles[result.controlId] ?? "",
    result.status,
    result.reviewerDecision.state,
    result.reviewerDecision.comment,
    ...result.supportingEvidence.flatMap((item) => [item.documentTitle, item.excerpt, item.factId]),
    ...result.contradictoryEvidence.flatMap((item) => [item.documentTitle, item.excerpt, item.factId]),
    ...result.missingEvidence.flatMap((item) => [item.description, item.expectedSource]),
  ].some((value) => value.toLocaleLowerCase().includes(normalized)));
  const documentMatches = documents.filter((document) => [
    document.id,
    document.title,
    document.type,
    ...document.facts.flatMap((fact) => [fact.id, fact.key, fact.excerpt, String(fact.value)]),
  ].some((value) => value.toLocaleLowerCase().includes(normalized)));
  return [
    ...controlMatches.map((result) => ({ kind: "CONTROL" as const, id: result.controlId })),
    ...documentMatches.map((document) => ({ kind: "DOCUMENT" as const, id: document.id })),
  ];
}

export function createRunSnapshot(generatedAt: string, threshold: number, results: ControlResult[], summary: ResultSummary): RunSnapshot {
  return {
    id: `RUN-${generatedAt.replace(/[-:.]/g, "")}`,
    generatedAt,
    threshold,
    summary: structuredClone(summary),
    statuses: Object.fromEntries(results.map((result) => [result.controlId, result.status])),
  };
}

export function changedControls(previous: RunSnapshot | null, current: RunSnapshot | null): string[] {
  if (!previous || !current) return [];
  return Object.keys(current.statuses).filter((controlId) => previous.statuses[controlId] !== current.statuses[controlId]);
}
