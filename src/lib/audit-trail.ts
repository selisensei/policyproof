import { z } from "zod";
import { resolveControlReference } from "@/src/domain/control-references";

export const AuditActionSchema = z.enum([
  "SCENARIO_LOADED",
  "CONTROLS_APPROVED",
  "REVIEW_RUN",
  "THRESHOLD_CHANGED",
  "REVIEWER_DECISION_SAVED",
  "RUN_COMPARISON_CREATED",
  "DETERMINISTIC_RERUN_VERIFIED",
  "DETERMINISTIC_DIVERGENCE_DETECTED",
  "RECEIPT_GENERATED",
  "RECEIPT_VERIFIED",
  "RECEIPT_EXPORTED",
]);

export const AuditEventSchema = z.object({
  id: z.string().min(1),
  timestamp: z.iso.datetime(),
  action: AuditActionSchema,
  scenarioId: z.string().regex(/^[a-z0-9-]+$/),
  controlId: z.string().min(1).nullable(),
  displayReference: z.string().min(1).nullable(),
  description: z.string().min(1).max(180),
}).strict();

export const AuditTrailSchema = z.array(AuditEventSchema).max(100);
export type AuditAction = z.infer<typeof AuditActionSchema>;
export type AuditEvent = z.infer<typeof AuditEventSchema>;

function safeDescription(value: string): string {
  return value.replace(/[\r\n\t]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 180);
}

export function createAuditEvent(input: {
  action: AuditAction;
  scenarioId: string;
  controlId?: string | null;
  description: string;
  timestamp: string;
}): AuditEvent {
  const reference = input.controlId ? resolveControlReference(input.controlId) : null;
  return AuditEventSchema.parse({
    id: `${input.timestamp}-${input.action}-${input.controlId ?? "case"}`,
    timestamp: input.timestamp,
    action: input.action,
    scenarioId: input.scenarioId,
    controlId: reference?.controlId ?? null,
    displayReference: reference?.displayReference ?? null,
    description: safeDescription(input.description),
  });
}

export function appendAuditEvent(trail: readonly AuditEvent[], event: AuditEvent): AuditEvent[] {
  return AuditTrailSchema.parse([...trail, event].slice(-100));
}

export function validateAuditTrail(input: unknown): AuditEvent[] {
  const parsed = AuditTrailSchema.safeParse(input);
  return parsed.success ? parsed.data : [];
}
