---
"@homeslate/widgets": minor
"@homeslate/server": minor
---

Add the first wave of Home Assistant widgets and Home Assistant sources for the
Weather, Calendar, and Grocery widgets.

- **`@homeslate/widgets`** — three new widgets: **Sensors** (read-only
  `sensor` / `binary_sensor` / `number` / `input_number` readings, list or grid,
  optional gauges), **Scenes & Scripts** (fire-and-forget `scene` / `script` /
  `button` / `input_button` with optional confirmation), and **Presence**
  (`person` / `device_tracker` / `zone`, with avatars and zone names). The
  Weather, Calendar, and Grocery widgets gain a `source` toggle that reads a Home
  Assistant entity instead of Open-Meteo / an iCal feed / a local list. New
  generic hooks `useEntityList`, `useEntitiesAcross`,
  `useHomeAssistantWeather`, and `useHomeAssistantCalendar` build on the Phase 0
  rail.
- **`@homeslate/widgets/server`** — the domain registry grows the sensor, scene,
  presence, weather, and calendar families, each with its entity-id shape and
  allowlisted services, plus normalized mappers (`mapSensorEntity`,
  `mapPresenceEntity`, `mapWeatherEntity`, `mapWeatherForecast`,
  `mapCalendarEvents`).
- **`@homeslate/server`** — two read routes ride the generic return-response
  service call: `GET /api/homeassistant/weather/:entityId/forecast` and
  `GET /api/homeassistant/calendar/:entityId/events`.
