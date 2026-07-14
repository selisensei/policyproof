import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
}

test("completes the deterministic critical path with traceable evidence and a receipt", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByText(/Version-controlled fictional evidence/)).toBeVisible();
  await page.screenshot({ path: "test-results/01-english-policy-1440.png", fullPage: true });

  await page.getByRole("button", { name: "Load demo case" }).first().click();
  await expect(page.getByRole("status")).toContainText("Demo case loaded");
  await page.getByRole("button", { name: "Run review" }).click();
  await expect(page.getByRole("status")).toContainText("Review complete");
  await expect(page.getByRole("button", { name: "Show 3 PASS results" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show 2 FAIL results" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show 1 MISSING results" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show 1 WARNING results" })).toBeVisible();
  await page.screenshot({ path: "test-results/02-english-review-matrix-1440.png", fullPage: true });

  await page.getByRole("button", { name: "Inspect Currency consistency" }).click();
  await expect(page.getByLabel("Evidence details")).toContainText("Purchase order amount: 12,480 EUR");
  await expect(page.getByLabel("Evidence details")).toContainText("Invoice amount: 12,480 USD");
  await page.screenshot({ path: "test-results/03-english-evidence-1440.png", fullPage: true });

  await page.getByRole("button", { name: "Decision" }).click();
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.locator("#review-comment-error")).toContainText("Add a reviewer comment");
  await page.screenshot({ path: "test-results/04-english-validation-error-1440.png", fullPage: true });
  await page.getByLabel("Reviewer comment").fill("Currency mismatch verified in the fictional documents.");
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByLabel("Decision receipt")).toContainText("Rejected");
  await page.screenshot({ path: "test-results/05-english-decision-receipt-1440.png", fullPage: true });

  await page.getByRole("button", { name: "Français" }).click();
  await expect(page.getByRole("button", { name: "Décision" })).toHaveAttribute("aria-current", "step");
  await expect(page.getByLabel("Reçu de décision")).toContainText("Rejetée");
  await expect(page.getByLabel("Reçu de décision")).toContainText("Currency mismatch verified in the fictional documents.");
  await page.screenshot({ path: "test-results/06-french-decision-receipt-1440.png", fullPage: true });

  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: "Controls" }).click();
  await page.getByLabel("Approval threshold (EUR)").fill("15000");
  await page.getByRole("button", { name: "Run review" }).click();
  await expect(page.getByRole("button", { name: "Inspect Approval threshold" })).toContainText("PASS");
  await expect(page.getByRole("status")).toContainText("Previous reviewer decisions and comments were reset");
  await expectNoHorizontalOverflow(page);
});

test("keeps English and French workflows usable across responsive widths", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  await page.goto("/");

  for (const [width, label] of [[1280, "1280"], [1024, "1024"], [768, "768"], [390, "390"]] as const) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.getByRole("button", { name: "Policy", exact: true }).click();
    await expect(page.getByRole("main")).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `test-results/english-policy-${label}.png`, fullPage: true });
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Français" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("button", { name: "Politique", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: "test-results/french-policy-390.png", fullPage: true });

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: "test-results/french-policy-1440.png", fullPage: true });
  expect(consoleErrors.filter((message) => /hydration/i.test(message))).toEqual([]);
});

test("supports keyboard navigation on a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.getByRole("button", { name: "Case documents" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Case documents" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("captures bilingual judge states and a safely mocked provider failure", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await expect(page.getByText("Human review remains required.")).toBeVisible();
  await page.screenshot({ path: "test-results/07-api-unavailable-state-1440.png", fullPage: true });

  await page.getByRole("button", { name: "Controls" }).click();
  await page.screenshot({ path: "test-results/08-english-controls-1440.png", fullPage: true });
  await page.getByRole("button", { name: "Français" }).click();
  await page.getByRole("button", { name: "Documents du cas" }).click();
  await page.screenshot({ path: "test-results/09-french-documents-1440.png", fullPage: true });

  await page.route("**/api/ai/status", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: true, model: "gpt-5.6" }) }));
  await page.route("**/api/ai/policy", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "AI_AUTHENTICATION_ERROR", category: "authentication", message: "Live GPT-5.6 authentication failed. Check the server-side API key configuration.", correlationId: "pp-mocked-browser", requestId: "req_mocked_browser" } }) }));
  await page.reload();
  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: "Live GPT-5.6" }).click();
  await page.getByRole("button", { name: "Propose controls with GPT-5.6" }).click();
  const safeError = page.locator(".error-callout").filter({ hasText: "Category: authentication" });
  await expect(safeError).toContainText("Category: authentication. Reference: req_mocked_browser.");
  await expect(safeError).not.toContainText("sk-");
  await page.screenshot({ path: "test-results/10-safe-provider-error-1440.png", fullPage: true });
});
