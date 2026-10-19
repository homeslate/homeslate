---
"@homeslate/widgets": minor
"@homeslate/server": minor
---

Add the second wave of Home Assistant widgets: on/off devices and covers.

- **`@homeslate/widgets`** — two new widgets: **Devices** (one configurable
  widget for `light` / `switch` / `input_boolean` / `fan`, with a domain filter,
  optimistic on/off toggles, a fan-speed chip, and an optional brightness slider
  for lights) and **Covers & Garage** (`cover`, with open / close / stop,
  position percentages and a slider, and a confirmation before opening garage
  doors). Both build on the Phase 0 rail and the Phase 1 generic hooks.
- **`@homeslate/widgets/server`** — the domain registry grows the on/off device
  family (`light`, `switch`, `input_boolean`, `fan`) and `cover`, each with its
  entity-id shape and allowlisted services (`turn_on` / `turn_off` / `toggle`;
  `open_cover` / `close_cover` / `stop_cover` / `set_cover_position`), plus the
  normalized mappers `mapDeviceEntity` and `mapCoverEntity`.
