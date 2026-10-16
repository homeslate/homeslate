# @homeslate/host-react

The homeslate web shell: a routed app over `@homeslate/editor` and
`@homeslate/display`, a Google runtime wired to the homeslate API, and the
debounced persist helper.

```tsx
import { HomeslateApp } from "@homeslate/host-react";

// Inside your provider tree (DesignSystemProvider / IconProvider / LayerProvider):
<HomeslateApp productName="Homeslate" />;
```

Pass `apiBaseUrl` when the API is on another origin, and `widgetRegistry` to
override the widget registry used by the editor and kiosk. Compose
`DisplayListPage`, `EditorPage`, and `KioskPage` yourself for different chrome.

See the [self-hosting guide](https://github.com/homeslate/homeslate/blob/main/docs/content/docs/self-hosting.mdx).
