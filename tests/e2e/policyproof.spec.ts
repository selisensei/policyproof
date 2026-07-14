import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
}

async function capture(page: Page, path: string) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => window.scrollY === 0);
  await page.screenshot({ path, fullPage: true });
}

test("completes the 12-step deterministic judge path with traceable evidence and a receipt", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  // 1. Open the fictional case workspace.
  await page.goto("/");
  await expect(page.getByText(/Version-controlled fictional evidence/)).toBeVisible();
  await capture(page, "test-results/01-english-policy-1440.png");

  // 2. Load the version-controlled Northstar case.
  await page.getByRole("button", { name: "Load demo case" }).first().click();
  await expect(page.getByRole("status")).toContainText("Demo case loaded");
  // 3. Review the complete policy source.
  await page.getByRole("button", { name: "Expand policy" }).click();
  await expect(page.getByText("The initiator and approver must be different people.")).toBeVisible();
  // 4. Confirm the control register.
  await page.getByRole("button", { name: "Controls" }).click();
  await expect(page.getByRole("heading", { name: "Reviewable controls" })).toBeVisible();
  await expect(page.getByLabel("Enable Currency consistency")).toBeChecked();
  // 5. Confirm the five-document case file.
  await page.getByRole("button", { name: "Case documents" }).click();
  await expect(page.getByText("Purchase Order PO-1042")).toBeVisible();
  await expect(page.getByText("Vendor Change Request VC-031")).toBeVisible();
  // 6. Run the deterministic review.
  await page.getByRole("button", { name: "Run review" }).click();
  await expect(page.getByRole("status")).toContainText("Review complete");
  // 7. Verify the guaranteed outcome distribution.
  await expect(page.getByRole("button", { name: "Show 3 PASS results" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show 2 FAIL results" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show 1 MISSING results" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show 1 WARNING results" })).toBeVisible();
  await capture(page, "test-results/02-english-review-matrix-1440.png");

  // 8. Inspect the exact EUR/USD contradiction.
  await page.getByRole("button", { name: "Inspect Currency consistency" }).click();
  await expect(page.getByLabel("Evidence details")).toContainText("Purchase order amount: 12,480 EUR");
  await expect(page.getByLabel("Evidence details")).toContainText("Invoice amount: 12,480 USD");
  await capture(page, "test-results/03-english-evidence-1440.png");

  // 9. Open the human decision workspace.
  await page.getByRole("button", { name: "Decision" }).click();
  await expect(page.getByLabel("Human review")).toContainText("Currency consistency");
  // 10. Verify that an unexplained override fails closed.
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.locator("#review-comment-error")).toContainText("Add a reviewer comment");
  await capture(page, "test-results/04-english-validation-error-1440.png");
  // 11. Record a contextual human rejection and verify the receipt.
  await page.getByLabel("Reviewer comment").fill("Currency mismatch verified in the fictional documents.");
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByLabel("Decision receipt")).toContainText("Rejected");
  await capture(page, "test-results/05-english-decision-receipt-1440.png");
  await page.emulateMedia({ media: "print" });
  await expect(page.getByLabel("Decision receipt")).toBeVisible();
  await expect(page.locator(".receipt-actions")).toBeHidden();
  await page.emulateMedia({ media: "screen" });

  await page.getByRole("button", { name: "Français" }).click();
  await expect(page.getByRole("button", { name: "Décision" })).toHaveAttribute("aria-current", "step");
  await expect(page.getByLabel("Reçu de décision")).toContainText("Rejetée");
  await expect(page.getByLabel("Reçu de décision")).toContainText("Currency mismatch verified in the fictional documents.");
  await capture(page, "test-results/06-french-decision-receipt-1440.png");

  // 12. Change the threshold, rerun, and verify a calculated result change.
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
    await capture(page, `test-results/english-policy-${label}.png`);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Français" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await expect(page.getByRole("button", { name: "Politique", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await capture(page, "test-results/french-policy-390.png");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await page.setViewportSize({ width: 1440, height: 900 });
  await capture(page, "test-results/french-policy-1440.png");
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
  await capture(page, "test-results/07-api-unavailable-state-1440.png");

  await page.getByRole("button", { name: "Controls" }).click();
  await capture(page, "test-results/08-english-controls-1440.png");
  await page.getByRole("button", { name: "Français" }).click();
  await page.getByRole("button", { name: "Documents du cas" }).click();
  await capture(page, "test-results/09-french-documents-1440.png");

  await page.route("**/api/ai/status", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: true, model: "gpt-5.6" }) }));
  await page.route("**/api/ai/policy", (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "AI_AUTHENTICATION_ERROR", category: "authentication", message: "Live GPT-5.6 authentication failed. Check the server-side API key configuration.", correlationId: "pp-mocked-browser", requestId: "req_mocked_browser" } }) }));
  await page.reload();
  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: "Live GPT-5.6" }).click();
  await page.getByRole("button", { name: "Propose controls with GPT-5.6" }).click();
  const safeError = page.locator(".error-callout").filter({ hasText: "Category: authentication" });
  await expect(safeError).toContainText("Category: authentication. Reference: req_mocked_browser.");
  await expect(safeError).not.toContainText("sk-");
  await capture(page, "test-results/10-safe-provider-error-1440.png");
});
