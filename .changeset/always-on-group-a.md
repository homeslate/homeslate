---
"@homeslate/display": minor
"@homeslate/host-react": minor
"@homeslate/server": minor
"@homeslate/widgets": minor
---

Isolate widget and route crashes, and add the display copy and starter-layout tools.

- **`@homeslate/display`** — a widget error boundary keeps one crash from blanking
  the board. Displays and views can be duplicated or exported as JSON, and new
  boards can start from Family Hub, Kitchen, Home Control, or Photo Frame.
- **`@homeslate/host-react`** — kiosk and editor routes show a reload fallback
  instead of a white screen. The display list can import, duplicate, and start
  from a template without overwriting an existing display.
- **`@homeslate/server`** — the Home Assistant image proxy also allows person
  images (`/api/image/…`) and `www` assets (`/local/…`).
- **`@homeslate/widgets`** — presence avatars load through that proxy and fall
  back to initials when the picture is missing or fails.
