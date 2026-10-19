---
"@homeslate/server": minor
"@homeslate/widgets": minor
---

Integrate the To-Do List widget with Home Assistant `todo` lists.

- **`@homeslate/server`** — the Home Assistant proxy now serves the `todo`
  domain: `GET /api/homeassistant/entities?domain=todo` lists `todo.*` entities,
  `GET /api/homeassistant/todo/:entityId/items` reads items through
  `todo.get_items`, and `POST /api/homeassistant/services/todo/:service`
  forwards the allowlisted `add_item` / `update_item` / `remove_item` calls.
- **`@homeslate/widgets`** — the To-Do List widget gains a **List source**
  setting. Choose `Home Assistant`, pick one `todo.*` entity, and the kiosk
  reads and writes that list in place (items stay in sync across displays).
  `Local` remains the default and keeps items in the display document.
  `@homeslate/widgets/server` exports `mapTodoItems`,
  `buildTodoServicePayload`, `isValidTodoEntityId`, `isAllowedTodoService`, and
  the `HomeAssistantTodoItem` type for hosts that proxy Home Assistant
  themselves.
