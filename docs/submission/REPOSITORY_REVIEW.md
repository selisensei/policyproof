# Public Repository Review

## Expected public content

- Application code in `app/`, `components/`, and `src/`
- Fictional fixtures and mocked evaluation contracts
- Unit, component, and Playwright tests
- English planning, testing, deployment, and submission documentation
- `.env.example`, lockfile, configuration, and secret-free CI workflow

## Ignored and generated paths

- `.env`, `.env.*` except `.env.example`
- `node_modules/`, `.pnpm-store/`
- `.next/`, `out/`, `.vercel/`
- `test-results/`, `playwright-report/`, `coverage/`
- logs, editor settings, OS metadata, and TypeScript build caches

These paths must not be staged or published. Local screenshots remain under `test-results/` until selected and intentionally copied to a public documentation path.

## Secret-scan checklist

- [ ] Search tracked and untracked candidate files for API-key, bearer-token, private-key, password, and authorization-header patterns.
- [ ] Confirm `.env.local` is ignored without opening it.
- [ ] Confirm no terminal output, screenshot, fixture, test, or documentation contains a real credential.
- [ ] Review the complete staged file list before the first public commit.
- [ ] Confirm the OpenAI status route exposes no environment value.

## README verification checklist

- [ ] Setup commands work from a clean clone.
- [ ] Node and pnpm versions match `package.json`.
- [ ] Deterministic expected results match automated tests.
- [ ] Live GPT-5.6 is described as awaiting supervised validation until it passes.
- [ ] Architecture, security boundaries, known limitations, Codex contribution, and test commands are current.
- [ ] Final public screenshots contain no development indicator, personal tab, path, credential, or private content.
- [ ] Deployment and repository links work in a private browser window.

## License decision

A license is still required before publication. Review `LICENSE_RECOMMENDATION.md`; do not publish a license until the builder selects it.

## Final pre-push commands

```shell
pnpm test
pnpm typecheck
pnpm lint
pnpm build
pnpm test:e2e
pnpm audit --prod
git diff --check
git status --short
git diff --cached --name-only
```

Also repeat the secret scan, ignored-file review, production smoke test, and English/French screenshot review documented in `TESTING.md`. Pushing and deployment require explicit builder approval.
