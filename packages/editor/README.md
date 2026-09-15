# @homeslate/editor

Canvas editor for a `DisplayDocument`: layout, widget settings, household, and theme.

## Install

```bash
pnpm add @homeslate/editor
```

Peers: `react` and `react-dom` ^19. Install VarUI peers `react-aria-components` and `@internationalized/date`. The host still imports `./styles` from `@homeslate/widgets`, `@homeslate/display`, and this package.

## Usage

```tsx
import { Editor } from "@homeslate/editor";
import type { DisplayDocument } from "@homeslate/schema";

function EditView({
  document,
  setDocument,
}: {
  document: DisplayDocument;
  setDocument: (next: DisplayDocument) => void;
}) {
  const viewId = document.activeViewId ?? document.views[0].id;
  return <Editor document={document} viewId={viewId} onChange={setDocument} />;
}
```

`Editor` nests its own `DesignSystemProvider` with the compiled display theme. Do not call `applyToDocument` there.

Also exported: `WidgetPanel`, `BgSettings`, `ThemeEditor`.

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
import "@homeslate/editor/styles";
```

On `@var-ui/core@0.1.0` the published `styles` file is empty; import `@var-ui/core/register-default-theme`, `@var-ui/core/base-styles`, and the other core style subpaths instead (as the [reference app](https://github.com/homeslate/homeslate/blob/main/apps/reference/typestyles-entry.ts) does). Full eight-step contract: [reference README](https://github.com/homeslate/homeslate/blob/main/apps/reference/README.md).

## See also

- [`@homeslate/display`](https://www.npmjs.com/package/@homeslate/display) — kiosk surface
- [`@homeslate/widgets`](https://www.npmjs.com/package/@homeslate/widgets) — `GoogleRuntimeProvider`
