---
"@homeslate/widgets": minor
"@homeslate/server": minor
"@homeslate/agent": minor
"@homeslate/relay": minor
---

Reach a home Home Assistant from a hosted homeslate API. `@homeslate/server`'s
`/api/homeassistant/*` routes now sit behind a `HomeAssistantTransport`, so a
host can inject one instead of `{ baseUrl, token }`; a new
`GET /api/homeassistant/status` reports whether the transport is configured and
connected, and transport failures surface as `503` (agent offline) / `504`
(timeout). `@homeslate/agent` is a LAN process that dials out to the cloud and
serves the allowlisted climate methods, keeping the Home Assistant token at home.
`@homeslate/relay` is the runtime-agnostic cloud side — agent presence plus
request correlation — with a Node WebSocket binding at `@homeslate/relay/node`.
`@homeslate/widgets` learns to render relay "agent offline" / timeout states and
exports the agent copy plus a `homeAssistantStatusUrl()` helper from
`@homeslate/widgets/server`.
