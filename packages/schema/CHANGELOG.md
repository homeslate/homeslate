# @homeslate/schema

## 1.1.0

### Minor Changes

- 6d33084: Keep a kiosk usable when the network drops, and show when the data on screen is stale.
  
  - **`@homeslate/widgets`** — remote widget data is cached and revalidated in the background. Stale reads stay on screen, and unlock/disarm waits for a fresh security state. Weather, news, sports, calendars, and stocks are loaded through the Homeslate server.
  - **`@homeslate/server`** — those reads are proxied by the API. Stock quotes use `FINNHUB_API_KEY` on the server instead of a key stored in the display.
  - **`@homeslate/host-react`** — the kiosk paints the last saved display, shows an offline banner, and reloads itself if it gets stuck while online.
  - **`@homeslate/display`** — the kiosk can keep the screen awake and offer a fullscreen button.
  - **`@homeslate/schema`** — displays can turn the wake lock off with `settings.wakeLockEnabled`. A saved Finnhub key is removed from stocks widgets.

### Patch Changes

- a7f67a8: Point the repository metadata at the phthalo-dev GitHub organization.

## 1.0.0

### Major Changes

- 9fe796d: Remove Mantine. Theme documents are VarUI-shaped (`createDesignTheme` JSON). Hosts must follow the README contract: one TypeStyles extract of `@var-ui/core/styles` then `@homeslate/*/styles`, one `DesignSystemProvider` with `applyToDocument` on full-page routes, plus `IconProvider` and `LayerProvider`. `Editor` and `Display` nest their own provider and must not call `applyToDocument`.
