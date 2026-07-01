import type { TFunction } from "i18next";
import type { GeolocationErrorReason } from "./geolocationRequest";

export function geolocationErrorMessage(reason: GeolocationErrorReason, t: TFunction): string {
  switch (reason) {
    case "insecure":
      return t("onboarding.locationInsecure");
    case "denied":
      return t("settings.geoDenied");
    case "timeout":
      return t("onboarding.locationTimeout");
    case "unsupported":
      return t("onboarding.locationUnsupported");
    case "unavailable":
      return t("onboarding.locationUnavailable");
    case "no_city":
      return t("settings.locationNoCity");
    default:
      return t("onboarding.locationUnavailable");
  }
}
