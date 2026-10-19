# @homeslate/agent

Connects a home network's Home Assistant to a hosted homeslate API over an
**outbound** WebSocket. The hosted API can't reach `homeassistant.local`, so a
small process on the LAN dials out and answers the generic Home Assistant entity
and service calls used by every Home Assistant widget.

- Nothing listens on the LAN — the agent opens the socket to the relay.
- The Home Assistant long-lived token stays on the agent and is never sent to the
  relay or the cloud.
- Self-hosted installs that run the API on the same LAN don't need this; they use
  `@homeslate/server`'s direct transport.

## Protocol v2

The agent speaks one generic trio: `entities.list`, `entity.get`, and
`service.call`. It advertises the domains it can serve in its `hello` (sourced
from `knownDomains()`) and validates every request against the
`@homeslate/widgets/server` registry before touching Home Assistant. The relay
validates the same request again before forwarding it, so an unknown domain,
entity id, service, or data key never reaches the LAN.

The optional `fetchImage` and `history` transport methods are direct-mode only
today; they are not in the agent protocol yet. Relay mode uses placeholder
artwork and returns `501` for the History widget.

## Usage

```bash
HOMEASSISTANT_BASE_URL=http://homeassistant.local:8123 \
HOMEASSISTANT_TOKEN=<home-assistant-long-lived-token> \
HOMESLATE_RELAY_URL=wss://relay.homeslate.app/agent \
HOMESLATE_ACCOUNT_ID=<account> \
HOMESLATE_AGENT_TOKEN=<relay-token-from-the-hosted-ui> \
npx @homeslate/agent
```

| Env                      | Meaning                                      |
| ------------------------ | -------------------------------------------- |
| `HOMEASSISTANT_BASE_URL` | Home Assistant origin on the LAN.            |
| `HOMEASSISTANT_TOKEN`    | Home Assistant long-lived access token.      |
| `HOMESLATE_RELAY_URL`    | Relay WebSocket URL (`wss://…/agent`).       |
| `HOMESLATE_ACCOUNT_ID`   | Account the agent is paired with.            |
| `HOMESLATE_AGENT_TOKEN`  | Revocable relay token, bound to the account. |
| `HOMESLATE_AGENT_ID`     | Optional stable id for this instance.        |

## Docker

Home Assistant advertises itself via mDNS (`homeassistant.local`), which a
bridge-network container can't resolve. Use host networking, or set
`HOMEASSISTANT_BASE_URL` to the LAN IP.

```bash
docker run --network host \
  -e HOMEASSISTANT_BASE_URL=http://homeassistant.local:8123 \
  -e HOMEASSISTANT_TOKEN=… \
  -e HOMESLATE_RELAY_URL=wss://relay.homeslate.app/agent \
  -e HOMESLATE_ACCOUNT_ID=… \
  -e HOMESLATE_AGENT_TOKEN=… \
  homeslate/agent
```

## Library

```ts
import { createHomeslateAgent } from "@homeslate/agent";

const agent = createHomeslateAgent({
  relayUrl: "wss://relay.example.com/agent",
  token: relayToken,
  accountId,
  baseUrl: "http://homeassistant.local:8123",
  haToken,
});
agent.onStateChange((state) => console.log(state));
agent.start();
```

The agent reconnects with exponential backoff (1s → 60s, ±20% jitter) and
heartbeats through the relay. It only forwards the allowlisted generic methods
(`entities.list`, `entity.get`, `service.call`), advertising the domains it
serves in its `hello`, and re-validates every request against the domain
registry before touching Home Assistant.
