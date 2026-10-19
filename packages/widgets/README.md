# @homeslate/widgets

Built-in glanceable widgets, the widget registry, and host-facing providers (Google, household, alarms, timers).

Importing `@homeslate/widgets` registers the built-ins as a side effect.

## Install

```bash
pnpm add @homeslate/widgets
```

Peers: `react` and `react-dom` ^19.

## Usage

Wrap editor/kiosk trees with a `GoogleRuntime` so calendar and photos widgets can sign in:

```tsx
import { GoogleRuntimeProvider, type GoogleRuntime } from "@homeslate/widgets";
import type { ReactNode } from "react";

function HostGoogleRuntime({
  accessToken,
  displayId,
  refreshAccessToken,
  children,
}: {
  accessToken: string | null;
  displayId: string | null;
  refreshAccessToken: () => Promise<string | null>;
  children: ReactNode;
}) {
  const value: GoogleRuntime = {
    accessToken,
    isAuthenticated: Boolean(accessToken),
    isLoading: false,
    signIn: () => {
      window.location.href = "/api/google/connect";
    },
    refreshAccessToken,
    displayId,
    isPreview: false,
    kioskFetchBaseUrl: "/api",
  };
  return <GoogleRuntimeProvider value={value}>{children}</GoogleRuntimeProvider>;
}
```

Custom widgets: `registerWidget({ type, name, description, icon, component, defaultConfig, defaultLayout, configSchema })`.

## Subpaths

| Export                       | Role                                                                                                |
| ---------------------------- | --------------------------------------------------------------------------------------------------- |
| `@homeslate/widgets`         | React registry + providers (registers built-ins)                                                    |
| `@homeslate/widgets/schemas` | Node-safe Zod config schemas for validation                                                         |
| `@homeslate/widgets/server`  | Commute query parsing, NWS alert mapping, Home Assistant climate + to-do mapping, Google error copy |
| `@homeslate/widgets/styles`  | TypeStyles extract entry — import after VarUI CSS                                                   |

## Home Assistant widgets

The **Thermostat** widget and the **To-Do List** widget can talk to a Home
Assistant instance. Set `homeAssistant: { baseUrl, token }` on
`@homeslate/server` and the widgets reach it through the `/api/homeassistant/*`
proxy — the long-lived token never reaches the browser.

The To-Do List widget has a **List source** setting. `Local` keeps items in the
display document (the default); `Home Assistant` binds the widget to one `todo.*`
entity and reads/writes it in place, so checking items off on the kiosk updates
Home Assistant and stays in sync everywhere.

## Host styles

Import `@homeslate/widgets/styles` from the TypeStyles extract entry, after VarUI, before `@homeslate/display/styles` and `@homeslate/editor/styles`. The editor and display READMEs have the provider tree; the [reference host contract](https://github.com/homeslate/homeslate/blob/main/apps/reference/README.md) has the full list.

## See also

- [`@homeslate/editor`](https://www.npmjs.com/package/@homeslate/editor)
- [`@homeslate/display`](https://www.npmjs.com/package/@homeslate/display)
- [`@homeslate/schema`](https://www.npmjs.com/package/@homeslate/schema)
