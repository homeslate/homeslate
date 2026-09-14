import { styles } from "../typeStyles";

export const list = styles.class("alarmlisteditor-list", {
  width: "100%",
});

export const card = styles.class("alarmlisteditor-card", {
  width: "100%",
});

export const timeInput = styles.class("alarmlisteditor-timeInput", {
  width: "6.5rem",
});

export const toneSelect = styles.class("alarmlisteditor-toneSelect", {
  width: "8.5rem",
});

export const dayRow = styles.class("alarmlisteditor-dayRow", {
  flexWrap: "wrap",
});

export const dayChip = styles.class("alarmlisteditor-dayChip", {
  flex: "1",
  minWidth: "2.25rem",
  height: "2.25rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--mantine-color-default-border)",
  background: "var(--mantine-color-default)",
  color: "var(--mantine-color-dimmed)",
  borderRadius: "var(--mantine-radius-sm)",
  fontSize: "0.8rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "background 0.12s ease,\n    border-color 0.12s ease,\n    color 0.12s ease",
  "-webkit-tap-highlight-color": "transparent",
  "&:hover": {
    borderColor: "var(--mantine-color-brand-5, var(--mantine-color-blue-5))",
  },
});

export const dayChipActive = styles.class("alarmlisteditor-dayChipActive", {
  background: "var(--mantine-color-brand-6, var(--mantine-color-blue-6))",
  borderColor: "var(--mantine-color-brand-6, var(--mantine-color-blue-6))",
  color: "var(--mantine-color-white)",
});

export const addBtn = styles.class("alarmlisteditor-addBtn", {
  alignSelf: "flex-start",
});
