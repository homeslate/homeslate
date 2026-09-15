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
2. In the TypeStyles extract entry, register VarUI CSS **before** `@homeslate/widgets/styles`, `@homeslate/display/styles`, and `@homeslate/editor/styles`. Prefer `@var-ui/core/styles` once that export is non-empty; on `@var-ui/core@0.1.0` import `@var-ui/core/register-default-theme`, `@var-ui/core/base-styles`, and the other core style subpaths instead (the published `styles` file is an empty module).
3. Wrap the root tree in `DesignSystemProvider` with `applyToDocument` on full-page host routes, plus `IconProvider` (`defaultIcons` from `@var-ui/icons`) and `LayerProvider` as in the VarUI Vite example. Install VarUI peer dependencies npm warns about (`react-aria-components` and `@internationalized/date`) so the host does not rely on accidental hoisting.
4. `Editor` and `Display` nest their own `DesignSystemProvider` with the compiled theme and controlled `colorMode`. They do not set `document.documentElement` (no `applyToDocument`).
5. Themed-subtree overlays pass `portalContainer` so portaled UI stays on the nested theme.
6. The host JS entry should import `@var-ui/core/register-default-theme` (and `base-styles`) so Vite dev injects theme tokens even when extract and the client are separate TypeStyles runs. Skip a second `@var-ui/core/styles` import only after that published file actually registers CSS.
7. Keep `@typestyles/vite`. Skipping the plugin still styles the UI via TypeStyles runtime injection.
8. Load the webfonts named in display theme documents (reference uses Google Fonts for the preset families). Token stacks like `'Outfit', 'Inter', sans-serif` only render those faces if the host provides the files.

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
