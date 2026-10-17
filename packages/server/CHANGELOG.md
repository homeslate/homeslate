# @homeslate/server

## 0.2.0

### Minor Changes

- d0bcb9e: Add a Home Assistant thermostat widget. `@homeslate/server` gains scoped
  `/api/homeassistant/*` routes (list climate entities, read one entity's state,
  call an allowlisted climate service) configured with a host-level
  `homeAssistant: { baseUrl, token }` option, so the long-lived token never
  reaches the browser. `@homeslate/widgets` gains the `thermostat` widget, the
  `useThermostat` / `useClimateEntities` hooks, and React-free climate helpers
  exported from `@homeslate/widgets/server`.

### Patch Changes

- Updated dependencies [d0bcb9e]
  - @homeslate/widgets@1.1.0
  - @homeslate/adapters@0.1.3

## 0.1.0

### Minor Changes

- bc65796: Add `@homeslate/server`, the Hono API (display CRUD, the public kiosk route, Google OAuth, and the calendar, commute, and weather-alerts proxies), and `@homeslate/host-react`, the routed React web shell over `@homeslate/editor` and `@homeslate/display`. Self-hosters can now depend on the packages instead of cloning the repo, and the reference app is a thin consumer of both.

### Patch Changes

- Updated dependencies [79fd3ae]
- Updated dependencies [d010d08]
- Updated dependencies [9fe796d]
- Updated dependencies [25def83]
  - @homeslate/google@0.1.2
  - @homeslate/widgets@1.0.0
  - @homeslate/adapters@0.1.2
