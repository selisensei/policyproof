import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cleanRoot = resolve(repositoryRoot, "test-results", "release-clean-room");
const sourceRoot = resolve(cleanRoot, "source");
const archivePath = resolve(cleanRoot, "tracked-repository.tar");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function run(command, args, cwd = repositoryRoot) {
  const result = spawnSync(command, args, { cwd, env: process.env, encoding: "utf8", stdio: "inherit", shell: false });
  if (result.status !== 0) throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status ?? 1}.`);
}

async function waitForProductionServer(url, child) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (child.exitCode !== null) throw new Error(`Production server exited with code ${child.exitCode}.`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
      if (response.ok) return response;
    } catch {
      // The local server is still starting.
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 250));
  }
  throw new Error("Production server did not become ready in the clean room.");
}

async function smokeProduction() {
  const port = 3411;
  const env = { ...process.env, PORT: String(port), NEXT_TELEMETRY_DISABLED: "1" };
  delete env.OPENAI_API_KEY;
  const nextExecutable = resolve(sourceRoot, "node_modules", "next", "dist", "bin", "next");
  const child = spawn(process.execPath, [nextExecutable, "start", "-p", String(port)], {
    cwd: sourceRoot,
    env,
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
  child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
  try {
    const response = await waitForProductionServer(`http://127.0.0.1:${port}/`, child);
    const statusResponse = await fetch(`http://127.0.0.1:${port}/api/ai/status`, { signal: AbortSignal.timeout(2000) });
    const status = await statusResponse.json();
    if (status.available !== false || status.model !== "gpt-5.6") throw new Error("Clean-room provider status did not fail closed without a key.");
    if (response.headers.get("x-content-type-options") !== "nosniff") throw new Error("Missing nosniff header in clean-room production smoke.");
    if (response.headers.get("x-frame-options") !== "DENY") throw new Error("Missing frame protection in clean-room production smoke.");
    if (response.headers.get("referrer-policy") !== "strict-origin-when-cross-origin") throw new Error("Missing referrer policy in clean-room production smoke.");
  } finally {
    child.kill();
    await Promise.race([
      new Promise((resolveExit) => child.once("exit", resolveExit)),
      new Promise((resolveWait) => setTimeout(resolveWait, 2000)),
    ]);
    writeFileSync(resolve(cleanRoot, "production.stdout.log"), stdout, "utf8");
    writeFileSync(resolve(cleanRoot, "production.stderr.log"), stderr, "utf8");
  }
}

export async function verifyCleanRoom() {
  rmSync(cleanRoot, { recursive: true, force: true });
  mkdirSync(sourceRoot, { recursive: true });
  run("git", ["archive", "--format=tar", "--output", archivePath, "HEAD"]);
  run("tar", ["-xf", archivePath, "-C", sourceRoot]);

  const forbidden = [".git", ".env.local", "node_modules", ".next", "test-results", "playwright-report", "coverage", ".vercel"];
  for (const entry of forbidden) {
    if (existsSync(resolve(sourceRoot, entry))) throw new Error(`Clean-room archive unexpectedly contains ${entry}.`);
  }

  run(pnpm, ["install", "--offline", "--frozen-lockfile"], sourceRoot);
  run(pnpm, ["demo:verify"], sourceRoot);
  run(pnpm, ["build"], sourceRoot);
  await smokeProduction();

  const result = {
    result: "PASS",
    source: "git archive HEAD",
    environmentFilePresent: false,
    gitDirectoryPresent: false,
    install: "pnpm install --offline --frozen-lockfile",
    demoVerification: "PASS",
    productionBuild: "PASS",
    productionSmoke: "PASS",
    providerAvailableWithoutKey: false,
  };
  writeFileSync(resolve(cleanRoot, "result.json"), `${JSON.stringify(result, null, 2)}\n`, "utf8");
  console.log("PolicyProof clean-room verification: PASS");
  return result;
}

async function main() {
  try {
    await verifyCleanRoom();
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main();
