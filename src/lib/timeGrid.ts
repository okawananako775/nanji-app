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

export function isTimelineDayInRange(dayOffset: number): boolean {
  return dayOffset >= -TIMELINE_HALF_DAYS && dayOffset <= TIMELINE_HALF_DAYS;
}
