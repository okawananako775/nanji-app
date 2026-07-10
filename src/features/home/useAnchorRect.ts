import { useLayoutEffect, useState, type RefObject } from "react";

export function useAnchorRect(
  anchorRef: RefObject<HTMLElement | null>,
  active: boolean,
): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!active) {
      setRect(null);
      return;
    }

    const sync = () => {
      const anchor = anchorRef.current;
      if (!anchor) {
        setRect(null);
        return;
      }
      setRect(anchor.getBoundingClientRect());
    };

    sync();
    const anchor = anchorRef.current;
    const observer = anchor ? new ResizeObserver(sync) : null;
    if (anchor && observer) observer.observe(anchor);

    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [anchorRef, active]);

  return rect;
}
