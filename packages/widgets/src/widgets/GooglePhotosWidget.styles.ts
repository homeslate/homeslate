import { styles } from "../typeStyles";

export const container = styles.class("googlephotoswidget-container", {
  width: "100%",
  height: "100%",
  position: "relative",
  overflow: "hidden",
  borderRadius: "var(--token-widget-radius, var(--token-radius-md))",
  backgroundColor: "var(--token-surface-card)",
});

export const transparent = styles.class("googlephotoswidget-transparent", {
  background: "transparent",
});

export const photo = styles.class("googlephotoswidget-photo", {
  width: "100%",
  height: "100%",
  backgroundSize: "cover",
  backgroundPosition: "center",
  transition: "opacity 0.5s ease-in-out",
});

export const fade = styles.class("googlephotoswidget-fade", {
  opacity: "0",
});

export const overlay = styles.class("googlephotoswidget-overlay", {
  position: "absolute",
  bottom: "0",
  left: "0",
  right: "0",
  height: "40%",
  background:
    "linear-gradient(\n    to top,\n    color-mix(in srgb, var(--token-surface-overlay, var(--token-surface-card)) 86%, transparent) 0%,\n    transparent 100%\n  )",
  pointerEvents: "none",
});

export const caption = styles.class("googlephotoswidget-caption", {
  position: "absolute",
  bottom: "12px",
  left: "12px",
  right: "12px",
  zIndex: "10",
});

export const captionText = styles.class("googlephotoswidget-captionText", {
  color: "var(--token-text-inverse)",
  fontSize: "14px",
  fontWeight: "500",
  textShadow: "0 1px 3px var(--token-surface-overlay, var(--token-surface-card))",
});

export const signIn = styles.class("googlephotoswidget-signIn", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: "20px",
  textAlign: "center",
});

export const empty = styles.class("googlephotoswidget-empty", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: "20px",
  textAlign: "center",
});

export const loading = styles.class("googlephotoswidget-loading", {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  padding: "20px",
  textAlign: "center",
  color: "var(--token-text-muted)",
  marginBottom: "12px",
});

export const googleIcon = styles.class("googlephotoswidget-googleIcon", {
  color: "var(--token-color-brand-500)",
  marginBottom: "12px",
});

export const emptyIcon = styles.class("googlephotoswidget-emptyIcon", {
  color: "var(--token-text-muted)",
  marginBottom: "12px",
});

export const authSection = styles.class("googlephotoswidget-authSection", {
  padding: "12px",
  backgroundColor: "var(--token-surface-card)",
  borderRadius: "var(--token-radius-md)",
});

export const refreshBtn = styles.class("googlephotoswidget-refreshBtn", {
  position: "absolute",
  top: "8px",
  right: "8px",
  zIndex: "10",
});

export const refreshButton = styles.class("googlephotoswidget-refreshButton", {
  backgroundColor:
    "color-mix(\n    in srgb,\n    var(--token-surface-overlay, var(--token-surface-card)) 75%,\n    transparent\n  )",
  color: "var(--token-text-inverse)",
  "&:hover": {
    backgroundColor:
      "color-mix(\n    in srgb,\n    var(--token-surface-overlay, var(--token-surface-card)) 90%,\n    transparent\n  )",
  },
});
