import type { ControlResult } from "@/src/domain/schemas";

export type ResultFilter = "ALL" | "OPEN" | ControlResult["status"];

export type ResultSummary = Record<ControlResult["status"], number> & {
  total: number;
  reviewed: number;
  pending: number;
};

export function summarizeResults(results: ControlResult[]): ResultSummary {
  const summary: ResultSummary = {
    PASS: 0,
    FAIL: 0,
    MISSING: 0,
    WARNING: 0,
    total: results.length,
    reviewed: 0,
    pending: 0,
  };

  for (const result of results) {
    summary[result.status] += 1;
    if (result.reviewerDecision.state === "PENDING") summary.pending += 1;
    else summary.reviewed += 1;
  }

  return summary;
}

export function filterResults(results: ControlResult[], filter: ResultFilter): ControlResult[] {
  if (filter === "ALL") return results;
  if (filter === "OPEN") return results.filter((result) => result.reviewerDecision.state === "PENDING");
  return results.filter((result) => result.status === filter);
}
