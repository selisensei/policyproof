import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const generatedSegment = /(^|\/)(?:node_modules|\.next|test-results|playwright-report|coverage|\.vercel)(?:\/|$)/;
const publicDocument = /(?:^|\/)(?:README|SECURITY|CHANGELOG|PRODUCT|PLAN|TESTING|DECISIONS|AGENTS)\.md$|^docs\/.*\.md$/;
const secretPattern = /sk-(?:proj-)?[A-Za-z0-9_-]{20,}/;
const personalPathPattern = /(?:[A-Za-z]:\\(?:Users|noxyf)\\|C:\/Users\/|D:\/noxyf\/|file:\/\/)/i;
const unsupportedClaims = [
  /\bis tamper-proof\b/i,
  /\bis unforgeable\b/i,
  /\bis an immutable record\b/i,
  /\bguarantees? compliance\b/i,
  /\bAI never hallucinates\b/i,
  /\ball scenarios (?:are |were )?live GPT-5\.6 validated\b/i,
];
const ownerTokens = ["REPOSITORY_URL", "DEPLOYED_DEMO_URL", "YOUTUBE_URL", "FEEDBACK_SESSION_ID"];
const ownerChecklist = "docs/submission/FINAL_SUBMISSION_CHECKLIST.md";

export function trackedFiles(root = scriptRoot) {
  const result = spawnSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8" });
  if (result.status !== 0) throw new Error("Release hygiene requires a Git worktree.");
  return result.stdout.split("\0").filter(Boolean).sort();
}

export function collectReleaseHygieneErrors({ root = scriptRoot, files = trackedFiles(root) } = {}) {
  const errors = [];
  const normalized = files.map((file) => file.replaceAll("\\", "/"));
  for (const file of normalized) {
    if (file === ".env.local" || file.endsWith("/.env.local")) errors.push(`${file}: local environment file must not be tracked`);
    if (generatedSegment.test(file) || /\.log$/i.test(file)) errors.push(`${file}: generated artifact must not be tracked`);
    const absolute = resolve(root, file);
    if (!existsSync(absolute)) continue;
    const content = readFileSync(absolute);
    if (content.includes(0)) continue;
    const text = content.toString("utf8");
    if (secretPattern.test(text)) errors.push(`${file}: possible OpenAI secret pattern`);
    if (publicDocument.test(file) && personalPathPattern.test(text)) errors.push(`${file}: public documentation contains a local path or file URL`);
    if (publicDocument.test(file)) {
      for (const claim of unsupportedClaims) if (claim.test(text)) errors.push(`${file}: unsupported public claim matches ${claim}`);
      if (file !== ownerChecklist) {
        for (const token of ownerTokens) if (text.includes(token)) errors.push(`${file}: owner placeholder ${token} belongs only in the final checklist`);
      }
    }
  }

  const currentDocs = ["README.md", "docs/release/RELEASE_MANIFEST.md"].filter((file) => normalized.includes(file));
  const counts = currentDocs.map((file) => {
    const match = readFileSync(resolve(root, file), "utf8").match(/\b(\d+) Vitest tests\b/);
    return { file, count: match?.[1] };
  });
  if (counts.length === 2 && counts.some(({ count }) => !count || count !== counts[0].count)) {
    errors.push("README.md and RELEASE_MANIFEST.md must state one identical current Vitest test count");
  }
  return errors;
}

export function checkReleaseHygiene(options) {
  const errors = collectReleaseHygieneErrors(options);
  if (errors.length > 0) throw new Error(`Release hygiene check failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  return { filesChecked: (options?.files ?? trackedFiles(options?.root)).length };
}

async function main() {
  try {
    const result = checkReleaseHygiene();
    console.log(`PolicyProof release hygiene: PASS (${result.filesChecked} tracked files)`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
