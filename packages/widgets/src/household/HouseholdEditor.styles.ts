import { styles } from "../typeStyles";

export const list = styles.class("householdeditor-list", {
  width: "100%",
});

export const row = styles.class("householdeditor-row", {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
});

export const disc = styles.class("householdeditor-disc", {
  width: "1.75rem",
  height: "1.75rem",
  minWidth: "1.75rem",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.75rem",
  fontWeight: "700",
  color: "var(--token-text-inverse, var(--token-text-primary))",
});

export const swatch = styles.class("householdeditor-swatch", {
  width: "1.5rem",
  height: "1.5rem",
  minWidth: "1.5rem",
  padding: "0",
  border: "1px solid var(--token-border-default)",
  borderRadius: "999px",
  cursor: "pointer",
});

export const swatchActive = styles.class("householdeditor-swatchActive", {
  outline: "2px solid var(--token-color-brand-500)",
  outlineOffset: "2px",
});
