import { z } from "zod";
import { resolveControlReference } from "@/src/domain/control-references";
import { REVIEW_FINGERPRINT_SCHEMA_VERSION, type ReviewFingerprintPayload } from "@/src/domain/review-fingerprint-schema";
import { ControlStatusSchema, ReviewDecisionStateSchema, SeveritySchema } from "@/src/domain/schemas";
import { AuditEventSchema, type AuditEvent } from "@/src/lib/audit-trail";
import type { DecisionReceipt } from "@/src/lib/decision-receipt";
import { canonicalizeDeterministicValue } from "@/src/lib/review-fingerprint";

export const RECEIPT_INTEGRITY_VERSION = "policyproof.receipt-integrity.v1" as const;
export const RECEIPT_FORMAT_VERSION = "policyproof.decision-receipt.v1" as const;
export const RECEIPT_PRODUCER_VERSION = "policyproof.app-schema.v1" as const;
export const RECEIPT_INTEGRITY_ALGORITHM = "SHA-256" as const;
export const RECEIPT_AUDIT_EVENT_LIMIT = 100;

const HashSchema = z.string().regex(/^[0-9a-f]{64}$/);
const ControlReferenceSchema = z.object({
  controlId: z.string().min(1),
  displayReference: z.string().min(1),
  title: z.string().min(1),
}).strict();

const ReceiptEvidenceSchema = z.object({
  id: z.string().min(1),
  documentId: z.string().min(1),
  factId: z.string().min(1),
  locator: z.string().min(1),
  excerpt: z.string().min(1),
  relationship: z.enum(["SUPPORTING", "CONTRADICTORY"]),
  validationState: z.enum(["VERIFIED", "REJECTED"]),
}).strict();

const ReceiptResultSchema = z.object({
  controlId: z.string().min(1),
  displayReference: z.string().min(1),
  title: z.string().min(1),
  status: ControlStatusSchema,
  explanation: z.string().min(1),
  severity: SeveritySchema,
  evidence: z.array(ReceiptEvidenceSchema),
  missingEvidence: z.array(z.object({
    description: z.string().min(1),
    expectedSource: z.string().min(1),
  }).strict()),
}).strict();

const HumanDecisionSchema = z.object({
  controlId: z.string().min(1),
  displayReference: z.string().min(1),
  state: ReviewDecisionStateSchema,
  comment: z.string(),
}).strict();

export const ReceiptIntegrityPayloadSchema = z.object({
  receiptFormatVersion: z.literal(RECEIPT_FORMAT_VERSION),
  producerVersion: z.literal(RECEIPT_PRODUCER_VERSION),
  receiptId: z.string().min(1),
  reviewFingerprint: z.object({
    version: z.literal(REVIEW_FINGERPRINT_SCHEMA_VERSION),
    value: HashSchema,
  }).strict(),
  scenarioId: z.string().min(1),
  caseReference: z.string().min(1),
  policy: z.object({
    id: z.string().min(1),
    version: z.string().min(1),
  }).strict(),
  controls: z.array(ControlReferenceSchema).min(1),
  results: z.array(ReceiptResultSchema).min(1),
  humanDecisions: z.array(HumanDecisionSchema).min(1),
  decisionStatus: z.enum(["IN_PROGRESS", "COMPLETE"]),
  acceptedExceptions: z.array(z.object({
    controlId: z.string().min(1),
    displayReference: z.string().min(1),
    comment: z.string().min(1),
  }).strict()),
  unresolvedFindings: z.array(z.object({
    controlId: z.string().min(1),
    displayReference: z.string().min(1),
    status: ControlStatusSchema,
  }).strict()),
  auditTrail: z.array(AuditEventSchema).max(RECEIPT_AUDIT_EVENT_LIMIT),
  generatedAt: z.iso.datetime(),
  language: z.enum(["en", "fr"]),
  runMode: z.enum(["DETERMINISTIC_DEMO", "LIVE_GPT_5_6"]),
  disclaimer: z.string().min(1),
}).strict();

export const ReceiptIntegrityBlockSchema = z.object({
  version: z.literal(RECEIPT_INTEGRITY_VERSION),
  algorithm: z.literal(RECEIPT_INTEGRITY_ALGORITHM),
  hash: HashSchema,
}).strict();

export const VerifiableDecisionReceiptSchema = z.object({
  integrity: ReceiptIntegrityBlockSchema,
  receipt: ReceiptIntegrityPayloadSchema,
}).strict();

export type ReceiptIntegrityPayload = z.infer<typeof ReceiptIntegrityPayloadSchema>;
export type VerifiableDecisionReceipt = z.infer<typeof VerifiableDecisionReceiptSchema>;
export type ReceiptVerificationStatus = "VALID" | "MODIFIED" | "UNSUPPORTED_VERSION" | "MALFORMED" | "MISSING_INTEGRITY";
export type ReceiptVerificationResult = {
  status: ReceiptVerificationStatus;
  receiptId: string | null;
  storedHash: string | null;
  calculatedHash: string | null;
};

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizeTimestamp(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) throw new TypeError("Receipt timestamps must be valid ISO 8601 values.");
  return date.toISOString();
}

function sortEvidence<T extends { documentId: string; locator: string; relationship: string; excerpt: string; id: string }>(items: T[]): T[] {
  return [...items].sort((left, right) =>
    compareText(left.documentId, right.documentId) ||
    compareText(left.locator, right.locator) ||
    compareText(left.relationship, right.relationship) ||
    compareText(left.excerpt, right.excerpt) ||
    compareText(left.id, right.id));
}

function validateCrossReferences(payload: ReceiptIntegrityPayload): ReceiptIntegrityPayload {
  const controls = new Map(payload.controls.map((control) => [control.controlId, control]));
  if (controls.size !== payload.controls.length) throw new TypeError("Receipt control IDs must be unique.");
  if (new Set(payload.controls.map((control) => control.displayReference)).size !== payload.controls.length) {
    throw new TypeError("Receipt display references must be unique.");
  }
  for (const item of [...payload.results, ...payload.humanDecisions]) {
    const control = controls.get(item.controlId);
    if (!control || control.displayReference !== item.displayReference) {
      throw new TypeError(`Unknown or inconsistent receipt control reference: ${item.controlId}.`);
    }
  }
  if (payload.results.length !== controls.size || payload.humanDecisions.length !== controls.size) {
    throw new TypeError("Every receipt control must have exactly one result and one human decision.");
  }
  return payload;
}

export function buildReceiptIntegrityPayload(input: {
  decisionReceipt: DecisionReceipt;
  reviewFingerprintPayload: ReviewFingerprintPayload;
  reviewFingerprint: string;
  auditTrail?: AuditEvent[];
}): ReceiptIntegrityPayload {
  const review = input.reviewFingerprintPayload;
  const outcomes = new Map(input.decisionReceipt.outcomes.map((outcome) => [outcome.controlId, outcome]));
  const controls = review.results.map((result) => {
    const reference = resolveControlReference(result.controlId);
    return { controlId: result.controlId, displayReference: reference.displayReference, title: result.title };
  });
  const humanDecisions = review.results.map((result) => {
    const outcome = outcomes.get(result.controlId);
    if (!outcome) throw new TypeError(`Decision receipt is missing control ${result.controlId}.`);
    return {
      controlId: result.controlId,
      displayReference: resolveControlReference(result.controlId).displayReference,
      state: outcome.reviewerDecision,
      comment: outcome.reviewerComment,
    };
  });
  const results = review.results.map((result) => ({
    ...result,
    displayReference: resolveControlReference(result.controlId).displayReference,
  }));
  return validateCrossReferences(ReceiptIntegrityPayloadSchema.parse({
    receiptFormatVersion: RECEIPT_FORMAT_VERSION,
    producerVersion: RECEIPT_PRODUCER_VERSION,
    receiptId: input.decisionReceipt.reviewId,
    reviewFingerprint: { version: REVIEW_FINGERPRINT_SCHEMA_VERSION, value: input.reviewFingerprint },
    scenarioId: review.scenarioId,
    caseReference: review.caseReference,
    policy: { id: review.policy.id, version: review.policy.version },
    controls,
    results,
    humanDecisions,
    decisionStatus: humanDecisions.some((decision) => decision.state === "PENDING") ? "IN_PROGRESS" : "COMPLETE",
    acceptedExceptions: humanDecisions
      .filter((decision) => decision.state === "ACCEPTED_EXCEPTION")
      .map(({ controlId, displayReference, comment }) => ({ controlId, displayReference, comment })),
    unresolvedFindings: results
      .filter((result) => humanDecisions.find((decision) => decision.controlId === result.controlId)?.state === "PENDING")
      .map(({ controlId, displayReference, status }) => ({ controlId, displayReference, status })),
    auditTrail: input.auditTrail ?? input.decisionReceipt.auditTrail,
    generatedAt: input.decisionReceipt.generatedAt,
    language: input.decisionReceipt.selectedLanguage,
    runMode: input.decisionReceipt.runMode,
    disclaimer: input.decisionReceipt.disclaimer,
  }));
}

export function validateReceiptIntegrityPayload(input: unknown): ReceiptIntegrityPayload {
  return validateCrossReferences(ReceiptIntegrityPayloadSchema.parse(input));
}

export function canonicalizeReceiptIntegrityPayload(input: unknown): ReceiptIntegrityPayload {
  const parsed = validateReceiptIntegrityPayload(canonicalizeDeterministicValue(input));
  return validateReceiptIntegrityPayload({
    ...parsed,
    generatedAt: normalizeTimestamp(parsed.generatedAt),
    controls: [...parsed.controls].sort((left, right) => compareText(left.controlId, right.controlId)),
    results: parsed.results
      .map((result) => ({
        ...result,
        evidence: sortEvidence(result.evidence),
        missingEvidence: [...result.missingEvidence].sort((left, right) =>
          compareText(left.expectedSource, right.expectedSource) || compareText(left.description, right.description)),
      }))
      .sort((left, right) => compareText(left.controlId, right.controlId)),
    humanDecisions: [...parsed.humanDecisions].sort((left, right) => compareText(left.controlId, right.controlId)),
    acceptedExceptions: [...parsed.acceptedExceptions].sort((left, right) => compareText(left.controlId, right.controlId)),
    unresolvedFindings: [...parsed.unresolvedFindings].sort((left, right) => compareText(left.controlId, right.controlId)),
    auditTrail: parsed.auditTrail
      .map((event) => ({ ...event, timestamp: normalizeTimestamp(event.timestamp) }))
      .sort((left, right) =>
        compareText(left.timestamp, right.timestamp) ||
        compareText(left.action, right.action) ||
        compareText(left.controlId ?? "", right.controlId ?? "") ||
        compareText(left.id, right.id)),
  });
}

export function serializeCanonicalReceipt(payload: ReceiptIntegrityPayload): string {
  return JSON.stringify(canonicalizeDeterministicValue(canonicalizeReceiptIntegrityPayload(payload)));
}

export async function computeReceiptIntegrityHash(payload: ReceiptIntegrityPayload): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("Web Crypto SHA-256 is unavailable in this runtime.");
  const digest = await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(serializeCanonicalReceipt(payload)));
  return Array.from(new Uint8Array(digest), (value) => value.toString(16).padStart(2, "0")).join("");
}

export async function attachReceiptIntegrity(payload: ReceiptIntegrityPayload): Promise<VerifiableDecisionReceipt> {
  const receipt = canonicalizeReceiptIntegrityPayload(payload);
  const hash = await computeReceiptIntegrityHash(receipt);
  return VerifiableDecisionReceiptSchema.parse({
    integrity: { version: RECEIPT_INTEGRITY_VERSION, algorithm: RECEIPT_INTEGRITY_ALGORITHM, hash },
    receipt,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export async function verifyReceiptIntegrity(input: unknown): Promise<ReceiptVerificationResult> {
  if (!isRecord(input) || !("integrity" in input)) {
    return { status: "MISSING_INTEGRITY", receiptId: null, storedHash: null, calculatedHash: null };
  }
  const integrity = isRecord(input.integrity) ? input.integrity : null;
  const content = isRecord(input.receipt) ? input.receipt : null;
  const receiptId = typeof content?.receiptId === "string" ? content.receiptId : null;
  const storedHash = typeof integrity?.hash === "string" ? integrity.hash : null;
  if (typeof integrity?.version === "string" && integrity.version !== RECEIPT_INTEGRITY_VERSION) {
    return { status: "UNSUPPORTED_VERSION", receiptId, storedHash, calculatedHash: null };
  }
  if (typeof content?.receiptFormatVersion === "string" && content.receiptFormatVersion !== RECEIPT_FORMAT_VERSION) {
    return { status: "UNSUPPORTED_VERSION", receiptId, storedHash, calculatedHash: null };
  }
  const parsed = VerifiableDecisionReceiptSchema.safeParse(input);
  if (!parsed.success) return { status: "MALFORMED", receiptId, storedHash, calculatedHash: null };
  try {
    const calculatedHash = await computeReceiptIntegrityHash(parsed.data.receipt);
    return {
      status: calculatedHash === parsed.data.integrity.hash ? "VALID" : "MODIFIED",
      receiptId: parsed.data.receipt.receiptId,
      storedHash: parsed.data.integrity.hash,
      calculatedHash,
    };
  } catch {
    return { status: "MALFORMED", receiptId, storedHash, calculatedHash: null };
  }
}

export async function verifyReceiptIntegrityJson(json: string): Promise<ReceiptVerificationResult> {
  try {
    return await verifyReceiptIntegrity(JSON.parse(json) as unknown);
  } catch {
    return { status: "MALFORMED", receiptId: null, storedHash: null, calculatedHash: null };
  }
}

export function abbreviateReceiptHash(hash: string): string {
  return /^[0-9a-f]{64}$/.test(hash) ? `${hash.slice(0, 8)}…${hash.slice(-8)}` : hash;
}

export function serializeVerifiableReceipt(receipt: VerifiableDecisionReceipt): string {
  return `${JSON.stringify(VerifiableDecisionReceiptSchema.parse(receipt), null, 2)}\n`;
}
