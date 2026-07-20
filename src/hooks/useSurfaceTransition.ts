import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { SURFACE_TRANSITION_MS } from "../lib/surfaceTransition";

export function useSurfaceTransition(open: boolean) {
  const openedAtRef = useRef(0);
  const [render, setRender] = useState(open);
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    if (open) {
      setRender(true);
      setShown(false);
      return;
    }
    setShown(false);
  }, [open]);

  useEffect(() => {
    if (!open || !render) return;

    openedAtRef.current = performance.now();

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        setShown(true);
      });
    });

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open, render]);

  useEffect(() => {
    if (!shown && !open && render) {
      const timer = window.setTimeout(() => setRender(false), SURFACE_TRANSITION_MS);
      return () => window.clearTimeout(timer);
    }
  }, [shown, open, render]);

  return { render, shown, openedAtRef };
}
