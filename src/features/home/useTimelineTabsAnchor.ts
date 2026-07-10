import { useLayoutEffect, useState, type CSSProperties, type RefObject } from "react";

const MOBILE_QUERY = "(max-width: 640px)";

export function useTimelineTabsAnchor(
  anchorRef: RefObject<HTMLElement | null>,
  sidePanelOpen: boolean,
): CSSProperties {
  const [style, setStyle] = useState<CSSProperties>({});

  useLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);

    const sync = () => {
      if (mq.matches) {
        setStyle({});
        return;
      }

      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      setStyle({
        position: "fixed",
        top: rect.top + rect.height / 2,
        right: sidePanelOpen ? "var(--range-selection-panel-width)" : 0,
        transform: "translateY(-50%)",
      });
    };

    sync();
    const anchor = anchorRef.current;
    const observer = anchor ? new ResizeObserver(sync) : null;
    if (anchor && observer) observer.observe(anchor);
    window.addEventListener("resize", sync);
    mq.addEventListener("change", sync);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", sync);
      mq.removeEventListener("change", sync);
    };
  }, [anchorRef, sidePanelOpen]);

  return style;
}
