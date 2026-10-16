import type { WidgetRegistryApi } from "@homeslate/display/canvas";
import { createContext, useContext, type ReactNode } from "react";

export type HomeslateHostConfig = {
  /** Prefix for API calls. Empty string means same origin. */
  apiBaseUrl: string;
  /** Shown in the display-list nav. */
  productName: string;
  /** Registry passed to Editor and Display. Defaults to the global registry. */
  widgetRegistry?: WidgetRegistryApi;
};

export const DEFAULT_HOMESLATE_HOST: HomeslateHostConfig = {
  apiBaseUrl: "",
  productName: "Homeslate",
};

const HomeslateHostContext = createContext<HomeslateHostConfig>(DEFAULT_HOMESLATE_HOST);

export function HomeslateHostProvider({
  value,
  children,
}: {
  value: HomeslateHostConfig;
  children: ReactNode;
}) {
  return <HomeslateHostContext.Provider value={value}>{children}</HomeslateHostContext.Provider>;
}

export function useHomeslateHost(): HomeslateHostConfig {
  return useContext(HomeslateHostContext);
}
