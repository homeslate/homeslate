import { useRef, useState } from "react";
import { Button } from "@mantine/core";

export function HoldToConfirm({
  label,
  holdingLabel = "Hold to confirm",
  ariaLabel,
  holdMs = 1500,
  onConfirm,
  size = "xs",
}: {
  label: string;
  holdingLabel?: string;
  ariaLabel?: string;
  holdMs?: number;
  onConfirm: () => void;
  size?: "xs" | "sm" | "md";
}) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<number | null>(null);

  const cancel = () => {
    setHolding(false);
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = () => {
    setHolding(true);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      setHolding(false);
      onConfirm();
    }, holdMs);
  };

  return (
    <Button
      variant="subtle"
      size={size}
      aria-label={ariaLabel ?? label}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
    >
      {holding ? holdingLabel : label}
    </Button>
  );
}
