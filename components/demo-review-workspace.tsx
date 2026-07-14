"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { AppHeader } from "@/components/workspace/app-header";
import { CaseLibrary } from "@/components/workspace/case-library";
import { CompetitionTools, type CompletedScenarioReview } from "@/components/workspace/competition-tools";
import { ControlsPanel } from "@/components/workspace/controls-panel";
import { DecisionPanel } from "@/components/workspace/decision-panel";
import { DocumentsPanel } from "@/components/workspace/documents-panel";
import { IntroPanel } from "@/components/workspace/intro-panel";
import { PolicyPanel } from "@/components/workspace/policy-panel";
import { ReviewPanel } from "@/components/workspace/review-panel";
import { StepNavigation } from "@/components/workspace/step-navigation";
import { WorkspaceSummary } from "@/components/workspace/workspace-summary";
import type { AiAvailability, AppMode, GuidedDemoMilestone, ProposalReviewState, WorkflowStep } from "@/components/workspace/types";
import { AiControlProposalSchema, CaseAnalysisSchema, PolicyCompilationSchema, type AiControlProposal } from "@/src/domain/ai-schemas";
import { loadScenario, buildScenarioControls, createScenarioResetState, type ReviewScenario } from "@/src/domain/scenario-schema";
import { ControlDefinitionSchema, type CaseDocument, type ControlDefinition, type ControlResult, type ReviewDecision } from "@/src/domain/schemas";
import { defaultScenarioId, reviewScenarios } from "@/src/fixtures/scenarios";
import { useLocale } from "@/src/i18n/locale-context";
import { localizedControl, type TranslationKey } from "@/src/i18n/translations";
import { createDecisionReceipt } from "@/src/lib/decision-receipt";
import { appendAuditEvent, createAuditEvent, type AuditAction, type AuditEvent } from "@/src/lib/audit-trail";
import { LocalDocumentError, readLocalDocuments, type LocalDocument } from "@/src/lib/local-documents";
import { recordReviewDecision } from "@/src/lib/review-decision";
import { runDeterministicReview } from "@/src/lib/review-engine";
import { filterResults, summarizeResults, type ResultFilter } from "@/src/lib/review-summary";
import { assessEvidenceIntegrity, createRunSnapshot } from "@/src/lib/review-intelligence";
import { advanceRunHistory, loadRunHistory, persistRunHistory, removeRunHistory, type RunHistory } from "@/src/lib/review-run-history";
import { toCaseDocuments, toDeterministicControls } from "@/src/openai/mappers";

const steps: WorkflowStep[] = ["policy", "controls", "documents", "review", "decision"];
const emptyRunHistory: RunHistory = { version: 1, previous: null, latest: null };
const initialScenario = loadScenario(defaultScenarioId, reviewScenarios);

type Notice = {
  key: TranslationKey;
  values?: Record<string, string | number>;
  controlId?: string;
  fallbackTitle?: string;
  decisionState?: ReviewDecision["state"];
};
type Translator = (key: TranslationKey, values?: Record<string, string | number>) => string;

function freshScenarioControls(scenario: ReviewScenario): ControlDefinition[] {
  return buildScenarioControls(scenario);
}

function getApiError(body: unknown, fallbackKey: TranslationKey, t: Translator, useProviderMessage: boolean): string {
  if (body && typeof body === "object" && "error" in body && body.error && typeof body.error === "object") {
    const apiError = body.error as Record<string, unknown>;
    const text: string[] = [];
    text.push(useProviderMessage && typeof apiError.message === "string" ? apiError.message : t(fallbackKey));
    if (typeof apiError.category === "string") text.push(t("error.category", { category: apiError.category.replaceAll("_", " ") }));
    const reference = typeof apiError.requestId === "string" ? apiError.requestId : typeof apiError.correlationId === "string" ? apiError.correlationId : null;
    if (reference) text.push(t("error.reference", { reference }));
    return text.join(" ");
  }
  return t(fallbackKey);
}

export function DemoReviewWorkspace() {
  const { locale, t } = useLocale();
  const policyCompilationInFlight = useRef(false);
  const [activeScenario, setActiveScenario] = useState<ReviewScenario>(() => structuredClone(initialScenario));
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("policy");
  const [mode, setMode] = useState<AppMode>("DETERMINISTIC_DEMO");
  const [ai, setAi] = useState<AiAvailability>({ available: false, model: "gpt-5.6", checking: true });
  const [policyText, setPolicyText] = useState(initialScenario.policy.text);
  const [policyExpanded, setPolicyExpanded] = useState(false);
  const [controls, setControls] = useState<ControlDefinition[]>(() => freshScenarioControls(initialScenario));
  const [threshold, setThreshold] = useState(String(initialScenario.thresholdParameters.defaultAmount));
  const [thresholdInvalid, setThresholdInvalid] = useState(false);
  const [proposals, setProposals] = useState<AiControlProposal[]>([]);
  const [proposalsApproved, setProposalsApproved] = useState(false);
  const [proposalStates, setProposalStates] = useState<Record<string, ProposalReviewState>>({});
  const [localDocuments, setLocalDocuments] = useState<LocalDocument[]>([]);
  const [documentError, setDocumentError] = useState("");
  const [compilationError, setCompilationError] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [notice, setNotice] = useState<Notice>({ key: "notice.ready" });
  const [results, setResults] = useState<ControlResult[]>([]);
  const [reviewDocuments, setReviewDocuments] = useState<CaseDocument[]>([]);
  const [runHistory, setRunHistory] = useState<RunHistory>(emptyRunHistory);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ResultFilter>("ALL");
  const [reviewError, setReviewError] = useState("");
  const [runGeneratedAt, setRunGeneratedAt] = useState<string | null>(null);
  const [changedControlId, setChangedControlId] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(true);
  const [guideMilestones, setGuideMilestones] = useState<Set<GuidedDemoMilestone>>(() => new Set());
  const [completedScenarios, setCompletedScenarios] = useState<CompletedScenarioReview[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [judgeMode, setJudgeMode] = useState(false);
  const [judgeStep, setJudgeStep] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/ai/status")
      .then(async (response) => {
        if (!response.ok) throw new Error("AI status is unavailable.");
        return response.json() as Promise<unknown>;
      })
      .then((body) => {
        if (cancelled) return;
        const parsed = z.object({ available: z.boolean(), model: z.string() }).parse(body);
        setAi({ ...parsed, checking: false });
      })
      .catch(() => {
        if (!cancelled) setAi({ available: false, model: "gpt-5.6", checking: false });
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const loadHistory = window.setTimeout(() => {
      setRunHistory(loadRunHistory(window.localStorage, initialScenario.id));
    }, 0);
    return () => window.clearTimeout(loadHistory);
  }, []);

  const selectedResult = useMemo(() => results.find((result) => result.controlId === selectedControlId) ?? null, [results, selectedControlId]);
  const summary = useMemo(() => summarizeResults(results), [results]);
  const visibleResults = useMemo(() => filterResults(results, filter), [results, filter]);
  const enabledControlCount = mode === "DETERMINISTIC_DEMO" ? controls.filter((control) => control.enabled).length : proposals.filter((control) => control.enabled).length;
  const receipt = useMemo(() => runGeneratedAt && results.length ? createDecisionReceipt({ results, policyName: activeScenario.policy.title, policyVersion: activeScenario.policy.version, caseName: mode === "DETERMINISTIC_DEMO" ? activeScenario.caseName[locale] : "Local fictional document review", selectedLanguage: locale, runMode: mode, generatedAt: runGeneratedAt, enabledControlCount, auditTrail }) : null, [activeScenario, auditTrail, enabledControlCount, locale, mode, results, runGeneratedAt]);
  const documentCount = mode === "DETERMINISTIC_DEMO" ? activeScenario.documents.length : localDocuments.length;
  const documentTypes = useMemo(
    () => mode === "DETERMINISTIC_DEMO"
      ? Object.fromEntries(activeScenario.documents.map((document) => [document.id, document.type]))
      : Object.fromEntries(localDocuments.map((document) => [document.id, document.inferredType])),
    [activeScenario.documents, localDocuments, mode],
  );
  const currentStepIndex = steps.indexOf(currentStep);

  function completeGuide(...milestones: GuidedDemoMilestone[]) {
    setGuideMilestones((current) => {
      const next = new Set(current);
      milestones.forEach((milestone) => next.add(milestone));
      return next;
    });
  }

  function audit(action: AuditAction, description: string, controlId: string | null = null) {
    const event = createAuditEvent({ action, scenarioId: activeScenario.id, controlId, description, timestamp: new Date().toISOString() });
    setAuditTrail((current) => appendAuditEvent(current, event));
  }

  function navigate(step: WorkflowStep) {
    setCurrentStep(step);
    if (step === "controls") completeGuide("CONTROLS_REVIEWED");
    if (step === "decision" && receipt) completeGuide("RECEIPT_REVIEWED");
  }

  function clearReview(nextNotice: Notice) {
    setResults([]);
    setReviewDocuments([]);
    setSelectedControlId(null);
    setRunGeneratedAt(null);
    setFilter("ALL");
    setReviewError("");
    setChangedControlId(null);
    setWorkspaceError("");
    setNotice(nextNotice);
  }

  function selectScenario(scenarioId: string, confirmDecisionLoss = true, forceReload = false): boolean {
    if (!forceReload && scenarioId === activeScenario.id && mode === "DETERMINISTIC_DEMO") return true;
    const hasDecisions = results.some((result) => result.reviewerDecision.state !== "PENDING");
    if (confirmDecisionLoss && hasDecisions) {
      const approved = window.confirm(locale === "fr"
        ? "Changer de scénario supprimera les résultats, décisions, reçu et comparaison actuels. Continuer ?"
        : "Changing scenario will clear the current results, decisions, receipt, and run comparison. Continue?");
      if (!approved) return false;
    }
    const nextScenario = loadScenario(scenarioId, reviewScenarios);
    const reset = createScenarioResetState(nextScenario, locale);
    setMode("DETERMINISTIC_DEMO");
    setActiveScenario(reset.scenario);
    setPolicyText(reset.policyText);
    setControls(reset.controls);
    setThreshold(reset.threshold);
    setThresholdInvalid(false);
    setProposals([]);
    setProposalsApproved(false);
    setProposalStates({});
    setLocalDocuments([]);
    setDocumentError("");
    setCompilationError("");
    setRunHistory(emptyRunHistory);
    clearReview({ key: "notice.demoLoaded" });
    setGuideMilestones(new Set(["CASE_LOADED"]));
    setCurrentStep("policy");
    const event = createAuditEvent({ action: "SCENARIO_LOADED", scenarioId: nextScenario.id, description: `Loaded controlled scenario ${nextScenario.caseReference}.`, timestamp: new Date().toISOString() });
    setAuditTrail((current) => appendAuditEvent(current, event));
    return true;
  }

  function enterJudgeMode() {
    if (activeScenario.id !== defaultScenarioId && !selectScenario(defaultScenarioId, true)) return;
    setJudgeMode(true);
    setJudgeStep(0);
  }

  function loadDemo() {
    selectScenario(defaultScenarioId, false, true);
  }

  function changeMode(nextMode: AppMode) {
    if (nextMode === "LIVE_GPT_5_6" && !ai.available) return;
    setMode(nextMode);
    setPolicyExpanded(nextMode === "LIVE_GPT_5_6");
    setCurrentStep("policy");
    clearReview({ key: nextMode === "LIVE_GPT_5_6" ? "notice.liveSelected" : "notice.demoSelected" });
  }

  function updateThreshold(value: string) {
    setThreshold(value);
    const amount = Number(value);
    setThresholdInvalid(value.trim() === "" || !Number.isFinite(amount) || amount < 0);
    setChangedControlId(null);
    if (results.length) setNotice({ key: "notice.settingsChanged" });
    if (Number(value) === 15_000) completeGuide("THRESHOLD_UPDATED");
  }

  function toggleControl(id: string, enabled: boolean) {
    setControls((current) => current.map((control) => control.id === id ? { ...control, enabled } : control));
    if (results.length) setNotice({ key: "notice.settingsChanged" });
  }

  function resetControls() {
    setControls(freshScenarioControls(activeScenario));
    setThreshold(String(activeScenario.thresholdParameters.defaultAmount));
    setThresholdInvalid(false);
    clearReview({ key: "notice.controlsReset" });
  }

  async function compilePolicy() {
    if (policyCompilationInFlight.current) return;
    policyCompilationInFlight.current = true;
    setIsCompiling(true);
    setCompilationError("");
    try {
      const response = await fetch("/api/ai/policy", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ policyText }) });
      const body = (await response.json()) as unknown;
      if (!response.ok) throw new Error(getApiError(body, "error.policyCompilation", t, locale === "en"));
      const parsed = z.object({ compilation: PolicyCompilationSchema }).parse(body);
      setProposals(parsed.compilation.controls);
      setProposalStates(Object.fromEntries(parsed.compilation.controls.map((control) => [control.id, "PROPOSED" as const])));
      setProposalsApproved(false);
      setNotice({ key: "notice.proposalsReady", values: { count: parsed.compilation.controls.length } });
      setCurrentStep("controls");
    } catch (error) {
      setCompilationError(error instanceof Error ? error.message : t("error.policyCompilation"));
    } finally {
      policyCompilationInFlight.current = false;
      setIsCompiling(false);
    }
  }

  function updateProposal(id: string, patch: Partial<AiControlProposal>) {
    setProposals((current) => current.map((control) => control.id === id ? { ...control, ...patch } : control));
    setProposalStates((current) => ({ ...current, [id]: "EDITED" }));
    setProposalsApproved(false);
  }

  function rejectProposal(id: string) {
    setProposals((current) => current.map((control) => control.id === id ? { ...control, enabled: false } : control));
    setProposalStates((current) => ({ ...current, [id]: "REJECTED" }));
    setProposalsApproved(false);
  }

  function approveProposals() {
    try {
      const activeProposals = proposals.filter((proposal) => proposalStates[proposal.id] !== "REJECTED" && proposal.enabled);
      z.array(AiControlProposalSchema).min(1).parse(activeProposals);
      setProposalsApproved(true);
      setProposalStates((current) => Object.fromEntries(Object.entries(current).map(([id, state]) => [id, state === "REJECTED" ? state : "APPROVED"])));
      setWorkspaceError("");
      setNotice({ key: "notice.proposalsApproved" });
      setCurrentStep("documents");
      audit("CONTROLS_APPROVED", `Approved ${activeProposals.length} proposed controls.`);
    } catch {
      setWorkspaceError(t("error.approveControls"));
    }
  }

  async function selectFiles(files: File[]) {
    setDocumentError("");
    if (localDocuments.length + files.length > 10) {
      setDocumentError(t("error.maxDocuments"));
      return;
    }
    const existingNames = new Set(localDocuments.map((document) => document.name.toLocaleLowerCase()));
    const duplicate = files.find((file, index) => existingNames.has(file.name.toLocaleLowerCase()) || files.findIndex((candidate) => candidate.name.toLocaleLowerCase() === file.name.toLocaleLowerCase()) !== index);
    if (duplicate) {
      setDocumentError(t("error.document.duplicate", { name: duplicate.name }));
      return;
    }
    try {
      const offset = localDocuments.length;
      const next = await readLocalDocuments(files, (file, index) => `LOCAL-${offset + index + 1}-${file.name.replace(/[^a-z0-9]+/gi, "-").toUpperCase()}`);
      setLocalDocuments((current) => [...current, ...next]);
      setNotice({ key: "notice.documentsSelected", values: { count: next.length } });
    } catch (error) {
      if (error instanceof LocalDocumentError) {
        const keyByCode: Partial<Record<typeof error.code, TranslationKey>> = {
          TOO_MANY: "error.maxDocuments",
          DUPLICATE_NAME: "error.document.duplicate",
          NAME_TOO_LONG: "error.document.name",
          UNSUPPORTED_EXTENSION: "error.document.extension",
          TOO_LARGE: "error.document.size",
          UNSUPPORTED_MIME: "error.document.mime",
          EMPTY: "error.document.empty",
          BINARY: "error.document.binary",
          INVALID_JSON: "error.document.json",
          UNSUPPORTED_ENCODING: "error.document.encoding",
          LINE_TOO_LONG: "error.document.line",
        };
        const key = keyByCode[error.code] ?? "error.readDocuments";
        setDocumentError(t(key, { name: error.filename ?? "File" }));
      } else {
        setDocumentError(t("error.readDocuments"));
      }
    }
  }

  function removeDocument(id: string) {
    setLocalDocuments((current) => current.filter((document) => document.id !== id));
    setNotice({ key: "notice.documentRemoved" });
  }

  function updateDocumentLabel(id: string, label: string) {
    setLocalDocuments((current) => current.map((document) => document.id === id ? { ...document, label } : document));
  }

  function prepareDemoControls(): ControlDefinition[] {
    const thresholdAmount = Number(threshold);
    if (!Number.isFinite(thresholdAmount) || thresholdAmount < 0 || threshold.trim() === "") throw new Error(t("error.thresholdBeforeRun"));
    const next = controls.map((control) => control.kind === "APPROVAL_THRESHOLD" ? ControlDefinitionSchema.parse({ ...control, parameters: { ...control.parameters, thresholdAmount } }) : control);
    if (!next.some((control) => control.enabled)) throw new Error(t("error.enableControl"));
    return next;
  }

  async function runReview() {
    const hadReviewerDecisions = results.some((result) => result.reviewerDecision.state !== "PENDING");
    const previousStatuses = new Map(results.map((result) => [result.controlId, result.status]));
    setIsRunning(true);
    setWorkspaceError("");
    try {
      let nextResults: ControlResult[];
      let nextReviewDocuments: CaseDocument[];
      if (mode === "DETERMINISTIC_DEMO") {
        const nextControls = prepareDemoControls();
        setControls(nextControls);
        nextResults = runDeterministicReview(nextControls, activeScenario.documents);
        nextReviewDocuments = activeScenario.documents;
      } else {
        if (!ai.available) throw new Error(t("error.liveUnavailable"));
        if (!proposalsApproved) throw new Error(t("error.liveApprove"));
        if (!localDocuments.length) throw new Error(t("error.liveDocuments"));
        const approvedProposals = proposals.filter((proposal) => proposal.enabled && proposalStates[proposal.id] === "APPROVED");
        if (!approvedProposals.length) throw new Error(t("error.liveApprove"));
        const response = await fetch("/api/ai/analyze", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ documents: localDocuments, controls: approvedProposals }) });
        const body = (await response.json()) as unknown;
        if (!response.ok) throw new Error(getApiError(body, "error.caseAnalysis", t, locale === "en"));
        const analysis = z.object({ analysis: CaseAnalysisSchema }).parse(body).analysis;
        const deterministicControls = toDeterministicControls(approvedProposals);
        if (!deterministicControls.length) throw new Error(t("error.noControls"));
        nextReviewDocuments = toCaseDocuments(analysis, localDocuments);
        nextResults = runDeterministicReview(deterministicControls, nextReviewDocuments);
      }
      setResults(nextResults);
      setReviewDocuments(nextReviewDocuments);
      setChangedControlId(nextResults.find((result) => previousStatuses.has(result.controlId) && previousStatuses.get(result.controlId) !== result.status)?.controlId ?? null);
      setSelectedControlId(nextResults.find((result) => result.controlId === activeScenario.guidedDemo.defaultSelectedControlId)?.controlId ?? nextResults[0]?.controlId ?? null);
      setFilter("ALL");
      const generatedAt = new Date().toISOString();
      setRunGeneratedAt(generatedAt);
      setReviewError("");
      setNotice(hadReviewerDecisions ? { key: "notice.reviewRerun" } : { key: "notice.reviewComplete", values: { count: nextResults.length } });
      setCurrentStep("review");
      const nextSummary = summarizeResults(nextResults);
      const snapshot = createRunSnapshot(generatedAt, Number(threshold), nextResults, nextSummary, activeScenario.id);
      audit("CONTROLS_APPROVED", `Approved ${nextResults.length} enabled controls for evaluation.`);
      audit("REVIEW_RUN", `Evaluated ${nextResults.length} controls; ${nextSummary.pending} human decisions remain open.`);
      if (runHistory.latest && runHistory.latest.threshold !== Number(threshold)) {
        audit("THRESHOLD_CHANGED", `Changed approval threshold to ${Number(threshold)} EUR.`);
        audit("RUN_COMPARISON_CREATED", "Created a comparison with the previous run.");
      }
      setRunHistory((current) => {
        const next = advanceRunHistory(current, snapshot);
        persistRunHistory(window.localStorage, next, activeScenario.id);
        return next;
      });
      if (mode === "DETERMINISTIC_DEMO") {
        const verifiedControls = nextResults.filter((result) => assessEvidenceIntegrity(result, nextReviewDocuments).state === "VERIFIED").length;
        const completed: CompletedScenarioReview = { scenarioId: activeScenario.id, summary: nextSummary, unresolved: nextSummary.pending, verifiedControls, controlCount: nextResults.length };
        setCompletedScenarios((current) => [...current.filter((item) => item.scenarioId !== activeScenario.id), completed]);
      }
      if (mode === "DETERMINISTIC_DEMO" && Number(threshold) === activeScenario.thresholdParameters.defaultAmount && nextSummary.PASS === activeScenario.expectedOutcomeCounts.PASS && nextSummary.FAIL === activeScenario.expectedOutcomeCounts.FAIL && nextSummary.MISSING === activeScenario.expectedOutcomeCounts.MISSING && nextSummary.WARNING === activeScenario.expectedOutcomeCounts.WARNING) completeGuide("INITIAL_REVIEW_RUN");
      if (mode === "DETERMINISTIC_DEMO" && activeScenario.thresholdParameters.comparisonAmount === Number(threshold) && nextResults.find((result) => result.controlId === "CTRL-APPROVAL")?.status === "PASS") completeGuide("THRESHOLD_RERUN");
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : t("error.review"));
    } finally {
      setIsRunning(false);
    }
  }

  function updateComment(comment: string) {
    if (!selectedControlId) return;
    setResults((current) => current.map((result) => result.controlId === selectedControlId ? { ...result, reviewerDecision: { ...result.reviewerDecision, comment } } : result));
    setReviewError("");
  }

  function applyDecision(state: ReviewDecision["state"]) {
    if (!selectedResult) return;
    try {
      const reviewed = recordReviewDecision(selectedResult, state, selectedResult.reviewerDecision.comment);
      setResults((current) => {
        const next = current.map((result) => result.controlId === reviewed.controlId ? reviewed : result);
        if (mode === "DETERMINISTIC_DEMO") {
          const nextSummary = summarizeResults(next);
          setCompletedScenarios((completed) => completed.map((item) => item.scenarioId === activeScenario.id ? { ...item, summary: nextSummary, unresolved: nextSummary.pending } : item));
        }
        return next;
      });
      setReviewError("");
      setNotice({ key: "notice.decisionSaved", controlId: selectedResult.controlId, fallbackTitle: selectedResult.title, decisionState: state });
      completeGuide("DECISION_RECORDED");
      audit("REVIEWER_DECISION_SAVED", `Saved reviewer decision ${state}.`, reviewed.controlId);
    } catch {
      setReviewError(state === "REJECTED" || state === "ACCEPTED_EXCEPTION" ? t("error.overrideComment") : t("error.decision"));
    }
  }

  function changeFilter(nextFilter: ResultFilter) {
    setFilter(nextFilter);
    const nextVisible = filterResults(results, nextFilter);
    if (nextVisible.length && !nextVisible.some((result) => result.controlId === selectedControlId)) setSelectedControlId(nextVisible[0].controlId);
  }

  function clearRunHistory() {
    removeRunHistory(window.localStorage, activeScenario.id);
    setRunHistory(emptyRunHistory);
  }

  const panel = currentStep === "policy" ? (
    <PolicyPanel mode={mode} ai={ai} policyText={policyText} expanded={policyExpanded} isCompiling={isCompiling} compilationError={compilationError} onPolicyTextChange={(value) => { setPolicyText(value); setProposalsApproved(false); }} onToggleExpanded={() => { setPolicyExpanded((current) => !current); completeGuide("POLICY_REVIEWED"); }} onCompile={compilePolicy} onOpenControls={() => navigate("controls")} />
  ) : currentStep === "controls" ? (
    <ControlsPanel mode={mode} controls={controls} proposals={proposals} proposalsApproved={proposalsApproved} proposalStates={proposalStates} threshold={threshold} thresholdError={thresholdInvalid ? t("error.threshold") : ""} onThresholdChange={updateThreshold} onToggleControl={toggleControl} onResetControls={resetControls} onProposalChange={updateProposal} onApproveProposals={approveProposals} onRejectProposal={rejectProposal} />
  ) : currentStep === "documents" ? (
    <DocumentsPanel mode={mode} demoDocuments={activeScenario.documents} localDocuments={localDocuments} documentError={documentError} onSelectFiles={selectFiles} onRemoveDocument={removeDocument} onUpdateLabel={updateDocumentLabel} onLoadDemo={loadDemo} onResetDemo={() => selectScenario(activeScenario.id, false, true)} caseName={activeScenario.caseName[locale]} />
  ) : currentStep === "review" ? (
    <ReviewPanel results={results} visibleResults={visibleResults} summary={summary} filter={filter} selectedResult={selectedResult} threshold={threshold} mode={mode} documents={reviewDocuments} controls={controls} policyText={activeScenario.policy.text} caseName={activeScenario.caseName[locale]} caseReference={activeScenario.caseReference} documentTypes={documentTypes} changedControlId={changedControlId} currentRun={runHistory.latest} previousRun={runHistory.previous} onFilterChange={changeFilter} onSelectResult={(controlId) => { setSelectedControlId(controlId); setReviewError(""); if (controlId === activeScenario.guidedDemo.defaultSelectedControlId) completeGuide("CONTRADICTION_INSPECTED"); }} onClearHistory={clearRunHistory} onGoDecision={() => navigate("decision")} />
  ) : (
    <DecisionPanel results={results} documents={reviewDocuments} selectedResult={selectedResult} summary={summary} receipt={receipt} reviewError={reviewError} threshold={threshold} policyReference={activeScenario.policyReference} onSelectResult={(controlId) => { setSelectedControlId(controlId); setReviewError(""); }} onCommentChange={updateComment} onDecision={applyDecision} onReopenEvidence={() => navigate("review")} onExport={(format) => audit("RECEIPT_EXPORTED", `Exported the review receipt as ${format}.`)} />
  );

  const primaryLabel = currentStep === "policy"
    ? mode === "LIVE_GPT_5_6" ? (locale === "fr" ? "Compiler la politique" : "Compile policy") : (locale === "fr" ? "Ouvrir le registre" : "Open register")
    : currentStep === "controls" || currentStep === "documents"
      ? isRunning ? t("action.running") : t("action.run")
      : currentStep === "review"
        ? (locale === "fr" ? "Accéder aux décisions" : "Go to decisions")
        : t("action.print");

  function runPrimaryAction() {
    if (currentStep === "policy") {
      if (mode === "LIVE_GPT_5_6") void compilePolicy();
      else navigate("controls");
      return;
    }
    if (currentStep === "controls" || currentStep === "documents") {
      void runReview();
      return;
    }
    if (currentStep === "review") {
      navigate("decision");
      return;
    }
    window.print();
  }

  return (
    <main className="app-root" aria-busy={isCompiling || isRunning}>
      <a href="#workspace" className="skip-link">{t("a11y.skip")}</a>
      <AppHeader mode={mode} ai={ai} onModeChange={changeMode} primaryLabel={primaryLabel} onPrimaryAction={runPrimaryAction} primaryDisabled={isRunning || isCompiling || (currentStep === "policy" && mode === "LIVE_GPT_5_6" && (!ai.available || policyText.trim().length < 50))} onShowGuide={() => setGuideDismissed(false)} />
      <div className="workspace-frame">
        <StepNavigation current={currentStep} onChange={navigate} enabledControls={enabledControlCount} documentCount={documentCount} summary={summary} caseReference={activeScenario.caseReference} policyReference={activeScenario.policyReference} policyVersion={activeScenario.policy.version} />
        <div id="workspace" className="workspace-surface">
          {currentStep === "policy" && mode === "DETERMINISTIC_DEMO" && <CaseLibrary scenarios={reviewScenarios} activeScenarioId={activeScenario.id} onSelect={selectScenario} />}
          {currentStep === "policy" && !guideMilestones.has("CASE_LOADED") && <IntroPanel onStartDemo={loadDemo} />}
          <WorkspaceSummary onLoadDemo={loadDemo} guideDismissed={guideDismissed} guideMilestones={guideMilestones} onDismissGuide={() => setGuideDismissed(true)} />
          <CompetitionTools judgeMode={judgeMode} judgeStep={judgeStep} completed={completedScenarios} scenarios={reviewScenarios} auditTrail={auditTrail} onEnterJudgeMode={enterJudgeMode} onExitJudgeMode={() => setJudgeMode(false)} onJudgeStep={setJudgeStep} onSelectScenario={(scenarioId) => { if (scenarioId === activeScenario.id && results.length) navigate("review"); else selectScenario(scenarioId); }} onClearAudit={() => setAuditTrail([])} />
          <div className="workspace-notice" data-tone={workspaceError ? "error" : "neutral"}>
            <span aria-hidden="true" className="workspace-notice-dot" />
            <div>
              <p aria-live="polite" role="status">
                {t(
                  notice.key,
                  notice.controlId && notice.decisionState
                    ? {
                        title: localizedControl(notice.controlId, locale, notice.fallbackTitle ?? notice.controlId).title,
                        decision: t(`decision.${notice.decisionState}`).toLocaleLowerCase(locale === "fr" ? "fr-FR" : "en-US"),
                      }
                    : notice.values,
                )}
              </p>
              {workspaceError && <p role="alert" className="workspace-error-copy">{workspaceError}</p>}
            </div>
          </div>

          <div className="active-workflow">
            {panel}
            <div className="workflow-actions">
              <button type="button" onClick={() => navigate(steps[Math.max(0, currentStepIndex - 1)])} disabled={currentStepIndex === 0} className="secondary-button disabled:invisible">← {t("action.back")}</button>
              <button
                type="button"
                onClick={runPrimaryAction}
                disabled={isRunning || isCompiling || (currentStep === "policy" && mode === "LIVE_GPT_5_6" && (!ai.available || policyText.trim().length < 50))}
                className="primary-button mobile-primary-action"
              >
                {primaryLabel}
              </button>
              {currentStepIndex < steps.length - 1 && <button type="button" onClick={() => navigate(steps[currentStepIndex + 1])} className="secondary-button workflow-next-action">{t("action.next")} →</button>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
