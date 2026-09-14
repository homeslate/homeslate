import { styles } from "./typeStyles";

export const root = styles.class("editor-root", {
  flex: "1",
  minHeight: "0",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  background: "var(--token-surface-canvas, var(--mantine-color-body))",
});

export const pageActions = styles.class("editor-pageActions", {
  flexShrink: "0",
  display: "flex",
  justifyContent: "flex-end",
  padding: "0.75rem 1.5rem",
  borderBottom: "1px solid var(--token-border-default, var(--mantine-color-default-border))",
  background: "var(--token-surface-card, var(--mantine-color-default))",
});

export const body = styles.class("editor-body", {
  flex: "1",
  display: "flex",
  overflow: "hidden",
});

export const main = styles.class("editor-main", {
  flex: "1",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  minWidth: "0",
  background: "var(--token-surface-canvas)",
  position: "relative",
});
