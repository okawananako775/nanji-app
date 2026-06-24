import { applyHomeCityFromPosition } from "./applyHomeCityFromPosition";
import { checkGeolocationSupport, requestGeolocationPosition, type GeolocationErrorReason } from "./geolocationRequest";
import type { AppState } from "../store/types";
import type { Action } from "../store/reducer";

export type LocationSyncCallbacks = {
  onError?: (reason: GeolocationErrorReason) => void;
  onNoCity?: () => void;
};

export function applyLocationSync(
  dispatch: (action: Action) => void,
  state: AppState,
  callbacks: LocationSyncCallbacks,
): void {
  if (!state.settings.locationSyncEnabled || checkGeolocationSupport()) return;

  requestGeolocationPosition(
    (pos) => {
      const entry = applyHomeCityFromPosition(dispatch, pos);
      if (!entry) callbacks.onNoCity?.();
    },
    (reason) => callbacks.onError?.(reason),
    { cacheOnly: true, maximumAge: 600_000 },
  );
}
