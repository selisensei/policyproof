import {
  REVIEW_FINGERPRINT_SCHEMA_VERSION,
  ReviewFingerprintPayloadSchema,
  type FingerprintResult,
  type ReviewFingerprintPayload,
} from "@/src/domain/review-fingerprint-schema";
import {
  CaseDocumentSchema,
  ControlDefinitionSchema,
  ControlResultListSchema,
  PolicyDefinitionSchema,
  type CaseDocument,
  type ControlDefinition,
  type ControlResult,
  type EvidenceReference,
  type PolicyDefinition,
} from "@/src/domain/schemas";

type CanonicalPrimitive = null | boolean | number | string;
export type CanonicalValue = CanonicalPrimitive | CanonicalValue[] | { [key: string]: CanonicalValue };

export type ReviewFingerprintInput = {
  scenarioId: string;
  caseReference: string;
  policy: PolicyDefinition;
  controls: ControlDefinition[];
  documents: CaseDocument[];
  results: ControlResult[];
};

export type ReviewFingerprintComparison = {
  kind: "IDENTICAL" | "CHANGED" | "DIVERGED";
  inputsMatch: boolean;
  resultsMatch: boolean;
  fingerprintsMatch: boolean;
  changedControlIds: string[];
  changedConclusions: Array<{ controlId: string; previousStatus: string | null; candidateStatus: string | null }>;
  unchangedControlCount: number;
  previousFingerprint: string;
  candidateFingerprint: string;
  previousThreshold: number;
  candidateThreshold: number;
};

function canonicalize(input: unknown, ancestors: WeakSet<object>): CanonicalValue {
  if (input === null || typeof input === "boolean" || typeof input === "string") {
    return typeof input === "string" ? input.replace(/\r\n?/g, "\n") : input;
  }
  if (typeof input === "number") {
    if (!Number.isFinite(input)) throw new TypeError("Canonical review values must use finite numbers.");
    return Object.is(input, -0) ? 0 : input;
  }
  if (input instanceof Date) {
    if (!Number.isFinite(input.getTime())) throw new TypeError("Canonical review dates must be valid.");
    return input.toISOString();
  }
  if (typeof input === "undefined" || typeof input === "function" || typeof input === "symbol" || typeof input === "bigint") {
    throw new TypeError(`Unsupported canonical review value: ${typeof input}.`);
  }
  if (typeof input !== "object") throw new TypeError("Unsupported canonical review value.");
  if (ancestors.has(input)) throw new TypeError("Canonical review values must not contain cycles.");

  ancestors.add(input);
  try {
    if (Array.isArray(input)) return input.map((value) => canonicalize(value, ancestors));
    const prototype = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      throw new TypeError("Canonical review objects must be plain objects.");
    }
    const keys = Reflect.ownKeys(input);
    if (keys.some((key) => typeof key === "symbol")) throw new TypeError("Canonical review objects must not use symbol keys.");
    const record = input as Record<string, unknown>;
    return (keys as string[]).sort().reduce<{ [key: string]: CanonicalValue }>((output, key) => {
      output[key] = canonicalize(record[key], ancestors);
      return output;
    }, {});
  } finally {
    ancestors.delete(input);
  }
}

export function canonicalizeDeterministicValue(input: unknown): CanonicalValue {
  return canonicalize(input, new WeakSet<object>());
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sortEvidence<T extends { documentId: string; locator: string; relationship: string; excerpt: string; id: string }>(items: T[]): T[] {
  return [...items].sort((left, right) =>
    compareText(left.documentId, right.documentId) ||
    compareText(left.locator, right.locator) ||
    compareText(left.relationship, right.relationship) ||
    compareText(left.excerpt, right.excerpt) ||
    compareText(left.id, right.id));
}

export function canonicalizeReviewFingerprintPayload(input: unknown): ReviewFingerprintPayload {
  const parsed = ReviewFingerprintPayloadSchema.parse(canonicalizeDeterministicValue(input));
  return ReviewFingerprintPayloadSchema.parse({
    ...parsed,
    controls: [...parsed.controls].sort((left, right) => compareText(left.id, right.id)),
    documents: parsed.documents
      .map((document) => ({
        ...document,
        facts: [...document.facts].sort((left, right) =>
          compareText(left.key, right.key) ||
          compareText(left.sourceLocator, right.sourceLocator) ||
          compareText(left.id, right.id)),
      }))
      .sort((left, right) => compareText(left.id, right.id)),
    results: parsed.results
      .map((result) => ({
        ...result,
        evidence: sortEvidence(result.evidence),
        missingEvidence: [...result.missingEvidence].sort((left, right) =>
          compareText(left.expectedSource, right.expectedSource) || compareText(left.description, right.description)),
      }))
      .sort((left, right) => compareText(left.controlId, right.controlId)),
  });
}

function validationState(reference: EvidenceReference, documents: CaseDocument[]): "VERIFIED" | "REJECTED" {
  const document = documents.find((candidate) => candidate.id === reference.documentId);
  const fact = document?.facts.find((candidate) => candidate.id === reference.factId);
  return document && fact &&
    document.content.includes(reference.excerpt) &&
    fact.excerpt === reference.excerpt &&
    fact.sourceLocator === reference.locator
    ? "VERIFIED"
    : "REJECTED";
}

function fingerprintEvidence(result: ControlResult, documents: CaseDocument[]) {
  const mapReference = (reference: EvidenceReference, relationship: "SUPPORTING" | "CONTRADICTORY") => ({
    id: reference.id,
    documentId: reference.documentId,
    factId: reference.factId,
    locator: reference.locator,
    excerpt: reference.excerpt,
    relationship,
    validationState: validationState(reference, documents),
  });
  return [
    ...result.supportingEvidence.map((reference) => mapReference(reference, "SUPPORTING")),
    ...result.contradictoryEvidence.map((reference) => mapReference(reference, "CONTRADICTORY")),
  ];
}

export function buildReviewFingerprintPayload(input: ReviewFingerprintInput): ReviewFingerprintPayload {
  const policy = PolicyDefinitionSchema.parse(input.policy);
  const controls = ControlDefinitionSchema.array().parse(input.controls).filter((control) => control.enabled);
  const documents = CaseDocumentSchema.array().parse(input.documents);
  const results = ControlResultListSchema.parse(input.results);
  const approvalControl = controls.find((control) => control.kind === "APPROVAL_THRESHOLD");
  if (!approvalControl || approvalControl.kind !== "APPROVAL_THRESHOLD") {
    throw new Error("An enabled approval-threshold control is required for the review fingerprint.");
  }

  return canonicalizeReviewFingerprintPayload({
    schemaVersion: REVIEW_FINGERPRINT_SCHEMA_VERSION,
    scenarioId: input.scenarioId,
    caseReference: input.caseReference,
    policy: { id: policy.id, version: policy.version, content: policy.text },
    approvalParameters: { ...approvalControl.parameters },
    controls: controls.map((control) => ({ ...control, parameters: { ...control.parameters }, enabled: true as const })),
    documents: documents.map((document) => ({
      id: document.id,
      title: document.title,
      type: document.type,
      content: document.content,
      facts: document.facts.map((fact) => ({
        id: fact.id,
        key: fact.key,
        value: fact.value,
        sourceLocator: fact.sourceLocator,
        excerpt: fact.excerpt,
        evidenceType: fact.evidenceType ?? null,
        relationToControl: fact.relationToControl ?? null,
      })),
    })),
    results: results.map((result) => ({
      controlId: result.controlId,
      title: result.title,
      status: result.status,
      explanation: result.explanation,
      severity: result.severity,
      evidence: fingerprintEvidence(result, documents),
      missingEvidence: result.missingEvidence.map((missing) => ({ ...missing })),
    })),
  });
}

export function serializeCanonicalReview(payload: ReviewFingerprintPayload): string {
  return JSON.stringify(canonicalizeDeterministicValue(canonicalizeReviewFingerprintPayload(payload)));
}

export async function computeReviewFingerprint(payload: ReviewFingerprintPayload): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto SHA-256 is unavailable in this runtime.");
  const bytes = new TextEncoder().encode(serializeCanonicalReview(payload));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

export function compareReviewFingerprints(previous: string, candidate: string): boolean {
  return /^[0-9a-f]{64}$/.test(previous) && previous === candidate;
}

function serializeInputs(payload: ReviewFingerprintPayload): string {
  const canonical = canonicalizeReviewFingerprintPayload(payload);
  const inputs = Object.fromEntries(Object.entries(canonical).filter(([key]) => key !== "results"));
  return JSON.stringify(canonicalizeDeterministicValue(inputs));
}

function serializeResult(result: FingerprintResult): string {
  return JSON.stringify(canonicalizeDeterministicValue(result));
}

export function compareReviewFingerprintPayloads(
  previous: ReviewFingerprintPayload,
  candidate: ReviewFingerprintPayload,
  previousFingerprint: string,
  candidateFingerprint: string,
): ReviewFingerprintComparison {
  const previousPayload = canonicalizeReviewFingerprintPayload(previous);
  const candidatePayload = canonicalizeReviewFingerprintPayload(candidate);
  const previousResults = new Map(previousPayload.results.map((result) => [result.controlId, serializeResult(result)]));
  const candidateResults = new Map(candidatePayload.results.map((result) => [result.controlId, serializeResult(result)]));
  const ids = [...new Set([...previousResults.keys(), ...candidateResults.keys()])].sort(compareText);
  const changedControlIds = ids.filter((id) => previousResults.get(id) !== candidateResults.get(id));
  const previousStatuses = new Map(previousPayload.results.map((result) => [result.controlId, result.status]));
  const candidateStatuses = new Map(candidatePayload.results.map((result) => [result.controlId, result.status]));
  const inputsMatch = serializeInputs(previousPayload) === serializeInputs(candidatePayload);
  const resultsMatch = changedControlIds.length === 0;
  const fingerprintsMatch = compareReviewFingerprints(previousFingerprint, candidateFingerprint);
  return {
    kind: inputsMatch ? (resultsMatch && fingerprintsMatch ? "IDENTICAL" : "DIVERGED") : "CHANGED",
    inputsMatch,
    resultsMatch,
    fingerprintsMatch,
    changedControlIds,
    changedConclusions: changedControlIds.map((controlId) => ({
      controlId,
      previousStatus: previousStatuses.get(controlId) ?? null,
      candidateStatus: candidateStatuses.get(controlId) ?? null,
    })),
    unchangedControlCount: ids.length - changedControlIds.length,
    previousFingerprint,
    candidateFingerprint,
    previousThreshold: previousPayload.approvalParameters.thresholdAmount,
    candidateThreshold: candidatePayload.approvalParameters.thresholdAmount,
  };
}
