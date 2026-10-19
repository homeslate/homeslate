---
"@homeslate/widgets": minor
"@homeslate/server": minor
---

Add the Phase 4 Home Assistant data and niche widgets.

- **`@homeslate/widgets`** — five new widgets:
  - **Home Status** — a read-only roll-up of lights on, covers open, doors/windows
    open, alarm state, people home, and chosen temperature sensors. Manual entity
    grouping in v1.
  - **Energy** — live power (W/kW normalized to kW), energy (Wh/kWh/MWh
    normalized to kWh), and an optional cost estimate from a per-kWh rate.
  - **Camera** — a refreshing snapshot with a configurable cadence, a runtime
    privacy toggle that pauses snapshots, and no Home Assistant origin/token in
    the browser.
  - **Updates** — pending `update` entities with install, skip, progress, and an
    optional up-to-date list.
  - **Lawn Mower** — start/pause, dock, and stop for `lawn_mower` entities.
- **`@homeslate/widgets/server`** — new normalized mappers
  `mapCameraEntity`, `mapUpdateEntity`, and `mapLawnMowerEntity`, plus the
  `camera` (read-only), `update` (`install` / `skip`), and `lawn_mower`
  (`start_pause` / `dock` / `stop`) registry families. Home Status and Energy
  reuse the existing sensor, cover, alarm, presence, and light mappers.
- **`@homeslate/server`** — the image proxy accepts a cache-busting `t`
  parameter so camera snapshots can bypass the proxy cache when the widget asks
  for a fresh frame, while ordinary artwork stays cached.
