import type { CSSProperties } from "react";

const BANNER_STYLE: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1100,
  padding: "0.35rem 0.75rem",
  textAlign: "center",
  fontSize: "0.85rem",
  background: "rgba(0, 0, 0, 0.78)",
  color: "white",
  pointerEvents: "none",
};

export function offlineBannerMessage(input: {
  online: boolean;
  loadFailed: boolean;
  showingSaved: boolean;
}): string | null {
  if (!input.online) return "Offline — showing last saved data";
  if (input.loadFailed) return "Reconnecting…";
  if (input.showingSaved) return "Showing saved version";
  return null;
}

export function OfflineBanner(props: {
  online: boolean;
  loadFailed: boolean;
  showingSaved: boolean;
}) {
  const message = offlineBannerMessage(props);
  if (!message) return null;
  return (
    <div role="status" style={BANNER_STYLE}>
      {message}
    </div>
  );
}
