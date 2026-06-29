import type Holidays from "date-holidays";
import { COUNTRY_HOLIDAY_CODES } from "./countryHolidayCodes";
import { getZonedParts } from "./timezone";

type HolidaysConstructor = typeof Holidays;

let HolidaysClass: HolidaysConstructor | null = null;
let holidaysLoadStarted = false;
const holidayInstances = new Map<string, Holidays>();
const nonBusinessDayCache = new Map<string, boolean>();
const readyListeners = new Set<() => void>();

function notifyReadyListeners(): void {
  for (const listener of readyListeners) listener();
  readyListeners.clear();
}

function getHolidayInstance(countryCode: string, timezone: string): Holidays | null {
  if (!HolidaysClass) return null;

  const key = `${countryCode}:${timezone}`;
  const existing = holidayInstances.get(key);
  if (existing) return existing;

  const instance = new HolidaysClass(countryCode);
  instance.setTimezone(timezone);
  holidayInstances.set(key, instance);
  return instance;
}

function isPublicHoliday(countryCode: string, timezone: string, utc: Date): boolean {
  const holidays = getHolidayInstance(countryCode, timezone)?.isHoliday(utc);
  if (!holidays) return false;
  return holidays.some((entry) => entry.type === "public");
}

function cacheKey(countryCode: string, timezone: string, year: number, month: number, day: number): string {
  return `${countryCode}:${timezone}:${year}-${month + 1}-${day}`;
}

/** Loads holiday data asynchronously when Business mode is enabled. */
export function preloadHolidayLibrary(onReady?: () => void): void {
  if (onReady) readyListeners.add(onReady);
  if (HolidaysClass) {
    notifyReadyListeners();
    return;
  }
  if (holidaysLoadStarted) return;
  holidaysLoadStarted = true;

  void import("date-holidays")
    .then((module) => {
      HolidaysClass = module.default;
      nonBusinessDayCache.clear();
      holidayInstances.clear();
      notifyReadyListeners();
    })
    .catch(() => {
      holidaysLoadStarted = false;
      readyListeners.clear();
    });
}

export function isNonBusinessDay(utc: Date, timezone: string, country: string): boolean {
  const { weekday, year, month, day } = getZonedParts(utc, timezone);
  if (weekday === 0 || weekday === 6) return true;

  const countryCode = COUNTRY_HOLIDAY_CODES[country];
  if (!countryCode) return false;
  if (!HolidaysClass) {
    preloadHolidayLibrary();
    return false;
  }

  const key = cacheKey(countryCode, timezone, year, month, day);
  const cached = nonBusinessDayCache.get(key);
  if (cached !== undefined) return cached;

  const result = isPublicHoliday(countryCode, timezone, utc);
  nonBusinessDayCache.set(key, result);
  return result;
}
