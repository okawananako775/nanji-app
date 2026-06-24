import { useVirtualizer, type VirtualItem } from "@tanstack/react-virtual";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useStore } from "../../store/StoreContext";
import { selectHomeCity, selectVisibleCities } from "../../store/selectors";
import type { City } from "../../store/types";
import {
  SLOT_HEIGHT,
  TIMELINE_HALF_DAYS,
  TIMELINE_TOTAL_ROWS,
  timelineRowIndex,
  timelineSlotFromRowIndex,
} from "../../lib/timeGrid";
import {
  cityHourFromHomeSlot,
  formatClockTime,
  formatClockTimeParts,
  formatDateHeading,
  formatHour,
  homeSlotToUtc,
  getZonedParts,
} from "../../lib/timezone";
import { businessSlotState, defaultSlotTextColor } from "../../lib/timeSlotStyle";
import { IconHome } from "../../components/icons/Icons";
import styles from "./TimeTable.module.css";

const HEADING_H = 120;
const HEADING_OVERLAP = 16;

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
  onCellClick: (slot: SlotSelection) => void;
  scrollToNowToken?: number;
  onNowLineVisibleChange?: (visible: boolean) => void;
  rangeStart: { day: number; hour: number } | null;
  rangeHighlight: {
    startDay: number;
    startHour: number;
    endDay: number;
    endHour: number;
  } | null;
}

function syncFollowerTransforms(
  followerSlots: readonly (HTMLDivElement | null)[],
  top: number,
) {
  followerSlots.forEach((el, index) => {
    if (index === 0 || !el) return;
    el.style.transform = `translateY(-${top}px)`;
  });
}

function applyScrollPosition(
  master: HTMLDivElement | null,
  followerSlots: readonly (HTMLDivElement | null)[],
  top: number,
  onScroll?: (top: number) => void,
) {
  if (master) master.scrollTop = top;
  syncFollowerTransforms(followerSlots, top);
  onScroll?.(top);
}

function scrollToRow(
  master: HTMLDivElement | null,
  followerSlots: readonly (HTMLDivElement | null)[],
  dayOffset: number,
  hour: number,
  minuteFraction = 0,
  behavior: ScrollBehavior = "smooth",
  onScroll?: (top: number) => void,
  onScrollEnd?: (top: number) => void,
) {
  if (!master) return;

  const y = timelineRowIndex(dayOffset, hour) * SLOT_HEIGHT + minuteFraction * SLOT_HEIGHT;
  const targetTop = Math.max(0, y - master.clientHeight / 2);

  if (behavior === "auto") {
    applyScrollPosition(master, followerSlots, targetTop, onScroll);
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
    applyScrollPosition(master, followerSlots, top, onScroll);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      onScrollEnd?.(targetTop);
    }
  };

  requestAnimationFrame(step);
}

function getRangeClass(
  dayOffset: number,
  hour: number,
  rangeStart: { day: number; hour: number } | null,
  rangeHighlight: {
    startDay: number;
    startHour: number;
    endDay: number;
    endHour: number;
  } | null,
): string {
  if (rangeHighlight) {
    const flat = timelineRowIndex(dayOffset, hour);
    const startFlat = timelineRowIndex(rangeHighlight.startDay, rangeHighlight.startHour);
    const endFlat = timelineRowIndex(rangeHighlight.endDay, rangeHighlight.endHour);
    const [lo, hi] = startFlat <= endFlat ? [startFlat, endFlat] : [endFlat, startFlat];
    if (flat < lo || flat > hi) return "";
    if (flat === lo && flat === hi) return styles.slotRangeStart;
    if (flat === lo) return styles.slotRangeStart;
    if (flat === hi) return styles.slotRangeEnd;
    return styles.slotRangeMid;
  }
  if (!rangeStart) return "";
  if (rangeStart.day === dayOffset && rangeStart.hour === hour) {
    return styles.slotRangeStart;
  }
  return "";
}

function CityColumn({
  city,
  homeTz,
  business,
  timeFormat,
  lang,
  now,
  highlight,
  rangeStart,
  rangeHighlight,
  virtualItems,
  totalSize,
  onCellClick,
  onMasterScroll,
  frameScrollRef,
  slotsRef,
  isMaster,
}: {
  city: City;
  homeTz: string;
  business: boolean;
  timeFormat: "24h" | "12h";
  lang: "ja" | "en";
  now: Date;
  highlight: { day: number | null; hour: number | null };
  rangeStart: { day: number; hour: number } | null;
  rangeHighlight: {
    startDay: number;
    startHour: number;
    endDay: number;
    endHour: number;
  } | null;
  virtualItems: VirtualItem[];
  totalSize: number;
  onCellClick: (slot: SlotSelection) => void;
  onMasterScroll?: () => void;
  frameScrollRef: (el: HTMLDivElement | null) => void;
  slotsRef?: (el: HTMLDivElement | null) => void;
  isMaster: boolean;
}) {
  const isHome = city.isHome;

  return (
    <div className={styles.column}>
      <div className={`${styles.heading} ${isHome ? styles.headingHome : styles.headingOther}`}>
        <div className={styles.headingTop}>
          {isHome && <IconHome />}
          <span>
            {city.countryFlag} {city.name}
          </span>
        </div>
        <div className={styles.timeLarge}>
          <HeadingClockTime date={now} timezone={city.timezone} timeFormat={timeFormat} />
        </div>
        <div className={styles.dateSmall}>{formatDateHeading(now, city.timezone, lang)}</div>
      </div>
      <div className={styles.frame}>
        <div className={styles.frameClip}>
          <div className={styles.fadeTop} />
          <div className={styles.fadeBottom} />
          <div
            ref={frameScrollRef}
            className={`${styles.frameScroll} ${isMaster ? "" : styles.frameScrollFollower}`}
            onScroll={isMaster ? onMasterScroll : undefined}
          >
            <div
              ref={slotsRef}
              className={`${styles.slots} ${isMaster ? "" : styles.slotsFollower}`}
              style={{ height: totalSize }}
            >
              {virtualItems.map((virtualRow) => {
                const { dayOffset, hour } = timelineSlotFromRowIndex(virtualRow.index);
                const utc = homeSlotToUtc(homeTz, dayOffset, hour);
                const localHour = getZonedParts(utc, city.timezone).hour;
                const displayHour = cityHourFromHomeSlot(homeTz, city.timezone, dayOffset, hour);

                let showDateTag = false;
                if (virtualRow.index > 0) {
                  const prev = timelineSlotFromRowIndex(virtualRow.index - 1);
                  const prevUtc = homeSlotToUtc(homeTz, prev.dayOffset, prev.hour);
                  const prevLocalHour = getZonedParts(prevUtc, city.timezone).hour;
                  showDateTag = prevLocalHour !== null && localHour === 0;
                }

                const biz = businessSlotState(localHour, business);
                const textColor = business
                  ? biz === "offhour"
                    ? "light"
                    : "dark"
                  : defaultSlotTextColor(localHour);

                const highlighted = highlight.day === dayOffset && highlight.hour === hour;
                const rangeClass = getRangeClass(dayOffset, hour, rangeStart, rangeHighlight);

                const slotClass = [
                  styles.slot,
                  !business ? styles.slotDefault : "",
                  showDateTag ? styles.slotWithDate : "",
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
                  rangeClass,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <button
                    key={virtualRow.key}
                    type="button"
                    className={slotClass}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                      ...(!business
                        ? ({ "--slot-local-hour": localHour } as CSSProperties)
                        : {}),
                    }}
                    onClick={() => onCellClick({ dayOffset, hour, utc })}
                    aria-label={`${city.name} ${formatHour(displayHour, timeFormat)}`}
                  >
                    {showDateTag && (
                      <span className={styles.dateTag}>{formatDateHeading(utc, city.timezone, lang)}</span>
                    )}
                    <span className={styles.slotTime}>{formatHour(displayHour, timeFormat)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TimeTable({
  onCellClick,
  scrollToNowToken,
  onNowLineVisibleChange,
  rangeStart,
  rangeHighlight,
}: TimeTableProps) {
  const { state } = useStore();
  const cities = selectVisibleCities(state);
  const home = selectHomeCity(state);
  const homeTz = home?.timezone ?? "UTC";
  const frameScrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const followerSlotsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const xScrollRef = useRef<HTMLDivElement>(null);
  const frameScrollTopRef = useRef(0);
  const scrollTopRafRef = useRef<number | null>(null);
  const didInitialScroll = useRef(false);
  const [now, setNow] = useState(() => new Date());
  const [frameScrollTop, setFrameScrollTop] = useState(0);
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(null);
  const [headingH, setHeadingH] = useState(HEADING_H);

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

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

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
    syncFollowerTransforms(followerSlotsRefs.current, top);
    scheduleScrollTopStateUpdate(top);
  }, [scheduleScrollTopStateUpdate]);

  const getMasterScrollEl = useCallback(() => frameScrollRefs.current[0] ?? null, []);

  const syncMasterScrollPosition = useCallback(
    (top: number) => {
      const master = getMasterScrollEl();
      if (!master) return;
      master.scrollTop = top;
      syncFollowerTransforms(followerSlotsRefs.current, top);
      scheduleScrollTopStateUpdate(top);
    },
    [getMasterScrollEl, scheduleScrollTopStateUpdate],
  );

  useLayoutEffect(() => {
    frameScrollRefs.current.length = cities.length;
    followerSlotsRefs.current.length = cities.length;
    const top = frameScrollRefs.current[0]?.scrollTop ?? frameScrollTopRef.current;
    syncFollowerTransforms(followerSlotsRefs.current, top);
  }, [cityIdsKey, cities.length]);

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
          master.scrollTop = startScrollTop + dy;
          syncFollowerTransforms(followerSlotsRefs.current, master.scrollTop);
          scheduleScrollTopStateUpdate(master.scrollTop);
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
    if (!home || didInitialScroll.current || !scrollElement) return;
    const run = () => {
      const scrollEl = getMasterScrollEl();
      if (!scrollEl || didInitialScroll.current) return;
      const parts = getZonedParts(new Date(), home.timezone);
      scrollToRow(
        scrollEl,
        followerSlotsRefs.current,
        0,
        parts.hour,
        parts.minute / 60,
        "auto",
        scheduleScrollTopStateUpdate,
        commitScrollPosition,
      );
      didInitialScroll.current = true;
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  }, [home?.id, home?.timezone, cities.length, getMasterScrollEl, scrollElement, scheduleScrollTopStateUpdate, commitScrollPosition]);

  useEffect(() => {
    if (!scrollToNowToken || !home) return;
    const scrollEl = getMasterScrollEl();
    if (!scrollEl) return;
    const parts = getZonedParts(new Date(), home.timezone);
    scrollToRow(
      scrollEl,
      followerSlotsRefs.current,
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
      scrollEl,
      followerSlotsRefs.current,
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
    <div className={styles.wrap}>
      <div ref={xScrollRef} className={styles.xScroll}>
        <div className={styles.columns}>
          {cities.map((city, index) => (
            <CityColumn
              key={city.id}
              city={city}
              homeTz={homeTz}
              business={state.settings.businessHoursEnabled}
              timeFormat={state.settings.timeFormat}
              lang="en"
              now={now}
              highlight={{ day: state.ui.highlightDay, hour: state.ui.highlightHour }}
              rangeStart={rangeStart}
              rangeHighlight={rangeHighlight}
              virtualItems={virtualItems}
              totalSize={totalSize}
              onCellClick={onCellClick}
              isMaster={index === 0}
              onMasterScroll={index === 0 ? onMasterScroll : undefined}
              frameScrollRef={(el) => {
                frameScrollRefs.current[index] = el;
                if (index === 0) {
                  setScrollElement(el);
                }
              }}
              slotsRef={
                index === 0
                  ? undefined
                  : (el) => {
                      followerSlotsRefs.current[index] = el;
                      if (el) {
                        const top =
                          frameScrollRefs.current[0]?.scrollTop ?? frameScrollTopRef.current;
                        el.style.transform = `translateY(-${top}px)`;
                      }
                    }
              }
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
