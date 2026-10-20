import { IconMaximize, IconMinimize } from "@tabler/icons-react";
import { useFullscreen } from "./useFullscreen";

/**
 * Fullscreen has to start from a user gesture, so this is a button rather than
 * an automatic request. Fully Kiosk and WallPanel can enter fullscreen natively.
 */
export function FullscreenButton(props: { hidden?: boolean; className?: string }) {
  const fullscreen = useFullscreen();
  if (props.hidden || !fullscreen.supported) return null;

  return (
    <button
      type="button"
      className={props.className}
      aria-label={fullscreen.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      onClick={() => {
        void fullscreen.toggle();
      }}
    >
      {fullscreen.isFullscreen ? <IconMinimize size={16} /> : <IconMaximize size={16} />}
    </button>
  );
}
