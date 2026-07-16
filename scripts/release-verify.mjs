import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

export const releaseSteps = Object.freeze([
  { label: "Release hygiene", command: process.execPath, args: ["scripts/check-release-hygiene.mjs"] },
  { label: "Documentation links", command: process.execPath, args: ["scripts/check-doc-links.mjs"] },
  { label: "Human copy", command: process.execPath, args: ["scripts/check-human-copy.mjs"] },
  { label: "Deterministic demo verification and TypeScript", command: pnpm, args: ["demo:verify"] },
  { label: "Full Vitest suite", command: pnpm, args: ["test"] },
  { label: "ESLint", command: pnpm, args: ["lint"] },
  { label: "Production build", command: pnpm, args: ["build"] },
  { label: "Playwright", command: pnpm, args: ["test:e2e"] },
  { label: "Git whitespace check", command: "git", args: ["diff", "--check"] },
  { label: "Git unstaged cleanliness", command: "git", args: ["diff", "--exit-code"] },
  { label: "Git staged cleanliness", command: "git", args: ["diff", "--cached", "--exit-code"] },
]);

export function runCommand(step) {
  const useWindowsCommandShell = process.platform === "win32" && step.command.endsWith(".cmd");
  const executable = useWindowsCommandShell ? "cmd.exe" : step.command;
  const executableArgs = useWindowsCommandShell ? ["/d", "/s", "/c", step.command, ...step.args] : step.args;
  const result = spawnSync(executable, executableArgs, { cwd: root, env: process.env, encoding: "utf8", stdio: "inherit", shell: false });
  if (result.error) return 1;
  return result.status ?? 1;
}

export async function runReleaseVerification({ steps = releaseSteps, run = runCommand, log = console.log } = {}) {
  log("PolicyProof release verification");
  log("--------------------------------");
  for (const step of steps) {
    log(`\n[release] ${step.label}`);
    const code = await run(step);
    if (code !== 0) throw new Error(`${step.label} failed with exit code ${code}.`);
  }
  log("\nPolicyProof release verification: PASS");
}

async function main() {
  try {
    await runReleaseVerification();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
