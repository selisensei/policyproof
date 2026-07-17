import { mkdirSync, readFileSync } from "node:fs";
import { expect, test, type Page } from "@playwright/test";

const captureRoot = "test-results/verifiable-receipt";
const finalCaptureRoot = "test-results/final-human-review/final";
const brandCaptureRoot = "test-results/final-brand-integration/final";
mkdirSync(`${captureRoot}/pass-1`, { recursive: true });
mkdirSync(`${captureRoot}/pass-2`, { recursive: true });
mkdirSync(`${captureRoot}/pass-3`, { recursive: true });
mkdirSync(finalCaptureRoot, { recursive: true });
mkdirSync(brandCaptureRoot, { recursive: true });

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({ width: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.width + 1);
}

async function generateNorthstarReceipt(page: Page) {
  await page.goto("/");
  const focused = page.getByRole("region", { name: "Focused Demo" });
  await focused.getByRole("button", { name: "Run review" }).click();
  await expect(focused.locator('.focused-outcomes [data-status="PASS"]')).toContainText(/3\s*PASS/);
  await expect(focused.locator('.focused-outcomes [data-status="FAIL"]')).toContainText(/2\s*FAIL/);
  await expect(focused.locator('.focused-outcomes [data-status="MISSING"]')).toContainText(/1\s*MISSING/);
  await expect(focused.locator('.focused-outcomes [data-status="WARNING"]')).toContainText(/1\s*WARNING/);
  await expect(focused.getByText("12,480 EUR", { exact: true })).toBeVisible();
  await expect(focused.getByText("12,480 USD", { exact: true })).toBeVisible();
  const initialFingerprint = await focused.locator(".review-fingerprint > header code").textContent();
  await focused.getByRole("button", { name: "Re-run checks" }).click();
  await expect(focused.getByText("7 of 7 conclusions reproduced identically")).toBeVisible();
  await expect(focused.getByText("Review fingerprint unchanged")).toBeVisible();
  await focused.getByRole("spinbutton", { name: "Approval threshold in EUR" }).fill("15000");
  await focused.getByRole("button", { name: "Re-run checks" }).click();
  await expect(focused.getByText("Changed conclusion: CTRL-01: FAIL → PASS")).toBeVisible();
  await expect(focused.getByText("Unchanged: 6 controls")).toBeVisible();
  await expect(focused.locator(".review-fingerprint > header code")).not.toHaveText(initialFingerprint ?? "");
  await focused.getByRole("textbox", { name: "Reviewer comment" }).fill("Currency evidence checked by the fictional reviewer.");
  await focused.getByRole("button", { name: "Confirm" }).click();
  await focused.getByRole("button", { name: "Generate receipt" }).click();
  await expect(focused.getByRole("button", { name: "Verify receipt integrity" })).toBeVisible();
  return focused;
}

test("judge path generates, verifies, exports, imports, and detects one-character tampering", async ({ page }) => {
  const providerRequests: string[] = [];
  page.on("request", (request) => {
    if (/\/api\/ai\/(policy|analyze)$/.test(new URL(request.url()).pathname)) providerRequests.push(request.url());
  });
  await page.setViewportSize({ width: 1280, height: 720 });
  const focused = await generateNorthstarReceipt(page);
  const integrity = focused.locator(".receipt-integrity-panel");
  await expect(integrity).toContainText("Review Fingerprint");
  await expect(integrity).toContainText("Receipt integrity hash");
  await integrity.getByRole("button", { name: "Technical details" }).click();
  await expect(integrity).toContainText("policyproof.receipt-integrity.v1");
  await expect(integrity).toContainText("SHA-256");
  await integrity.screenshot({ path: `${captureRoot}/pass-1/focused-receipt-expanded-1280x720.png` });

  const requestCountBeforeVerification = await page.evaluate(() => performance.getEntriesByType("resource").length);
  await integrity.getByRole("button", { name: "Verify receipt integrity" }).click();
  await expect(integrity.getByText("Receipt integrity verified")).toBeVisible();
  const requestCountAfterVerification = await page.evaluate(() => performance.getEntriesByType("resource").length);
  expect(requestCountAfterVerification).toBe(requestCountBeforeVerification);
  await integrity.screenshot({ path: `${captureRoot}/pass-2/valid-receipt.png` });
  await integrity.screenshot({ path: `${finalCaptureRoot}/05-verified-receipt-1280x720.png` });
  await integrity.screenshot({ path: `${brandCaptureRoot}/05-verified-receipt-1280x720.png` });

  const downloadPromise = page.waitForEvent("download");
  await integrity.getByRole("button", { name: "Export receipt JSON" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();
  const exportedJson = readFileSync(downloadPath!, "utf8");
  expect(exportedJson).toContain('"version": "policyproof.receipt-integrity.v1"');
  expect(exportedJson).toContain('"controlId": "CTRL-APPROVAL"');
  expect(exportedJson).toContain('"displayReference": "CTRL-01"');

  await page.setViewportSize({ width: 1440, height: 900 });
  await integrity.locator("summary", { hasText: "Verify a local JSON receipt" }).click();
  await integrity.getByLabel("Or paste JSON").fill(exportedJson);
  await integrity.getByRole("button", { name: "Verify local JSON" }).click();
  await expect(integrity.getByText("Receipt integrity verified")).toHaveCount(2);
  const modifiedJson = exportedJson.replace("fictional reviewer", "fictional reviewex");
  await integrity.getByLabel("Or paste JSON").fill(modifiedJson);
  await integrity.getByRole("button", { name: "Verify local JSON" }).click();
  await expect(integrity.getByText("Receipt content has changed")).toBeVisible();
  await integrity.screenshot({ path: `${captureRoot}/pass-2/modified-receipt.png` });
  await integrity.locator(".receipt-local-verifier").screenshot({ path: `${finalCaptureRoot}/11-modified-receipt.png` });

  await focused.getByRole("button", { name: "Open full workspace" }).click();
  await page.getByRole("button", { name: "Decision", exact: true }).click();
  await expect(page.getByText("Receipt integrity verified")).toBeVisible();
  await expect(page.locator(".receipt-brand img")).toHaveAttribute("src", "/brand/policyproof-mark-color.svg");
  await expect(page.locator(".receipt-brand img")).toHaveAttribute("alt", "");
  await expect(page.locator("summary", { hasText: "More exports" })).toBeVisible();
  const technicalDetails = page.getByRole("button", { name: "Technical details" });
  if (await technicalDetails.getAttribute("aria-expanded") === "true") await technicalDetails.click();
  await page.locator(".receipt-section").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, -160));
  await page.screenshot({ path: `${brandCaptureRoot}/05-verified-receipt-1280x720.png` });
  await page.screenshot({ path: `${captureRoot}/pass-1/full-workspace-receipt.png`, fullPage: true });
  await page.getByRole("button", { name: "Return to focused demo" }).click();
  await expect(page.getByRole("region", { name: "Focused Demo" }).getByText("Receipt integrity verified")).toBeVisible();
  expect(providerRequests).toEqual([]);
});

test("local verifier distinguishes unsupported, malformed, and missing-integrity receipts", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const focused = await generateNorthstarReceipt(page);
  const integrity = focused.locator(".receipt-integrity-panel");
  const downloadPromise = page.waitForEvent("download");
  await integrity.getByRole("button", { name: "Export receipt JSON" }).click();
  const downloadPath = await (await downloadPromise).path();
  const exported = JSON.parse(readFileSync(downloadPath!, "utf8")) as Record<string, unknown>;
  await integrity.locator("summary", { hasText: "Verify a local JSON receipt" }).click();
  const input = integrity.getByLabel("Or paste JSON");

  const unsupported = structuredClone(exported);
  (unsupported.integrity as Record<string, unknown>).version = "policyproof.receipt-integrity.v2";
  await input.fill(JSON.stringify(unsupported));
  await integrity.getByRole("button", { name: "Verify local JSON" }).click();
  await expect(integrity.getByText("Unsupported receipt version")).toBeVisible();
  await integrity.screenshot({ path: `${captureRoot}/pass-2/unsupported-version.png` });

  await input.fill("{malformed-json");
  await integrity.getByRole("button", { name: "Verify local JSON" }).click();
  await expect(integrity.getByText("Invalid receipt structure")).toBeVisible();
  await integrity.screenshot({ path: `${captureRoot}/pass-2/malformed-receipt.png` });

  const missing = structuredClone(exported);
  delete missing.integrity;
  await input.fill(JSON.stringify(missing));
  await integrity.getByRole("button", { name: "Verify local JSON" }).click();
  await expect(integrity.getByText("Receipt integrity block is missing")).toBeVisible();
  await integrity.screenshot({ path: `${captureRoot}/pass-2/missing-integrity.png` });
});

test("receipt verification remains bilingual, responsive, keyboard reachable, and reduced-motion safe", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  const focused = await generateNorthstarReceipt(page);
  const integrity = focused.locator(".receipt-integrity-panel");
  await expectNoHorizontalOverflow(page);
  const verify = integrity.getByRole("button", { name: "Verify receipt integrity" });
  await verify.focus();
  await expect(verify).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(integrity.getByText("Receipt integrity verified")).toBeVisible();
  await integrity.screenshot({ path: `${captureRoot}/pass-3/receipt-en-390x844-keyboard.png` });

  await page.getByRole("button", { name: "Français" }).click();
  const focusedFr = page.getByRole("region", { name: "Démonstration ciblée" });
  await expect(focusedFr.getByText("Intégrité du reçu vérifiée")).toBeVisible();
  await expect(focusedFr.getByRole("button", { name: "Vérifier l’intégrité du reçu" })).toBeVisible();
  await expect(focusedFr).toContainText("Cela ne prouve ni l’identité, ni l’auteur, ni une signature juridique, ni un horodatage qualifié.");
  await expectNoHorizontalOverflow(page);
  await focusedFr.locator(".receipt-integrity-panel").screenshot({ path: `${captureRoot}/pass-3/receipt-fr-390x844.png` });

  await page.getByRole("button", { name: "English" }).click();
  await page.setViewportSize({ width: 640, height: 360 });
  await expectNoHorizontalOverflow(page);
  await integrity.screenshot({ path: `${captureRoot}/pass-3/receipt-effective-200-percent.png` });
  const motion = await integrity.evaluate((element) => ({ animation: getComputedStyle(element).animationDuration, transition: getComputedStyle(element).transitionDuration }));
  expect(parseFloat(motion.animation || "0")).toBeLessThanOrEqual(0.001);
  expect(parseFloat(motion.transition || "0")).toBeLessThanOrEqual(0.001);
});

test("captures the desktop receipt hierarchy at the remaining required viewports", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const focused = await generateNorthstarReceipt(page);
  await focused.locator(".receipt-integrity-panel").getByRole("button", { name: "Verify receipt integrity" }).click();
  await focused.locator(".receipt-integrity-panel").screenshot({ path: `${captureRoot}/pass-3/receipt-en-1440x900.png` });
  await page.setViewportSize({ width: 1024, height: 768 });
  await expectNoHorizontalOverflow(page);
  await focused.locator(".receipt-integrity-panel").screenshot({ path: `${captureRoot}/pass-3/receipt-en-1024x768.png` });
});
