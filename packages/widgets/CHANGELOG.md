# @homeslate/widgets

## 1.0.0

### Major Changes

- 9fe796d: Remove Mantine. Theme documents are VarUI-shaped (`createDesignTheme` JSON). Hosts must follow the README contract: one TypeStyles extract of `@var-ui/core/styles` then `@homeslate/*/styles`, one `DesignSystemProvider` with `applyToDocument` on full-page routes, plus `IconProvider` and `LayerProvider`. `Editor` and `Display` nest their own provider and must not call `applyToDocument`.

### Minor Changes

- 79fd3ae: Fix Google Calendar week/month views on kiosk displays by fetching events from 42 days back (configurable via `daysBack` on `/display-calendar`). Add IndexedDB stale-while-revalidate caching in `useDisplayCalendar` so displays poll less often without blanking on network hiccups. Editor-mode `useGoogleCalendar` uses the same past window by default. `displayCalendarUrl` now includes `daysBack` in its params.
- d010d08: Replace CSS modules with TypeStyles. Hosts can extract `@homeslate/*/styles` with `@typestyles/vite`; without the plugin, styles still inject at runtime.

### Patch Changes

- 25def83: Request the read-only Google Calendar scope (`calendar.readonly`) from the
  client-side Google Identity Services flow, matching the reference server's
  `/api/google/connect` scope. Calendar widgets only read events, so the
  narrower scope shrinks the blast radius if a refresh token ever leaks.
- Updated dependencies [79fd3ae]
- Updated dependencies [9fe796d]
  - @homeslate/google@0.1.2
  - @homeslate/schema@1.0.0
