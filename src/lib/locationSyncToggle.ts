import { catalogToCity, CITY_CATALOG } from "./cities";
import { checkGeolocationSupport, requestGeolocationPosition, type GeolocationErrorReason } from "./geolocationRequest";
import { applyHomeCityFromPosition } from "./applyHomeCityFromPosition";
import type { LocationSyncCallbacks } from "./locationSync";
import type { Action } from "../store/reducer";
import type { AppState } from "../store/types";

export function setHomeCityFromCatalog(
  dispatch: (action: Action) => void,
  state: AppState,
  cityId: string,
  options?: { disableLocationSync?: boolean },
): boolean {
  const existing = state.cities.byId[cityId];
  const entry = existing ?? CITY_CATALOG.find((c) => c.id === cityId);
  if (!entry) return false;

  const city = existing ?? catalogToCity(entry, true, state.cities.allIds.length);
  dispatch({
    type: "SET_HOME_CITY",
    payload: { city: { ...(state.cities.byId[cityId] ?? city), isHome: true } },
  });
  if (options?.disableLocationSync !== false && state.settings.locationSyncEnabled) {
    dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: false } });
  }
  return true;
}

export function toggleLocationSync(
  dispatch: (action: Action) => void,
  state: AppState,
  enabled: boolean,
  callbacks?: LocationSyncCallbacks & {
    onFetching?: () => void;
    onDetected?: (cityName: string) => void;
  },
): void {
  if (!enabled) {
    dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: false } });
    return;
  }

  const blocked = checkGeolocationSupport();
  if (blocked) {
    if (import.meta.env.DEV) {
      console.warn("[locationSync] blocked before request", blocked);
    }
    callbacks?.onError?.(blocked);
    return;
  }

  dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: true } });
  callbacks?.onFetching?.();
  let resolved = false;
  requestGeolocationPosition(
    (pos) => {
      if (import.meta.env.DEV) {
        console.log("[locationSync] position", {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      }
      const entry = applyHomeCityFromPosition(dispatch, pos);
      if (import.meta.env.DEV) {
        console.log("[locationSync] resolved entry", entry?.id ?? null);
      }
      if (!entry) {
        dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: false } });
        callbacks?.onNoCity?.();
        return;
      }
      resolved = true;
      callbacks?.onDetected?.(entry.name);
    },
    (reason) => {
      if (resolved) {
        if (import.meta.env.DEV) {
          console.warn("[locationSync] ignored stale error after success", reason);
        }
        return;
      }
      if (import.meta.env.DEV) {
        console.warn("[locationSync] getCurrentPosition failed", reason);
      }
      dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: false } });
      callbacks?.onError?.(reason);
    },
    { overallTimeoutMs: 60_000 },
  );
}
