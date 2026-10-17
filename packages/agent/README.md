# @homeslate/agent

Connects a home network's Home Assistant to a hosted homeslate API over an
**outbound** WebSocket. The hosted API can't reach `homeassistant.local`, so a
small process on the LAN dials out and answers the few Home Assistant calls the
thermostat widget needs.

- Nothing listens on the LAN — the agent opens the socket to the relay.
- The Home Assistant long-lived token stays on the agent and is never sent to the
  relay or the cloud.
- Self-hosted installs that run the API on the same LAN don't need this; they use
  `@homeslate/server`'s direct transport.

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
heartbeats through the relay. It only forwards the allowlisted climate methods
(`climate.entities.list`, `climate.state.get`, `climate.service.call`) and
re-validates every request before touching Home Assistant.
