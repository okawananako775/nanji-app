import { addHours } from "date-fns";
import { getZonedParts } from "./timezone";
import { isTimelineDayInRange } from "./timeGrid";

export type TimeSearchTab = "single" | "relative" | "multi";

/** Map a UTC instant to a home-TZ day offset + hour for the timeline grid. */
export function jumpTargetFromUtc(homeTz: string, targetUtc: Date): { day: number; hour: number } {
  const nowParts = getZonedParts(new Date(), homeTz);
  const targetParts = getZonedParts(targetUtc, homeTz);

  const nowDay = new Date(nowParts.year, nowParts.month, nowParts.day);
  const targetDay = new Date(targetParts.year, targetParts.month, targetParts.day);
  const dayDiff = Math.round((targetDay.getTime() - nowDay.getTime()) / 86400000);

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
