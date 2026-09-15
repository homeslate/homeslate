# @homeslate/display

Kiosk surface for a `DisplayDocument`: view rotation, alarms, holidays, and the widget canvas.

## Install

```bash
pnpm add @homeslate/display
```

Peers: `react` and `react-dom` ^19. Install VarUI peers `react-aria-components` and `@internationalized/date`. The host still imports `./styles` from `@homeslate/widgets` and this package.

## Usage

```tsx
import { Display } from "@homeslate/display";
import type { DisplayDocument } from "@homeslate/schema";

function Kiosk({
  document,
  setDocument,
}: {
  document: DisplayDocument;
  setDocument: (next: DisplayDocument) => void;
}) {
  return <Display document={document} onChange={setDocument} />;
}
```

`onChange` is optional; pass it when the kiosk should persist widget or sticky-note edits. `Display` nests its own `DesignSystemProvider` with the compiled display theme. Do not call `applyToDocument` there.

`@homeslate/display/canvas` exports `DocumentCanvas`, theme helpers, and document patch functions (the editor uses this subpath).

## Host contract

Wrap the page in providers, and extract CSS once:

```tsx
import { DesignSystemProvider, IconProvider, LayerProvider } from "@var-ui/react";
import { defaultIcons } from "@var-ui/icons";

<DesignSystemProvider applyToDocument>
  <IconProvider icons={defaultIcons}>
    <LayerProvider>
      <App />
    </LayerProvider>
  </IconProvider>
</DesignSystemProvider>;
```

```ts
// TypeStyles extract entry — VarUI first, then Homeslate
import "@var-ui/core/styles";
import "@homeslate/widgets/styles";
import "@homeslate/display/styles";
// also import @homeslate/editor/styles if you mount Editor
```

On `@var-ui/core@0.1.0` the published `styles` file is empty; import `@var-ui/core/register-default-theme`, `@var-ui/core/base-styles`, and the other core style subpaths instead (as the [reference app](https://github.com/homeslate/homeslate/blob/main/apps/reference/typestyles-entry.ts) does). Full eight-step contract: [reference README](https://github.com/homeslate/homeslate/blob/main/apps/reference/README.md).

## See also

- [`@homeslate/editor`](https://www.npmjs.com/package/@homeslate/editor) — layout editor
- [`@homeslate/widgets`](https://www.npmjs.com/package/@homeslate/widgets) — `GoogleRuntimeProvider`
