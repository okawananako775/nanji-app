/** Pixel height of one hour row in the timeline grid. */
export const SLOT_HEIGHT = 42;

/** Days before/after today included in the virtual scroll range (±180 days). */
export const TIMELINE_HALF_DAYS = 180;

export const TIMELINE_TOTAL_ROWS = (TIMELINE_HALF_DAYS * 2 + 1) * 24;

export function timelineRowIndex(dayOffset: number, hour: number): number {
  return (dayOffset + TIMELINE_HALF_DAYS) * 24 + hour;
}

export function timelineSlotFromRowIndex(rowIndex: number): { dayOffset: number; hour: number } {
  return {
    dayOffset: Math.floor(rowIndex / 24) - TIMELINE_HALF_DAYS,
    hour: rowIndex % 24,
  };
}

export interface SlotRange {
  startDay: number;
  startHour: number;
  endDay: number;
  endHour: number;
}

export function normalizeSlotRange(
  a: { dayOffset: number; hour: number },
  b: { dayOffset: number; hour: number },
): SlotRange {
  const startFlat = timelineRowIndex(a.dayOffset, a.hour);
  const endFlat = timelineRowIndex(b.dayOffset, b.hour);
  if (startFlat <= endFlat) {
    return {
      startDay: a.dayOffset,
      startHour: a.hour,
      endDay: b.dayOffset,
      endHour: b.hour,
    };
  }
  return {
    startDay: b.dayOffset,
    startHour: b.hour,
    endDay: a.dayOffset,
    endHour: a.hour,
  };
}

export function slotFromPointerY(
  scrollEl: HTMLElement,
  clientY: number,
): { dayOffset: number; hour: number } | null {
  const rect = scrollEl.getBoundingClientRect();
  const yInContent = clientY - rect.top + scrollEl.scrollTop;
  const rowIndex = Math.floor(yInContent / SLOT_HEIGHT);
  if (rowIndex < 0 || rowIndex >= TIMELINE_TOTAL_ROWS) return null;
  return timelineSlotFromRowIndex(rowIndex);
}

export function isTimelineDayInRange(dayOffset: number): boolean {
  return dayOffset >= -TIMELINE_HALF_DAYS && dayOffset <= TIMELINE_HALF_DAYS;
}
