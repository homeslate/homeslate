# @homeslate/server

The homeslate Hono API: display CRUD, the public kiosk route, the Google OAuth
routes, and the calendar, commute, and weather-alerts proxies. Node 22.13+
(uses `node:sqlite` through `@homeslate/adapters`).

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

In a container, bind all interfaces so Docker's published port can reach the
API — Docker forwards to the container's bridge address, not its loopback:

```ts
await startHomeslateServer({ dataDir: "/data", hostname: "0.0.0.0" });
```

Keep the host-side port mapping on loopback (`-p 127.0.0.1:8787:8787`) so the
API stays off the LAN except through your proxy.

See the [self-hosting guide](https://github.com/homeslate/homeslate/blob/main/docs/content/docs/self-hosting.mdx).
