import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store/StoreContext";
import { selectHomeCity, selectVisibleCities } from "../../store/selectors";
import type { City } from "../../store/types";
import {
  SLOT_HEIGHT,
  TIMELINE_TOTAL_ROWS,
  timelineRowIndex,
  timelineSlotFromRowIndex,
  type SelectedTimeRange,
} from "../../lib/timeGrid";
import { getCityDisplayName } from "../../lib/cities";
import {
  cityHourFromHomeSlot,
  formatClockTime,
  formatClockTimeParts,
  formatDateHeading,
  formatDateTag,
  formatHour,
  homeSlotToUtc,
  getZonedParts,
} from "../../lib/timezone";
import { isNonBusinessDay, preloadHolidayLibrary } from "../../lib/nonBusinessDay";
import { businessSlotState, defaultSlotTextColor } from "../../lib/timeSlotStyle";
import { IconHome } from "../../components/icons/Icons";
import styles from "./TimeTable.module.css";

const HEADING_H = 118;
const HEADING_OVERLAP = 16;
const TAP_MOVE_THRESHOLD_PX = 10;

interface SlotTapGestureState {
  pointerId: number;
  startX: number;
  startY: number;
  slot: { dayOffset: number; hour: number };
  cancelled: boolean;
}

function HeadingClockTime({
  date,
  timezone,
  timeFormat,
}: {
  date: Date;
  timezone: string;
  timeFormat: "24h" | "12h";
}) {
  const { time, period } = formatClockTimeParts(date, timezone, timeFormat);
  if (!period) return <>{time}</>;
  return (
    <>
      {time}
      <span className={styles.timePeriod}>{period}</span>
    </>
  );
}

export interface SlotSelection {
  dayOffset: number;
  hour: number;
  utc: Date;
}

interface TimeTableProps {
  onSlotTap: (slot: { dayOffset: number; hour: number }) => void;
  scrollToNowToken?: number;
  onNowLineVisibleChange?: (visible: boolean) => void;
  selectedRanges: SelectedTimeRange[];
  pendingRangeStart: { dayOffset: number; hour: number } | null;
  selectionPanelOpen?: boolean;
}

function syncFollowerScroll(
  frameScrolls: readonly (HTMLDivElement | null)[],
  top: number,
) {
  frameScrolls.forEach((el, index) => {
    if (index === 0 || !el || el.scrollTop === top) return;
    el.scrollTop = top;
  });
}

function applyScrollPosition(
  frameScrolls: readonly (HTMLDivElement | null)[],
  top: number,
  onScroll?: (top: number) => void,
) {
  frameScrolls.forEach((el, index) => {
    if (!el || el.scrollTop === top) return;
    el.scrollTop = top;
  });
  onScroll?.(top);
}

function scrollToRow(
  frameScrolls: readonly (HTMLDivElement | null)[],
  dayOffset: number,
  hour: number,
  minuteFraction = 0,
  behavior: ScrollBehavior = "smooth",
  onScroll?: (top: number) => void,
  onScrollEnd?: (top: number) => void,
) {
  const master = frameScrolls[0];
  if (!master) return;

  const y = timelineRowIndex(dayOffset, hour) * SLOT_HEIGHT + minuteFraction * SLOT_HEIGHT;
  const targetTop = Math.max(0, y - master.clientHeight / 2);

  if (behavior === "auto") {
    applyScrollPosition(frameScrolls, targetTop, onScroll);
    onScrollEnd?.(targetTop);
    return;
  }

  const startTop = master.scrollTop;
  const distance = targetTop - startTop;
  if (distance === 0) return;

  const duration = 350;
  const startTime = performance.now();

  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    const top = startTop + distance * eased;
    applyScrollPosition(frameScrolls, top, onScroll);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      onScrollEnd?.(targetTop);
    }
  };

  requestAnimationFrame(step);
}

function isLocalMidnightRow(
  rowIndex: number,
  homeTz: string,
  cityTimezone: string,
): boolean {
  const { dayOffset, hour } = timelineSlotFromRowIndex(rowIndex);
  const utc = homeSlotToUtc(homeTz, dayOffset, hour);
  const localHour = getZonedParts(utc, cityTimezone).hour;
  return localHour === 0;
}

function findNextLocalMidnightRow(
  fromRow: number,
  homeTz: string,
  cityTimezone: string,
): number {
  for (let rowIndex = fromRow + 1; rowIndex < TIMELINE_TOTAL_ROWS; rowIndex += 1) {
    if (isLocalMidnightRow(rowIndex, homeTz, cityTimezone)) {
      return rowIndex;
    }
  }
  return TIMELINE_TOTAL_ROWS;
}

interface DateSentinel {
  rowIndex: number;
  start: number;
  height: number;
  label: string;
}

function buildDateSentinels(
  virtualItems: VirtualItem[],
  scrollTop: number,
  viewportHeight: number,
  homeTz: string,
  cityTimezone: string,
  lang: "ja" | "en",
): DateSentinel[] {
  const topRow = Math.max(0, Math.floor(scrollTop / SLOT_HEIGHT));
  const bottomRow = Math.min(
    TIMELINE_TOTAL_ROWS - 1,
    Math.ceil((scrollTop + viewportHeight) / SLOT_HEIGHT),
  );
  const midnightRows = new Set<number>();

  for (let rowIndex = topRow - 1; rowIndex >= 0; rowIndex -= 1) {
    if (isLocalMidnightRow(rowIndex, homeTz, cityTimezone)) {
      midnightRows.add(rowIndex);
      break;
    }
  }

  for (let rowIndex = topRow; rowIndex <= bottomRow; rowIndex += 1) {
    if (isLocalMidnightRow(rowIndex, homeTz, cityTimezone)) {
      midnightRows.add(rowIndex);
    }
  }

  for (const row of virtualItems) {
    if (isLocalMidnightRow(row.index, homeTz, cityTimezone)) {
      midnightRows.add(row.index);
    }
  }

  return [...midnightRows]
    .sort((a, b) => a - b)
    .map((rowIndex) => {
      const { dayOffset, hour } = timelineSlotFromRowIndex(rowIndex);
      const utc = homeSlotToUtc(homeTz, dayOffset, hour);
      const nextMidnightRow = findNextLocalMidnightRow(rowIndex, homeTz, cityTimezone);
      return {
        rowIndex,
        start: rowIndex * SLOT_HEIGHT,
        height: (nextMidnightRow - rowIndex) * SLOT_HEIGHT,
        label: formatDateTag(utc, cityTimezone, lang),
      };
    });
}

interface RangeOverlay {
  id: string;
  top: number;
  height: number;
  label: string | null;
  pending: boolean;
  zIndex: number;
}

function buildRangeOverlays(
  selectedRanges: SelectedTimeRange[],
  pendingRangeStart: { dayOffset: number; hour: number } | null,
  formatCandidateLabel: (index: number) => string,
): RangeOverlay[] {
  const overlays: RangeOverlay[] = selectedRanges.map((selected, arrayIndex) => {
    const startFlat = timelineRowIndex(selected.range.startDay, selected.range.startHour);
    const endFlat = timelineRowIndex(selected.range.endDay, selected.range.endHour);
    const lo = Math.min(startFlat, endFlat);
    const hi = Math.max(startFlat, endFlat);

    return {
      id: selected.id,
      top: lo * SLOT_HEIGHT,
      height: (hi - lo + 1) * SLOT_HEIGHT,
      label: formatCandidateLabel(selected.index),
      pending: false,
      zIndex: arrayIndex + 1,
    };
  });

  if (pendingRangeStart) {
    const pendingFlat = timelineRowIndex(pendingRangeStart.dayOffset, pendingRangeStart.hour);
    overlays.push({
      id: "pending",
      top: pendingFlat * SLOT_HEIGHT,
      height: SLOT_HEIGHT,
      label: null,
      pending: true,
      zIndex: selectedRanges.length + 2,
    });
  }

  return overlays;
}

function CityColumn({
  city,
  homeTz,
  business,
  timeFormat,
  lang,
  now,
  highlight,
  selectedRanges,
  pendingRangeStart,
  formatCandidateLabel,
  virtualItems,
  totalSize,
  frameScrollTop,
  scrollViewportHeight,
  onSlotPointerDown,
  frameScrollRef,
  isMaster,
}: {
  city: City;
  homeTz: string;
  business: boolean;
  timeFormat: "24h" | "12h";
  lang: "ja" | "en";
  now: Date;
  highlight: { day: number | null; hour: number | null };
  selectedRanges: SelectedTimeRange[];
  pendingRangeStart: { dayOffset: number; hour: number } | null;
  formatCandidateLabel: (index: number) => string;
  virtualItems: VirtualItem[];
  totalSize: number;
  frameScrollTop: number;
  scrollViewportHeight: number;
  onSlotPointerDown?: (event: ReactPointerEvent<HTMLButtonElement>, slot: SlotSelection) => void;
  frameScrollRef: (el: HTMLDivElement | null) => void;
  isMaster: boolean;
}) {
  const isHome = city.isHome;
  const cityName = getCityDisplayName(city, lang);
  const dateSentinels = buildDateSentinels(
    virtualItems,
    frameScrollTop,
    scrollViewportHeight,
    homeTz,
    city.timezone,
    lang,
  );
  const rangeOverlays = buildRangeOverlays(
    selectedRanges,
    pendingRangeStart,
    formatCandidateLabel,
  );

  return (
    <div className={styles.column}>
      <div className={`${styles.heading} ${isHome ? styles.headingHome : styles.headingOther}`}>
        <div className={styles.headingTop}>
          {isHome && <IconHome />}
          <span className={styles.headingCityName} title={`${city.countryFlag} ${cityName}`}>
            {city.countryFlag} {cityName}
          </span>
        </div>
        <div className={styles.timeLarge}>
          <HeadingClockTime date={now} timezone={city.timezone} timeFormat={timeFormat} />
        </div>
        <div className={styles.dateSmall}>{formatDateHeading(now, city.timezone, lang)}</div>
      </div>
      <div className={styles.frame}>
        <div className={styles.frameClip}>
          <div className={styles.fadeBottom} />
          <div
            ref={frameScrollRef}
            className={`${styles.frameScroll} ${isMaster ? "" : styles.frameScrollFollower}`}
          >
            <div className={styles.slots} style={{ height: totalSize }}>
              {dateSentinels.map((sentinel) => (
                <div
                  key={`sentinel-${sentinel.rowIndex}`}
                  className={styles.dateSentinel}
                  style={{ top: `${sentinel.start}px`, height: `${sentinel.height}px` }}
                  aria-hidden="true"
                >
                  <span className={styles.dateTag}>{sentinel.label}</span>
                </div>
              ))}
              {virtualItems.map((virtualRow) => {
                const { dayOffset, hour } = timelineSlotFromRowIndex(virtualRow.index);
                const utc = homeSlotToUtc(homeTz, dayOffset, hour);
                const rawLocalHour = getZonedParts(utc, city.timezone).hour;
                const localHour = Number.isFinite(rawLocalHour) ? rawLocalHour : hour;
                const displayHour = cityHourFromHomeSlot(homeTz, city.timezone, dayOffset, hour);

                const biz = businessSlotState(
                  localHour,
                  business,
                  business ? isNonBusinessDay(utc, city.timezone, city.country) : false,
                );
                const textColor = business
                  ? biz === "offhour"
                    ? "light"
                    : "dark"
                  : defaultSlotTextColor(localHour);

                const highlighted = highlight.day === dayOffset && highlight.hour === hour;

                const slotClass = [
                  styles.slot,
                  !business ? styles.slotDefault : "",
                  biz === "active"
                    ? styles.slotBizActive
                    : biz === "inactive"
                      ? styles.slotBizInactive
                      : biz === "offhour"
                        ? styles.slotBizOff
                        : textColor === "light"
                          ? styles.slotLight
                          : styles.slotDark,
                  highlighted ? styles.slotHighlighted : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={virtualRow.key}
                    type="button"
                    className={slotClass}
                    onPointerDown={(event) => onSlotPointerDown?.(event, { dayOffset, hour, utc })}
                    style={{
                      position: "absolute",
                      top: `${virtualRow.start}px`,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      touchAction: "pan-y",
                      ...(!business
                        ? ({ "--slot-local-hour": localHour } as CSSProperties)
                        : {}),
                    }}
                    aria-label={`${cityName} ${formatHour(displayHour, timeFormat)}`}
                  >
                    <span className={styles.slotTime}>{formatHour(displayHour, timeFormat)}</span>
                  </button>
                );
              })}
              {rangeOverlays.map((overlay) => (
                <div
                  key={overlay.id}
                  className={`${styles.rangeOverlay} ${overlay.pending ? styles.rangeOverlayPending : ""}`}
                  style={{
                    top: `${overlay.top}px`,
                    height: `${overlay.height}px`,
                    zIndex: overlay.zIndex,
                  }}
                  aria-hidden="true"
                >
                  {overlay.label && <span className={styles.rangeOverlayBadge}>{overlay.label}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimeTable({
  onSlotTap,
  scrollToNowToken,
  onNowLineVisibleChange,
  selectedRanges,
  pendingRangeStart,
  selectionPanelOpen = false,
}: TimeTableProps) {
  const { state } = useStore();
  const { t } = useTranslation();
  const cities = selectVisibleCities(state);
  const home = selectHomeCity(state);
  const homeTz = home?.timezone ?? "UTC";
  const frameScrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const xScrollRef = useRef<HTMLDivElement>(null);
  const frameScrollTopRef = useRef(0);
  const scrollTopRafRef = useRef<number | null>(null);
  const didInitialScroll = useRef(false);
  const lastHomeScrollKeyRef = useRef<string | null>(null);
  const gestureRef = useRef<SlotTapGestureState | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [frameScrollTop, setFrameScrollTop] = useState(0);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const [scrollViewportHeight, setScrollViewportHeight] = useState(0);
  const [headingH, setHeadingH] = useState(HEADING_H);
  const [, setHolidayDataVersion] = useState(0);
  const businessHoursEnabled = state.settings.businessHoursEnabled;
  const [modeSwitchAnim, setModeSwitchAnim] = useState(false);
  const skipModeSwitchAnim = useRef(true);

  useEffect(() => {
    if (skipModeSwitchAnim.current) {
      skipModeSwitchAnim.current = false;
      return;
    }
    setModeSwitchAnim(true);
  }, [businessHoursEnabled]);

  const formatCandidateLabel = useCallback(
    (index: number) => t("rangeSelection.candidate", { n: index }),
    [t],
  );

  const onSlotPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLButtonElement>, slot: SlotSelection) => {
      if (event.button !== 0) return;

      gestureRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        slot: { dayOffset: slot.dayOffset, hour: slot.hour },
        cancelled: false,
      };

      const onMove = (moveEvent: PointerEvent) => {
        const gesture = gestureRef.current;
        if (!gesture || moveEvent.pointerId !== gesture.pointerId || gesture.cancelled) return;

        const distance = Math.hypot(
          moveEvent.clientX - gesture.startX,
          moveEvent.clientY - gesture.startY,
        );
        if (distance > TAP_MOVE_THRESHOLD_PX) {
          gesture.cancelled = true;
        }
      };

      const onEnd = (endEvent: PointerEvent) => {
        const gesture = gestureRef.current;
        if (!gesture || endEvent.pointerId !== gesture.pointerId) return;

        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onEnd);
        window.removeEventListener("pointercancel", onEnd);

        if (!gesture.cancelled) {
          const distance = Math.hypot(
            endEvent.clientX - gesture.startX,
            endEvent.clientY - gesture.startY,
          );
          if (distance <= TAP_MOVE_THRESHOLD_PX) {
            onSlotTap(gesture.slot);
          }
        }

        gestureRef.current = null;
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onEnd);
      window.addEventListener("pointercancel", onEnd);
    },
    [onSlotTap],
  );

  useEffect(() => {
    if (!businessHoursEnabled) return;
    preloadHolidayLibrary(() => setHolidayDataVersion((version) => version + 1));
  }, [businessHoursEnabled]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setHeadingH(mq.matches ? HEADING_H - 4 : HEADING_H);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: TIMELINE_TOTAL_ROWS,
    getScrollElement: () => scrollElement,
    estimateSize: () => SLOT_HEIGHT,
    overscan: 12,
  });

  const { measure: measureRows } = rowVirtualizer;
  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const homeScrollKey = home ? `${home.id}:${home.timezone}` : "";

  const cityIdsKey = cities.map((c) => c.id).join(",");

  const commitScrollPosition = useCallback((top: number) => {
    frameScrollTopRef.current = top;
    setFrameScrollTop(top);
  }, []);

  const scheduleScrollTopStateUpdate = useCallback((top: number) => {
    frameScrollTopRef.current = top;
    if (scrollTopRafRef.current !== null) return;
    scrollTopRafRef.current = requestAnimationFrame(() => {
      scrollTopRafRef.current = null;
      setFrameScrollTop(frameScrollTopRef.current);
    });
  }, []);

  const onMasterScroll = useCallback(() => {
    const master = frameScrollRefs.current[0];
    if (!master) return;
    const top = master.scrollTop;
    syncFollowerScroll(frameScrollRefs.current, top);
    scheduleScrollTopStateUpdate(top);
  }, [scheduleScrollTopStateUpdate]);

  const getMasterScrollEl = useCallback(() => frameScrollRefs.current[0] ?? null, []);

  const syncAllFollowers = useCallback(() => {
    const top = frameScrollRefs.current[0]?.scrollTop ?? frameScrollTopRef.current;
    syncFollowerScroll(frameScrollRefs.current, top);
  }, []);

  useEffect(() => {
    const master = getMasterScrollEl();
    if (!master) return;
    master.addEventListener("scroll", onMasterScroll, { passive: true });
    return () => master.removeEventListener("scroll", onMasterScroll);
  }, [getMasterScrollEl, onMasterScroll, cityIdsKey]);

  const syncMasterScrollPosition = useCallback(
    (top: number) => {
      applyScrollPosition(frameScrollRefs.current, top, scheduleScrollTopStateUpdate);
    },
    [scheduleScrollTopStateUpdate],
  );

  useLayoutEffect(() => {
    frameScrollRefs.current.length = cities.length;
    syncAllFollowers();
  }, [cityIdsKey, cities.length, syncAllFollowers, virtualItems.length]);

  useEffect(() => {
    const master = getMasterScrollEl();
    const xScroll = xScrollRef.current;
    if (!master || !xScroll) return;

    const cleanups: (() => void)[] = [];

    frameScrollRefs.current.forEach((el, index) => {
      if (!el) return;

      let startX = 0;
      let startY = 0;
      let startScrollTop = 0;
      let startScrollLeft = 0;
      let tracking = false;
      let axis: "x" | "y" | null = null;
      const isFollower = index !== 0;

      const onTouchStart = (e: TouchEvent) => {
        if (e.touches.length !== 1) return;
        tracking = true;
        axis = null;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        startScrollTop = master.scrollTop;
        startScrollLeft = xScroll.scrollLeft;
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!tracking || e.touches.length !== 1) return;

        const dx = startX - e.touches[0].clientX;
        const dy = startY - e.touches[0].clientY;

        if (!axis) {
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);
          if (absDx < 4 && absDy < 4) return;
          axis = absDx > absDy ? "x" : "y";
        }

        if (axis === "x") {
          e.preventDefault();
          xScroll.scrollLeft = startScrollLeft + dx;
          return;
        }

        if (isFollower) {
          e.preventDefault();
          applyScrollPosition(frameScrollRefs.current, startScrollTop + dy, scheduleScrollTopStateUpdate);
        }
      };

      const onTouchEnd = () => {
        tracking = false;
        axis = null;
      };

      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchmove", onTouchMove, { passive: false });
      el.addEventListener("touchend", onTouchEnd, { passive: true });
      el.addEventListener("touchcancel", onTouchEnd, { passive: true });

      cleanups.push(() => {
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchmove", onTouchMove);
        el.removeEventListener("touchend", onTouchEnd);
        el.removeEventListener("touchcancel", onTouchEnd);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [cityIdsKey, cities.length, getMasterScrollEl, scheduleScrollTopStateUpdate]);

  useEffect(() => {
    setNow(new Date());
    const scheduleNextMinute = () => {
      const current = new Date();
      const msUntilNextMinute =
        (60 - current.getSeconds()) * 1000 - current.getMilliseconds();
      return window.setTimeout(() => {
        setNow(new Date());
        intervalId = window.setInterval(() => setNow(new Date()), 60000);
      }, msUntilNextMinute);
    };
    let intervalId = 0;
    const timeoutId = scheduleNextMinute();
    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const xScroll = xScrollRef.current;
    if (!xScroll) return;

    const onWheel = (e: WheelEvent) => {
      const scrollEl = getMasterScrollEl();
      if (!scrollEl) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX > absY && absX > 0) {
        e.preventDefault();
        xScroll.scrollLeft += e.deltaX;
        return;
      }

      if (absY > 0) {
        const isOnMaster = scrollEl.contains(e.target as Node);
        if (!isOnMaster) {
          e.preventDefault();
          syncMasterScrollPosition(scrollEl.scrollTop + e.deltaY);
        }
      }
    };

    xScroll.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => {
      xScroll.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [getMasterScrollEl, syncMasterScrollPosition]);

  useLayoutEffect(() => {
    if (homeScrollKey && lastHomeScrollKeyRef.current !== homeScrollKey) {
      if (lastHomeScrollKeyRef.current !== null) {
        didInitialScroll.current = false;
        frameScrollTopRef.current = 0;
        setFrameScrollTop(0);
        const master = frameScrollRefs.current[0];
        if (master) {
          applyScrollPosition(frameScrollRefs.current, 0);
        }
        syncAllFollowers();
      }
      lastHomeScrollKeyRef.current = homeScrollKey;
    }
    if (!homeScrollKey) {
      lastHomeScrollKeyRef.current = null;
    }
  }, [homeScrollKey, syncAllFollowers]);

  useLayoutEffect(() => {
    if (!scrollElement) return;
    const syncViewportHeight = () => setScrollViewportHeight(scrollElement.clientHeight);
    syncViewportHeight();
    const observer = new ResizeObserver(syncViewportHeight);
    observer.observe(scrollElement);
    return () => observer.disconnect();
  }, [scrollElement]);

  useLayoutEffect(() => {
    if (!scrollElement) return;
    measureRows();
    syncAllFollowers();
  }, [scrollElement, homeScrollKey, measureRows, syncAllFollowers, virtualItems.length]);

  useLayoutEffect(() => {
    if (!home || didInitialScroll.current || !scrollElement) return;
    const parts = getZonedParts(new Date(), home.timezone);
    scrollToRow(
      frameScrollRefs.current,
      0,
      parts.hour,
      parts.minute / 60,
      "auto",
      scheduleScrollTopStateUpdate,
      commitScrollPosition,
    );
    didInitialScroll.current = true;
    syncAllFollowers();
  }, [homeScrollKey, scrollElement, scheduleScrollTopStateUpdate, commitScrollPosition, home, syncAllFollowers]);

  useEffect(() => {
    if (!scrollToNowToken || !home) return;
    const scrollEl = getMasterScrollEl();
    if (!scrollEl) return;
    const parts = getZonedParts(new Date(), home.timezone);
    scrollToRow(
      frameScrollRefs.current,
      0,
      parts.hour,
      parts.minute / 60,
      "smooth",
      scheduleScrollTopStateUpdate,
      commitScrollPosition,
    );
  }, [scrollToNowToken, home?.id, home?.timezone, getMasterScrollEl, scheduleScrollTopStateUpdate, commitScrollPosition]);

  useEffect(() => {
    if (state.ui.highlightHour === null || state.ui.highlightDay === null || !home) {
      return;
    }
    const scrollEl = getMasterScrollEl();
    if (!scrollEl) return;
    scrollToRow(
      frameScrollRefs.current,
      state.ui.highlightDay,
      state.ui.highlightHour,
      0,
      "smooth",
      scheduleScrollTopStateUpdate,
      commitScrollPosition,
    );
  }, [state.ui.highlightDay, state.ui.highlightHour, home?.id, getMasterScrollEl, scheduleScrollTopStateUpdate, commitScrollPosition]);

  const homeParts = home ? getZonedParts(now, home.timezone) : null;

  useEffect(() => {
    if (!onNowLineVisibleChange || !home || homeParts === null) return;
    const scrollEl = getMasterScrollEl();
    if (!scrollEl) return;

    const nowRowY =
      timelineRowIndex(0, homeParts.hour) * SLOT_HEIGHT + (homeParts.minute / 60) * SLOT_HEIGHT;
    const viewTop = frameScrollTop;
    const viewBottom = frameScrollTop + scrollEl.clientHeight;
    const visible = nowRowY >= viewTop && nowRowY <= viewBottom;
    onNowLineVisibleChange(visible);
  }, [frameScrollTop, home, homeParts, getMasterScrollEl, onNowLineVisibleChange]);

  const nowLineTop =
    homeParts !== null
      ? headingH -
        HEADING_OVERLAP +
        timelineRowIndex(0, homeParts.hour) * SLOT_HEIGHT +
        (homeParts.minute / 60) * SLOT_HEIGHT -
        frameScrollTop
      : null;

  return (
    <div className={`${styles.wrap} ${selectionPanelOpen ? styles.wrapWithPanel : ""}`}>
      <div ref={xScrollRef} className={styles.xScroll}>
        <div
          className={`${styles.columns} ${modeSwitchAnim ? styles.columnsModeSwitch : ""}`}
          onAnimationEnd={() => setModeSwitchAnim(false)}
        >
          {cities.map((city, index) => (
            <CityColumn
              key={`${city.id}:${index === 0 ? "master" : "follower"}`}
              city={city}
              homeTz={homeTz}
              business={state.settings.businessHoursEnabled}
              timeFormat={state.settings.timeFormat}
              lang={state.settings.language}
              now={now}
              highlight={{ day: state.ui.highlightDay, hour: state.ui.highlightHour }}
              selectedRanges={selectedRanges}
              pendingRangeStart={pendingRangeStart}
              formatCandidateLabel={formatCandidateLabel}
              virtualItems={virtualItems}
              totalSize={totalSize}
              frameScrollTop={frameScrollTop}
              scrollViewportHeight={scrollViewportHeight}
              onSlotPointerDown={onSlotPointerDown}
              isMaster={index === 0}
              frameScrollRef={(el) => {
                frameScrollRefs.current[index] = el;
                if (index === 0 && el) {
                  setScrollElement(el);
                } else if (el) {
                  const top =
                    frameScrollRefs.current[0]?.scrollTop ?? frameScrollTopRef.current;
                  if (el.scrollTop !== top) el.scrollTop = top;
                }
              }}
            />
          ))}
          {nowLineTop !== null && home && (
            <div className={styles.nowLine} style={{ top: nowLineTop }}>
              <span className={styles.nowBadge}>
                {formatClockTime(now, home.timezone, state.settings.timeFormat)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
