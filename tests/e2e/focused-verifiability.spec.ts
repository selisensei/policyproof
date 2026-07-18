import { mkdirSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const captureRoot = "test-results/focused-verifiability";
const finalCaptureRoot = "test-results/final-human-review/final";
const brandCaptureRoot = "test-results/final-brand-integration/final";
const finalUiCaptureRoot = "test-results/final-ui-clarity";
mkdirSync(`${captureRoot}/pass-1`, { recursive: true });
mkdirSync(`${captureRoot}/pass-2`, { recursive: true });
mkdirSync(`${captureRoot}/pass-3`, { recursive: true });
mkdirSync(finalCaptureRoot, { recursive: true });
mkdirSync(brandCaptureRoot, { recursive: true });
mkdirSync(finalUiCaptureRoot, { recursive: true });

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
}

async function runFocusedReview(page: Page) {
  const focused = page.getByRole("region", { name: "Focused Demo" });
  await focused.getByRole("button", { name: "Run review" }).click();
  await expect(focused.getByRole("heading", { name: "Reproducibility check" })).toBeVisible();
  return focused;
}

test("pass 1 — focuses the Northstar proof while preserving the complete workspace", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const focused = page.getByRole("region", { name: "Focused Demo" });
  await expect(focused.getByRole("heading", { name: "Review the Northstar vendor change" })).toBeVisible();
  await expect(focused.getByText("Catch a EUR/USD mismatch before payment, with the exact source lines.")).toBeVisible();
  await expect(focused.getByText("For finance, procurement and internal-control reviewers.")).toBeVisible();
  await expect(focused).toContainText("Northstar Facilities : Mixed-Risk Case");
  await expect(focused).toContainText("7 enabled");
  await expect(focused.getByText("Review results")).toHaveCount(0);
  await page.screenshot({ path: `${captureRoot}/pass-1/focused-landing-1440x900.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 720 });
  await expect(page.locator(".product-identity img")).toHaveAttribute("src", "/brand/policyproof-logo-horizontal-color.svg");
  await expect(page.locator(".product-identity strong")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  const initialWorkflow = await focused.locator(".focused-run-card").boundingBox();
  expect(initialWorkflow).not.toBeNull();
  expect((initialWorkflow?.y ?? 0) + (initialWorkflow?.height ?? 0)).toBeLessThanOrEqual(720);
  await page.screenshot({ path: `${finalCaptureRoot}/01-focused-initial-1280x720.png`, fullPage: true });
  await page.screenshot({ path: `${brandCaptureRoot}/01-focused-initial-1280x720.png`, fullPage: true });
  await page.screenshot({ path: `${finalUiCaptureRoot}/02-home-after.png` });

  await runFocusedReview(page);
  await expect(focused.locator('.focused-outcomes [data-status="PASS"]')).toContainText(/3\s*PASS/);
  await expect(focused.locator('.focused-outcomes [data-status="FAIL"]')).toContainText(/2\s*FAIL/);
  await expect(focused.locator('.focused-outcomes [data-status="MISSING"]')).toContainText(/1\s*MISSING/);
  await expect(focused.locator('.focused-outcomes [data-status="WARNING"]')).toContainText(/1\s*WARNING/);
  const reviewFacts = focused.locator(".focused-review-facts");
  await expect(reviewFacts).toContainText("Transaction under review");
  await expect(reviewFacts).toContainText("12,480 EUR");
  await expect(reviewFacts).toContainText("Approval threshold");
  await expect(reviewFacts).toContainText("10,000 EUR");
  await expect(focused.locator(".focused-currency-comparison").getByText("12,480 EUR", { exact: true })).toBeVisible();
  await expect(focused.locator(".focused-currency-comparison").getByText("12,480 USD", { exact: true })).toBeVisible();
  await expect(focused.getByText("✓ Exact excerpts verified")).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.screenshot({ path: `${captureRoot}/pass-1/focused-reviewed-1280x720.png`, fullPage: true });
  await page.screenshot({ path: `${finalCaptureRoot}/02-northstar-completed-1280x720.png`, fullPage: true });
  await page.screenshot({ path: `${brandCaptureRoot}/02-northstar-completed-1280x720.png`, fullPage: true });
  await focused.locator(".focused-exception").screenshot({ path: `${finalCaptureRoot}/03-currency-evidence-1280x720.png` });
  await focused.locator(".focused-exception").screenshot({ path: `${brandCaptureRoot}/03-currency-evidence-1280x720.png` });
  await focused.locator(".focused-exception").screenshot({ path: `${finalUiCaptureRoot}/03-currency-after.png` });
  await focused.locator(".focused-human-decision").screenshot({ path: `${finalCaptureRoot}/04-reviewer-decision-1280x720.png` });
  await focused.locator(".focused-human-decision").screenshot({ path: `${brandCaptureRoot}/04-reviewer-decision-1280x720.png` });

  await focused.getByRole("button", { name: "Open full workspace" }).click();
  await expect(page.getByRole("navigation", { name: "Review progress" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Case overview" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Evidence coverage map" })).toBeVisible();
  await page.screenshot({ path: `${captureRoot}/pass-1/full-workspace-1280x720.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: `${finalCaptureRoot}/06-full-workspace-1440x900.png`, fullPage: true });
  await page.screenshot({ path: `${brandCaptureRoot}/06-full-workspace-1440x900.png`, fullPage: true });

  await page.getByRole("button", { name: "Return to focused demo" }).click();
  await page.getByRole("button", { name: "Demo guide" }).click();
  const judge = page.getByRole("region", { name: "Judge Mode sequence" });
  await expect(judge).toContainText("Run the review");
  await judge.getByRole("button", { name: "Next" }).click();
  await expect(judge).toContainText("Inspect the evidence");
  await judge.getByRole("button", { name: "Next" }).click();
  await expect(judge).toContainText("Reproduce the result");
  await judge.getByRole("button", { name: "Next" }).click();
  await expect(judge).toContainText("Record the decision");
  await page.screenshot({ path: `${captureRoot}/pass-1/judge-mode-compact.png`, fullPage: true });
});

test("pass 2 — reproduces the fingerprint and explains the threshold change", async ({ page }) => {
  const providerRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/api\/ai\/(policy|analyze)$/.test(new URL(request.url()).pathname)) providerRequests.push(request.url());
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/");
  const focused = await runFocusedReview(page);
  const fingerprintDetails = focused.locator(".fingerprint-details");
  const fingerprint = fingerprintDetails.locator("code");
  await expect(fingerprintDetails).not.toHaveAttribute("open", "");
  const initialFingerprint = await fingerprint.textContent();
  expect(initialFingerprint).toMatch(/^[0-9a-f]{64}$/);
  await focused.locator(".focused-exception").screenshot({ path: `${captureRoot}/pass-2/currency-eur-usd.png` });
  await focused.locator(".review-fingerprint").screenshot({ path: `${captureRoot}/pass-2/fingerprint-before-rerun.png` });

  const confirm = focused.getByRole("button", { name: "Confirm finding" });
  await confirm.click();
  await expect(confirm).toHaveAttribute("aria-pressed", "true");
  await focused.getByRole("button", { name: "Re-run checks" }).click();
  await expect(focused.getByText("Reproduced identically ✓")).toBeVisible();
  await expect(focused.getByText("Same inputs and conclusions reproduced")).toBeVisible();
  await expect(focused.getByText("7 of 7 conclusions reproduced identically")).toBeVisible();
  await expect(focused.getByText("Review fingerprint unchanged")).toBeVisible();
  await expect(fingerprint).toHaveText(initialFingerprint ?? "");
  await expect(confirm).toHaveAttribute("aria-pressed", "true");
  await focused.locator(".review-fingerprint").screenshot({ path: `${finalUiCaptureRoot}/04-fingerprint-collapsed.png` });
  await fingerprintDetails.getByText("View fingerprint").click();
  await expect(fingerprintDetails).toHaveAttribute("open", "");
  await expect(fingerprint).toBeVisible();
  await focused.locator(".review-fingerprint").screenshot({ path: `${finalUiCaptureRoot}/05-fingerprint-expanded.png` });
  await fingerprintDetails.getByText("View fingerprint").click();
  await focused.locator(".review-fingerprint").screenshot({ path: `${captureRoot}/pass-2/same-input-rerun.png` });

  const threshold = focused.getByRole("spinbutton", { name: "Approval threshold in EUR" });
  await expect(threshold).toHaveValue("10000");
  await focused.locator(".focused-reproducibility").screenshot({ path: `${captureRoot}/pass-2/threshold-10000.png` });
  await threshold.fill("15000");
  await focused.getByRole("button", { name: "Re-run checks" }).click();
  await expect(focused.getByText("Review content changed")).toBeVisible();
  await expect(focused.getByText("Changed conclusion: CTRL-01: FAIL → PASS")).toBeVisible();
  await expect(focused.getByText("Unchanged: 6 controls")).toBeVisible();
  await expect(focused.locator('.focused-outcomes [data-status="PASS"]')).toContainText(/4\s*PASS/);
  await expect(focused.locator('.focused-outcomes [data-status="FAIL"]')).toContainText(/1\s*FAIL/);
  await expect(fingerprint).not.toHaveText(initialFingerprint ?? "");
  await expect(confirm).toHaveAttribute("aria-pressed", "false");
  await focused.locator(".focused-reproducibility").screenshot({ path: `${captureRoot}/pass-2/threshold-15000-diff.png` });

  await focused.getByRole("button", { name: "Open full workspace" }).click();
  await expect(page.getByRole("heading", { name: "Case overview" })).toBeVisible();
  await page.getByRole("button", { name: "Return to focused demo" }).click();
  await expect(page.getByRole("spinbutton", { name: "Approval threshold in EUR" })).toHaveValue("15000");
  expect(providerRequests).toEqual([]);
});

test("pass 3 — remains bilingual, keyboard usable, reduced-motion safe, and responsive", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/api/ai/status", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ available: false, model: "gpt-5.6" }) }));
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Live GPT-5.6" })).toBeDisabled();
  await page.screenshot({ path: `${brandCaptureRoot}/11-no-key-state.png`, fullPage: true });
  const focused = await runFocusedReview(page);

  for (const [width, height, name, fullPage] of [
    [1440, 900, "focused-en-1440x900", false],
    [1280, 720, "focused-en-1280x720", false],
    [1024, 768, "focused-en-1024x768", false],
    [768, 900, "focused-en-768", true],
    [390, 844, "focused-en-390x844", true],
  ] as const) {
    await page.setViewportSize({ width, height });
    await expectNoHorizontalOverflow(page);
    if (name === "focused-en-390x844") {
      await expect.poll(() => page.locator(".product-identity img").evaluate((image: HTMLImageElement) => image.currentSrc)).toContain("/brand/policyproof-mark-color.svg");
    }
    await page.screenshot({ path: `${captureRoot}/pass-3/${name}.png`, fullPage });
    if (name === "focused-en-390x844") {
      await page.screenshot({ path: `${finalCaptureRoot}/07-mobile-english-390x844.png`, fullPage: true });
      await page.screenshot({ path: `${brandCaptureRoot}/07-mobile-english-390x844.png`, fullPage: true });
      await page.screenshot({ path: `${finalUiCaptureRoot}/06-mobile-after.png`, fullPage: true });
    }
  }

  await page.getByRole("button", { name: "Français" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  const focusedFr = page.getByRole("region", { name: "Démonstration ciblée" });
  await expect(focusedFr.getByRole("heading", { name: "Contrôle de reproductibilité", level: 3 })).toBeVisible();
  await expect(focusedFr.getByRole("button", { name: "Relancer les contrôles" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `${captureRoot}/pass-3/focused-fr-390x844.png`, fullPage: true });
  await page.screenshot({ path: `${finalCaptureRoot}/08-mobile-french-390x844.png`, fullPage: true });
  await page.screenshot({ path: `${brandCaptureRoot}/08-mobile-french-390x844.png`, fullPage: true });

  await page.getByRole("button", { name: "English" }).click();
  await page.setViewportSize({ width: 640, height: 360 });
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `${captureRoot}/pass-3/effective-zoom-200.png`, fullPage: true });
  await page.screenshot({ path: `${finalCaptureRoot}/09-effective-200-percent-zoom.png`, fullPage: true });
  await page.screenshot({ path: `${brandCaptureRoot}/09-effective-200-percent-zoom.png`, fullPage: true });

  const rerun = focused.getByRole("button", { name: "Re-run checks" });
  await page.setViewportSize({ width: 1280, height: 720 });
  await rerun.scrollIntoViewIfNeeded();
  await rerun.focus();
  await expect(rerun).toBeFocused();
  await page.screenshot({ path: `${captureRoot}/pass-3/keyboard-focus.png`, fullPage: true });
  await page.screenshot({ path: `${finalCaptureRoot}/10-keyboard-focus.png` });
  await page.screenshot({ path: `${brandCaptureRoot}/10-keyboard-focus.png` });
  const motion = await focused.locator(".review-fingerprint").evaluate((element) => {
    const style = getComputedStyle(element);
    return { animationDuration: style.animationDuration, transitionDuration: style.transitionDuration };
  });
  expect(parseFloat(motion.animationDuration || "0")).toBeLessThanOrEqual(0.001);
  expect(parseFloat(motion.transitionDuration || "0")).toBeLessThanOrEqual(0.001);
});
