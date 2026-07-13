"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/workspace/app-header";
import { ControlsPanel } from "@/components/workspace/controls-panel";
import { DecisionPanel } from "@/components/workspace/decision-panel";
import { DocumentsPanel } from "@/components/workspace/documents-panel";
import { PolicyPanel } from "@/components/workspace/policy-panel";
import { ReviewPanel } from "@/components/workspace/review-panel";
import { StepNavigation } from "@/components/workspace/step-navigation";
import type { AiAvailability, AppMode } from "@/components/workspace/types";
import {
  AiControlProposalSchema,
  CaseAnalysisSchema,
  PolicyCompilationSchema,
  type AiControlProposal,
} from "@/src/domain/ai-schemas";
import {
  ControlDefinitionSchema,
  type ControlDefinition,
  type ControlResult,
  type ReviewDecision,
} from "@/src/domain/schemas";
import { demoControls, demoDocuments, demoPolicy } from "@/src/fixtures/demo-case";
import { createDecisionReceipt } from "@/src/lib/decision-receipt";
import { readLocalDocuments, type LocalDocument } from "@/src/lib/local-documents";
import { recordReviewDecision } from "@/src/lib/review-decision";
import { runDeterministicReview } from "@/src/lib/review-engine";
import { filterResults, summarizeResults, type ResultFilter } from "@/src/lib/review-summary";
import { toCaseDocuments, toDeterministicControls } from "@/src/openai/mappers";
import { z } from "zod";

const CASE_NAME = "Northstar Facilities vendor change";

function freshDemoControls(): ControlDefinition[] {
  return structuredClone(demoControls);
}

function getApiError(body: unknown, fallback: string): string {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    body.error &&
    typeof body.error === "object" &&
    "message" in body.error &&
    typeof body.error.message === "string"
  ) {
    return body.error.message;
  }
  return fallback;
}

export function DemoReviewWorkspace() {
  const [mode, setMode] = useState<AppMode>("DETERMINISTIC_DEMO");
  const [ai, setAi] = useState<AiAvailability>({ available: false, model: "gpt-5.6", checking: true });
  const [policyText, setPolicyText] = useState(demoPolicy.text);
  const [policyExpanded, setPolicyExpanded] = useState(false);
  const [controls, setControls] = useState<ControlDefinition[]>(freshDemoControls);
  const [threshold, setThreshold] = useState("10000");
  const [thresholdError, setThresholdError] = useState("");
  const [proposals, setProposals] = useState<AiControlProposal[]>([]);
  const [proposalsApproved, setProposalsApproved] = useState(false);
  const [localDocuments, setLocalDocuments] = useState<LocalDocument[]>([]);
  const [documentError, setDocumentError] = useState("");
  const [compilationError, setCompilationError] = useState("");
  const [workspaceError, setWorkspaceError] = useState("");
  const [notice, setNotice] = useState("Demo case ready. Run the review when controls are confirmed.");
  const [results, setResults] = useState<ControlResult[]>([]);
  const [selectedControlId, setSelectedControlId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ResultFilter>("ALL");
  const [reviewError, setReviewError] = useState("");
  const [runGeneratedAt, setRunGeneratedAt] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

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
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedResult = useMemo(
    () => results.find((result) => result.controlId === selectedControlId) ?? null,
    [results, selectedControlId],
  );
  const summary = useMemo(() => summarizeResults(results), [results]);
  const visibleResults = useMemo(() => filterResults(results, filter), [results, filter]);
  const receipt = useMemo(
    () =>
      runGeneratedAt && results.length
        ? createDecisionReceipt({
            results,
            policyVersion: demoPolicy.version,
            caseName: mode === "DETERMINISTIC_DEMO" ? CASE_NAME : "Local fictional document review",
            runMode: mode,
            generatedAt: runGeneratedAt,
          })
        : null,
    [mode, results, runGeneratedAt],
  );

  function clearReview(message: string) {
    setResults([]);
    setSelectedControlId(null);
    setRunGeneratedAt(null);
    setFilter("ALL");
    setReviewError("");
    setWorkspaceError("");
    setNotice(message);
  }

  function loadDemo() {
    setMode("DETERMINISTIC_DEMO");
    setPolicyText(demoPolicy.text);
    setControls(freshDemoControls());
    setThreshold("10000");
    setThresholdError("");
    setProposals([]);
    setProposalsApproved(false);
    setLocalDocuments([]);
    setDocumentError("");
    setCompilationError("");
    clearReview("Demo case loaded. All seven controls are enabled at a EUR 10,000 threshold.");
  }

  function changeMode(nextMode: AppMode) {
    if (nextMode === "LIVE_GPT_5_6" && !ai.available) return;
    setMode(nextMode);
    setPolicyExpanded(nextMode === "LIVE_GPT_5_6");
    clearReview(
      nextMode === "LIVE_GPT_5_6"
        ? "Live mode selected. Compile the policy, approve controls, and select fictional local documents."
        : "Deterministic demo selected. Fixture data remains ready to review.",
    );
  }

  function updateThreshold(value: string) {
    setThreshold(value);
    const amount = Number(value);
    setThresholdError(
      value.trim() === "" || !Number.isFinite(amount) || amount < 0
        ? "Enter a valid threshold of zero or more."
        : "",
    );
    if (results.length) setNotice("Control settings changed. Rerun the review to replace the previous results and reviewer decisions.");
  }

  function toggleControl(id: string, enabled: boolean) {
    setControls((current) => current.map((control) => (control.id === id ? { ...control, enabled } : control)));
    if (results.length) setNotice("Control settings changed. Rerun the review to replace the previous results and reviewer decisions.");
  }

  function resetControls() {
    setControls(freshDemoControls());
    setThreshold("10000");
    setThresholdError("");
    clearReview("Demo controls reset to seven enabled controls and a EUR 10,000 threshold.");
  }

  async function compilePolicy() {
    setIsCompiling(true);
    setCompilationError("");
    try {
      const response = await fetch("/api/ai/policy", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ policyText }),
      });
      const body = (await response.json()) as unknown;
      if (!response.ok) throw new Error(getApiError(body, "Policy compilation failed."));
      const parsed = z.object({ compilation: PolicyCompilationSchema }).parse(body);
      setProposals(parsed.compilation.controls);
      setProposalsApproved(false);
      setNotice(`${parsed.compilation.controls.length} GPT-5.6 control proposals are ready for human review.`);
    } catch (error) {
      setCompilationError(error instanceof Error ? error.message : "Policy compilation failed.");
    } finally {
      setIsCompiling(false);
    }
  }

  function updateProposal(id: string, patch: Partial<AiControlProposal>) {
    setProposals((current) => current.map((control) => (control.id === id ? { ...control, ...patch } : control)));
    setProposalsApproved(false);
  }

  function approveProposals() {
    try {
      z.array(AiControlProposalSchema).min(1).parse(proposals);
      setProposalsApproved(true);
      setWorkspaceError("");
      setNotice("Proposed controls approved by the reviewer. Live case analysis is now available.");
    } catch {
      setWorkspaceError("Complete every control title and description before approval.");
    }
  }

  async function selectFiles(files: File[]) {
    setDocumentError("");
    if (localDocuments.length + files.length > 10) {
      setDocumentError("Select no more than 10 local documents in total.");
      return;
    }
    try {
      const offset = localDocuments.length;
      const next = await readLocalDocuments(files, (file, index) =>
        `LOCAL-${offset + index + 1}-${file.name.replace(/[^a-z0-9]+/gi, "-").toUpperCase()}`,
      );
      setLocalDocuments((current) => [...current, ...next]);
      setNotice(`${next.length} local document${next.length === 1 ? "" : "s"} selected. Files have not been sent anywhere.`);
    } catch (error) {
      setDocumentError(error instanceof Error ? error.message : "The selected documents could not be read.");
    }
  }

  function removeDocument(id: string) {
    setLocalDocuments((current) => current.filter((document) => document.id !== id));
    setNotice("Local document removed. No external deletion was required.");
  }

  function updateDocumentLabel(id: string, label: string) {
    setLocalDocuments((current) =>
      current.map((document) => (document.id === id ? { ...document, label } : document)),
    );
  }

  function prepareDemoControls(): ControlDefinition[] {
    const thresholdAmount = Number(threshold);
    if (!Number.isFinite(thresholdAmount) || thresholdAmount < 0 || threshold.trim() === "") {
      throw new Error("Enter a valid approval threshold before running the review.");
    }
    const next = controls.map((control) =>
      control.kind === "APPROVAL_THRESHOLD"
        ? ControlDefinitionSchema.parse({
            ...control,
            parameters: { ...control.parameters, thresholdAmount },
          })
        : control,
    );
    if (!next.some((control) => control.enabled)) throw new Error("Enable at least one control before running the review.");
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
        if (!ai.available) throw new Error("Live GPT-5.6 mode is not configured.");
        if (!proposalsApproved) throw new Error("Approve the proposed controls before running Live analysis.");
        if (!localDocuments.length) throw new Error("Select at least one fictional local document before Live analysis.");

        const response = await fetch("/api/ai/analyze", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ documents: localDocuments, controls: proposals }),
        });
        const body = (await response.json()) as unknown;
        if (!response.ok) throw new Error(getApiError(body, "Live case analysis failed."));
        const analysis = z.object({ analysis: CaseAnalysisSchema }).parse(body).analysis;
        const deterministicControls = toDeterministicControls(proposals);
        if (!deterministicControls.length) throw new Error("No approved deterministic controls are available for calculation.");
        nextResults = runDeterministicReview(deterministicControls, toCaseDocuments(analysis, localDocuments));
      }

      const generatedAt = new Date().toISOString();
      setResults(nextResults);
      setSelectedControlId(nextResults[0]?.controlId ?? null);
      setFilter("ALL");
      setRunGeneratedAt(generatedAt);
      setReviewError("");
      setNotice(
        hadReviewerDecisions
          ? "Review rerun complete. Previous reviewer decisions and comments were reset."
          : `Review complete. ${nextResults.length} enabled controls were evaluated.`,
      );
    } catch (error) {
      setWorkspaceError(error instanceof Error ? error.message : "The review could not be completed.");
    } finally {
      setIsRunning(false);
    }
  }

  function updateComment(comment: string) {
    if (!selectedControlId) return;
    setResults((current) =>
      current.map((result) =>
        result.controlId === selectedControlId
          ? { ...result, reviewerDecision: { ...result.reviewerDecision, comment } }
          : result,
      ),
    );
    setReviewError("");
  }

  function applyDecision(state: ReviewDecision["state"]) {
    if (!selectedResult) return;
    try {
      const reviewed = recordReviewDecision(selectedResult, state, selectedResult.reviewerDecision.comment);
      setResults((current) =>
        current.map((result) => (result.controlId === reviewed.controlId ? reviewed : result)),
      );
      setReviewError("");
      setNotice(`${selectedResult.title}: human decision recorded as ${state.replaceAll("_", " ").toLowerCase()}.`);
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : "The reviewer decision could not be recorded.");
    }
  }

  function changeFilter(nextFilter: ResultFilter) {
    setFilter(nextFilter);
    const nextVisible = filterResults(results, nextFilter);
    if (nextVisible.length && !nextVisible.some((result) => result.controlId === selectedControlId)) {
      setSelectedControlId(nextVisible[0].controlId);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-16">
      <AppHeader mode={mode} ai={ai} onModeChange={changeMode} onRun={runReview} isRunning={isRunning} />
      <StepNavigation />

      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        <div className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
          mode === "DETERMINISTIC_DEMO"
            ? "border-amber-200 bg-amber-50 text-amber-950"
            : "border-indigo-200 bg-indigo-50 text-indigo-950"
        }`}>
          <span className="font-bold">{mode === "DETERMINISTIC_DEMO" ? "Deterministic demo" : "Live GPT-5.6"}:</span>{" "}
          {mode === "DETERMINISTIC_DEMO"
            ? "Results use version-controlled fictional fixtures. No AI request is made."
            : "GPT-5.6 interprets policy and extracts evidence; deterministic TypeScript code calculates supported controls."}
          {!ai.checking && !ai.available && (
            <span className="mt-1 block text-xs">
              Live GPT-5.6 is disabled. Add OPENAI_API_KEY to .env.local and restart the server to enable it.
            </span>
          )}
        </div>

        <div aria-live="polite" role="status" className="mt-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {notice}
        </div>
        {workspaceError && <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">{workspaceError}</p>}

        <div className="mt-5 grid gap-5">
          <PolicyPanel
            mode={mode}
            ai={ai}
            policyText={policyText}
            expanded={policyExpanded}
            isCompiling={isCompiling}
            compilationError={compilationError}
            onPolicyTextChange={(value) => {
              setPolicyText(value);
              setProposalsApproved(false);
            }}
            onToggleExpanded={() => setPolicyExpanded((current) => !current)}
            onCompile={compilePolicy}
          />
          <ControlsPanel
            mode={mode}
            controls={controls}
            proposals={proposals}
            proposalsApproved={proposalsApproved}
            threshold={threshold}
            thresholdError={thresholdError}
            onThresholdChange={updateThreshold}
            onToggleControl={toggleControl}
            onResetControls={resetControls}
            onProposalChange={updateProposal}
            onApproveProposals={approveProposals}
          />
          <DocumentsPanel
            mode={mode}
            demoDocuments={demoDocuments}
            localDocuments={localDocuments}
            documentError={documentError}
            onSelectFiles={selectFiles}
            onRemoveDocument={removeDocument}
            onUpdateLabel={updateDocumentLabel}
            onLoadDemo={loadDemo}
            onResetDemo={loadDemo}
          />
          <ReviewPanel
            results={results}
            visibleResults={visibleResults}
            summary={summary}
            filter={filter}
            selectedResult={selectedResult}
            onFilterChange={changeFilter}
            onSelectResult={(controlId) => {
              setSelectedControlId(controlId);
              setReviewError("");
            }}
          />
          <DecisionPanel
            selectedResult={selectedResult}
            summary={summary}
            receipt={receipt}
            reviewError={reviewError}
            onCommentChange={updateComment}
            onDecision={applyDecision}
          />
        </div>
      </div>
    </main>
  );
}
