import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const targets = [
  "src/i18n/translations.ts",
  "components/demo-review-workspace.tsx",
  "components/workspace",
  "README.md",
  "PRODUCT.md",
  "SECURITY.md",
  "docs/submission/DEVPOST_FINAL_DRAFT.md",
  "docs/submission/VIDEO_SCRIPT_FINAL.md",
  "docs/submission/JUDGE_QA.md",
  "docs/release/RELEASE_MANIFEST.md",
];

const prohibitedPhrases = [
  "ai-powered",
  "powered by ai",
  "leverage",
  "unlock",
  "seamless",
  "seamlessly",
  "robust",
  "cutting-edge",
  "revolutionary",
  "next-generation",
  "intelligent platform",
  "smart insights",
  "comprehensive solution",
  "at a glance",
  "effortlessly",
  "transform your workflow",
  "reimagine",
  "supercharge",
  "advanced capabilities",
  "actionable insights",
  "confidence at every step",
  "built for trust",
  "designed for transparency",
  "not just",
  "not only",
];

function filesUnder(path) {
  const absolute = resolve(root, path);
  if (statSync(absolute).isFile()) return [absolute];
  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(absolute, entry.name);
    if (entry.isDirectory()) return filesUnder(relative(root, child));
    return /\.(?:tsx?|md)$/.test(entry.name) ? [child] : [];
  });
}

export function scanHumanCopy() {
  const findings = [];
  for (const file of targets.flatMap(filesUnder)) {
    const displayPath = relative(root, file).replaceAll("\\", "/");
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    for (const [index, line] of lines.entries()) {
      if (/[—–]/u.test(line)) findings.push(`${displayPath}:${index + 1}: long dash`);
      const lower = line.toLocaleLowerCase("en-US");
      for (const phrase of prohibitedPhrases) {
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (new RegExp(`(?:^|[^a-z])${escaped}(?:$|[^a-z])`, "u").test(lower)) findings.push(`${displayPath}:${index + 1}: prohibited phrase "${phrase}"`);
      }
      if (displayPath.endsWith(".md") && /[!?]{2,}/u.test(line)) findings.push(`${displayPath}:${index + 1}: repeated punctuation`);
      if (/\b(?:lorem ipsum|coming soon|placeholder copy)\b/iu.test(line)) findings.push(`${displayPath}:${index + 1}: placeholder copy`);
    }
  }
  return findings;
}

function main() {
  const findings = scanHumanCopy();
  if (findings.length) {
    console.error("PolicyProof human-copy audit: FAIL");
    for (const finding of findings) console.error(`- ${finding}`);
    process.exitCode = 1;
    return;
  }
  console.log(`PolicyProof human-copy audit: PASS (${targets.length} audited targets)`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
