import { styles } from "../typeStyles";

export const fallback = styles.class("widgeterrorboundary-fallback", {
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.75rem",
  textAlign: "center",
  boxSizing: "border-box",
});

export const title = styles.class("widgeterrorboundary-title", {
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  maxWidth: "100%",
});

export const message = styles.class("widgeterrorboundary-message", {
  margin: "0",
});

export const detail = styles.class("widgeterrorboundary-detail", {
  margin: "0",
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontSize: "0.75rem",
  color: "var(--var-ui-color-text-secondary)",
});

export const actions = styles.class("widgeterrorboundary-actions", {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap",
  justifyContent: "center",
});

export const button = styles.class("widgeterrorboundary-button", {
  appearance: "none",
  border: "1px solid var(--var-ui-color-border-default, CanvasText)",
  borderRadius: "var(--var-ui-radius-sm, 6px)",
  background: "var(--var-ui-color-background-surface, Canvas)",
  color: "inherit",
  font: "inherit",
  padding: "0.25rem 0.625rem",
  cursor: "pointer",
});

export const removeButton = styles.class("widgeterrorboundary-removeButton", {
  color: "var(--var-ui-color-tone-danger-foreground, inherit)",
});
