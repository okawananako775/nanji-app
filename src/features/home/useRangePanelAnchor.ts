import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

export function useRangePanelAnchor(
  anchorRef: RefObject<HTMLElement | null>,
  mounted: boolean,
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    if (!mounted) return;

    const anchor = anchorRef.current;
    if (!anchor) return;

    const mq = window.matchMedia("(max-width: 640px)");

    const sync = () => {
      if (mq.matches) {
        setStyle({});
        return;
      }

      const rect = anchor.getBoundingClientRect();
      setStyle({
        top: rect.top,
        height: rect.height,
        right: Math.max(0, window.innerWidth - rect.right),
      });
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(anchor);
    window.addEventListener("resize", sync);
    mq.addEventListener("change", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", sync);
      mq.removeEventListener("change", sync);
    };
  }, [mounted, anchorRef]);

  return style;
}
