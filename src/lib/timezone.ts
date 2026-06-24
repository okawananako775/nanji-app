import { addDays, addHours, setHours, setMinutes, setSeconds, setMilliseconds, startOfDay } from "date-fns";
import { formatInTimeZone, toZonedTime, fromZonedTime } from "date-fns-tz";

export function safeFormatInTimeZone(
  date: Date,
  timezone: string,
  format: string,
  fallbackTimezone = "UTC",
): string {
  try {
    return formatInTimeZone(date, timezone, format);
  } catch {
    return formatInTimeZone(date, fallbackTimezone, format);
  }
}

export function getZonedParts(date: Date, timezone: string) {
  const zoned = toZonedTime(date, timezone);
  return {
    year: zoned.getFullYear(),
    month: zoned.getMonth(),
    day: zoned.getDate(),
    hour: zoned.getHours(),
    minute: zoned.getMinutes(),
    weekday: zoned.getDay(),
  };
}

export function getUtcOffsetLabel(timezone: string, date = new Date()): string {
  const formatted = formatInTimeZone(date, timezone, "XXX");
  return formatted.replace(":00", "");
}

export function homeSlotToUtc(homeTimezone: string, dayOffset: number, hour: number, minute = 0): Date {
  const now = new Date();
  const homeNow = toZonedTime(now, homeTimezone);
  const dayBase = addDays(startOfDay(homeNow), dayOffset);
  const local = setMilliseconds(setSeconds(setMinutes(setHours(dayBase, hour), minute), 0), 0);
  return fromZonedTime(local, homeTimezone);
}

export function formatHour(hour: number, timeFormat: "24h" | "12h"): string {
  if (timeFormat === "12h") {
    const ap = hour < 12 ? "AM" : "PM";
    return `${hour % 12 || 12}:00 ${ap}`;
  }
  return `${String(hour).padStart(2, "0")}:00`;
}

export function formatClockTime(date: Date, timezone: string, timeFormat: "24h" | "12h"): string {
  if (timeFormat === "12h") return formatInTimeZone(date, timezone, "h:mm a");
  return formatInTimeZone(date, timezone, "HH:mm");
}

export function formatClockTimeParts(
  date: Date,
  timezone: string,
  timeFormat: "24h" | "12h",
): { time: string; period?: string } {
  if (timeFormat === "12h") {
    return {
      time: formatInTimeZone(date, timezone, "h:mm"),
      period: formatInTimeZone(date, timezone, "a"),
    };
  }
  return { time: formatInTimeZone(date, timezone, "HH:mm") };
}

export function formatDateHeading(date: Date, timezone: string, lang: "ja" | "en"): string {
  if (lang === "ja") {
    const w = ["日", "月", "火", "水", "木", "金", "土"][toZonedTime(date, timezone).getDay()];
    const z = toZonedTime(date, timezone);
    return `${z.getFullYear()}/${z.getMonth() + 1}/${z.getDate()}（${w}）`;
  }
  return formatInTimeZone(date, timezone, "EEE, MMM d");
}

export function cityLocalHourAtUtcInstant(utc: Date, timezone: string): number {
  return getZonedParts(utc, timezone).hour;
}

export function cityHourFromHomeSlot(homeTz: string, targetTz: string, dayOffset: number, homeHour: number): number {
  const utc = homeSlotToUtc(homeTz, dayOffset, homeHour);
  return cityLocalHourAtUtcInstant(utc, targetTz);
}
