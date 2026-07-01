import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import type { City } from "../store/types";
import { formatClockTime } from "./timezone";

function weekdayJa(date: Date, timezone: string): string {
  return ["日", "月", "火", "水", "木", "金", "土"][toZonedTime(date, timezone).getDay()];
}

function formatDateShort(date: Date, timezone: string, lang: "ja" | "en"): string {
  if (lang === "ja") {
    const w = weekdayJa(date, timezone);
    const z = formatInTimeZone(date, timezone, "yyyy/M/d");
    return `${z}（${w}）`;
  }
  return formatInTimeZone(date, timezone, "EEE, MMM d");
}

function formatCityInstant(city: City, utc: Date, lang: "ja" | "en", timeFormat: "24h" | "12h"): string {
  const tz = city.timezone;
  if (lang === "ja") {
    const w = weekdayJa(utc, tz);
    const date = formatInTimeZone(utc, tz, "yyyy年M月d日");
    const time = formatClockTime(utc, tz, timeFormat);
    const abbr = formatInTimeZone(utc, tz, "zzz");
    return `${city.countryFlag} ${city.nameJa}：${date}（${w}）${time} ${abbr}`;
  }
  const date = formatInTimeZone(utc, tz, "EEEE, MMMM d, yyyy");
  const time = formatClockTime(utc, tz, timeFormat);
  const abbr = formatInTimeZone(utc, tz, "zzz");
  return `${city.countryFlag} ${city.name}: ${date}, ${time} ${abbr}`;
}

function formatCityRange(
  city: City,
  startUtc: Date,
  endUtc: Date,
  lang: "ja" | "en",
  timeFormat: "24h" | "12h",
): string {
  const tz = city.timezone;
  const startDateKey = formatInTimeZone(startUtc, tz, "yyyy-MM-dd");
  const endDateKey = formatInTimeZone(endUtc, tz, "yyyy-MM-dd");
  const startTime = formatClockTime(startUtc, tz, timeFormat);
  const endTime = formatClockTime(endUtc, tz, timeFormat);
  const name = lang === "ja" ? city.nameJa : city.name;

  if (startDateKey === endDateKey) {
    const date = formatDateShort(startUtc, tz, lang);
    if (lang === "ja") {
      return `${city.countryFlag} ${name}：${date} ${startTime}〜${endTime}`;
    }
    return `${city.countryFlag} ${name}: ${date}, ${startTime} – ${endTime}`;
  }

  const startDate = formatDateShort(startUtc, tz, lang);
  const endDate = formatDateShort(endUtc, tz, lang);
  if (lang === "ja") {
    return `${city.countryFlag} ${name}：${startDate} ${startTime}〜${endDate} ${endTime}`;
  }
  return `${city.countryFlag} ${name}: ${startDate}, ${startTime} – ${endDate}, ${endTime}`;
}

export function formatCopyLines(
  cities: City[],
  utc: Date,
  lang: "ja" | "en",
  timeFormat: "24h" | "12h" = "24h",
): string {
  return cities.map((city) => formatCityInstant(city, utc, lang, timeFormat)).join("\n");
}

export function formatCopyLinesRange(
  cities: City[],
  startUtc: Date,
  endUtc: Date,
  lang: "ja" | "en",
  timeFormat: "24h" | "12h",
): string {
  return cities.map((city) => formatCityRange(city, startUtc, endUtc, lang, timeFormat)).join("\n");
}
