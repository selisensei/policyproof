# Performance and runtime check

## Purpose

This document records indicative local release evidence. It is not a public latency benchmark, production service-level claim, or comparison with another product.

## Validated environment

- Node.js 24.14.0
- pnpm 11.9.0
- Next.js 16.2.10
- Chromium through Playwright 1.61.1
- Windows local workspace with a slow-filesystem warning during browser tests

## Release evidence

| Check | Local evidence |
| --- | --- |
| Production build | Successful; 5 application routes reported |
| Vitest | 205 tests across 28 files; final duration recorded in the release report |
| Playwright | 23 Chromium tests; final duration recorded in the release report |
| Competition evaluation | 3 scenarios, 21 conclusions; deterministic PASS |
| Demo verification | Provider-free PASS |
| Clean room | Offline frozen install, demo verification, build, and no-key production smoke PASS |
| Clean-room first successful run | Approximately 6 minutes 39 seconds on the local slow Windows filesystem; not a performance target |
| Local document input limit | Up to 10 text files, 1 MB per file |
| Additional production dependencies in release hardening | None |

## Runtime observations

- Deterministic review, same-input rerun, fingerprints, receipt hashing, receipt verification, mutations, and adversarial checks use local TypeScript and native Web Crypto.
- Deterministic Demo makes no provider request.
- The evaluation harness recorded zero attempted external calls under its scoped guard.
- Hashing is performed only for the current review or receipt boundary; no repeated background hashing service exists.
- Scenarios share one registry and engine instead of duplicating large runtime bundles.
- Provider code remains behind server routes; the browser does not instantiate the OpenAI client.
- The tracked repository contains no build output, browser report, coverage directory, or large binary scenario asset.

## Build routes

```text
/                    static
/_not-found          static
/api/ai/analyze      dynamic server route
/api/ai/policy       dynamic server route
/api/ai/status       dynamic server route
```

## Honest limitations

- No deployed production latency has been measured.
- Local durations depend on disk, antivirus, CPU, cache state, and browser installation.
- Clean-room extraction inside the repository is intentionally isolated but can be slower on Windows because pnpm relinks 435 packages and Turbopack rebuilds from an empty cache.
- A first remote CI run remains necessary to measure GitHub-hosted behavior.
- Optional live GPT-5.6 latency and provider availability are not evaluated by release verification.
