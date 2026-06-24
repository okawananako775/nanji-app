import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from "react";

export type SegmentIndicatorLayout = { x: number; width: number };

function layoutEqual(a: SegmentIndicatorLayout, b: SegmentIndicatorLayout): boolean {
  return a.x === b.x && a.width === b.width;
}

function measureSegment(container: HTMLElement, segment: HTMLElement): SegmentIndicatorLayout | null {
  const containerRect = container.getBoundingClientRect();
  const segmentRect = segment.getBoundingClientRect();
  if (segmentRect.width <= 0) return null;
  return {
    x: segmentRect.left - containerRect.left,
    width: segmentRect.width,
  };
}

export function useSegmentIndicator(
  containerRef: RefObject<HTMLElement | null>,
  segmentRefs: RefObject<HTMLElement | null>[],
  activeIndex: number,
  options: { enabled?: boolean; remeasureDeps?: unknown[] } = {},
) {
  const { enabled = true, remeasureDeps = [] } = options;
  const [indicator, setIndicator] = useState<SegmentIndicatorLayout>({ x: 0, width: 0 });
  const currentRef = useRef<SegmentIndicatorLayout>({ x: 0, width: 0 });
  const segmentRefsRef = useRef(segmentRefs);
  const wasEnabledRef = useRef(enabled);
  segmentRefsRef.current = segmentRefs;

  const measure = useCallback(
    (index: number) => {
      const container = containerRef.current;
      const el = segmentRefsRef.current[index]?.current;
      if (!container || !el) return null;
      return measureSegment(container, el);
    },
    [containerRef],
  );

  const applyLayout = useCallback((next: SegmentIndicatorLayout, force = false) => {
    if (!force && layoutEqual(currentRef.current, next)) return;
    currentRef.current = next;
    setIndicator(next);
  }, []);

  useLayoutEffect(() => {
    if (!enabled) {
      wasEnabledRef.current = false;
      return;
    }

    const reenabled = !wasEnabledRef.current;
    wasEnabledRef.current = true;

    let cancelled = false;
    let rafId = 0;
    let retryCount = 0;
    const maxRetries = 8;

    const update = (force = false) => {
      const next = measure(activeIndex);
      if (next) {
        applyLayout(next, force);
        return true;
      }
      return false;
    };

    const retry = (force = false) => {
      if (cancelled) return;
      if (update(force)) return;
      if (retryCount >= maxRetries) return;
      retryCount += 1;
      rafId = requestAnimationFrame(() => retry(force));
    };

    retry(reenabled);

    const container = containerRef.current;
    const ro = new ResizeObserver(() => update(false));
    if (container) {
      ro.observe(container);
      segmentRefsRef.current.forEach((ref) => {
        if (ref.current) ro.observe(ref.current);
      });
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, applyLayout, containerRef, enabled, measure, ...remeasureDeps]);

  return indicator;
}
