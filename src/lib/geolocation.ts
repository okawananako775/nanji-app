import tzlookup from "tz-lookup";
import { CITY_CATALOG } from "./cities";
import { getCityCoordinate } from "./cityCoordinates";
import { haversineKm } from "./geoDistance";
import type { CityCatalogEntry } from "../store/types";

/** Map deprecated or tz-lookup-specific IANA names to catalog timezones. */
const TIMEZONE_ALIASES: Record<string, string> = {
  "America/Argentina/Buenos_Aires": "America/Buenos_Aires",
  "America/Argentina/Catamarca": "America/Argentina/Cordoba",
  "Europe/Kiev": "Europe/Kyiv",
};

export function timezoneFromCoords(lat: number, lng: number): string {
  try {
    return tzlookup(lat, lng);
  } catch {
    return "UTC";
  }
}

function timezoneLookupKeys(tz: string): string[] {
  const alias = TIMEZONE_ALIASES[tz];
  return alias && alias !== tz ? [tz, alias] : [tz];
}

function catalogMatchesTimezone(entry: CityCatalogEntry, keys: string[]): boolean {
  return keys.some((key) => entry.id === key || entry.timezone === key);
}

function catalogCandidatesForTimezone(tz: string): CityCatalogEntry[] {
  const keys = timezoneLookupKeys(tz);
  return CITY_CATALOG.filter((entry) => catalogMatchesTimezone(entry, keys));
}

/**
 * Resolve a catalog city for an IANA timezone from geolocation.
 * Matches by city id (e.g. Africa/Bamako) even when the stored timezone differs,
 * then by timezone field, preferring canonical ids that equal the IANA name.
 */
export function findCatalogByTimezone(tz: string): CityCatalogEntry | undefined {
  for (const key of timezoneLookupKeys(tz)) {
    const byId = CITY_CATALOG.find((c) => c.id === key);
    if (byId) return byId;
  }

  for (const key of timezoneLookupKeys(tz)) {
    const canonical = CITY_CATALOG.find((c) => c.id === key && c.timezone === key);
    if (canonical) return canonical;
  }

  for (const key of timezoneLookupKeys(tz)) {
    const byTz = CITY_CATALOG.find((c) => c.timezone === key);
    if (byTz) return byTz;
  }

  return undefined;
}

/** Pick the nearest catalog city within the same IANA timezone as the device location. */
export function findCatalogByCoords(lat: number, lng: number, tz: string): CityCatalogEntry | undefined {
  const candidates = catalogCandidatesForTimezone(tz);
  if (candidates.length === 0) return findCatalogByTimezone(tz);

  let nearest: CityCatalogEntry | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const entry of candidates) {
    const coordinate = getCityCoordinate(entry.id);
    if (!coordinate) continue;
    const distance = haversineKm(lat, lng, coordinate.lat, coordinate.lng);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearest = entry;
    }
  }

  return nearest ?? findCatalogByTimezone(tz);
}

export function resolveHomeCityFromCoords(lat: number, lng: number): {
  entry: CityCatalogEntry | null;
  timezone: string;
} {
  const timezone = timezoneFromCoords(lat, lng);
  const entry =
    timezone === "UTC" ? null : (findCatalogByCoords(lat, lng, timezone) ?? null);
  return { entry, timezone };
}
