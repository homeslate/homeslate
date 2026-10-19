---
"@homeslate/widgets": minor
"@homeslate/server": minor
"@homeslate/agent": minor
"@homeslate/relay": minor
---

Replace the per-domain Home Assistant transport with one generic, allowlisted
entity + service rail, driven by a single domain registry.

- **`@homeslate/widgets/server`** — a new domain registry is the source of truth
  for entity-id shape, allowed services, allowed data keys, and optional state
  mapping (`registerDomainSpec`, `isKnownDomain`, `entityDomain`,
  `isValidEntityId`, `isAllowedService`, `buildServicePayload`, `mapEntity`). A
  generic `HomeAssistantEntity` projection (`mapHomeAssistantEntity`) covers
  domains that have no dedicated mapper. `@homeslate/widgets` gains generic
  client helpers (`fetchEntities`, `fetchEntity`, `callHomeAssistantService`) and
  hooks (`useEntities`, `useEntity`, `useHomeAssistantService`); the Thermostat
  and To-Do widgets migrate onto them with no behavior change.
- **`@homeslate/server`** — `HomeAssistantTransport` collapses to three generic
  methods: `listEntities(domain)`, `getEntity(entityId)`, and
  `callService(domain, service, entityId, data, options?)`. The
  `/api/homeassistant/*` routes validate against the registry, so a new domain
  needs a registry entry, not a new route. `HomeAssistantTodoTransport` and
  `hasTodoSupport` are removed (to-do now rides the generic rail).
- **`@homeslate/agent` / `@homeslate/relay`** — the agent protocol is now **v2**:
  `entities.list` / `entity.get` / `service.call`, with the agent advertising its
  supported domains in its `hello`. The relay transport implements the same
  three methods and re-validates every call before forwarding it to the socket.
