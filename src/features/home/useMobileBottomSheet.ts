import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";

export type SheetSnap = "peek" | "half" | "full";

const MOBILE_QUERY = "(max-width: 640px)";
const PEEK_HEIGHT = 72;
const HALF_RATIO = 0.45;
const FULL_RATIO = 0.88;
const DRAG_THRESHOLD_PX = 6;

function getSnapHeights() {
  const viewport = window.innerHeight;
  return {
    peek: PEEK_HEIGHT,
    half: Math.min(viewport * HALF_RATIO, 400),
    full: Math.min(viewport * FULL_RATIO, viewport - 64),
  };
}

function nearestSnap(height: number): SheetSnap {
  const heights = getSnapHeights();
  const entries: SheetSnap[] = ["peek", "half", "full"];
  let nearest: SheetSnap = "half";
  let minDistance = Number.POSITIVE_INFINITY;

  for (const snap of entries) {
    const distance = Math.abs(height - heights[snap]);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = snap;
    }
  }

  return nearest;
}

export function useMobileBottomSheet(open: boolean) {
  const [isMobile, setIsMobile] = useState(false);
  const [snap, setSnap] = useState<SheetSnap>("half");
  const [dragHeight, setDragHeight] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef<{ y: number; height: number } | null>(null);
  const moved = useRef(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_QUERY);
    const sync = () => setIsMobile(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) return;
    setSnap("full");
    setDragHeight(null);
    setIsDragging(false);
    dragStart.current = null;
    moved.current = false;
  }, [open]);

  const resolvedHeight = useMemo(() => {
    if (!isMobile) return null;
    if (dragHeight !== null) return dragHeight;
    return getSnapHeights()[snap];
  }, [isMobile, snap, dragHeight]);

  const clampHeight = useCallback((height: number) => {
    const heights = getSnapHeights();
    return Math.min(heights.full, Math.max(heights.peek, height));
  }, []);

  const onHeaderPointerDown = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!isMobile) return;
      if ((event.target as HTMLElement).closest("button")) return;

      const heights = getSnapHeights();
      event.currentTarget.setPointerCapture(event.pointerId);
      dragStart.current = {
        y: event.clientY,
        height: dragHeight ?? heights[snap],
      };
      moved.current = false;
      setIsDragging(true);
    },
    [isMobile, dragHeight, snap],
  );

  const onHeaderPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!isMobile || !dragStart.current) return;

      const delta = dragStart.current.y - event.clientY;
      if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
        moved.current = true;
      }

      setDragHeight(clampHeight(dragStart.current.height + delta));
    },
    [isMobile, clampHeight],
  );

  const finishDrag = useCallback(() => {
    if (!isMobile) return;

    if (moved.current && dragHeight !== null) {
      setSnap(nearestSnap(dragHeight));
    } else if (!moved.current) {
      setSnap((current) => (current === "peek" ? "half" : "peek"));
    }

    dragStart.current = null;
    setDragHeight(null);
    setIsDragging(false);
    moved.current = false;
  }, [isMobile, dragHeight]);

  const onHeaderPointerUp = useCallback(() => {
    finishDrag();
  }, [finishDrag]);

  const onHeaderPointerCancel = useCallback(() => {
    finishDrag();
  }, [finishDrag]);

  return {
    isMobile,
    snap,
    height: resolvedHeight,
    isDragging,
    headerHandlers: {
      onPointerDown: onHeaderPointerDown,
      onPointerMove: onHeaderPointerMove,
      onPointerUp: onHeaderPointerUp,
      onPointerCancel: onHeaderPointerCancel,
    },
  };
}
