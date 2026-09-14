import { useRef, useState } from "react";
import { Button } from "@var-ui/react";

export function HoldToConfirm({
  label,
  holdingLabel = "Hold to confirm",
  ariaLabel,
  holdMs = 1500,
  onConfirm,
  size = "sm",
}: {
  label: string;
  holdingLabel?: string;
  ariaLabel?: string;
  holdMs?: number;
  onConfirm: () => void;
  size?: "xs" | "sm" | "md";
}) {
  const buttonSize = size === "xs" ? "sm" : size;
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
      appearance="ghost"
      size={buttonSize}
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
