import { spawn } from "node:child_process";
import { createRequire } from "node:module";

const supportedCommands = new Set(["dev", "build", "start"]);
const [, , command, ...args] = process.argv;

if (!command || !supportedCommands.has(command)) {
  console.error("Expected one of: dev, build, start.");
  process.exit(1);
}

const require = createRequire(import.meta.url);
const nextExecutable = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextExecutable, command, ...args], {
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
