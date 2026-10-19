# @homeslate/server

The homeslate Hono API: display CRUD, the public kiosk route, the Google OAuth
routes, and the calendar, commute, weather-alerts, and Home Assistant device
proxies. Node 22.13+ (uses `node:sqlite` through `@homeslate/adapters`).

```ts
import { startHomeslateServer } from "@homeslate/server";

await startHomeslateServer({
  dataDir: "./data",
  publicBaseUrl: "http://homeslate.lan",
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  openRouteServiceApiKey: process.env.OPENROUTESERVICE_API_KEY,
  seedEmptyDisplay: true,
  onListen: ({ port }) => console.log(`homeslate API on http://127.0.0.1:${port}`),
});
```

Mount it yourself with `createHomeslateServer(options)`, which returns the Hono
app so you can add routes, test it, or run it on another runtime.

## Displays and viewer passcodes

- `GET /api/displays` lists `{ id, name }` summaries.
- `POST /api/displays`, `GET /api/displays/:id`, and `PUT /api/displays/:id`
  return the document plus a `passcodeEnabled` flag. The passcode hash is never
  included in a response.
- `PATCH /api/displays/:id` accepts `{ passcode: string | null }` to set a
  4-digit viewer PIN or clear it with `null` (`isValidPin` validates the shape;
  `hashPasscode` stores a scrypt hash on the display record).
- `DELETE /api/displays/:id` removes the display.
- `GET` / `PUT /api/public/:publicId` serve the kiosk. When the display has a
  passcode they answer `401 { passcodeRequired: true }` unless the request
  carries `?passcode=<pin>` (`verifyPasscode`).

`hashPasscode`, `verifyPasscode`, and `isValidPin` are exported for hosts that
manage passcodes themselves.

## Home Assistant proxy

Set `homeAssistant: { baseUrl, token }` to enable the Home Assistant widgets.
The browser never sees the long-lived token; the server forwards an allowlisted
subset:

- `GET /api/homeassistant/entities?domain=climate|todo` — entity pickers.
- `GET /api/homeassistant/states/:entityId` — climate state.
- `GET /api/homeassistant/todo/:entityId/items` — normalized `todo` items.
- `POST /api/homeassistant/services/:domain/:service` — allowlisted service
  calls (`climate` and `todo` write services).

Without `homeAssistant`, these routes answer `501` and the widgets stay
designable with a "set the env vars" notice.

Routes run on a `HomeAssistantTransport`. The built-in direct client
(`{ baseUrl, token }`) serves climate and to-do; an injected transport (the
[relay](https://www.npmjs.com/package/@homeslate/relay)) may serve climate only.
To-do is an optional capability (`HomeAssistantTodoTransport`, checked with
`hasTodoSupport`), so `domain=todo` requests against a transport without it
answer `503` with an "unsupported" copy.

In a container, bind all interfaces so Docker's published port can reach the
API — Docker forwards to the container's bridge address, not its loopback:

```ts
await startHomeslateServer({ dataDir: "/data", hostname: "0.0.0.0" });
```

Keep the host-side port mapping on loopback (`-p 127.0.0.1:8787:8787`) so the
API stays off the LAN except through your proxy.

See the [self-hosting guide](https://github.com/homeslate/homeslate/blob/main/docs/content/docs/self-hosting.mdx).
