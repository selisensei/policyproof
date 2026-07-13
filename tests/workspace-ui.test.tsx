// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DemoReviewWorkspace } from "@/components/demo-review-workspace";

function jsonResponse(body: unknown, ok = true) {
  return { ok, json: async () => body } as Response;
}

describe("PolicyProof workspace interactions", () => {
  beforeEach(() => {
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
    render(<DemoReviewWorkspace />);

    expect(screen.getByText(/Results use version-controlled fictional fixtures/)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Load demo case" }));
    await user.click(screen.getByRole("button", { name: "Run review" }));

    const approval = screen.getByRole("button", { name: "Inspect Approval threshold" });
    expect(within(approval).getByText("FAIL")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Show 2 FAIL results" }));
    expect(screen.getByRole("button", { name: "Inspect Currency consistency" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Inspect Amount match" })).toBeNull();

    await user.click(screen.getByRole("button", { name: "Inspect Currency consistency" }));
    const evidence = screen.getByLabelText("Evidence details");
    expect(within(evidence).getByText(/Purchase order amount: 12,480 EUR/)).toBeTruthy();
    expect(within(evidence).getByText(/Invoice amount: 12,480 USD/)).toBeTruthy();
  });

  it("recomputes approval at EUR 15,000 and resets the demo", async () => {
    const user = userEvent.setup();
    render(<DemoReviewWorkspace />);

    await user.click(screen.getByRole("button", { name: "Run review" }));
    expect(within(screen.getByRole("button", { name: "Inspect Approval threshold" })).getByText("FAIL")).toBeTruthy();

    const threshold = screen.getByLabelText("Approval threshold (EUR)");
    await user.clear(threshold);
    await user.type(threshold, "15000");
    await user.click(screen.getByRole("button", { name: "Run review" }));
    expect(within(screen.getByRole("button", { name: "Inspect Approval threshold" })).getByText("PASS")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Reset demo" }));
    expect((screen.getByLabelText("Approval threshold (EUR)") as HTMLInputElement).value).toBe("10000");
    expect(screen.getByText("No review results yet")).toBeTruthy();
    expect((screen.getByLabelText("Enable Currency consistency") as HTMLInputElement).checked).toBe(true);
  });

  it("requires a reviewer comment for overrides and updates the receipt", async () => {
    const user = userEvent.setup();
    render(<DemoReviewWorkspace />);
    await user.click(screen.getByRole("button", { name: "Run review" }));
    await user.click(screen.getByRole("button", { name: "Inspect Currency consistency" }));

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
  });

  it("keeps Live GPT-5.6 visibly disabled when no API key is configured", async () => {
    render(<DemoReviewWorkspace />);
    const liveMode = screen.getByRole("button", { name: "Live GPT-5.6" });
    await waitFor(() => expect((liveMode as HTMLButtonElement).disabled).toBe(true));
    expect(liveMode.getAttribute("title")).toMatch(/OPENAI_API_KEY/);
    expect(screen.getByText(/Live GPT-5.6 is disabled/)).toBeTruthy();
  });

  it("selects and removes a supported local document in configured Live mode", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse({ available: true, model: "gpt-5.6" })),
    );
    const user = userEvent.setup();
    render(<DemoReviewWorkspace />);
    const liveMode = screen.getByRole("button", { name: "Live GPT-5.6" });
    await waitFor(() => expect((liveMode as HTMLButtonElement).disabled).toBe(false));
    await user.click(liveMode);

    const file = new File(["Invoice amount: 12,480 USD."], "invoice.txt", { type: "text/plain" });
    await user.upload(screen.getByLabelText("Select local documents"), file);
    expect(await screen.findByText("invoice.txt")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Remove invoice.txt" }));
    expect(screen.queryByText("invoice.txt")).toBeNull();
  });
});
