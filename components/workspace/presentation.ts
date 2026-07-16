import type { ControlResult } from "@/src/domain/schemas";
import { CONTROL_REFERENCE_REGISTRY, resolveControlReference } from "@/src/domain/control-references";

export function sequenceForControl(controlId: string): number | null {
  const index = CONTROL_REFERENCE_REGISTRY.findIndex((entry) => entry.controlId === controlId);
  return index === -1 ? null : index + 1;
}

export function controlRef(controlId: string): string {
  return resolveControlReference(controlId).displayReference;
}

export function requirementRef(controlId: string): string {
  const sequence = sequenceForControl(controlId);
  return sequence ? `R-${String(sequence).padStart(2, "0")}` : "R-LIVE";
}

export function decisionRef(controlId: string): string {
  const sequence = sequenceForControl(controlId);
  return sequence ? `DEC-${String(sequence).padStart(2, "0")}` : `DEC-${controlId.replace(/^CTRL-/, "")}`;
}

export function statusGlyph(status: ControlResult["status"]): string {
  if (status === "PASS") return "✓";
  if (status === "FAIL") return "×";
  if (status === "MISSING") return "⌀";
  return "!";
}

export function decisionGlyph(state: ControlResult["reviewerDecision"]["state"]): string {
  if (state === "CONFIRMED") return "✓";
  if (state === "REJECTED" || state === "ACCEPTED_EXCEPTION") return "✎";
  return "○";
}

export function methodLabel(mode: "DETERMINISTIC_DEMO" | "LIVE_GPT_5_6"): string {
  return mode === "DETERMINISTIC_DEMO" ? "TS · DETERMINISTIC" : "GPT-5.6 · SEMANTIC";
}

export function evidenceCount(result: ControlResult): number {
  return result.supportingEvidence.length + result.contradictoryEvidence.length + result.missingEvidence.length;
}
