import { styles } from "../typeStyles";

export const container = styles.class("todowidget-container", {
  height: "100%",
  background: "var(--token-widget-background, var(--token-surface-card))",
  border:
    "var(--token-widget-border-width, 1px) solid\n    var(--token-widget-border-color, var(--token-border-default))",
  borderRadius: "var(--token-widget-radius, var(--token-radius-md))",
  padding: "var(--token-widget-padding, var(--token-spacing-3))",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
});

export const transparent = styles.class("todowidget-transparent", {
  background: "transparent",
  borderColor: "transparent",
});

export const empty = styles.class("todowidget-empty", {
  flex: "1",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

export const list = styles.class("todowidget-list", {
  flex: "1",
  overflowY: "auto",
});

export const deleteBtn = styles.class("todowidget-deleteBtn", {});

export const addRow = styles.class("todowidget-addRow", {
  marginTop: "0.25rem",
  paddingTop: "0.25rem",
  borderTop: "1px solid var(--token-border-default)",
});

export const item = styles.class("todowidget-item", {
  display: "flex",
  alignItems: "flex-start",
  gap: "0.6rem",
  padding: "0.4rem 0.25rem",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  textAlign: "left",
  width: "100%",
  borderRadius: "var(--token-radius-sm)",
  transition: "background 0.12s ease",
  "&:hover": {
    background: "rgba(var(--token-color-brand-500-rgb), 0.08)",
  },
});

export const itemText = styles.class("todowidget-itemText", {
  color: "var(--token-text-primary)",
  flex: "1",
  wordBreak: "break-word",
  lineHeight: "1.4",
});

export const checkbox = styles.class("todowidget-checkbox", {
  width: "18px",
  height: "18px",
  minWidth: "18px",
  border: "2px solid var(--token-color-brand-500)",
  borderRadius: "var(--token-radius-sm)",
  marginTop: "1px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background 0.12s ease,\n    border-color 0.12s ease",
  color: "transparent",
});

export const checkboxChecked = styles.class("todowidget-checkboxChecked", {
  background: "var(--token-color-brand-500)",
  color: "var(--token-text-inverse)",
});

export const itemRow = styles.class("todowidget-itemRow", {
  display: "flex",
  alignItems: "center",
  gap: "0.25rem",
  [`& .${deleteBtn}`]: {
    flexShrink: "0",
    opacity: "0.6",
  },
  [`&:hover .${deleteBtn}`]: {
    opacity: "1",
  },
});

export const itemChecked = styles.class("todowidget-itemChecked", {
  [`& .${itemText}`]: {
    textDecoration: "line-through",
    opacity: "0.45",
  },
});
