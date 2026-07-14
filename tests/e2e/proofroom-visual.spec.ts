import { expect, test, type Page } from "@playwright/test";

const passName = process.env.PROOFROOM_PASS ?? "final";
const captureRoot = `test-results/proofroom-integration/${passName}`;

async function capture(page: Page, name: string, fullPage = false) {
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
  });
  await page.waitForFunction(() => window.scrollY === 0);
  await page.waitForTimeout(350);
  await page.screenshot({ path: `${captureRoot}/${name}.png`, fullPage });
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
}

test("captures the complete Proofroom visual comparison matrix", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  await page.getByRole("button", { name: "Load demo case" }).first().click();
  const dismissGuide = page.getByRole("button", { name: "Dismiss guided demo" });
  if (await dismissGuide.isVisible()) await dismissGuide.click();

  await capture(page, "01-policy-desktop-en");

  await page.getByRole("button", { name: "Controls", exact: true }).click();
  await capture(page, "02-controls-desktop-en");

  await page.getByRole("button", { name: "Case documents", exact: true }).click();
  await capture(page, "03-documents-desktop-en");

  await page.getByRole("button", { name: "Run review" }).click();
  await page.getByRole("button", { name: "Inspect Currency consistency" }).click();
  await expect(page.getByLabel("Currency comparison")).toContainText("EUR");
  await expect(page.getByLabel("Currency comparison")).toContainText("USD");
  await capture(page, "04-review-desktop-en");

  await page.getByRole("button", { name: "Decision", exact: true }).click();
  await capture(page, "05-decision-desktop-en");

  await page.getByLabel("Reviewer comment").fill("Currency mismatch verified in the fictional documents.");
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByLabel("Decision receipt")).toContainText("Rejected");
  await page.locator(".decision-receipt").screenshot({ path: `${captureRoot}/06-receipt-desktop-en.png` });

  await page.getByRole("button", { name: "Français" }).click();
  await page.getByRole("button", { name: "Revue", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  await capture(page, "07-review-desktop-fr");

  await page.getByRole("button", { name: "English" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
  await expect(page.getByLabel("Evidence details")).toContainText("Purchase order amount: 12,480 EUR");
  await expect(page.getByLabel("Evidence details")).toContainText("Invoice amount: 12,480 USD");
  await capture(page, "08-review-mobile-en");

  await page.getByRole("button", { name: "Français" }).click();
  await expectNoHorizontalOverflow(page);
  await capture(page, "09-review-mobile-fr");
});

test("captures final empty, threshold, print, loading, and provider-error states", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");
  const dismissGuide = page.getByRole("button", { name: "Dismiss guided demo" });
  if (await dismissGuide.isVisible()) await dismissGuide.click();

  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(page.getByText("No review results yet")).toBeVisible();
  await capture(page, "10-review-empty");

  await page.getByRole("button", { name: "Controls", exact: true }).click();
  await page.getByRole("button", { name: "Run review" }).click();
  await page.getByRole("button", { name: "Controls", exact: true }).click();
  await page.getByLabel("Approval threshold (EUR)").fill("15000");
  await page.getByRole("button", { name: "Run review" }).click();
  await expect(page.locator(".conclusion-changed")).toContainText("CTRL-01 FAIL → PASS");
  await capture(page, "11-threshold-after-pass");

  await page.getByRole("button", { name: "Decision", exact: true }).click();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByLabel("Decision receipt")).toBeVisible();
  await page.emulateMedia({ media: "print" });
  await page.getByLabel("Decision receipt").screenshot({ path: `${captureRoot}/12-receipt-print.png` });
  await page.emulateMedia({ media: "screen" });

  let releasePolicyResponse: (() => void) | undefined;
  const policyGate = new Promise<void>((resolve) => { releasePolicyResponse = resolve; });
  await page.route("**/api/ai/status", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: true, model: "gpt-5.6" }) }));
  await page.route("**/api/ai/policy", async (route) => {
    await policyGate;
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: { code: "AI_AUTHENTICATION_ERROR", category: "authentication", message: "Live GPT-5.6 authentication failed. Check the server-side API key configuration.", correlationId: "pp-visual-mock", requestId: "req_visual_mock" } }) });
  });
  await page.reload();
  if (await page.getByRole("button", { name: "Dismiss guided demo" }).isVisible()) {
    await page.getByRole("button", { name: "Dismiss guided demo" }).click();
  }
  await page.getByRole("button", { name: "Live GPT-5.6" }).click();
  await page.getByRole("button", { name: "Propose controls with GPT-5.6" }).click();
  await expect(page.locator(".progress-rule")).toBeVisible();
  await capture(page, "13-policy-loading");
  releasePolicyResponse?.();
  const safeError = page.locator(".safe-error");
  await expect(safeError).toContainText("Category: authentication. Reference: req_visual_mock.");
  await expect(safeError).not.toContainText("sk-");
  await capture(page, "14-provider-error");
});
