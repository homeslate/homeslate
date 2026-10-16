---
"@homeslate/widgets": minor
"@homeslate/server": minor
---

Add a Home Assistant thermostat widget. `@homeslate/server` gains scoped
`/api/homeassistant/*` routes (list climate entities, read one entity's state,
call an allowlisted climate service) configured with a host-level
`homeAssistant: { baseUrl, token }` option, so the long-lived token never
reaches the browser. `@homeslate/widgets` gains the `thermostat` widget, the
`useThermostat` / `useClimateEntities` hooks, and React-free climate helpers
exported from `@homeslate/widgets/server`.
