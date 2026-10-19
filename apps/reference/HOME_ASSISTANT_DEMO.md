# Testing with a full Home Assistant demo container

The reference app includes a fast, deterministic mock Home Assistant
(`pnpm dev:mock`). When you want to exercise **real Home Assistant parsers,
integrations, service handlers, and entity attributes**, run the official Home
Assistant container with the built-in `demo` integration instead.

The `demo` integration creates a broad catalog of demo entities — lights,
climates, covers, locks, alarms, media players, cameras, vacuums, sensors,
weather, calendars, to-dos, and more. The exact set varies by Home Assistant
version, so treat this as a realistic integration test rather than a guaranteed
fixture for every domain in the homeslate registry.

## Prerequisites

- Docker (or Podman with a Docker-compatible CLI)
- This repository checked out
- About 1–2 minutes for the first start

## 1. Create the demo config

```bash
mkdir -p ha-demo-config
cat > ha-demo-config/configuration.yaml <<'YAML'
default_config:
demo:
YAML
```

`default_config:` brings in the standard integrations; `demo:` adds the demo
entities. The container will write its database and onboarding state into
`ha-demo-config/`.

## 2. Start the container

### Docker

```bash
docker run -d \
  --name homeslate-ha-demo \
  -p 8123:8123 \
  -v "$PWD/ha-demo-config:/config" \
  -e TZ=America/New_York \
  --restart unless-stopped \
  ghcr.io/home-assistant/home-assistant:stable
```

### Docker Compose

Create `docker-compose.yml` next to `ha-demo-config/`:

```yaml
services:
  home-assistant:
    image: ghcr.io/home-assistant/home-assistant:stable
    container_name: homeslate-ha-demo
    restart: unless-stopped
    ports:
      - "8123:8123"
    volumes:
      - ./ha-demo-config:/config
    environment:
      TZ: America/New_York
```

```bash
docker compose up -d
docker compose logs -f home-assistant
```

Wait until the log says Home Assistant is running, then open
<http://127.0.0.1:8123>.

## 3. Complete onboarding and create a token

1. On first launch, create the owner account in the Home Assistant onboarding
   flow.
2. Open the owner profile (bottom-left avatar).
3. Go to **Security → Long-lived access tokens**.
4. Create a token named `homeslate-demo` and copy it. It is only shown once.

The token is what homeslate uses for the `/api/states`, `/api/services`, and
image proxy calls. The Home Assistant origin and token stay on the host; the
browser only talks to homeslate.

## 4. Verify the API

```bash
export HOMEASSISTANT_TOKEN='paste-the-token-here'
curl -s -H "Authorization: Bearer $HOMEASSISTANT_TOKEN" \
  http://127.0.0.1:8123/api/states | head -c 400
```

You should get a JSON array of entities. If you get `401 Unauthorized`, the
token is missing or wrong.

## 5. Point homeslate at it

Set both variables on the **API process** (not the Vite web process):

```bash
HOMEASSISTANT_BASE_URL=http://127.0.0.1:8123
HOMEASSISTANT_TOKEN=paste-the-token-here
```

For local development, put them in `apps/reference/.env` (gitignored) or export
them before starting:

```bash
HOMEASSISTANT_BASE_URL=http://127.0.0.1:8123 \
HOMEASSISTANT_TOKEN=paste-the-token-here \
pnpm dev:reference
```

Open <http://127.0.0.1:5174>, add Home Assistant widgets, and use the settings
pickers. They should list the demo entities.

### If homeslate also runs in Docker

`127.0.0.1` inside the homeslate container points at the homeslate container,
not the host. Use one of these instead:

| Host platform                               | `HOMEASSISTANT_BASE_URL`           |
| ------------------------------------------- | ---------------------------------- |
| homeslate on the host                       | `http://127.0.0.1:8123`            |
| homeslate in Docker on macOS / Windows      | `http://host.docker.internal:8123` |
| homeslate in Docker on Linux                | `http://<host-LAN-IP>:8123`        |
| homeslate and HA on the same Docker network | `http://home-assistant:8123`       |

For Linux + `host.docker.internal`, start the homeslate container with:

```bash
--add-host=host.docker.internal:host-gateway
```

If the reference app is the containerized one, publish its API port the same way
the repo's `CONTAINER.md` describes.

## 6. What to try

- **Climate / Thermostat** — heat, cool, fan mode, preset, swing.
- **Devices** — lights, switches, fans, input booleans.
- **Covers & Garage** — position slider and garage confirmation.
- **Security** — lock/unlock, alarm arm modes, disarmed attention state.
- **Media Player** — artwork through the image proxy, play/pause, volume, source.
- **Camera** — refreshing snapshot and the privacy toggle.
- **Vacuum / Fan / Humidifier / Water Heater** — state and command controls.
- **Sensors / Presence / Home Status / Energy** — read-only roll-ups.
- **Weather / Calendar / Grocery / To-Do** — set their source to Home Assistant
  and pick a demo entity.
- **Updates / Lawn Mower** — only if your Home Assistant version's demo
  integration exposes those entities.

## Resetting and upgrading

```bash
# Stop but keep the config and onboarding state
docker compose down

# Stop and wipe everything (new onboarding + new token next time)
docker compose down
rm -rf ha-demo-config

# Upgrade the image
docker compose pull
docker compose up -d
```

Removing `ha-demo-config/` invalidates the old token. Create a new long-lived
token and update `HOMEASSISTANT_TOKEN`.

## Fast alternative: the repo mock

For day-to-day widget work, prefer the built-in mock:

```bash
pnpm dev:mock
```

It covers every domain in the homeslate registry, starts in milliseconds,
mutates state on service calls, and is deterministic. See
[`README.md`](./README.md#mock-home-assistant-no-devices-required) and
`src/server/mockHomeAssistant.ts`.

Use the Docker demo when you specifically want to validate against real Home
Assistant behavior.

## Troubleshooting

| Symptom                                | Likely cause                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------- |
| `curl` gets connection refused         | The container is still starting, or port `8123` is taken. Check `docker compose logs`.        |
| `curl` gets `401`                      | Missing/wrong token, or the token was created before the config was reset.                    |
| homeslate widgets show `501`           | `HOMEASSISTANT_BASE_URL` / `HOMEASSISTANT_TOKEN` are not set on the API process.              |
| homeslate widgets show `502`           | The API process cannot reach the URL. Use the host/container table above.                     |
| Widget settings list is empty          | The token is valid but the demo entities have not finished loading. Refresh the picker.       |
| Media artwork or camera snapshot fails | Not every demo entity exposes an image. Try another media player/camera entity.               |
| `demo:` config error                   | Confirm `configuration.yaml` is in the mounted `/config` directory and restart the container. |
