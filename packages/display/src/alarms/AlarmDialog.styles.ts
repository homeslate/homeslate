import { styles } from "../typeStyles";

export const overlay = styles.class("alarmdialog-overlay", {
  position: "fixed",
  inset: "0",
  zIndex: "10000",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "color-mix(in oklab, canvas 20%, black)",
  padding: "1.5rem",
});

export const card = styles.class("alarmdialog-card", {
  width: "min(560px, 100%)",
  borderRadius: "1rem",
  background: "var(--var-ui-color-background-surface)",
  color: "var(--var-ui-color-text-primary)",
  padding: "2rem",
  textAlign: "center",
  boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)",
});

export const label = styles.class("alarmdialog-label", {
  fontSize: "clamp(1.75rem, 5vw, 2.75rem)",
  fontWeight: "700",
  lineHeight: "1.15",
  marginBottom: "0.5rem",
});

export const time = styles.class("alarmdialog-time", {
  fontSize: "clamp(1.25rem, 3vw, 1.75rem)",
  opacity: "0.75",
  marginBottom: "1.75rem",
});

export const voiceStatus = styles.class("alarmdialog-voiceStatus", {
  margin: "-1rem 0 1.25rem",
  letterSpacing: "0.01em",
  '&[data-listening="true"]': {
    color: "var(--var-ui-color-tone-success-foreground)",
    opacity: "1",
  },
});

export const pulse = styles.class("alarmdialog-pulse", {
  width: "64px",
  height: "64px",
  margin: "0 auto 1.25rem",
  borderRadius: "50%",
  background: "var(--var-ui-color-danger)",
  animation: "pulse 1.2s ease-in-out infinite",
});

export const pulseSilent = styles.class("alarmdialog-pulseSilent", {
  opacity: "0.45",
});

export const actions = styles.class("alarmdialog-actions", {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
});

export const snoozeRow = styles.class("alarmdialog-snoozeRow", {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "0.5rem",
});

export const topRow = styles.class("alarmdialog-topRow", {
  display: "flex",
  justifyContent: "flex-end",
  marginBottom: "0.5rem",
});
