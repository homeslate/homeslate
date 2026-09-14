# Homeslate

Public MIT packages and reference self-host app for Homeslate.

Documentation: run `vp run docs:dev` (or `pnpm docs:dev`) and open the URL Astro prints.

## Clone

```bash
git clone https://github.com/homeslate/homeslate.git
cd homeslate
vp install
```

## Packages

Published on npm as `@homeslate/*`:

- `@homeslate/schema`
- `@homeslate/google`
- `@homeslate/widgets`
- `@homeslate/editor`
- `@homeslate/display`
- `@homeslate/adapters`

UI packages (`widgets`, `display`, `editor`) style with TypeStyles. Hosts that want zero-runtime production CSS add `@typestyles/vite` and import `@homeslate/widgets/styles`, `@homeslate/display/styles`, and `@homeslate/editor/styles`. Without the plugin, styles still inject at runtime.

## Releasing

Packages version independently with [Changesets](https://changesets.dev). On a PR that should publish `@homeslate/*`:

```bash
pnpm changeset
```

Merging to `main` opens a **Version Packages** PR. Merging that PR publishes to npm (`NPM_TOKEN` secret). In the repo settings under Actions → General, enable **Allow GitHub Actions to create and approve pull requests**.

## Reference app

```bash
vp run dev:reference
```

Then open [http://127.0.0.1:5174](http://127.0.0.1:5174). That one command starts the Hono API and the Vite UI (Vite proxies `/api` to port 8787).

## Hosted product

The managed hosted app (Netlify + Neon) lives in the private [homeslate-hosted](https://github.com/homeslate/homeslate-hosted) repository.
