# @homeslate/google

Google OAuth token exchange/refresh plus Calendar and Photos API helpers. Runtime-agnostic: you supply a `TokenStore`.

## Install

```bash
pnpm add @homeslate/google
```

## Usage

```ts
import { createGoogleClient } from "@homeslate/google";
import { FileTokenStore } from "@homeslate/adapters";

const google = createGoogleClient({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  tokenStore: new FileTokenStore({ dir: "./data/tokens" }),
});

await google.exchangeAuthCode(accountId, code, redirectUri);
const calendars = await google.listCalendars(accountId);
```

`createGoogleClient` throws if credentials are empty. Token refresh failures surface as `GoogleAuthError` (`missing_tokens`, `invalid_grant`, `token_revoked`, `refresh_failed`); narrow with `isGoogleAuthError`.

The host owns OAuth URLs and cookies. See the [reference server](https://github.com/homeslate/homeslate/blob/main/apps/reference/src/server/app.ts).

## Also exported

- `GoogleBindingStore` — map a display to an account id (`SqliteGoogleBindingStore` in `@homeslate/adapters`)
- `listCalendarsWithAccessToken` / `listEventsWithAccessToken` / `fetchPhotoWithAccessToken` when you already have a token

## See also

- [`@homeslate/adapters`](https://www.npmjs.com/package/@homeslate/adapters) — `FileTokenStore` and sqlite bindings
- [`@homeslate/widgets`](https://www.npmjs.com/package/@homeslate/widgets) — `GoogleRuntimeProvider` for the UI
