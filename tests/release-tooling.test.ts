import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
// @ts-expect-error The release checker is an intentionally dependency-free Node ESM script.
import { collectMarkdownLinkErrors } from "../scripts/check-doc-links.mjs";
// @ts-expect-error The release checker is an intentionally dependency-free Node ESM script.
import { collectReleaseHygieneErrors } from "../scripts/check-release-hygiene.mjs";
// @ts-expect-error The copy checker is an intentionally dependency-free Node ESM script.
import { scanHumanCopy } from "../scripts/check-human-copy.mjs";
// @ts-expect-error The release orchestrator is an intentionally dependency-free Node ESM script.
import { releaseSteps, runReleaseVerification } from "../scripts/release-verify.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const temporaryRoot = resolve(repositoryRoot, "test-results", "release-tooling-tests");
const createdDirectories: string[] = [];

function fixtureDirectory() {
  mkdirSync(temporaryRoot, { recursive: true });
  const directory = mkdtempSync(join(temporaryRoot, "case-"));
  createdDirectories.push(directory);
  return directory;
}

afterEach(() => {
  for (const directory of createdDirectories.splice(0)) rmSync(directory, { recursive: true, force: true });
});

describe("release documentation and hygiene tooling", () => {
  it("keeps visible product and public submission copy free from long dashes and generic AI marketing", () => {
    expect(scanHumanCopy()).toEqual([]);
  });

  it("accepts existing relative Markdown links and rejects missing targets and file URLs", () => {
    const root = fixtureDirectory();
    mkdirSync(join(root, "docs"));
    writeFileSync(join(root, "README.md"), "[Guide](docs/guide.md)\n[Missing](docs/missing.md)\n[Local](file:///tmp/report.md)\n", "utf8");
    writeFileSync(join(root, "docs", "guide.md"), "# Guide\n", "utf8");

    expect(collectMarkdownLinkErrors({ root, files: ["README.md", "docs/guide.md"] })).toEqual([
      "README.md: missing relative link target docs/missing.md",
      "README.md: file URLs are not public repository links",
    ]);
  });

  it("detects tracked secrets, generated output, local paths, placeholders, and unsupported claims", () => {
    const root = fixtureDirectory();
    writeFileSync(join(root, "README.md"), [
      "C:\\Users\\builder\\project",
      "REPOSITORY_URL",
      "The receipt is tamper-proof.",
      ["sk", "proj", "123456789012345678901234"].join("-"),
    ].join("\n"), "utf8");

    const errors = collectReleaseHygieneErrors({
      root,
      files: ["README.md", ".env.local", "test-results/output.log"],
    });

    expect(errors).toEqual(expect.arrayContaining([
      "README.md: possible OpenAI secret pattern",
      "README.md: public documentation contains a local path or file URL",
      "README.md: owner placeholder REPOSITORY_URL belongs only in the final checklist",
      ".env.local: local environment file must not be tracked",
      "test-results/output.log: generated artifact must not be tracked",
    ]));
    expect(errors.some((error: string) => error.includes("unsupported public claim"))).toBe(true);
  });

  it("keeps README and release-manifest test counts synchronized", () => {
    const root = fixtureDirectory();
    mkdirSync(join(root, "docs", "release"), { recursive: true });
    writeFileSync(join(root, "README.md"), "The release has 200 Vitest tests.\n", "utf8");
    writeFileSync(join(root, "docs", "release", "RELEASE_MANIFEST.md"), "The release has 201 Vitest tests.\n", "utf8");

    expect(collectReleaseHygieneErrors({
      root,
      files: ["README.md", "docs/release/RELEASE_MANIFEST.md"],
    })).toContain("README.md and RELEASE_MANIFEST.md must state one identical current Vitest test count");
  });
});

describe("release verification orchestration", () => {
  it("runs every mandatory step and reports PASS only after success", async () => {
    const calls: string[] = [];
    const logs: string[] = [];
    await runReleaseVerification({
      run: (step: { label: string }) => { calls.push(step.label); return 0; },
      log: (message: string) => logs.push(message),
    });

    expect(calls).toEqual(releaseSteps.map((step: { label: string }) => step.label));
    expect(logs.at(-1)).toBe("\nPolicyProof release verification: PASS");
  });

  it("fails fast and does not run later commands after a child failure", async () => {
    const calls: string[] = [];
    await expect(runReleaseVerification({
      steps: releaseSteps.slice(0, 4),
      run: (step: { label: string }) => {
        calls.push(step.label);
        return step.label === "Documentation links" ? 7 : 0;
      },
      log: () => undefined,
    })).rejects.toThrow("Documentation links failed with exit code 7");
    expect(calls).toEqual(["Release hygiene", "Documentation links"]);
  });
});

describe("CI and clean-room contracts", () => {
  it("uses frozen installs, deterministic verification, Chromium, audit, and no OpenAI secret", () => {
    const workflow = readFileSync(resolve(repositoryRoot, ".github/workflows/ci.yml"), "utf8");
    expect(workflow).toContain("permissions:\n  contents: read");
    expect(workflow.match(/pnpm install --frozen-lockfile/g)).toHaveLength(3);
    expect(workflow).toContain("run: pnpm demo:verify");
    expect(workflow).toContain("run: pnpm test:e2e");
    expect(workflow).toContain("run: pnpm audit --prod");
    expect(workflow).not.toMatch(/OPENAI_API_KEY|secrets\./);
    expect(workflow).not.toMatch(/deploy|vercel/i);
  });

  it("builds the clean room from Git-tracked content with an offline frozen install", () => {
    const script = readFileSync(resolve(repositoryRoot, "scripts/clean-room-verify.mjs"), "utf8");
    expect(script).toContain("git\", [\"archive\"");
    expect(script).toContain("--offline");
    expect(script).toContain("--frozen-lockfile");
    expect(script).toContain("delete env.OPENAI_API_KEY");
    expect(script).toContain("status.available !== false");
    expect(script).not.toContain("copyFile");
    expect(script).not.toContain("shell: true");
  });
});
