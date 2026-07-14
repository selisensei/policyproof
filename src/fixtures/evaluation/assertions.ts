import type { z } from "zod";
import type { CaseAnalysis, PolicyCompilation } from "@/src/domain/ai-schemas";
import type { LocalDocument } from "@/src/lib/local-documents";

export function assertSchemaValidity<T>(schema: z.ZodType<T>, value: unknown): T {
  return schema.parse(value);
}

export function assertKnownSourceIdentifiers(analysis: CaseAnalysis, sources: LocalDocument[]): void {
  const ids = new Set(sources.map((source) => source.id));
  for (const finding of analysis.documentFindings) {
    if (!ids.has(finding.documentIdentifier)) throw new Error(`Unknown source identifier: ${finding.documentIdentifier}`);
  }
}

export function assertExactExcerpts(analysis: CaseAnalysis, sources: LocalDocument[]): void {
  for (const finding of analysis.documentFindings) {
    const source = sources.find((candidate) => candidate.id === finding.documentIdentifier);
    if (!source) throw new Error(`Unknown source identifier: ${finding.documentIdentifier}`);
    for (const evidence of finding.evidence) {
      if (!source.content.includes(evidence.exactExcerpt)) throw new Error(`Invented excerpt: ${evidence.id}`);
    }
  }
}

export function assertDeterministicParameters(
  compilation: PolicyCompilation,
  expected: Record<string, PolicyCompilation["controls"][number]["deterministicParameters"]>,
): void {
  for (const [controlId, parameters] of Object.entries(expected)) {
    const control = compilation.controls.find((candidate) => candidate.id === controlId);
    if (!control) throw new Error(`Missing control: ${controlId}`);
    if (JSON.stringify(control.deterministicParameters) !== JSON.stringify(parameters)) throw new Error(`Parameters changed for ${controlId}`);
  }
}

export function assertRequiredEvidenceCoverage(compilation: PolicyCompilation): void {
  for (const control of compilation.controls) {
    if (!control.requiredEvidence.length) throw new Error(`Control ${control.id} has no required evidence.`);
  }
}
