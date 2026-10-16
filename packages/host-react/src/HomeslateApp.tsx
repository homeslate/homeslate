import type { WidgetRegistryApi } from "@homeslate/display/canvas";
import { Navigate, Route, BrowserRouter, Routes, useHref, useNavigate } from "react-router-dom";
import { RouterProvider } from "react-aria-components";
import { DisplayListPage, EditorPage, KioskPage } from "./pages";
import { HomeslateHostProvider, type HomeslateHostConfig } from "./hostContext";

export type HomeslateAppProps = {
  /** Shown in the display-list nav. Defaults to `"Homeslate"`. */
  productName?: string;
  /** Prefix for API calls. Defaults to `""` (same origin). */
  apiBaseUrl?: string;
  /** Registry passed to Editor and Display. Defaults to the global registry. */
  widgetRegistry?: WidgetRegistryApi;
};

/**
 * The routed homeslate app: display list (`/`), editor (`/edit/:id`), and kiosk
 * (`/d/:publicId`). Compose the exported pages yourself if you want different
 * chrome or routing.
 */
export function HomeslateApp({ productName, apiBaseUrl, widgetRegistry }: HomeslateAppProps = {}) {
  const config: HomeslateHostConfig = {
    apiBaseUrl: apiBaseUrl ?? "",
    productName: productName ?? "Homeslate",
    widgetRegistry,
  };

  return (
    <HomeslateHostProvider value={config}>
      <BrowserRouter>
        <HomeslateRoutes />
      </BrowserRouter>
    </HomeslateHostProvider>
  );
}

function HomeslateRoutes() {
  const navigate = useNavigate();
  return (
    <RouterProvider navigate={navigate} useHref={useHref}>
      <Routes>
        <Route path="/" element={<DisplayListPage />} />
        <Route path="/edit/:id" element={<EditorPage />} />
        <Route path="/d/:publicId" element={<KioskPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouterProvider>
  );
}
