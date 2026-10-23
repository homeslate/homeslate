# AGENTS.md

Homeslate is a pnpm monorepo on Vite+ (`vp`): `packages/*` are published to npm, `apps/reference` is the reference app, `docs` is the Astro docs site.

## Key commands

Run from the repository root:

```bash
vp install          # install workspace deps
vp run ci           # build + check + docs check + tests (what CI runs)
vp check            # format, lint, type checks
vp test             # tests (watch); `vp test run` runs once
pnpm changeset      # add a changeset for a published package change
```

## CI/CD

All three repos (`typestyles`, `var-ui`, `homeslate`) use the same pipeline. Everything lives in `.github/workflows/ci.yml`.

- **Verify** is the status check to require on `main`. It runs `vp run ci`, the same command the pre-push hook runs, so run it before pushing. Every package under `packages/*` is built and published.
- **Release** runs on `main` after `Verify`. It reuses the `dist` that `Verify` built, mints a token from the GitHub App (so the version PR and tags trigger CI), and runs the changesets action.

### Releasing

1. Add a changeset (`pnpm changeset`) to any PR that changes a published package.
2. After merge, Release opens a `chore: version packages` PR. `Verify` runs on it. Merge it to publish.
3. Publishing uses **npm trusted publishing (OIDC)** with provenance. There is no `NPM_TOKEN`. Each package's trusted publisher is `phthalo-dev/homeslate` with workflow **`ci.yml`**, so do not rename that file or move the release job.
4. A **new package** needs one manual first publish, then: `npm trust github <pkg> --repo phthalo-dev/homeslate --file ci.yml --allow-publish --allow-stage-publish -y`.

### Things that bite

- Git hooks live in `.vite-hooks/` (`vp check` and `vp staged` on commit, `vp run ci` on push). They exit early when `CI` is set; the release job commits and pushes tags, and must not re-run them.
- Generated `CHANGELOG.md` files are excluded from formatting; changesets does not format them.
- Do not set `registry-url` on `setup-vp`: it writes a placeholder auth token that blocks OIDC. The release job also installs `npm@^11.5.1` (trusted publishing needs it; npm 12 rejects flags pnpm forwards).
- Secrets: `APP_CLIENT_ID` and `APP_PRIVATE_KEY` (GitHub App) are org secrets.
- Node comes from `.nvmrc`; pnpm from `packageManager`. Do not repeat versions in workflow YAML.
