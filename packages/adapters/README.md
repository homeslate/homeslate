# @homeslate/adapters

Node stores for display documents and Google tokens. Requires **Node 22.13+** (`node:sqlite`).

## Install

```bash
pnpm add @homeslate/adapters
```

## Usage

```ts
import { openSqlite, SqliteDisplayStore, createEmptyDisplayDocument } from "@homeslate/adapters";

const database = openSqlite("./data/homeslate.sqlite");
const displays = new SqliteDisplayStore({ database });
const record = await displays.create(createEmptyDisplayDocument("Kitchen"));
```

Also: `SqliteGoogleBindingStore` (display id → Google account), `FileTokenStore` (owner-only token files), and `FileDisplayStore` (JSON files instead of sqlite).

`SqliteDisplayStore` and `FileDisplayStore` validate on write via `assertValidDisplayDocument` (imports `@homeslate/widgets/schemas` so built-in widget configs are checked). Invalid JSON throws `InvalidDisplayDocumentError`. Missing ids throw `DisplayNotFoundError`.

## Viewer passcodes

Both display stores implement the passcode half of the `DisplayStore` interface:

- `getPasscodeHash(id)` returns the stored hash, or `null` when the display has no passcode.
- `setPasscode(id, hash)` sets the hash, or clears it with `null`.

Only the hash is persisted: `SqliteDisplayStore` keeps it in a `passcode_hash`
column (added by an `ALTER TABLE` migration for existing databases) and never
includes it in the `DisplayRecord` it returns. Hash and verify the PIN with
`hashPasscode` / `verifyPasscode` from [`@homeslate/server`](https://www.npmjs.com/package/@homeslate/server).

## See also

- [`@homeslate/schema`](https://www.npmjs.com/package/@homeslate/schema) — document types and validation
- [`@homeslate/google`](https://www.npmjs.com/package/@homeslate/google) — `TokenStore` / `GoogleBindingStore` interfaces
- [Reference app](https://github.com/homeslate/homeslate/tree/main/apps/reference)
