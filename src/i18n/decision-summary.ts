import type { Locale } from "@/src/i18n/translations";

type DecisionSummaryCounts = {
  confirmed: number;
  rejected: number;
  exceptions: number;
  pending: number;
};

function countLabel(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function formatDecisionSummary(locale: Locale, counts: DecisionSummaryCounts): string {
  if (locale === "fr") {
    return `Décisions humaines : ${[
      countLabel(counts.confirmed, "confirmée", "confirmées"),
      countLabel(counts.rejected, "rejetée", "rejetées"),
      countLabel(counts.exceptions, "dérogation", "dérogations"),
      countLabel(counts.pending, "non résolue", "non résolues"),
    ].join(" · ")}`;
  }

  return `Human decisions: ${[
    countLabel(counts.confirmed, "confirmed", "confirmed"),
    countLabel(counts.rejected, "rejected", "rejected"),
    countLabel(counts.exceptions, "exception", "exceptions"),
    countLabel(counts.pending, "unresolved", "unresolved"),
  ].join(" · ")}`;
}
