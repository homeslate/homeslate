import { styles } from "../typeStyles";

export const container = styles.class("photowidget-container", {
  height: "100%",
  position: "relative",
  borderRadius: "var(--token-widget-radius, var(--token-radius-md))",
  overflow: "hidden",
});

export const transparent = styles.class("photowidget-transparent", {
  background: "transparent",
});

export const photo = styles.class("photowidget-photo", {
  position: "absolute",
  inset: "0",
  backgroundSize: "cover",
  backgroundPosition: "center",
  transition: "opacity 0.5s ease,\n    transform 0.5s ease",
});

export const fade = styles.class("photowidget-fade", {
  opacity: "0",
});

export const slide = styles.class("photowidget-slide", {
  transform: "translateX(-100%)",
});

export const overlay = styles.class("photowidget-overlay", {
  position: "absolute",
  inset: "0",
  background:
    "linear-gradient(\n    180deg,\n    transparent 0%,\n    transparent 60%,\n    color-mix(in srgb, var(--token-surface-overlay, var(--token-surface-card)) 82%, transparent)\n      100%\n  )",
  pointerEvents: "none",
});

export const caption = styles.class("photowidget-caption", {
  position: "absolute",
  bottom: "0",
  left: "0",
  right: "0",
  padding: "1rem",
  paddingBottom: "2rem",
});

export const captionText = styles.class("photowidget-captionText", {
  color: "var(--token-text-inverse)",
  fontSize: "1rem",
  fontWeight: "500",
  textShadow: "0 2px 4px var(--token-surface-overlay, var(--token-surface-card))",
});

export const dots = styles.class("photowidget-dots", {
  position: "absolute",
  bottom: "0.75rem",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",
  gap: "0.5rem",
});

export const dot = styles.class("photowidget-dot", {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "color-mix(in srgb, var(--token-text-inverse) 40%, transparent)",
  border: "none",
  cursor: "pointer",
  transition: "all 0.2s ease",
  padding: "0",
  "&:hover": {
    background: "color-mix(in srgb, var(--token-text-inverse) 70%, transparent)",
    transform: "scale(1.2)",
  },
});

export const activeDot = styles.class("photowidget-activeDot", {
  background: "var(--token-text-inverse)",
  transform: "scale(1.2)",
});

export const demoNotice = styles.class("photowidget-demoNotice", {
  position: "absolute",
  top: "0.5rem",
  right: "0.5rem",
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  background:
    "color-mix(\n    in srgb,\n    var(--token-surface-overlay, var(--token-surface-card)) 82%,\n    transparent\n  )",
  padding: "0.25rem 0.5rem",
  borderRadius: "var(--token-radius-sm)",
  color: "var(--token-text-inverse)",
  backdropFilter: "blur(4px)",
});

export const thumbWrapper = styles.class("photowidget-thumbWrapper", {
  position: "relative",
  borderRadius: "var(--token-radius-sm)",
  overflow: "hidden",
  background: "var(--token-surface-card)",
});

export const thumb = styles.class("photowidget-thumb", {
  display: "block",
  width: "100%",
});

export const thumbPlaceholder = styles.class("photowidget-thumbPlaceholder", {
  height: "80px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--token-border-default)",
  borderRadius: "var(--token-radius-sm)",
});

export const thumbRemove = styles.class("photowidget-thumbRemove", {
  position: "absolute",
  top: "4px",
  right: "4px",
  opacity: "0",
  transition: "opacity 0.15s ease",
  zIndex: "2",
  [`.${thumbWrapper}:hover &`]: {
    opacity: "1",
  },
});

export const thumbCaption = styles.class("photowidget-thumbCaption", {
  position: "absolute",
  bottom: "0",
  left: "0",
  right: "0",
  padding: "0.25rem 0.375rem",
  background:
    "color-mix(\n    in srgb,\n    var(--token-surface-overlay, var(--token-surface-card)) 78%,\n    transparent\n  )",
  color: "var(--token-text-inverse)",
  fontSize: "0.65rem",
  lineHeight: "1.3",
});
