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
- `@homeslate/server`
- `@homeslate/host-react`

UI packages (`widgets`, `display`, `editor`) style with TypeStyles and VarUI. Hosts wrap the tree in `DesignSystemProvider` (`applyToDocument`) plus `IconProvider` and `LayerProvider`, and install VarUI peers `react-aria-components` and `@internationalized/date`. For zero-runtime production CSS, add `@typestyles/vite` and import `@var-ui/core/styles` first, then `@homeslate/widgets/styles`, `@homeslate/display/styles`, and `@homeslate/editor/styles`. Do not also import VarUI CSS from a JS entry. Without the plugin, styles still inject at runtime. `Editor` and `Display` nest their own provider and must not call `applyToDocument`. See `apps/reference/README.md` for the full eight-step host contract.

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

## Self-host with Docker

For a LAN-only install behind a reverse proxy, [`CONTAINER.md`](./CONTAINER.md) walks through building the reference app into a container, wiring it to Caddy and a local DNS record, and connecting Google Calendar. The API reads `HOMESLATE_PUBLIC_BASE_URL` (the externally reachable origin, used to build the OAuth redirect URI) and `HOMESLATE_DATA_DIR` (where the sqlite file and Google refresh tokens live).

## Self-host from packages

Prefer to build your own host app instead of cloning the repo? Depend on `@homeslate/server` (the Hono API) and `@homeslate/host-react` (the routed web shell), customize widgets, theme, and routes in your own repo, and upgrade with `pnpm up "@homeslate/*"`. See the [self-hosting guide](./docs/content/docs/self-hosting.mdx).

## Hosted product

The managed hosted app (Netlify + Neon) lives in the private [homeslate-hosted](https://github.com/homeslate/homeslate-hosted) repository.
