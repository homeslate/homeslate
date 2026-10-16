---
"@homeslate/server": minor
"@homeslate/host-react": minor
---

Add `@homeslate/server`, the Hono API (display CRUD, the public kiosk route, Google OAuth, and the calendar, commute, and weather-alerts proxies), and `@homeslate/host-react`, the routed React web shell over `@homeslate/editor` and `@homeslate/display`. Self-hosters can now depend on the packages instead of cloning the repo, and the reference app is a thin consumer of both.
