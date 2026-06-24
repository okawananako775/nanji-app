import { catalogToCity } from "./cities";
import { resolveHomeCityFromCoords } from "./geolocation";
import type { CityCatalogEntry } from "../store/types";
import type { Action } from "../store/reducer";

export function applyHomeCityFromPosition(
  dispatch: (action: Action) => void,
  pos: GeolocationPosition,
): CityCatalogEntry | null {
  const { entry, timezone } = resolveHomeCityFromCoords(pos.coords.latitude, pos.coords.longitude);
  if (import.meta.env.DEV) {
    console.log("[locationSync] timezone lookup", { timezone, entryId: entry?.id ?? null });
  }
  if (!entry) return null;

  const city = catalogToCity(entry, true, 0);
  dispatch({ type: "SET_HOME_CITY", payload: { city } });
  return entry;
}
