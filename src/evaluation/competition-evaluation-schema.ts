import { z } from "zod";

export const COMPETITION_EVALUATION_VERSION = "policyproof.competition-evaluation.v1" as const;
export const BUSINESS_RULE_MUTATION_VERSION = "policyproof.business-rule-mutation.v1" as const;
export const ADVERSARIAL_CORPUS_VERSION = "policyproof.adversarial-corpus.v1" as const;

export const EvaluationStatusSchema = z.enum([
  "PASS",
  "FAIL",
  "NOT_RUN",
  "HISTORICAL_EVIDENCE",
  "DETERMINISTIC",
  "MOCKED",
]);

const OutcomeCountsSchema = z.object({
  PASS: z.number().int().nonnegative(),
  FAIL: z.number().int().nonnegative(),
  MISSING: z.number().int().nonnegative(),
  WARNING: z.number().int().nonnegative(),
  total: z.number().int().positive(),
}).strict();

const ConclusionSchema = z.object({
  controlId: z.string().min(1),
  expected: z.enum(["PASS", "FAIL", "MISSING", "WARNING"]),
  actual: z.enum(["PASS", "FAIL", "MISSING", "WARNING"]),
  matches: z.boolean(),
}).strict();

export const EvaluatedScenarioSchema = z.object({
  scenarioId: z.enum(["northstar-mixed-risk", "meridian-clean-procurement", "atlas-incomplete-evidence"]),
  caseReference: z.string().min(1),
  executionMode: z.literal("DETERMINISTIC"),
  controlCount: z.literal(7),
  conclusions: z.array(ConclusionSchema).length(7),
  expectedOutcomeCounts: OutcomeCountsSchema,
  actualOutcomeCounts: OutcomeCountsSchema,
  outcomeProfileMatched: z.boolean(),
  evidenceReferencesValid: z.boolean(),
  exactExcerptsValid: z.boolean(),
}).strict();

const CheckSchema = z.object({
  status: z.enum(["PASS", "FAIL", "NOT_RUN"]),
  detail: z.string().min(1),
}).strict();

export const CompetitionEvaluationSchema = z.object({
  evaluationSchemaVersion: z.literal(COMPETITION_EVALUATION_VERSION),
  applicationSchemaVersion: z.literal("policyproof.app-schema.v1"),
  evaluationMode: z.literal("LOCAL_DETERMINISTIC_NO_NETWORK"),
  evaluatedScenarios: z.array(EvaluatedScenarioSchema).length(3),
  totals: z.object({
    scenariosEvaluated: z.literal(3),
    controlsEvaluated: z.literal(21),
    expectedConclusionsMatched: z.number().int().min(0).max(21),
    outcomeProfilesMatched: z.number().int().min(0).max(3),
    externalNetworkCalls: z.literal(0),
    unexpectedFailures: z.number().int().nonnegative(),
  }).strict(),
  checks: z.object({
    scenarioSchemas: CheckSchema,
    expectedConclusions: CheckSchema,
    outcomeProfiles: CheckSchema,
    evidenceReferences: CheckSchema,
    exactExcerpts: CheckSchema,
    scenarioIsolation: CheckSchema,
    deterministicReproduction: CheckSchema,
    thresholdSensitivity: CheckSchema,
    reviewFingerprints: CheckSchema,
    receiptIntegrity: CheckSchema,
    businessRuleMutations: CheckSchema,
    adversarialValidation: CheckSchema,
    noNetwork: CheckSchema,
  }).strict(),
  mutationSummary: z.object({
    schemaVersion: z.literal(BUSINESS_RULE_MUTATION_VERSION),
    executed: z.number().int().min(7),
    passed: z.number().int().nonnegative(),
    status: z.enum(["PASS", "FAIL"]),
  }).strict(),
  adversarialSummary: z.object({
    schemaVersion: z.literal(ADVERSARIAL_CORPUS_VERSION),
    executed: z.number().int().min(10),
    passed: z.number().int().nonnegative(),
    status: z.enum(["PASS", "FAIL"]),
  }).strict(),
  historicalLiveValidation: z.object({
    status: z.literal("HISTORICAL_EVIDENCE"),
    model: z.literal("gpt-5.6"),
    validatedCommit: z.literal("eb120feaca78bf3cdbc71b7b7198045f86a44852"),
    source: z.literal("docs/evaluation/LIVE_GPT56_VALIDATION.md"),
    executedDuringEvaluation: z.literal(false),
  }).strict(),
  receiptSecurityBoundary: z.object({
    classification: z.literal("EXPECTED SECURITY BOUNDARY"),
    contentHashVerified: z.literal(true),
    modifiedContentDetected: z.literal(true),
    digitallySigned: z.literal(false),
    provesOrigin: z.literal(false),
    provesIdentity: z.literal(false),
    provesAuthorship: z.literal(false),
    provesTrustedTime: z.literal(false),
    provesLegalSignature: z.literal(false),
    simultaneousContentAndHashReplacementRemainsPossible: z.literal(true),
  }).strict(),
  warnings: z.array(z.string()),
  failures: z.array(z.string()),
  overallResult: z.enum(["PASS", "FAIL"]),
}).strict().superRefine((evaluation, context) => {
  if (new Set(evaluation.evaluatedScenarios.map(({ scenarioId }) => scenarioId)).size !== 3) {
    context.addIssue({ code: "custom", path: ["evaluatedScenarios"], message: "Evaluation scenarios must be unique." });
  }
  const conclusionCount = evaluation.evaluatedScenarios.reduce((sum, scenario) => sum + scenario.conclusions.length, 0);
  if (conclusionCount !== evaluation.totals.controlsEvaluated) {
    context.addIssue({ code: "custom", path: ["totals", "controlsEvaluated"], message: "Control total must match evaluated conclusions." });
  }
  if ((evaluation.failures.length === 0) !== (evaluation.overallResult === "PASS")) {
    context.addIssue({ code: "custom", path: ["overallResult"], message: "Overall result must reflect failures." });
  }
});

export type CompetitionEvaluation = z.infer<typeof CompetitionEvaluationSchema>;
export type EvaluationCheck = z.infer<typeof CheckSchema>;
