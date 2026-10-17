import "@var-ui/core/base-styles";
import "@var-ui/core/register-default-theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DesignSystemProvider, IconProvider, LayerProvider } from "@var-ui/react";
import { defaultIcons } from "@var-ui/icons";
import { HomeslateApp } from "@homeslate/host-react";

// `HomeslateApp` needs no props. It defaults `productName` to "Homeslate",
// calls the API on the same origin, and uses the widget registry that
// `@homeslate/host-react` pulls in from `@homeslate/widgets`.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DesignSystemProvider applyToDocument defaultColorMode="dark">
      <IconProvider icons={defaultIcons}>
        <LayerProvider>
          <HomeslateApp />
        </LayerProvider>
      </IconProvider>
    </DesignSystemProvider>
  </StrictMode>,
);
