import { applyHomeCityFromPosition } from "./applyHomeCityFromPosition";
import { checkGeolocationSupport, requestGeolocationPosition, type GeolocationErrorReason } from "./geolocationRequest";
import type { Action } from "../store/reducer";

export type LocationSyncCallbacks = {
  onError?: (reason: GeolocationErrorReason) => void;
  onNoCity?: () => void;
};

export type LocationSyncOptions = {
  /** When true, use cached browser position only (fast, no GPS refresh). */
  cacheOnly?: boolean;
};

export function applyLocationSync(
  dispatch: (action: Action) => void,
  callbacks: LocationSyncCallbacks,
  options: LocationSyncOptions = {},
): void {
  if (checkGeolocationSupport()) return;

  const cacheOnly = options.cacheOnly ?? true;

  requestGeolocationPosition(
    (pos) => {
      const entry = applyHomeCityFromPosition(dispatch, pos);
      if (!entry) callbacks.onNoCity?.();
    },
    (reason) => callbacks.onError?.(reason),
    cacheOnly
      ? { cacheOnly: true, maximumAge: 600_000 }
      : { maximumAge: 60_000 },
  );
}
