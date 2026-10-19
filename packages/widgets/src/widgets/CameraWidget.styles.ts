import { styles } from "../typeStyles";

export const container = styles.class("camerawidget-container", {
  height: "100%",
  background: "var(--var-ui-widget-background, var(--var-ui-color-background-surface))",
  border:
    "var(--var-ui-widget-borderWidth, 1px) solid\n    var(--var-ui-widget-borderColor, var(--var-ui-color-border-default))",
  borderRadius: "var(--var-ui-widget-radius, var(--var-ui-radius-md))",
  padding: "var(--var-ui-widget-padding, var(--var-ui-space-3))",
  display: "flex",
  flexDirection: "column",
  gap: "var(--var-ui-space-2)",
  overflow: "hidden",
});

export const transparent = styles.class("camerawidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("camerawidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("camerawidget-emptyIcon", {
  color: "var(--var-ui-color-text-secondary)",
});

export const emptyTitle = styles.class("camerawidget-emptyTitle", {
  fontWeight: 600,
});

export const header = styles.class("camerawidget-header", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});

export const title = styles.class("camerawidget-title", {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontWeight: 600,
  minWidth: 0,
});

export const headerActions = styles.class("camerawidget-headerActions", {
  display: "flex",
  alignItems: "center",
  gap: "var(--var-ui-space-1)",
});

export const frame = styles.class("camerawidget-frame", {
  position: "relative",
  flex: "1",
  minHeight: "120px",
  borderRadius: "var(--var-ui-radius-sm)",
  overflow: "hidden",
  background: "var(--var-ui-color-background-muted, transparent)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const image = styles.class("camerawidget-image", {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
});

export const frameFallback = styles.class("camerawidget-frameFallback", {
  color: "var(--var-ui-color-text-secondary)",
});

export const privacyOverlay = styles.class("camerawidget-privacyOverlay", {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--var-ui-space-2)",
  background: "var(--var-ui-color-background-surface)",
  color: "var(--var-ui-color-text-secondary)",
  textAlign: "center",
  padding: "var(--var-ui-space-3)",
});

export const privacyBadge = styles.class("camerawidget-privacyBadge", {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  fontSize: "0.75em",
  color: "var(--var-ui-color-tone-warning-foreground)",
});

export const errorBox = styles.class("camerawidget-error", {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--var-ui-space-2)",
});
