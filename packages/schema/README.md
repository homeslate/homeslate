# @homeslate/schema

Zod types and validation for Homeslate display documents (views, widgets, themes, household, alarms).

## Install

```bash
pnpm add @homeslate/schema
```

## Usage

`validateDisplayDocument` migrates unknown JSON, then validates it. Widget `config` is checked only for types you have registered.

```ts
import { validateDisplayDocument, registerWidgetConfigSchema } from "@homeslate/schema";
import { z } from "zod";

registerWidgetConfigSchema("clock", z.object({ showSeconds: z.boolean().optional() }));

function parseDisplay(raw: unknown) {
  const result = validateDisplayDocument(raw);
  if (!result.ok) {
    throw new Error(result.errors.map((error) => error.message).join("; "));
  }
  return result.document;
}
```

For every built-in widget, import `@homeslate/widgets/schemas` once (Node-safe) before validating. `@homeslate/adapters` does that for you.

## Also exported

- `migrateDisplayDocument`
- `validateThemeDocument` / `isThemeDocumentCandidate`
- Types: `DisplayDocument`, `View`, `WidgetInstance`, `ThemeDocument`, `HouseholdMember`, `AlarmDefinition`

## See also

- [`@homeslate/widgets`](https://www.npmjs.com/package/@homeslate/widgets) — built-in config schemas and the widget registry
- [Reference app](https://github.com/homeslate/homeslate/tree/main/apps/reference)
