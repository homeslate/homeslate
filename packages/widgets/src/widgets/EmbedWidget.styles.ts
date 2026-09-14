import { styles } from "../typeStyles";

export const container = styles.class("embedwidget-container", {
  height: "100%",
  background: "var(--token-widget-background, var(--token-surface-card))",
  border:
    "var(--token-widget-border-width, 1px) solid\n    var(--token-widget-border-color, var(--token-border-default))",
  borderRadius: "var(--token-widget-radius, var(--token-radius-md))",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
});

export const padded = styles.class("embedwidget-padded", {
  padding: "var(--token-widget-padding, var(--token-spacing-3))",
});

export const transparent = styles.class("embedwidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("embedwidget-empty", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--token-spacing-2)",
  textAlign: "center",
});

export const emptyIcon = styles.class("embedwidget-emptyIcon", {
  color: "var(--token-text-secondary)",
});

export const frame = styles.class("embedwidget-frame", {
  flex: "1",
  width: "100%",
  height: "100%",
  border: "0",
});

export const noPointer = styles.class("embedwidget-noPointer", {
  pointerEvents: "none",
});
