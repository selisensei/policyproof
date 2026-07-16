import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("public release metadata", () => {
  it("keeps Node, pnpm, private-package, and MIT metadata coherent", () => {
    const manifest = JSON.parse(read("package.json")) as {
      private?: boolean;
      license?: string;
      packageManager?: string;
      engines?: { node?: string };
    };

    expect(manifest.private).toBe(true);
    expect(manifest.license).toBe("MIT");
    expect(manifest.packageManager).toBe("pnpm@11.9.0");
    expect(manifest.engines?.node).toBe(">=24.0.0");
    expect(read(".nvmrc").trim()).toBe("24");
  });

  it("contains the complete MIT license with the owner attribution", () => {
    const license = read("LICENSE");
    expect(license).toContain("MIT License");
    expect(license).toContain("Copyright (c) 2026 Ilies Sampaio Fernandes");
    expect(license).toContain("THE SOFTWARE IS PROVIDED \"AS IS\"");
  });

  it("documents a secret-free optional live environment", () => {
    const example = read(".env.example");
    const readme = read("README.md");
    expect(example).toContain("needs no API key");
    expect(example).toContain("Live mode is never enabled by default");
    expect(example).toMatch(/^OPENAI_API_KEY=$/m);
    expect(example).not.toMatch(/sk-(?:proj-)?[A-Za-z0-9_-]{16,}/);
    expect(readme).toContain("pnpm install --frozen-lockfile\npnpm demo:verify\npnpm dev");
    expect(readme).toContain("needs no API key, browser, development server, or live provider");
    expect(readme).toContain("202 Vitest tests");
    expect(readme).toContain("23 Playwright tests");
  });

  it("states the three mandatory security boundaries exactly", () => {
    const security = read("SECURITY.md");
    expect(security).toContain("The integrity check confirms that the receipt content matches its recorded hash. Because the hash is not digitally signed, it does not establish origin, identity, authorship, authenticity or trusted time.");
    expect(security).toContain("The tested prompt-injection case demonstrates that hostile instructions remain inert document data within the local structured evaluation boundary. It does not establish universal model-level prompt-injection resistance.");
    expect(security).toContain("The evaluation harness blocks the network APIs used by the application and recorded zero attempted external calls during the verified workflow.");
  });

  it("freezes the validated source commit and product profiles", () => {
    const freeze = read("docs/release/CODE_FREEZE.md");
    expect(freeze).toContain("`1a6db74cef7331a2432b19c0f8bf6a8d894dd4e4`");
    expect(freeze).toContain("| Northstar | 3 | 2 | 1 | 1 |");
    expect(freeze).toContain("| Meridian | 7 | 0 | 0 | 0 |");
    expect(freeze).toContain("| Atlas | 4 | 1 | 2 | 0 |");
    expect(freeze).toContain("explicit owner approval");
  });

  it("pins Turbopack to the active repository root for nested clean-room builds", () => {
    const nextConfig = read("next.config.ts");
    const vitestConfig = read("vitest.config.ts");
    expect(nextConfig).toContain("turbopack:");
    expect(nextConfig).toContain("root: process.cwd()");
    expect(vitestConfig).toContain("maxWorkers: 2");
    expect(vitestConfig).toContain("testTimeout: 15_000");
  });
});
