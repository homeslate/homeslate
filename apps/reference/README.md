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

## Host contract

Copy this when wrapping `@homeslate/editor` and `@homeslate/display` in another app (including hosted). One extract, one provider tree, one copy of VarUI CSS.

1. Depend on `@homeslate/editor`, `@homeslate/display`, and `@homeslate/widgets` (they pull `@var-ui/react` and `@var-ui/core`).
2. In the TypeStyles extract entry, import `@var-ui/core/styles` **before** `@homeslate/widgets/styles`, `@homeslate/display/styles`, and `@homeslate/editor/styles`.
3. Wrap the root tree in `DesignSystemProvider` with `applyToDocument` on full-page host routes, plus `IconProvider` (`defaultIcons` from `@var-ui/icons`) and `LayerProvider` as in the VarUI Vite example. Install VarUI peer dependencies npm warns about (`react-aria-components` and `@internationalized/date`) so the host does not rely on accidental hoisting.
4. `Editor` and `Display` nest their own `DesignSystemProvider` with the compiled theme and controlled `colorMode`. They do not set `document.documentElement` (no `applyToDocument`).
5. Themed-subtree overlays pass `portalContainer` so portaled UI stays on the nested theme.
6. Do not mount `MantineProvider` or import `@mantine/*/styles.css`. Do not also import `@var-ui/core/styles` from a JS entry if the extract entry already registered it.
7. Keep `@typestyles/vite`. Skipping the plugin still styles the UI via TypeStyles runtime injection.

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
