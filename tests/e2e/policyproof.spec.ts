import { expect, test } from "@playwright/test";

test("completes the deterministic critical path", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Results use version-controlled fictional fixtures/)).toBeVisible();

  await page.getByRole("button", { name: "Load demo case" }).click();
  await expect(page.getByRole("status")).toContainText("Demo case loaded");
  await page.getByRole("button", { name: "Run review" }).click();
  await expect(page.getByRole("status")).toContainText("Review complete");

  const approval = page.getByRole("button", { name: "Inspect Approval threshold" });
  await expect(approval).toContainText("FAIL");

  await page.getByRole("button", { name: "Inspect Currency consistency" }).click();
  await expect(page.getByLabel("Evidence details")).toContainText("Invoice amount: 12,480 USD");

  await page.getByLabel("Reviewer comment").fill("Currency mismatch verified in the fictional documents.");
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByLabel("Decision receipt")).toContainText("Rejected");

  await page.getByLabel("Approval threshold (EUR)").fill("15000");
  await page.getByRole("button", { name: "Run review" }).click();
  await expect(page.getByRole("button", { name: "Inspect Approval threshold" })).toContainText("PASS");
  await page.screenshot({ path: "test-results/policyproof-desktop.png", fullPage: true });
});

test("keeps the primary workflow usable on a narrow viewport and by keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("button", { name: "Load demo case" })).toBeVisible();

  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
  await page.screenshot({ path: "test-results/policyproof-mobile.png", fullPage: true });
});
