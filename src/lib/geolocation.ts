import tzlookup from "tz-lookup";
import { CITY_CATALOG } from "./cities";
import type { CityCatalogEntry } from "../store/types";

export function timezoneFromCoords(lat: number, lng: number): string {
  try {
    return tzlookup(lat, lng);
  } catch {
    return "UTC";
  }
}

/** Prefer canonical catalog entry whose id matches the IANA timezone (e.g. Asia/Tokyo). */
export function findCatalogByTimezone(tz: string): CityCatalogEntry | undefined {
  const canonical = CITY_CATALOG.find((c) => c.id === tz);
  if (canonical) return canonical;
  return CITY_CATALOG.find((c) => c.timezone === tz);
}

export function resolveHomeCityFromCoords(lat: number, lng: number): {
  entry: CityCatalogEntry | null;
  timezone: string;
} {
  const timezone = timezoneFromCoords(lat, lng);
  const entry = timezone === "UTC" ? null : (findCatalogByTimezone(timezone) ?? null);
  return { entry, timezone };
}
