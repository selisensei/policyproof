"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { AppHeader } from "@/components/workspace/app-header";
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
import { ControlDefinitionSchema, type ControlDefinition, type ControlResult, type ReviewDecision } from "@/src/domain/schemas";
import { demoControls, demoDocuments, demoPolicy } from "@/src/fixtures/demo-case";
import { useLocale } from "@/src/i18n/locale-context";
import { localizedControl, type TranslationKey } from "@/src/i18n/translations";
import { createDecisionReceipt } from "@/src/lib/decision-receipt";
import { LocalDocumentError, readLocalDocuments, type LocalDocument } from "@/src/lib/local-documents";
import { recordReviewDecision } from "@/src/lib/review-decision";
import { runDeterministicReview } from "@/src/lib/review-engine";
import { filterResults, summarizeResults, type ResultFilter } from "@/src/lib/review-summary";
import { toCaseDocuments, toDeterministicControls } from "@/src/openai/mappers";

const CASE_NAME = "Northstar Facilities vendor change";
const steps: WorkflowStep[] = ["policy", "controls", "documents", "review", "decision"];

type Notice = {
  key: TranslationKey;
  values?: Record<string, string | number>;
  controlId?: string;
  fallbackTitle?: string;
  decisionState?: ReviewDecision["state"];
};
type Translator = (key: TranslationKey, values?: Record<string, string | number>) => string;

function freshDemoControls(): ControlDefinition[] {
  return structuredClone(demoControls);
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
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("policy");
  const [mode, setMode] = useState<AppMode>("DETERMINISTIC_DEMO");
  const [ai, setAi] = useState<AiAvailability>({ available: false, model: "gpt-5.6", checking: true });
  const [policyText, setPolicyText] = useState(demoPolicy.text);
  const [policyExpanded, setPolicyExpanded] = useState(false);
  const [controls, setControls] = useState<ControlDefinition[]>(freshDemoControls);
  const [threshold, setThreshold] = useState("10000");
  const [thresholdInvalid, setThresholdInvalid] = useState(false);
  const [proposals, setProposals] = useState<AiControlProposal[]>([]);
  const [proposalsApproved, setProposalsApproved] = useState(false);
  const [proposalValidationFailed, setProposalValidationFailed] = useState(false);
  const [proposalStates, setProposalStates] = useState<Record<string, ProposalReviewState>>({});
  const [localDocuments, setLocalDocuments] = useState<LocalDocument[]>([]);
  const [documentError, setDocumentError] = useState("");
  const [compilationError, setCompilationError] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [notice, setNotice] = useState<Notice>({ key: "notice.ready" });
  const [results, setResults] = useState<ControlResult[]>([]);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ResultFilter>("ALL");
  const [reviewError, setReviewError] = useState("");
  const [runGeneratedAt, setRunGeneratedAt] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [guideDismissed, setGuideDismissed] = useState(false);
  const [guideMilestones, setGuideMilestones] = useState<Set<GuidedDemoMilestone>>(() => new Set());

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

  const selectedResult = useMemo(() => results.find((result) => result.controlId === selectedControlId) ?? null, [results, selectedControlId]);
  const summary = useMemo(() => summarizeResults(results), [results]);
  const visibleResults = useMemo(() => filterResults(results, filter), [results, filter]);
  const enabledControlCount = mode === "DETERMINISTIC_DEMO" ? controls.filter((control) => control.enabled).length : proposals.filter((control) => control.enabled).length;
  const receipt = useMemo(() => runGeneratedAt && results.length ? createDecisionReceipt({ results, policyName: demoPolicy.title, policyVersion: demoPolicy.version, caseName: mode === "DETERMINISTIC_DEMO" ? CASE_NAME : "Local fictional document review", selectedLanguage: locale, runMode: mode, generatedAt: runGeneratedAt, enabledControlCount }) : null, [enabledControlCount, locale, mode, results, runGeneratedAt]);
  const documentCount = mode === "DETERMINISTIC_DEMO" ? demoDocuments.length : localDocuments.length;
  const documentTypes = useMemo(
    () => mode === "DETERMINISTIC_DEMO"
      ? Object.fromEntries(demoDocuments.map((document) => [document.id, document.type]))
      : Object.fromEntries(localDocuments.map((document) => [document.id, document.inferredType])),
    [localDocuments, mode],
  );
  const currentStepIndex = steps.indexOf(currentStep);

  function completeGuide(...milestones: GuidedDemoMilestone[]) {
    setGuideMilestones((current) => {
      const next = new Set(current);
      milestones.forEach((milestone) => next.add(milestone));
      return next;
    });
  }

  function navigate(step: WorkflowStep) {
    setCurrentStep(step);
    if (step === "controls") completeGuide("CONTROLS_REVIEWED");
    if (step === "decision" && receipt) completeGuide("RECEIPT_REVIEWED");
  }

  function clearReview(nextNotice: Notice) {
    setResults([]);
    setSelectedControlId(null);
    setRunGeneratedAt(null);
    setFilter("ALL");
    setReviewError("");
    setWorkspaceError("");
    setNotice(nextNotice);
  }

  function loadDemo() {
    setMode("DETERMINISTIC_DEMO");
    setPolicyText(demoPolicy.text);
    setControls(freshDemoControls());
    setThreshold("10000");
    setThresholdInvalid(false);
    setProposals([]);
    setProposalsApproved(false);
    setProposalValidationFailed(false);
    setProposalStates({});
    setLocalDocuments([]);
    setDocumentError("");
    setCompilationError("");
    clearReview({ key: "notice.demoLoaded" });
    completeGuide("CASE_LOADED");
    setCurrentStep("policy");
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
    if (results.length) setNotice({ key: "notice.settingsChanged" });
    if (Number(value) === 15_000) completeGuide("THRESHOLD_UPDATED");
  }

  function toggleControl(id: string, enabled: boolean) {
    setControls((current) => current.map((control) => control.id === id ? { ...control, enabled } : control));
    if (results.length) setNotice({ key: "notice.settingsChanged" });
  }

  function resetControls() {
    setControls(freshDemoControls());
    setThreshold("10000");
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
      setProposalValidationFailed(false);
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
    setProposalValidationFailed(false);
  }

  function rejectProposal(id: string) {
    setProposals((current) => current.map((control) => control.id === id ? { ...control, enabled: false } : control));
    setProposalStates((current) => ({ ...current, [id]: "REJECTED" }));
    setProposalsApproved(false);
    setProposalValidationFailed(false);
  }

  function approveProposals() {
    try {
      const activeProposals = proposals.filter((proposal) => proposalStates[proposal.id] !== "REJECTED" && proposal.enabled);
      z.array(AiControlProposalSchema).min(1).parse(activeProposals);
      setProposalsApproved(true);
      setProposalValidationFailed(false);
      setProposalStates((current) => Object.fromEntries(Object.entries(current).map(([id, state]) => [id, state === "REJECTED" ? state : "APPROVED"])));
      setWorkspaceError("");
      setNotice({ key: "notice.proposalsApproved" });
      setCurrentStep("documents");
    } catch {
      setProposalValidationFailed(true);
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
    setIsRunning(true);
    setWorkspaceError("");
    try {
      let nextResults: ControlResult[];
      if (mode === "DETERMINISTIC_DEMO") {
        const nextControls = prepareDemoControls();
        setControls(nextControls);
        nextResults = runDeterministicReview(nextControls, demoDocuments);
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
        nextResults = runDeterministicReview(deterministicControls, toCaseDocuments(analysis, localDocuments));
      }
      setResults(nextResults);
      setSelectedControlId(nextResults[0]?.controlId ?? null);
      setFilter("ALL");
      setRunGeneratedAt(new Date().toISOString());
      setReviewError("");
      setNotice(hadReviewerDecisions ? { key: "notice.reviewRerun" } : { key: "notice.reviewComplete", values: { count: nextResults.length } });
      setCurrentStep("review");
      const nextSummary = summarizeResults(nextResults);
      if (mode === "DETERMINISTIC_DEMO" && Number(threshold) === 10_000 && nextSummary.PASS === 3 && nextSummary.FAIL === 2 && nextSummary.MISSING === 1 && nextSummary.WARNING === 1) completeGuide("INITIAL_REVIEW_RUN");
      if (mode === "DETERMINISTIC_DEMO" && Number(threshold) === 15_000 && nextResults.find((result) => result.controlId === "CTRL-APPROVAL")?.status === "PASS") completeGuide("THRESHOLD_RERUN");
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
      setResults((current) => current.map((result) => result.controlId === reviewed.controlId ? reviewed : result));
      setReviewError("");
      setNotice({ key: "notice.decisionSaved", controlId: selectedResult.controlId, fallbackTitle: selectedResult.title, decisionState: state });
      completeGuide("DECISION_RECORDED");
    } catch {
      setReviewError(state === "REJECTED" || state === "ACCEPTED_EXCEPTION" ? t("error.overrideComment") : t("error.decision"));
    }
  }

  function changeFilter(nextFilter: ResultFilter) {
    setFilter(nextFilter);
    const nextVisible = filterResults(results, nextFilter);
    if (nextVisible.length && !nextVisible.some((result) => result.controlId === selectedControlId)) setSelectedControlId(nextVisible[0].controlId);
  }

  const panel = currentStep === "policy" ? (
    <PolicyPanel mode={mode} ai={ai} policyText={policyText} expanded={policyExpanded} isCompiling={isCompiling} compilationError={compilationError} onPolicyTextChange={(value) => { setPolicyText(value); setProposalsApproved(false); }} onToggleExpanded={() => { setPolicyExpanded((current) => !current); completeGuide("POLICY_REVIEWED"); }} onCompile={compilePolicy} />
  ) : currentStep === "controls" ? (
    <ControlsPanel mode={mode} controls={controls} proposals={proposals} proposalsApproved={proposalsApproved} proposalStates={proposalStates} threshold={threshold} thresholdError={thresholdInvalid ? t("error.threshold") : ""} onThresholdChange={updateThreshold} onToggleControl={toggleControl} onResetControls={resetControls} onProposalChange={updateProposal} onApproveProposals={approveProposals} onRejectProposal={rejectProposal} />
  ) : currentStep === "documents" ? (
    <DocumentsPanel mode={mode} demoDocuments={demoDocuments} localDocuments={localDocuments} documentError={documentError} onSelectFiles={selectFiles} onRemoveDocument={removeDocument} onUpdateLabel={updateDocumentLabel} onLoadDemo={loadDemo} onResetDemo={loadDemo} />
  ) : currentStep === "review" ? (
    <ReviewPanel results={results} visibleResults={visibleResults} summary={summary} filter={filter} selectedResult={selectedResult} threshold={threshold} mode={mode} documentTypes={documentTypes} onFilterChange={changeFilter} onSelectResult={(controlId) => { setSelectedControlId(controlId); setReviewError(""); if (controlId === "CTRL-CURRENCY") completeGuide("CONTRADICTION_INSPECTED"); }} />
  ) : (
    <DecisionPanel selectedResult={selectedResult} summary={summary} receipt={receipt} reviewError={reviewError} onCommentChange={updateComment} onDecision={applyDecision} />
  );

  return (
    <main className="min-h-screen bg-[#f3f5f3] pb-12" aria-busy={isCompiling || isRunning}>
      <a href="#workspace" className="sr-only z-50 rounded bg-white p-3 font-semibold text-slate-950 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">{t("a11y.skip")}</a>
      <AppHeader mode={mode} ai={ai} onModeChange={changeMode} onRun={runReview} isRunning={isRunning} />
      <StepNavigation current={currentStep} onChange={navigate} />
      <div id="workspace" className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 xl:px-8">
        <IntroPanel onStartDemo={loadDemo} compact={currentStep !== "policy"} />
        <div className={`mode-banner ${mode === "DETERMINISTIC_DEMO" ? "border-teal-200 bg-teal-50/70 text-teal-950" : "border-indigo-200 bg-indigo-50 text-indigo-950"}`}>
          <span className="font-bold">{t(mode === "DETERMINISTIC_DEMO" ? "mode.demo" : "mode.live")}</span>
          <span className="hidden sm:inline"> — </span><span className="block sm:inline">{t(mode === "DETERMINISTIC_DEMO" ? "mode.demo.description" : "mode.live.description")}</span>
          {!ai.checking && !ai.available && <span className="mt-1 block text-xs">{t("mode.live.disabled")}</span>}
        </div>
        <div aria-live="polite" role="status" className="notice-bar">
          {t(
            notice.key,
            notice.controlId && notice.decisionState
              ? {
                  title: localizedControl(notice.controlId, locale, notice.fallbackTitle ?? notice.controlId).title,
                  decision: t(`decision.${notice.decisionState}`).toLocaleLowerCase(locale === "fr" ? "fr-FR" : "en-US"),
                }
              : notice.values,
          )}
        </div>
        {workspaceError && <p role="alert" className="error-callout mt-3">{workspaceError}</p>}

        <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0">
            {panel}
            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" onClick={() => navigate(steps[Math.max(0, currentStepIndex - 1)])} disabled={currentStepIndex === 0} className="secondary-button disabled:invisible">← {t("action.back")}</button>
              {currentStepIndex < steps.length - 1 && <button type="button" onClick={() => navigate(steps[currentStepIndex + 1])} className="secondary-button">{t("action.next")} →</button>}
            </div>
          </div>
          <WorkspaceSummary enabledControlCount={enabledControlCount} documentCount={documentCount} summary={summary} results={results} currentStep={currentStep} onLoadDemo={loadDemo} guideDismissed={guideDismissed} guideMilestones={guideMilestones} onDismissGuide={() => setGuideDismissed(true)} mode={mode} isCompiling={isCompiling} compilationError={compilationError} proposals={proposals} proposalStates={proposalStates} proposalsApproved={proposalsApproved} proposalValidationFailed={proposalValidationFailed} isRunning={isRunning} workspaceError={workspaceError} />
        </div>
      </div>
    </main>
  );
}
