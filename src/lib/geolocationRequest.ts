export type GeolocationErrorReason =
  | "unsupported"
  | "insecure"
  | "denied"
  | "timeout"
  | "unavailable"
  | "no_city";

export type GeolocationRequestOptions = {
  /** Total time budget for the whole request (includes permission prompt). */
  overallTimeoutMs?: number;
  maximumAge?: number;
  /** When true, only try cached/low-cost reads and fail fast without watchPosition. */
  cacheOnly?: boolean;
};

type GeolocationListener = {
  onSuccess: PositionCallback;
  onError: (reason: GeolocationErrorReason) => void;
  settled: boolean;
};

let inflightListeners: GeolocationListener[] | null = null;
let attemptSerial = 0;

const DEFAULT_OVERALL_MS = 120_000;
const CACHE_ONLY_OVERALL_MS = 20_000;

export function checkGeolocationSupport(): GeolocationErrorReason | null {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return "unsupported";
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    return "insecure";
  }
  return null;
}

function toReason(err: GeolocationPositionError): GeolocationErrorReason {
  if (err.code === err.PERMISSION_DENIED) return "denied";
  if (err.code === err.TIMEOUT) return "timeout";
  return "unavailable";
}

function deliverSuccess(listeners: GeolocationListener[], pos: GeolocationPosition): void {
  inflightListeners = null;
  listeners.forEach((listener) => {
    if (listener.settled) return;
    listener.settled = true;
    listener.onSuccess(pos);
  });
}

function deliverError(listeners: GeolocationListener[], reason: GeolocationErrorReason): void {
  inflightListeners = null;
  listeners.forEach((listener) => {
    if (listener.settled) return;
    listener.settled = true;
    listener.onError(reason);
  });
}

export function requestGeolocationPosition(
  onSuccess: PositionCallback,
  onError: (reason: GeolocationErrorReason) => void,
  options?: GeolocationRequestOptions,
): void {
  const blocked = checkGeolocationSupport();
  if (blocked) {
    onError(blocked);
    return;
  }

  const listener: GeolocationListener = { onSuccess, onError, settled: false };

  if (inflightListeners) {
    inflightListeners.push(listener);
    return;
  }

  inflightListeners = [listener];
  const listeners = inflightListeners;
  const attempt = ++attemptSerial;

  const cacheOnly = options?.cacheOnly ?? false;
  const overallMs = options?.overallTimeoutMs ?? (cacheOnly ? CACHE_ONLY_OVERALL_MS : DEFAULT_OVERALL_MS);
  const maximumAge = options?.maximumAge ?? 600_000;

  let watchId: number | null = null;
  let overallTimer: ReturnType<typeof setTimeout> | null = null;
  let phase = 0;
  let finished = false;

  const cleanup = () => {
    if (overallTimer !== null) {
      clearTimeout(overallTimer);
      overallTimer = null;
    }
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
  };

  const finishSuccess = (pos: GeolocationPosition) => {
    if (finished || attempt !== attemptSerial || !inflightListeners) return;
    finished = true;
    cleanup();
    if (import.meta.env.DEV) {
      console.log("[locationSync] geolocation success", {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        cacheOnly,
      });
    }
    deliverSuccess(listeners, pos);
  };

  const finishError = (reason: GeolocationErrorReason) => {
    if (finished || attempt !== attemptSerial || !inflightListeners) return;
    finished = true;
    cleanup();
    if (import.meta.env.DEV) {
      console.warn("[locationSync] geolocation failed", reason, { cacheOnly, phase });
    }
    deliverError(listeners, reason);
  };

  const onFail = (err: GeolocationPositionError) => {
    if (finished || attempt !== attemptSerial || !inflightListeners) return;
    const reason = toReason(err);
    if (reason === "denied") {
      finishError("denied");
      return;
    }

    phase += 1;
    runPhase();
  };

  const runPhase = () => {
    if (finished || attempt !== attemptSerial || !inflightListeners) return;

    if (cacheOnly) {
      if (phase === 0) {
        navigator.geolocation.getCurrentPosition(finishSuccess, onFail, {
          enableHighAccuracy: false,
          maximumAge: Number.POSITIVE_INFINITY,
          timeout: overallMs,
        });
        return;
      }
      finishError("timeout");
      return;
    }

    if (phase === 0) {
      navigator.geolocation.getCurrentPosition(finishSuccess, onFail, {
        enableHighAccuracy: false,
        maximumAge,
        timeout: Math.min(20_000, overallMs),
      });
      return;
    }

    if (phase === 1) {
      navigator.geolocation.getCurrentPosition(finishSuccess, onFail, {
        enableHighAccuracy: false,
        maximumAge: Number.POSITIVE_INFINITY,
        timeout: Math.min(60_000, overallMs),
      });
      return;
    }

    if (phase === 2) {
      navigator.geolocation.getCurrentPosition(finishSuccess, onFail, {
        enableHighAccuracy: true,
        maximumAge: 300_000,
        timeout: Math.min(45_000, overallMs),
      });
      return;
    }

    if (phase === 3) {
      watchId = navigator.geolocation.watchPosition(
        finishSuccess,
        (watchErr) => {
          if (finished || attempt !== attemptSerial || !inflightListeners) return;
          if (toReason(watchErr) === "denied") {
            finishError("denied");
          }
        },
        {
          enableHighAccuracy: false,
          maximumAge: Number.POSITIVE_INFINITY,
        },
      );
      return;
    }

    finishError("timeout");
  };

  overallTimer = setTimeout(() => {
    finishError("timeout");
  }, overallMs);

  runPhase();
}

export async function queryGeolocationPermission(): Promise<PermissionState | "unknown"> {
  try {
    if (!navigator.permissions?.query) return "unknown";
    const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
    return status.state;
  } catch {
    return "unknown";
  }
}
