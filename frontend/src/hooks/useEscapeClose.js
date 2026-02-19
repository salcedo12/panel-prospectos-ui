import { useEffect } from "react";

export function useEscapeClose(enabled, onClose) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onClose]);
}
