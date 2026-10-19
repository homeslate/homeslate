---
"@homeslate/widgets": minor
"@homeslate/server": minor
---

Add the Phase 5 strategic Home Assistant widgets.

- **`@homeslate/widgets`** — four new widgets:
  - **Entity Tile** — bind any registry entity and render its primary control
    (`toggle`, `brightness`, cover `position`, media `play-pause`, or `lock`).
    Long-tail domains fall back to a read-only state.
  - **Room** — manually group a room's lights, switches, and covers, with
    per-entity controls plus All off / All on / Close covers.
  - **Notify** — send a `notify.send_message` notification or a `tts.speak`
    announcement to a Home Assistant media player, with a runtime message input.
  - **History** — a numeric sensor with its current value and a downsampled
    `/api/history/period` sparkline over a 1–168 hour window.
- **`@homeslate/widgets/server`** — new `notify` (`send_message`) and `tts`
  (`speak`) registry families, plus `mapHistoryPoints` and the shared history
  window/downsample helpers. `HOME_ASSISTANT_DOMAINS` is the client-safe domain
  list used by the Entity Tile picker.
- **`@homeslate/server`** — `GET /api/homeassistant/history/:entityId?hours=…`
  and an optional `history` transport method. The direct LAN client implements
  it; relay transports can add it later (the route returns `501` until then).
