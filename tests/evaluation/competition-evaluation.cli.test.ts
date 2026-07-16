import { readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runCompetitionEvaluation, competitionEvaluationExitCode } from "@/src/evaluation/competition-evaluation";
import {
  formatCompetitionEvaluationTerminal,
  serializeCompetitionEvaluationJson,
  serializeCompetitionEvaluationMarkdown,
} from "@/src/evaluation/competition-report";

function writeStable(path: string, content: string): void {
  let current = "";
  try { current = readFileSync(path, "utf8"); } catch { /* First deterministic generation. */ }
  if (current !== content) writeFileSync(path, content, "utf8");
}

describe("PolicyProof competition evaluation CLI", () => {
  it("runs all mandatory checks, writes deterministic reports, and exits successfully", async () => {
    const evaluation = await runCompetitionEvaluation();
    writeStable("docs/evaluation/COMPETITION_EVALUATION_REPORT.md", serializeCompetitionEvaluationMarkdown(evaluation));
    writeStable("docs/evaluation/competition-evaluation-report.json", serializeCompetitionEvaluationJson(evaluation));
    console.log(`\n${formatCompetitionEvaluationTerminal(evaluation)}\n`);
    expect(competitionEvaluationExitCode(evaluation)).toBe(0);
  });
});
