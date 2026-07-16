import type { CompetitionEvaluation } from "@/src/evaluation/competition-evaluation-schema";

function row(label: string, value: string | number): string {
  return `${label.padEnd(39)} ${String(value)}`;
}

export function formatCompetitionEvaluationTerminal(evaluation: CompetitionEvaluation): string {
  return [
    "PolicyProof Competition Evaluation",
    "----------------------------------",
    row("Scenarios evaluated", `${evaluation.totals.scenariosEvaluated} / 3`),
    row("Controls evaluated", `${evaluation.totals.controlsEvaluated} / 21`),
    row("Expected conclusions matched", `${evaluation.totals.expectedConclusionsMatched} / 21`),
    row("Outcome profiles matched", `${evaluation.totals.outcomeProfilesMatched} / 3`),
    row("Evidence references valid", evaluation.checks.evidenceReferences.status),
    row("Exact controlled excerpts valid", evaluation.checks.exactExcerpts.status),
    row("Scenario isolation", evaluation.checks.scenarioIsolation.status),
    row("Deterministic reproduction", evaluation.checks.deterministicReproduction.status),
    row("Threshold sensitivity", evaluation.checks.thresholdSensitivity.status),
    row("Review fingerprints", evaluation.checks.reviewFingerprints.status),
    row("Receipt integrity", evaluation.checks.receiptIntegrity.status),
    row("Business-rule mutations", evaluation.checks.businessRuleMutations.status),
    row("Adversarial validation", evaluation.checks.adversarialValidation.status),
    row("Live GPT-5.6 validation", evaluation.historicalLiveValidation.status.replace("_", " ")),
    row("External network calls", evaluation.totals.externalNetworkCalls),
    row("Unexpected failures", evaluation.totals.unexpectedFailures),
    row("Overall result", evaluation.overallResult),
  ].join("\n");
}

export function serializeCompetitionEvaluationJson(evaluation: CompetitionEvaluation): string {
  return `${JSON.stringify(evaluation, null, 2)}\n`;
}

export function serializeCompetitionEvaluationMarkdown(evaluation: CompetitionEvaluation): string {
  const scenarioRows = evaluation.evaluatedScenarios.map((scenario) =>
    `| ${scenario.scenarioId} | ${scenario.controlCount} | ${scenario.conclusions.filter(({ matches }) => matches).length}/7 | ${scenario.actualOutcomeCounts.PASS} PASS, ${scenario.actualOutcomeCounts.FAIL} FAIL, ${scenario.actualOutcomeCounts.MISSING} MISSING, ${scenario.actualOutcomeCounts.WARNING} WARNING | ${scenario.outcomeProfileMatched ? "PASS" : "FAIL"} |`,
  );
  return `# PolicyProof Competition Evaluation Report

Schema: \`${evaluation.evaluationSchemaVersion}\`<br>
Application schema: \`${evaluation.applicationSchemaVersion}\`<br>
Mode: \`${evaluation.evaluationMode}\`<br>
Overall result: **${evaluation.overallResult}**

This tracked report is deterministic. It contains no generation timestamp, runtime duration, local path, environment value, provider payload, or browser metadata.

## Coverage

| Scenario | Controls | Conclusions matched | Actual outcome profile | Result |
| --- | ---: | ---: | --- | --- |
${scenarioRows.join("\n")}

- Scenarios evaluated: ${evaluation.totals.scenariosEvaluated}/3
- Controls evaluated: ${evaluation.totals.controlsEvaluated}/21
- Expected conclusions matched: ${evaluation.totals.expectedConclusionsMatched}/21
- Outcome profiles matched: ${evaluation.totals.outcomeProfilesMatched}/3
- Business-rule mutations: ${evaluation.mutationSummary.passed}/${evaluation.mutationSummary.executed}
- Adversarial cases: ${evaluation.adversarialSummary.passed}/${evaluation.adversarialSummary.executed}
- External network calls: ${evaluation.totals.externalNetworkCalls}

## Executed checks

${Object.entries(evaluation.checks).map(([name, value]) => `- **${name}: ${value.status}** — ${value.detail}`).join("\n")}

## Historical GPT-5.6 evidence

Status: **HISTORICAL EVIDENCE**. The controlled Northstar live validation was not rerun. Its tracked source is \`${evaluation.historicalLiveValidation.source}\` and its validated commit is \`${evaluation.historicalLiveValidation.validatedCommit}\`. Meridian and Atlas remain deterministic and mocked only.

## Receipt integrity security boundary

**EXPECTED SECURITY BOUNDARY**

Receipt content matches the recorded hash, and modified content retained with the old hash is detected. The hash is not digitally signed. A party able to modify both receipt content and its hash can produce a new internally consistent pair. The mechanism does not establish origin, identity, authorship, trusted time, or legal signature.

## Warnings

${evaluation.warnings.map((warning) => `- ${warning}`).join("\n")}

## Failures

${evaluation.failures.length ? evaluation.failures.map((failure) => `- ${failure}`).join("\n") : "None."}
`;
}
