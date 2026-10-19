---
"@homeslate/widgets": minor
"@homeslate/server": minor
---

Add the Phase 3 Home Assistant controllers.

- **`@homeslate/widgets`** — six new widgets:
  - **Security** — locks (`lock` / `unlock` / `open` with confirmation) and
    alarm panels (only the arm modes the panel advertises; confirm before
    disarming). Unlocked/disarmed states use an attention color.
  - **Media Player** — now-playing metadata and artwork, play/pause, previous /
    next, volume + mute, and a source picker. Controls and the source picker are
    gated on `supported_features`, and artwork is served through the host proxy.
  - **Fan** — power, speed percentage, preset mode, and oscillate, gated on the
    fan feature bits. Air purifiers use the same domain.
  - **Vacuum** — start/resume, pause, stop, dock, locate, spot clean, battery,
    and an optional fan-speed picker, with command gating.
  - **Humidifier** — power, current + target humidity, and mode.
  - **Water Heater** — power, current + target temperature, and operation mode.
- **`@homeslate/widgets/server`** — the domain registry grows `lock`,
  `alarm_control_panel`, `media_player`, `fan` (extended from on/off), `vacuum`,
  `humidifier`, and `water_heater`, each with its entity-id shape and
  allowlisted services. Generic payload building now preserves boolean data keys
  (`is_volume_muted`, `oscillating`). New normalized mappers:
  `mapLockEntity`, `mapAlarmEntity`, `mapMediaPlayerEntity`, `mapFanEntity`,
  `mapVacuumEntity`, `mapHumidifierEntity`, `mapWaterHeaterEntity`.
- **`@homeslate/server`** — a new `GET /api/homeassistant/image` route re-serves
  Home Assistant artwork / camera snapshots from the two proxy path families,
  injects the host token, enforces a size cap, and caches briefly. Direct LAN
  transports implement `fetchImage`; relay transports can add it later.
