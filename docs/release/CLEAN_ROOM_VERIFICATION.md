# Clean-room verification

## Purpose

The clean-room check proves that PolicyProof can be reconstructed from tracked repository content without relying on the active development directory, `.env.local`, a Git worktree inside the copy, cached build output, or copied `node_modules`.

## Command

```shell
pnpm release:clean-room
```

The native Node orchestrator:

1. recreates the ignored `test-results/release-clean-room/` directory;
2. exports `HEAD` with `git archive`;
3. extracts only tracked files into `source/`;
4. verifies that `.git`, `.env.local`, `node_modules`, `.next`, test reports, coverage, and deployment artifacts are absent;
5. installs from the frozen lockfile with pnpm offline mode;
6. runs `pnpm demo:verify`;
7. creates a production build;
8. starts the production server locally with no API key;
9. checks the root response, provider-unavailable behavior, and security headers.

The command performs no live provider request. The offline installation succeeds only when the required package tarballs already exist in the local pnpm store; remote CI separately validates a fresh online frozen-lockfile installation.

## Result record

Runtime logs and `result.json` are written only below `test-results/release-clean-room/`. They are ignored and must not be committed. The final supervised result is recorded in the release handoff and release manifest after the release commits exist.
