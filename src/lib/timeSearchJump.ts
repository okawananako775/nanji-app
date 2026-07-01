import { addDays, addHours } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { TIMELINE_HALF_DAYS, isTimelineDayInRange } from "./timeGrid";
import { getZonedParts, safeFormatInTimeZone } from "./timezone";

/** Max hours for relative time search (= timeline half-range). */
export const TIMELINE_MAX_RELATIVE_HOURS = TIMELINE_HALF_DAYS * 24;

function calendarDayDiffInTimezone(timezone: string, from: Date, to: Date): number {
  const toUtcDay = (date: Date) => {
    const [y, m, d] = formatInTimeZone(date, timezone, "yyyy-MM-dd").split("-").map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((toUtcDay(to) - toUtcDay(from)) / 86_400_000);
}

export function getTimelineDateBounds(
  timezone: string,
  anchor = new Date(),
): { minDate: string; maxDate: string } {
  return {
    minDate: safeFormatInTimeZone(addDays(anchor, -TIMELINE_HALF_DAYS), timezone, "yyyy-MM-dd"),
    maxDate: safeFormatInTimeZone(addDays(anchor, TIMELINE_HALF_DAYS), timezone, "yyyy-MM-dd"),
  };
}

export type TimeSearchTab = "single" | "relative" | "multi";

/** Map a UTC instant to a home-TZ day offset + hour for the timeline grid. */
export function jumpTargetFromUtc(homeTz: string, targetUtc: Date): { day: number; hour: number } {
  const dayDiff = calendarDayDiffInTimezone(homeTz, new Date(), targetUtc);
  const targetParts = getZonedParts(targetUtc, homeTz);

  return {
    day: dayDiff,
    hour: targetParts.hour,
  };
}

export function jumpTargetRelative(homeTz: string, hours: number, direction: "after" | "before"): {
  day: number;
  hour: number;
} {
  const delta = direction === "after" ? hours : -hours;
  return jumpTargetFromUtc(homeTz, addHours(new Date(), delta));
}

export function isJumpTargetInTimelineRange(dayOffset: number): boolean {
  return isTimelineDayInRange(dayOffset);
}

export function clampDateInput(value: string, min: string, max: string): string {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}
