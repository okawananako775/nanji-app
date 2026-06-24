import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { applyHomeCityFromPosition } from "../../lib/applyHomeCityFromPosition";
import {
  queryGeolocationPermission,
  requestGeolocationPosition,
  type GeolocationErrorReason,
} from "../../lib/geolocationRequest";
import { useStore } from "../../store/StoreContext";
import { OnboardingIllustration, type OnboardingIllustrationId } from "./OnboardingIllustrations";
import styles from "./OnboardingPage.module.css";

const TOUR_SLIDE_COUNT = 4;

const TOUR_ILLUSTRATIONS: OnboardingIllustrationId[] = ["tour1", "tour2", "tour3", "tour4"];

export function OnboardingPage() {
  const { t } = useTranslation();
  const { state, dispatch } = useStore();
  const [phase, setPhase] = useState<"location" | "tour">(() =>
    state.settings.replayTour ? "tour" : "location",
  );
  const [slide, setSlide] = useState(0);
  const [locationRequesting, setLocationRequesting] = useState(false);
  const [locationError, setLocationError] = useState<GeolocationErrorReason | null>(null);
  const [locationDetected, setLocationDetected] = useState<string | null>(null);
  const [permissionHint, setPermissionHint] = useState<PermissionState | "unknown">("unknown");

  useEffect(() => {
    void queryGeolocationPermission().then(setPermissionHint);
    if (state.settings.replayTour) {
      dispatch({ type: "UPDATE_SETTINGS", payload: { replayTour: false } });
    }
  }, []);

  useEffect(() => {
    if (!locationRequesting) return;
    const updatePermission = () => {
      void queryGeolocationPermission().then(setPermissionHint);
    };
    updatePermission();
    const id = window.setInterval(updatePermission, 500);
    return () => window.clearInterval(id);
  }, [locationRequesting]);

  const finish = () => {
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { onboardingCompleted: true, tourCompleted: true },
    });
  };

  const applyDetectedLocation = (pos: GeolocationPosition) => {
    const entry = applyHomeCityFromPosition(dispatch, pos);
    if (!entry) {
      setLocationRequesting(false);
      setLocationError("no_city");
      dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: false } });
      return;
    }

    const label = entry.name;
    setLocationDetected(label);
    dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: true } });
    setLocationRequesting(false);
    setLocationError(null);
    setPhase("tour");
  };

  const enableLocation = () => {
    setLocationError(null);
    setLocationDetected(null);
    setLocationRequesting(true);

    let resolved = false;
    requestGeolocationPosition(
      (pos) => {
        resolved = true;
        applyDetectedLocation(pos);
      },
      (reason) => {
        if (resolved) return;
        setLocationRequesting(false);
        setLocationError(reason);
        dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: false } });
        void queryGeolocationPermission().then(setPermissionHint);
      },
      { overallTimeoutMs: 60_000 },
    );
  };

  const skipLocation = () => {
    dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: false } });
    setLocationRequesting(false);
    setLocationError(null);
    setLocationDetected(null);
    setPhase("tour");
  };

  const locationErrorMessage = (reason: GeolocationErrorReason) => {
    switch (reason) {
      case "insecure":
        return t("onboarding.locationInsecure");
      case "denied":
        return t("onboarding.locationDenied");
      case "timeout":
        return t("onboarding.locationTimeout");
      case "unsupported":
        return t("onboarding.locationUnsupported");
      case "no_city":
        return t("onboarding.locationNoCity");
      default:
        return t("onboarding.locationUnavailable");
    }
  };

  const nextSlide = () => {
    if (slide >= TOUR_SLIDE_COUNT - 1) {
      finish();
      return;
    }
    setSlide((s) => s + 1);
  };

  if (phase === "location") {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.illustrationWrap} aria-hidden={false}>
            <OnboardingIllustration id="location" title={t("onboarding.locationIllustrationAlt")} />
          </div>
          <div className={styles.copyBlock}>
            <h1 className={styles.title}>{t("onboarding.locationTitle")}</h1>
            <p className={styles.body}>{t("onboarding.locationBody")}</p>
          </div>
          {permissionHint === "denied" && !locationError && (
            <p className={styles.locationHint} role="status">
              {t("onboarding.locationDeniedHint")}
            </p>
          )}
          {locationError && (
            <p className={styles.locationError} role="alert">
              {locationErrorMessage(locationError)}
            </p>
          )}
          {locationRequesting && permissionHint === "granted" && (
            <p className={styles.locationHint} role="status">
              {t("onboarding.locationRequestingHint")}
            </p>
          )}
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={enableLocation}
              disabled={locationRequesting}
            >
              {locationRequesting ? t("onboarding.locationRequesting") : t("onboarding.allowLocation")}
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={skipLocation} disabled={locationRequesting}>
              {t("onboarding.skipLocation")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tourSlides = [
    { title: t("onboarding.tour1Title"), body: t("onboarding.tour1Body"), alt: t("onboarding.tour1IllustrationAlt") },
    { title: t("onboarding.tour2Title"), body: t("onboarding.tour2Body"), alt: t("onboarding.tour2IllustrationAlt") },
    { title: t("onboarding.tour3Title"), body: t("onboarding.tour3Body"), alt: t("onboarding.tour3IllustrationAlt") },
    { title: t("onboarding.tour4Title"), body: t("onboarding.tour4Body"), alt: t("onboarding.tour4IllustrationAlt") },
  ];
  const currentSlide = tourSlides[slide]!;
  const illustrationId = TOUR_ILLUSTRATIONS[slide]!;

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.illustrationWrap} key={illustrationId}>
          <OnboardingIllustration id={illustrationId} title={currentSlide.alt} />
        </div>
        {locationDetected && slide === 0 && (
          <p className={styles.locationSuccess} role="status">
            {t("onboarding.locationDetected", { city: locationDetected })}
          </p>
        )}
        <div className={styles.copyBlock}>
          <h1 className={styles.title}>{currentSlide.title}</h1>
          <p className={styles.body}>{currentSlide.body}</p>
        </div>
        <div className={styles.dots}>
          {tourSlides.map((_, i) => (
            <span key={i} className={`${styles.dot} ${i === slide ? styles.dotActive : ""}`} />
          ))}
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.primaryBtn} onClick={nextSlide}>
            {slide >= tourSlides.length - 1 ? t("onboarding.start") : t("onboarding.next")}
          </button>
          <button type="button" className={styles.textBtn} onClick={finish}>
            {t("onboarding.skipTour")}
          </button>
        </div>
      </div>
    </div>
  );
}
