import { formatInTimeZone } from "date-fns-tz";
import catalog from "../data/citiesCatalog.json";
import type { City, CityCatalogEntry } from "../store/types";
import type { AppLanguage } from "./appLanguage";
import { getUtcOffsetLabel } from "./timezone";

export const CITY_CATALOG = catalog as CityCatalogEntry[];

export function getCityDisplayName(
  city: Pick<CityCatalogEntry, "name" | "nameJa">,
  lang: AppLanguage,
): string {
  return lang === "ja" ? city.nameJa : city.name;
}

export function formatCityLabel(
  city: Pick<CityCatalogEntry, "countryFlag" | "name" | "nameJa">,
  lang: AppLanguage,
): string {
  return `${city.countryFlag} ${getCityDisplayName(city, lang)}`;
}

export function searchCities(query: string): CityCatalogEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return CITY_CATALOG.slice(0, 12);
  return CITY_CATALOG.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.nameJa.includes(query.trim()) ||
      c.country.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q),
  ).slice(0, 40);
}

export function catalogToCity(entry: CityCatalogEntry, isHome = false, order = 0): City {
  return { ...entry, isHome, label: null, order };
}

function levenshtein(a: string, b: string): number {
  const rows = b.length + 1;
  const cols = a.length + 1;
  const matrix = Array.from({ length: rows }, () => Array<number>(cols).fill(0));
  for (let i = 0; i < rows; i++) matrix[i][0] = i;
  for (let j = 0; j < cols; j++) matrix[0][j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = b[i - 1] === a[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost,
      );
    }
  }
  return matrix[rows - 1][cols - 1];
}

export function getTimezoneOffsetMinutes(timezone: string, date = new Date()): number {
  const formatted = formatInTimeZone(date, timezone, "xxx");
  const match = formatted.match(/([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;
  const sign = match[1] === "+" ? 1 : -1;
  return sign * (Number(match[2]) * 60 + Number(match[3]));
}

function findReferenceCity(query: string): CityCatalogEntry | null {
  const trimmed = query.trim();
  if (!trimmed) return null;

  const q = trimmed.toLowerCase();
  let best: { city: CityCatalogEntry; score: number } | null = null;
  for (const city of CITY_CATALOG) {
    const scores = [levenshtein(q, city.name.toLowerCase()), levenshtein(trimmed, city.nameJa)];
    const score = Math.min(...scores);
    if (score <= 3 && (!best || score < best.score)) {
      best = { city, score };
    }
  }
  if (best) return best.city;

  const upper = trimmed.toUpperCase();
  return (
    CITY_CATALOG.find((city) => getUtcOffsetLabel(city.timezone).toUpperCase().includes(upper)) ?? null
  );
}

export function suggestSameOffsetCities(
  query: string,
  excludeIds: Set<string>,
  limit = 8,
): CityCatalogEntry[] {
  const reference = findReferenceCity(query);
  if (!reference) return [];

  const offset = getTimezoneOffsetMinutes(reference.timezone);
  return CITY_CATALOG.filter(
    (city) =>
      !excludeIds.has(city.id) &&
      city.id !== reference.id &&
      getTimezoneOffsetMinutes(city.timezone) === offset,
  ).slice(0, limit);
}

export const POPULAR_CITY_IDS = [
  "Asia/Tokyo",
  "America/Vancouver",
  "America/New_York",
  "Europe/London",
  "Europe/Amsterdam",
  "Australia/Sydney",
];
