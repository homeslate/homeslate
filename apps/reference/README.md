# Homeslate reference host

Clone-and-run editor + kiosk for a single local machine. Requires **Node 22.13+**.

There are no accounts, Stripe, or quotas. Persistence is a sqlite file under `apps/reference/data`.

## Run

From the repository root:

```bash
vp install
```

Then start the API and Vite UI:

```bash
vp run dev:reference
```

Open [http://127.0.0.1:5174](http://127.0.0.1:5174). Vite proxies `/api` to the Hono server on port 8787. Opening the API port redirects there.

This is a development setup: the Hono server serves `/api` only, and Vite serves the UI. `build:web` (`vp build`) extracts TypeStyles CSS via `@typestyles/vite` from `typestyles-entry.ts`.

Hosts that want zero-runtime production CSS should add `@typestyles/vite` and import `@homeslate/widgets/styles`, `@homeslate/display/styles`, and `@homeslate/editor/styles`. Skipping the plugin still styles the UI via TypeStyles runtime injection.

## Typecheck

The reference app builds on its own tsconfig solution (Node libs for `src/server`, DOM libs for `src/web`) and is deliberately outside the package `vp run build`.

## Optional Google Calendar

Set these in the API process if you want calendar widgets to sign in:

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

The OAuth callback is `http://127.0.0.1:5174/api/google/callback` (Vite proxies `/api` to the Hono server). Without these variables the editor and kiosk still run; calendar widgets stay empty.

## Optional commute

Set `OPENROUTESERVICE_API_KEY` on the API process to enable commute estimates:

```bash
OPENROUTESERVICE_API_KEY=...
```

Without it, the commute route returns 501 and the widget stays designable.
