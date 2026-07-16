import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function fallbackMarkdownFiles(root) {
  const files = [];
  const visit = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if ([".git", ".next", "node_modules", "test-results", "playwright-report", "coverage"].includes(entry.name)) continue;
      const absolute = resolve(directory, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else if (extname(entry.name).toLowerCase() === ".md") files.push(absolute.slice(root.length + 1).replaceAll("\\", "/"));
    }
  };
  visit(root);
  return files.sort();
}

export function trackedMarkdownFiles(root = scriptRoot) {
  const result = spawnSync("git", ["ls-files", "-z", "--", "*.md"], { cwd: root, encoding: "utf8" });
  if (result.status === 0) return result.stdout.split("\0").filter(Boolean).sort();
  return fallbackMarkdownFiles(root);
}

function stripCodeFences(markdown) {
  let fenced = false;
  return markdown.split(/\r?\n/).map((line) => {
    if (/^\s*(```|~~~)/.test(line)) {
      fenced = !fenced;
      return "";
    }
    return fenced ? "" : line;
  }).join("\n");
}

function localTarget(rawTarget) {
  const target = rawTarget.trim().replace(/^<|>$/g, "");
  if (!target || target.startsWith("#") || /^(?:https?:|mailto:|data:|javascript:)/i.test(target)) return null;
  if (/^file:/i.test(target)) return { invalid: "file URLs are not public repository links" };
  const withoutFragment = target.split("#", 1)[0].split("?", 1)[0];
  if (!withoutFragment) return null;
  try {
    return { path: decodeURIComponent(withoutFragment) };
  } catch {
    return { invalid: "link target is not valid percent-encoding" };
  }
}

export function collectMarkdownLinkErrors({ root = scriptRoot, files = trackedMarkdownFiles(root) } = {}) {
  const errors = [];
  const linkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^)]*["'])?\)/g;
  for (const file of files) {
    const absoluteFile = resolve(root, file);
    if (!existsSync(absoluteFile)) {
      errors.push(`${file}: tracked Markdown file is missing`);
      continue;
    }
    const markdown = stripCodeFences(readFileSync(absoluteFile, "utf8"));
    for (const match of markdown.matchAll(linkPattern)) {
      const target = localTarget(match[1]);
      if (!target) continue;
      if (target.invalid) {
        errors.push(`${file}: ${target.invalid}`);
        continue;
      }
      const resolvedTarget = resolve(dirname(absoluteFile), target.path);
      if (!existsSync(resolvedTarget)) {
        errors.push(`${file}: missing relative link target ${target.path}`);
      } else if (!statSync(resolvedTarget).isFile() && !statSync(resolvedTarget).isDirectory()) {
        errors.push(`${file}: unsupported relative link target ${target.path}`);
      }
    }
  }
  return errors;
}

export function checkDocumentationLinks(options) {
  const errors = collectMarkdownLinkErrors(options);
  if (errors.length > 0) throw new Error(`Documentation link check failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  return { filesChecked: (options?.files ?? trackedMarkdownFiles(options?.root)).length };
}

async function main() {
  try {
    const result = checkDocumentationLinks();
    console.log(`PolicyProof documentation links: PASS (${result.filesChecked} Markdown files)`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
