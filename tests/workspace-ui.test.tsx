// @vitest-environment jsdom

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoReviewWorkspace } from "@/components/demo-review-workspace";
import liveFixture from "@/src/fixtures/evaluation/live-gpt56-northstar.json";
import { LocaleProvider } from "@/src/i18n/locale-context";

const liveArtifactPath = resolve("test-results/live-gpt56/final-case-analysis.json");
const liveArtifact = existsSync(liveArtifactPath)
  ? JSON.parse(readFileSync(liveArtifactPath, "utf8")) as { response: { analysis: unknown } }
  : null;

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response;
}

function renderWorkspace() {
  return render(
    <LocaleProvider>
      <DemoReviewWorkspace />
    </LocaleProvider>,
  );
}

async function runReviewFromControls(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: /^(Controls|Contrôles)$/ }));
  await user.click(screen.getByRole("button", { name: /^(Run review|Lancer la revue)$/ }));
}

describe("PolicyProof workspace interactions", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ available: false, model: "gpt-5.6" })),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("loads the deterministic demo, runs it, filters results, and inspects evidence", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    renderWorkspace();

    expect(screen.getByText(/The deterministic demo makes no AI request/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Load demo case" }));
    await runReviewFromControls(user);

    const approval = screen.getByRole("button", { name: "Inspect Approval threshold" });
    expect(within(approval).getByText("FAIL")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Show 2 FAIL results" }));
    expect(screen.getByRole("button", { name: "Inspect Currency consistency" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Inspect Amount match" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Inspect Currency consistency" }));
    const evidence = screen.getByLabelText("Evidence details");
    expect(within(evidence).getByText(/Purchase order amount: 12,480 EUR/)).toBeTruthy();
    expect(within(evidence).getByText(/Invoice amount: 12,480 USD/)).toBeTruthy();
    await user.click(within(evidence).getAllByRole("button", { name: "Copy excerpt" })[0]);
    expect(writeText).toHaveBeenCalledWith("Purchase order amount: 12,480 EUR.");
    await user.click(within(evidence).getAllByRole("button", { name: "Copy reference" })[0]);
    expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining("FACT-PO-CURRENCY"));
  });

  it("recomputes approval at EUR 15,000 and resets the demo", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await runReviewFromControls(user);
    expect(within(screen.getByRole("button", { name: "Inspect Approval threshold" })).getByText("FAIL")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Controls" }));
    const threshold = screen.getByLabelText("Approval threshold (EUR)");
    await user.clear(threshold);
    await user.type(threshold, "15000");
    await runReviewFromControls(user);
    expect(within(screen.getByRole("button", { name: "Inspect Approval threshold" })).getByText("PASS")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Controls" }));
    await user.click(screen.getByRole("button", { name: "Reset controls" }));
    expect((screen.getByLabelText("Approval threshold (EUR)") as HTMLInputElement).value).toBe("10000");
    await user.click(screen.getByRole("button", { name: "Review" }));
    expect(screen.getByText("No review results yet")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Controls" }));
    expect((screen.getByLabelText("Enable Currency consistency") as HTMLInputElement).checked).toBe(true);
  });

  it("requires a reviewer comment for overrides and updates the receipt", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await runReviewFromControls(user);
    await user.click(screen.getByRole("button", { name: "Inspect Currency consistency" }));
    await user.click(screen.getByRole("button", { name: "Decision" }));

    await user.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.getByRole("alert").textContent).toMatch(/Add a reviewer comment/);

    await user.type(screen.getByLabelText("Reviewer comment"), "Currency mismatch confirmed by both documents.");
    await user.click(screen.getByRole("button", { name: "Reject" }));
    await waitFor(() => {
      expect(screen.getByText(/human decision recorded as rejected/)).toBeTruthy();
    });
    const receipt = screen.getByLabelText("Decision receipt");
    expect(within(receipt).getByText("Currency mismatch confirmed by both documents.")).toBeTruthy();
    expect(within(receipt).getByText("Rejected")).toBeTruthy();
    expect(within(receipt).getByText(/1 rejected · 0 exceptions · 6 unresolved/)).toBeTruthy();
  });

  it("keeps Live GPT-5.6 visibly disabled when no API key is configured", async () => {
    renderWorkspace();
    const liveMode = screen.getByRole("button", { name: "Live GPT-5.6" });
    await waitFor(() => expect((liveMode as HTMLButtonElement).disabled).toBe(true));
    expect(liveMode.getAttribute("title")).toMatch(/OPENAI_API_KEY/);
    expect((liveMode as HTMLButtonElement).disabled).toBe(true);
  });

  it("selects and removes a supported local document in configured Live mode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ available: true, model: "gpt-5.6" })),
    );
    const user = userEvent.setup();
    renderWorkspace();
    const liveMode = screen.getByRole("button", { name: "Live GPT-5.6" });
    await waitFor(() => expect((liveMode as HTMLButtonElement).disabled).toBe(false));
    await user.click(liveMode);
    await user.click(screen.getByRole("button", { name: "Case documents" }));

    const file = new File(["Invoice amount: 12,480 USD."], "invoice.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText("Select local documents"), file);
    expect(await screen.findByText("invoice.txt")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Remove invoice.txt" }));
    expect(screen.queryByText("invoice.txt")).toBeNull();
  });

  it("shows a safe diagnostic reference and blocks duplicate policy requests", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ available: true, model: "gpt-5.6" }))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            error: {
              code: "AI_AUTHENTICATION_ERROR",
              category: "authentication",
              message: "Live GPT-5.6 authentication failed. Check the server-side API key configuration.",
              correlationId: "pp-ui-correlation",
              requestId: "req_ui_test",
            },
          },
          false,
        ),
      );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWorkspace();

    const liveMode = screen.getByRole("button", { name: "Live GPT-5.6" });
    await waitFor(() => expect((liveMode as HTMLButtonElement).disabled).toBe(false));
    await user.click(liveMode);
    const compile = screen.getByRole("button", { name: "Propose controls with GPT-5.6" });
    fireEvent.click(compile);
    fireEvent.click(compile);

    await waitFor(() => {
      const policyCalls = fetchMock.mock.calls.filter(([url]) => url === "/api/ai/policy");
      expect(policyCalls).toHaveLength(1);
    });
    expect((await screen.findByRole("alert")).textContent).toMatch(
      /Category: authentication\. Reference: req_ui_test\./,
    );
  });

  it("switches between English and French without resetting review state or source evidence", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await runReviewFromControls(user);
    await user.click(screen.getByRole("button", { name: "Inspect Currency consistency" }));
    expect(screen.getByText(/Invoice amount: 12,480 USD/)).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Français" }));
    expect(screen.getByRole("button", { name: "Revue" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Accéder aux décisions" })).toBeTruthy();
    expect(screen.getByText(/Invoice amount: 12,480 USD/)).toBeTruthy();
    expect(document.documentElement.lang).toBe("fr");

    await user.click(screen.getByRole("button", { name: "Contrôles" }));
    const threshold = screen.getByLabelText("Seuil d’approbation (EUR)");
    await user.clear(threshold);
    expect(screen.getByRole("alert").textContent).toMatch(/Saisissez un seuil valide/);

    await user.click(screen.getByRole("button", { name: "English" }));
    expect(screen.getByRole("button", { name: "Controls" })).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toMatch(/Enter a valid threshold/);
    expect(document.documentElement.lang).toBe("en");
  });

  it("preserves guided-demo progress across a language switch", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    expect(screen.queryByRole("heading", { name: "Judge demo checklist" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Judge demo checklist" }));
    expect(screen.getByRole("heading", { name: "Judge demo checklist" })).toBeTruthy();
    await user.click(screen.getAllByRole("button", { name: "Start guided demo" })[0]);
    expect(screen.getByText("1 of 9 steps complete")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Expand policy" }));
    expect(screen.getByText("2 of 9 steps complete")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Français" }));
    expect(screen.getByText("2 étapes terminées sur 9")).toBeTruthy();
    expect(screen.getByText("Charger le cas fictif Northstar.").closest("li")?.className).toContain("text-slate-600");
  });

  it("offers receipt copy and JSON export actions from current structured state", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:receipt");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    renderWorkspace();

    await runReviewFromControls(user);
    await user.click(screen.getByRole("button", { name: "Decision" }));
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    await user.click(screen.getByRole("button", { name: "Copy receipt ID" }));
    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/^PP-/));
    await user.click(screen.getByRole("button", { name: "Copy summary" }));
    expect(writeText).toHaveBeenLastCalledWith(expect.stringContaining("3 PASS, 2 FAIL, 1 MISSING, 1 WARNING"));
    await user.click(screen.getByRole("button", { name: "Download JSON" }));
    expect(createObjectURL).toHaveBeenCalled();
    expect(anchorClick).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:receipt");
  });

  it("keeps mocked GPT-5.6 proposals unapproved until human review", async () => {
    const proposal = {
      id: "CTRL-MOCK",
      title: "Mocked currency control",
      description: "Compare currencies.",
      condition: "Currencies match.",
      requiredEvidence: ["Invoice", "Purchase order"],
      severity: "HIGH",
      controlType: "CURRENCY_MATCH",
      enabled: true,
      deterministicParameters: { thresholdAmount: null, currency: null, requiredApprovers: null },
      semanticReviewQuestion: null,
    };
    vi.stubGlobal("fetch", vi.fn()
      .mockResolvedValueOnce(jsonResponse({ available: true, model: "gpt-5.6" }))
      .mockResolvedValueOnce(jsonResponse({ compilation: { policyTitle: "Mock policy", policySummary: "Mocked only.", controls: [proposal] } })));
    const user = userEvent.setup();
    renderWorkspace();
    const liveMode = screen.getByRole("button", { name: "Live GPT-5.6" });
    await waitFor(() => expect((liveMode as HTMLButtonElement).disabled).toBe(false));
    await user.click(liveMode);
    await user.click(screen.getByRole("button", { name: "Propose controls with GPT-5.6" }));

    expect(await screen.findByText("Proposal received")).toBeTruthy();
    expect(screen.getByText("Awaiting human approval")).toBeTruthy();
    await user.type(screen.getByLabelText("Control title CTRL-MOCK"), " edited");
    expect(screen.getByText("Edited — approval required")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Reject proposal" }));
    const rejectedState = screen.getByText("Rejected by reviewer");
    expect(rejectedState).toBeTruthy();
    expect(rejectedState.closest(".proposal-row")?.getAttribute("data-state")).toBe("REJECTED");
  });

  it("runs the complete mocked Live pipeline through evidence, human decision, and receipt", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ available: true, model: "gpt-5.6" }))
      .mockResolvedValueOnce(jsonResponse({ compilation: liveFixture.compilation }))
      .mockResolvedValueOnce(jsonResponse({ analysis: liveFixture.mockAnalysis }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWorkspace();

    const liveMode = screen.getByRole("button", { name: "Live GPT-5.6" });
    await waitFor(() => expect((liveMode as HTMLButtonElement).disabled).toBe(false));
    await user.click(liveMode);
    await user.click(screen.getByRole("button", { name: "Propose controls with GPT-5.6" }));
    expect(await screen.findAllByText("Proposal received")).toHaveLength(7);

    for (const control of liveFixture.compilation.controls) {
      await user.click(screen.getByLabelText(`Enable ${control.title}`));
    }
    await user.click(screen.getByRole("button", { name: "Approve proposed controls" }));
    expect(screen.getByText(/Proposed controls approved by the reviewer/)).toBeTruthy();

    const files = liveFixture.documents.map((document) =>
      new File([document.content], document.name, { type: "text/plain" }));
    await user.upload(screen.getByLabelText("Select local documents"), files);
    await runReviewFromControls(user);

    expect(within(await screen.findByRole("button", { name: "Inspect Two approvers above EUR 10,000" })).getByText("FAIL")).toBeTruthy();
    expect(within(screen.getByRole("button", { name: "Inspect Purchase order predates invoice" })).getByText("PASS")).toBeTruthy();
    expect(within(screen.getByRole("button", { name: "Inspect Purchase order and invoice amount match" })).getByText("PASS")).toBeTruthy();
    const currency = screen.getByRole("button", { name: "Inspect Purchase order and invoice currency match" });
    expect(within(currency).getByText("FAIL")).toBeTruthy();
    expect(within(screen.getByRole("button", { name: "Inspect Delivery evidence exists" })).getByText("PASS")).toBeTruthy();
    expect(within(screen.getByRole("button", { name: "Inspect Independent verification of bank-details changes" })).getByText("MISSING")).toBeTruthy();
    expect(within(screen.getByRole("button", { name: "Inspect Initiator and approver segregation" })).getByText("WARNING")).toBeTruthy();

    await user.click(currency);
    const evidence = screen.getByLabelText("Evidence details");
    expect(within(evidence).getByText(/Purchase order amount: 12,480 EUR/)).toBeTruthy();
    expect(within(evidence).getByText(/Invoice amount: 12,480 USD/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Decision" }));
    await user.type(screen.getByLabelText("Reviewer comment"), "Exact EUR and USD excerpts verified.");
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    const receipt = screen.getByLabelText("Decision receipt");
    expect(within(receipt).getByText("Exact EUR and USD excerpts verified.")).toBeTruthy();
    expect(within(receipt).getByText(/1 confirmed/)).toBeTruthy();
  });

  it.skipIf(!liveArtifact)("replays the captured Live artifact through the interface without a provider call", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(jsonResponse({ available: true, model: "gpt-5.6" }))
      .mockResolvedValueOnce(jsonResponse({ compilation: liveFixture.compilation }))
      .mockResolvedValueOnce(jsonResponse({ analysis: liveArtifact!.response.analysis }));
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderWorkspace();

    const liveMode = screen.getByRole("button", { name: "Live GPT-5.6" });
    await waitFor(() => expect((liveMode as HTMLButtonElement).disabled).toBe(false));
    await user.click(liveMode);
    await user.click(screen.getByRole("button", { name: "Propose controls with GPT-5.6" }));
    await screen.findAllByText("Proposal received");
    for (const control of liveFixture.compilation.controls) {
      await user.click(screen.getByLabelText(`Enable ${control.title}`));
    }
    await user.click(screen.getByRole("button", { name: "Approve proposed controls" }));
    const files = liveFixture.documents.map((document) =>
      new File([document.content], document.name, { type: "text/plain" }));
    await user.upload(screen.getByLabelText("Select local documents"), files);
    await runReviewFromControls(user);

    expect(await screen.findByRole("button", { name: "Show 3 PASS results" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show 2 FAIL results" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show 1 MISSING results" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show 1 WARNING results" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Inspect Purchase order and invoice currency match" }));
    const evidence = screen.getByLabelText("Evidence details");
    expect(within(evidence).getByText(/Purchase order amount: 12,480 EUR/)).toBeTruthy();
    expect(within(evidence).getByText(/Invoice amount: 12,480 USD/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Decision" }));
    await user.type(screen.getByLabelText("Reviewer comment"), "Captured EUR and USD excerpts verified.");
    await user.click(screen.getByRole("button", { name: "Confirm" }));
    const receipt = screen.getByLabelText("Decision receipt");
    expect(within(receipt).getByText("Captured EUR and USD excerpts verified.")).toBeTruthy();
    expect(within(receipt).getByText(/1 confirmed/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
