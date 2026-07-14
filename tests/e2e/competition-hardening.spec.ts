import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const captures = "test-results/competition-hardening";
mkdirSync(captures, { recursive: true });

async function selectScenario(page: Page, name: RegExp) {
  await page.goto("/");
  await page.getByRole("region", { name: "Choose a controlled case" }).getByRole("button", { name }).click();
}

async function runSelectedScenario(page: Page) {
  await page.getByRole("button", { name: "Controls", exact: true }).click();
  await page.getByRole("button", { name: "Run review" }).click();
  await expect(page.getByRole("status")).toContainText("Review complete");
}

test("runs Meridian with complete evidence and produces a scenario receipt", async ({ page }) => {
  await selectScenario(page, /Meridian Office Services/);
  await runSelectedScenario(page);
  await expect(page.getByRole("button", { name: "Show 7 PASS results" })).toBeVisible();
  await page.getByRole("button", { name: "Inspect Amount match" }).click();
  await expect(page.getByLabel("Evidence details")).toContainText("Purchase order amount: 8,750 EUR");
  await page.getByRole("button", { name: "Decision", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByLabel("Decision receipt")).toContainText("Meridian Office Services");
  await page.screenshot({ path: `${captures}/meridian-review.png`, fullPage: true });
});

test("runs Atlas and keeps missing delivery and bank evidence explicit", async ({ page }) => {
  await selectScenario(page, /Atlas Workplace Supply/);
  await runSelectedScenario(page);
  await expect(page.getByRole("button", { name: "Show 4 PASS results" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show 1 FAIL results" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show 2 MISSING results" })).toBeVisible();
  await page.getByRole("button", { name: "Inspect Independent bank verification" }).click();
  await expect(page.getByLabel("Evidence details")).toContainText(/does not fabricate/i);
  await page.getByRole("button", { name: "Decision", exact: true }).click();
  await expect(page.getByLabel("Human review")).toContainText("Independent bank verification");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.screenshot({ path: `${captures}/atlas-review.png`, fullPage: true });
});

test("confirms a destructive case switch and does not leak Northstar decisions", async ({ page }) => {
  await page.goto("/");
  await runSelectedScenario(page);
  await page.getByRole("button", { name: "Decision", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.getByRole("button", { name: "Policy", exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("region", { name: "Choose a controlled case" }).getByRole("button", { name: /Meridian Office Services/ }).click();
  await expect(page.getByRole("button", { name: "Review", exact: true })).not.toHaveClass(/is-complete/);
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(page.getByText("No review results yet")).toBeVisible();
  await expect(page.getByText("Purchase order amount: 12,480 EUR.")).toHaveCount(0);
});

test("keeps Judge Mode manual, bilingual, keyboard usable, and responsive", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const meridian = page.getByRole("region", { name: "Choose a controlled case" }).getByRole("button", { name: /Meridian Office Services/ });
  await meridian.focus();
  await page.keyboard.press("Enter");
  await expect(meridian).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Enter Judge Mode" }).click();
  const judge = page.getByRole("region", { name: "Judge Mode sequence" });
  await expect(judge).toContainText("Select Northstar");
  await expect(judge).toContainText(/no action or decision is automated/i);
  await page.getByRole("button", { name: "Français" }).click();
  await expect(page.getByRole("region", { name: "Séquence du mode jury" })).toContainText("Sélectionner Northstar");
  const dimensions = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
  await page.screenshot({ path: `${captures}/judge-mode-mobile-fr.png`, fullPage: true });
  await page.getByRole("button", { name: "Quitter le mode jury" }).click();
  await expect(page.getByRole("region", { name: "Séquence du mode jury" })).toHaveCount(0);
});

test("captures the competition hardening visual review matrix", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.screenshot({ path: `${captures}/case-library-desktop-en.png`, fullPage: true });
  await page.getByRole("button", { name: "Français" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${captures}/case-library-mobile-fr.png`, fullPage: true });

  await page.setViewportSize({ width: 1280, height: 720 });
  await page.getByRole("button", { name: "English" }).click();
  await page.getByRole("button", { name: "Controls", exact: true }).click();
  await page.getByRole("button", { name: "Run review" }).click();
  await page.screenshot({ path: `${captures}/northstar-review-1280x720.png`, fullPage: true });

  const comparison = page.locator("summary").filter({ hasText: "Compare completed cases" });
  await comparison.click();
  await expect(page.getByRole("table", { name: "Completed scenario comparison" })).toBeVisible();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${captures}/scenario-comparison.png` });
  await comparison.click();

  const architecture = page.locator("summary").filter({ hasText: "Architecture" });
  await architecture.click();
  await expect(page.getByText(/Policy interpretation and structured fact/)).toBeVisible();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${captures}/architecture-explanation.png` });
  await architecture.click();

  const audit = page.locator("summary").filter({ hasText: "Audit trail" });
  await audit.click();
  await expect(page.getByText("REVIEW RUN")).toBeVisible();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${captures}/audit-trail.png` });
  await audit.click();

  await page.getByRole("button", { name: "Enter Judge Mode" }).click();
  await expect(page.getByRole("region", { name: "Judge Mode sequence" })).toBeVisible();
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${captures}/judge-mode-desktop-1280x720.png` });
  await page.getByRole("button", { name: "Exit Judge Mode" }).click();

  await page.getByRole("button", { name: "Decision", exact: true }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await page.screenshot({ path: `${captures}/northstar-receipt.png`, fullPage: true });
});
