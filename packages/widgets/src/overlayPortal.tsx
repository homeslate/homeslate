import { createContext, useContext } from "react";

/** Overlay target for VarUI Dialog/Select portals inside a nested themed subtree. */
export const OverlayPortalContext = createContext<Element | undefined>(undefined);

export function useOverlayPortalContainer(): Element | undefined {
  return useContext(OverlayPortalContext);
}
