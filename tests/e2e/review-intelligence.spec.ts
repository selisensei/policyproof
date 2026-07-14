import { expect, test, type Page } from "@playwright/test";

const passName = process.env.REVIEW_INTELLIGENCE_PASS ?? "final";
const captureRoot = `test-results/review-intelligence/${passName}`;

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
}

async function loadAndRun(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Load demo case" }).first().click();
  await expect(page.getByRole("status")).toContainText("Demo case loaded");
  await page.getByRole("button", { name: "Expand policy", exact: true }).click();
  await expect(page.getByText("The initiator and approver must be different people.")).toBeVisible();
  await page.getByRole("button", { name: "Controls", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Control register" })).toBeVisible();
  await page.getByRole("button", { name: "Case documents", exact: true }).click();
  await expect(page.getByText("Vendor Change Request VC-031")).toBeVisible();
  await page.getByRole("button", { name: "Run review" }).click();
  await expect(page.getByRole("status")).toContainText("Review complete");
}

test("completes the evidence-led review intelligence journey", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loadAndRun(page);

  await expect(page.getByRole("heading", { name: "Case overview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Outcome composition" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidence coverage map" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Chronology" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Threshold sensitivity" })).toBeVisible();
  await expect(page.getByText("3 PASS").first()).toBeVisible();
  await expect(page.getByText("The amount exceeds the threshold. 2 approvers are required, but 1 is recorded.")).toBeVisible();
  await expect(page.getByText("The purchase order precedes delivery and invoice.")).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `${captureRoot}/01-english-desktop-1440x900.png` });
  await page.getByRole("region", { name: "Case overview" }).screenshot({ path: `${captureRoot}/02-case-overview.png` });
  await page.locator(".outcome-composition").screenshot({ path: `${captureRoot}/03-outcome-composition.png` });
  await page.locator(".coverage-map").screenshot({ path: `${captureRoot}/04-evidence-coverage.png` });
  await page.locator(".chronology").screenshot({ path: `${captureRoot}/05-chronology.png` });
  await page.locator(".threshold-sensitivity").screenshot({ path: `${captureRoot}/06-threshold-10000.png` });

  await page.getByLabel("Search this review").fill("USD");
  await expect(page.getByText(/match\(es\)/)).toBeVisible();
  await page.locator(".search-results button").filter({ hasText: "Currency consistency" }).click();
  await expect(page.getByRole("button", { name: "Inspect Currency consistency" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Evidence details")).toContainText("Purchase order amount: 12,480 EUR");
  await expect(page.getByLabel("Evidence details")).toContainText("Invoice amount: 12,480 USD");

  await page.getByRole("button", { name: "Filter 2 FAIL results" }).click();
  await expect(page.getByRole("button", { name: "Inspect Approval threshold" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Inspect Currency consistency" })).toBeVisible();
  await page.getByRole("button", { name: "Show all 7 results" }).click();

  await page.getByRole("button", { name: "Decision", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Reviewer queue navigation" })).toBeVisible();
  await expect(page.getByText(/Exact sources verified/)).toBeVisible();
  await page.screenshot({ path: `${captureRoot}/07-decision.png` });
  await page.getByLabel("Reviewer comment").fill("Currency mismatch verified in the fictional case.");
  await page.getByRole("button", { name: "Reject" }).click();
  await expect(page.getByLabel("Decision receipt")).toContainText("Rejected");
  await expect(page.getByRole("button", { name: "Download Markdown" })).toBeVisible();
  await page.getByLabel("Decision receipt").screenshot({ path: `${captureRoot}/08-receipt.png` });

  await page.getByRole("button", { name: "Controls", exact: true }).click();
  await page.getByLabel("Approval threshold (EUR)").fill("15000");
  await page.getByRole("button", { name: "Run review" }).click();
  await expect(page.getByRole("button", { name: "Inspect Approval threshold" })).toContainText("PASS");
  await expect(page.getByRole("heading", { name: "Run comparison" })).toBeVisible();
  await expect(page.locator(".changed-controls")).toContainText("FAIL → PASS");
  await page.locator(".threshold-sensitivity").screenshot({ path: `${captureRoot}/09-threshold-15000.png` });
  await page.locator(".run-comparison").screenshot({ path: `${captureRoot}/10-run-comparison.png` });
});

test("keeps the review intelligence workspace usable at demo and mobile widths", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await loadAndRun(page);
  await expect(page.getByRole("heading", { name: "Case overview" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `${captureRoot}/11-demo-view-1280x720.png` });

  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `${captureRoot}/12-english-mobile.png`, fullPage: true });
  await page.getByRole("button", { name: "Français" }).click();
  await expect(page.getByRole("heading", { name: "Vue d’ensemble du cas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Carte de couverture des preuves" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `${captureRoot}/13-french-mobile.png`, fullPage: true });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: `${captureRoot}/14-french-desktop.png` });
});

test("supports empty search, keyboard coverage navigation, and history reset", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await loadAndRun(page);
  const search = page.getByLabel("Search this review");
  await search.fill("no-such-control-or-document");
  await expect(page.getByText("No matches")).toBeVisible();
  await search.fill("");

  const currencyCoverage = page.getByRole("cell", { name: /Currency consistency, Purchase Order PO-1042: contradictory/ });
  await currencyCoverage.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Inspect Currency consistency" })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Controls", exact: true }).click();
  await page.getByLabel("Approval threshold (EUR)").fill("15000");
  await page.getByRole("button", { name: "Run review" }).click();
  await expect(page.locator(".changed-controls")).toContainText("FAIL → PASS");
  await page.getByRole("button", { name: "Clear history" }).click();
  await expect(page.getByText("No previous run to compare. Change the threshold and rerun the review.")).toBeVisible();
});

test("preserves the review path at an effective 200 percent browser zoom", async ({ page }) => {
  // A 1280 × 720 browser viewport at 200% zoom exposes roughly 640 × 360 CSS pixels.
  // Using that effective viewport exercises the same responsive reflow without
  // relying on browser-specific keyboard shortcuts in headless Chromium.
  await page.setViewportSize({ width: 640, height: 360 });
  await loadAndRun(page);

  await expect(page.getByRole("heading", { name: "Case overview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidence coverage map" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Inspect Currency consistency" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `${captureRoot}/15-effective-zoom-200.png`, fullPage: true });
});
