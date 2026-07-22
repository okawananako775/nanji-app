import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Snackbar } from "../../components/Snackbar";
import type { DateCandidate } from "../../lib/multiCandidateSearch";
import { applyLocationSync, type LocationSyncCallbacks } from "../../lib/locationSync";
import {
  dateCandidateToSlotRange,
  slotRangeToDateCandidate,
} from "../../lib/rangeSelectionSync";
import { normalizeSlotRange, type SelectedTimeRange } from "../../lib/timeGrid";
import { useStore } from "../../store/StoreContext";
import { selectDisplayCities, selectHomeCity } from "../../store/selectors";
import type { City } from "../../store/types";
import { ContextualGuide } from "./ContextualGuide";
import { SettingsModal } from "../settings/SettingsModal";
import { HomeCityModal } from "../settings/HomeCityModal";
import { CitySearchModal } from "../city-search/CitySearchModal";
import { GroupEditorModal } from "../groups/GroupEditorModal";
import { BottomBar } from "./BottomBar";
import { NavBar } from "./NavBar";
import { TagBar } from "./TagBar";
import { TimelineSidePanel } from "./TimelineSidePanel";
import { TimelineSideTabs } from "./TimelineSideTabs";
import { TimeTable } from "./TimeTable";
import styles from "./HomePage.module.css";

interface HomeLocationState {
  openSettings?: boolean;
}

function candidatesToSelectedRanges(
  baseTimezone: string,
  candidates: DateCandidate[],
): SelectedTimeRange[] {
  return candidates.flatMap((candidate, index) => {
    const range = dateCandidateToSlotRange(baseTimezone, candidate);
    if (!range) return [];
    return [{ id: candidate.id, index: index + 1, range }];
  });
}

export function HomePage() {
  const { state, dispatch, storageReset, clearStorageReset } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [snack, setSnack] = useState<string | null>(null);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [homeCityOpen, setHomeCityOpen] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [groupEditorOpen, setGroupEditorOpen] = useState(false);
  const [groupEditId, setGroupEditId] = useState<string | null>(null);
  const [scrollToNowToken, setScrollToNowToken] = useState(0);
  const [showBackToNow, setShowBackToNow] = useState(false);
  const [pendingRangeStart, setPendingRangeStart] = useState<{ dayOffset: number; hour: number } | null>(
    null,
  );
  const [candidates, setCandidates] = useState<DateCandidate[]>([]);
  const [rangeSelectionOpen, setRangeSelectionOpen] = useState(false);
  const [rangeBaseTimezone, setRangeBaseTimezone] = useState("UTC");
  const [isMobileGuide, setIsMobileGuide] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const saveGroupBtnRef = useRef<HTMLButtonElement>(null);
  const convertTabRef = useRef<HTMLButtonElement>(null);
  const jumpTabRef = useRef<HTMLButtonElement>(null);

  const home = selectHomeCity(state);
  const homeTimezone = home?.timezone ?? "UTC";
  const displayCities = selectDisplayCities(state);
  const guideStep = state.settings.contextualGuideStep;
  const sidePanelOpen = rangeSelectionOpen || jumpOpen;
  const sidePanelTab = rangeSelectionOpen ? "convert" : jumpOpen ? "jump" : null;

  useEffect(() => {
    if (home) {
      setRangeBaseTimezone(home.timezone);
    }
  }, [home?.id, home?.timezone]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const sync = () => setIsMobileGuide(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!state.settings.onboardingCompleted) return;
    if (guideStep !== 0) return;
    if (displayCities.length >= 2) {
      dispatch({ type: "UPDATE_SETTINGS", payload: { contextualGuideStep: 1 } });
    }
  }, [state.settings.onboardingCompleted, guideStep, displayCities.length, dispatch]);

  const selectedRanges = useMemo(
    () => candidatesToSelectedRanges(rangeBaseTimezone, candidates),
    [rangeBaseTimezone, candidates],
  );

  const locationSyncEnabledRef = useRef(state.settings.locationSyncEnabled);
  locationSyncEnabledRef.current = state.settings.locationSyncEnabled;

  const locationSyncCallbacks = useCallback((): LocationSyncCallbacks => ({
      onError: (reason) => {
        if (import.meta.env.DEV && reason !== "timeout") {
          console.warn("[locationSync] background sync failed", reason);
        }
        if (reason === "denied" || reason === "insecure" || reason === "unsupported") {
          dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: false } });
        }
      },
      onNoCity: () => {
        dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: false } });
        setSnack(t("settings.locationNoCity"));
      },
    }),
    [dispatch, t],
  );

  useEffect(() => {
    if (!state.settings.locationSyncEnabled) return;
    applyLocationSync(dispatch, locationSyncCallbacks(), { cacheOnly: true });
  }, [dispatch, locationSyncCallbacks, state.settings.locationSyncEnabled]);

  useEffect(() => {
    if (!state.settings.locationSyncEnabled) return;

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible" || !locationSyncEnabledRef.current) return;
      applyLocationSync(dispatch, locationSyncCallbacks(), { cacheOnly: false });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [dispatch, locationSyncCallbacks, state.settings.locationSyncEnabled]);

  useEffect(() => {
    if (storageReset) {
      setSnack(t("settings.resetToast"));
      clearStorageReset();
    }
  }, [storageReset, clearStorageReset, t]);

  useEffect(() => {
    if (state.ui.highlightHour === null) return;
    const id = setTimeout(() => {
      dispatch({ type: "SET_HIGHLIGHT", payload: { day: null, hour: null } });
    }, 3000);
    return () => clearTimeout(id);
  }, [state.ui.highlightHour, state.ui.highlightDay, dispatch]);

  useEffect(() => {
    if (!state.ui.pulseCityId) return;
    const id = setTimeout(() => {
      dispatch({ type: "SET_PULSE_CITY", payload: { cityId: null } });
    }, 2400);
    return () => clearTimeout(id);
  }, [state.ui.pulseCityId, dispatch]);

  useEffect(() => {
    const routeState = location.state as HomeLocationState | null;
    if (routeState?.openSettings) {
      setSettingsOpen(true);
      navigate("/", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  const handleRangeBaseCityChange = useCallback((city: City) => {
    setRangeBaseTimezone(city.timezone);
  }, []);

  const closeRangeSelection = useCallback(() => {
    setRangeSelectionOpen(false);
    setPendingRangeStart(null);
    setCandidates([]);
    if (home) {
      setRangeBaseTimezone(home.timezone);
    }
  }, [home]);

  // Convert を閉じたときだけ候補をリセット。Jump の閉じる／Apply では消さない（統合前と同じ）。
  const closeSidePanel = useCallback(() => {
    if (rangeSelectionOpen) {
      closeRangeSelection();
      return;
    }
    setJumpOpen(false);
  }, [rangeSelectionOpen, closeRangeSelection]);

  const toggleRangeSelection = useCallback(() => {
    if (rangeSelectionOpen) {
      closeRangeSelection();
      return;
    }
    setJumpOpen(false);
    setRangeSelectionOpen(true);
  }, [rangeSelectionOpen, closeRangeSelection]);

  const toggleJump = useCallback(() => {
    if (jumpOpen) {
      setJumpOpen(false);
      return;
    }
    setRangeSelectionOpen(false);
    setJumpOpen(true);
  }, [jumpOpen]);

  const onSlotTap = useCallback(
    (slot: { dayOffset: number; hour: number }) => {
      if (!pendingRangeStart) {
        setPendingRangeStart(slot);
        setJumpOpen(false);
        setRangeSelectionOpen(true);
        return;
      }

      const range = normalizeSlotRange(pendingRangeStart, slot);
      setCandidates((prev) => [...prev, slotRangeToDateCandidate(homeTimezone, range)]);
      setPendingRangeStart(null);
      setJumpOpen(false);
      setRangeSelectionOpen(true);
    },
    [pendingRangeStart, homeTimezone],
  );

  const openHomeCitySettings = useCallback(() => {
    setSettingsOpen(false);
    setHomeCityOpen(true);
  }, []);

  const onHomeCityChanged = useCallback(
    (cityName: string) => {
      setSnack(t("settings.homeChanged", { city: cityName }));
    },
    [t],
  );

  const dismissGuide = useCallback(() => {
    if (guideStep === 1) {
      dispatch({ type: "UPDATE_SETTINGS", payload: { contextualGuideStep: 2 } });
      return;
    }
    if (guideStep === 2) {
      dispatch({ type: "UPDATE_SETTINGS", payload: { contextualGuideStep: 3 } });
      return;
    }
    if (guideStep === 3) {
      dispatch({ type: "UPDATE_SETTINGS", payload: { contextualGuideStep: 4 } });
    }
  }, [guideStep, dispatch]);

  const guideConfig = useMemo(() => {
    if (!state.settings.onboardingCompleted) return null;
    if (guideStep < 1 || guideStep > 3) return null;
    if (sidePanelOpen) return null;

    if (guideStep === 1) {
      const showSave = displayCities.length >= 2 && !state.ui.activeGroupId;
      if (!showSave) return null;
      return {
        targetRef: saveGroupBtnRef,
        message: t("guide.saveGroup"),
        placement: "bottom-right" as const,
      };
    }

    if (guideStep === 2) {
      return {
        targetRef: jumpTabRef,
        message: t("guide.jump"),
        placement: (isMobileGuide ? "top" : "left") as "top" | "left",
      };
    }

    return {
      targetRef: convertTabRef,
      message: t("guide.convert"),
      placement: (isMobileGuide ? "top" : "left") as "top" | "left",
    };
  }, [
    state.settings.onboardingCompleted,
    guideStep,
    sidePanelOpen,
    displayCities.length,
    state.ui.activeGroupId,
    isMobileGuide,
    t,
  ]);

  return (
    <>
      <div className={styles.page}>
        <NavBar onOpenSettings={() => setSettingsOpen(true)} />
        <TagBar
          onEditHomeCity={openHomeCitySettings}
          onAddCity={() => setCitySearchOpen(true)}
          onSaveAsGroup={() => {
            setGroupEditId(null);
            setGroupEditorOpen(true);
          }}
          onEditGroup={(groupId) => {
            setGroupEditId(groupId);
            setGroupEditorOpen(true);
          }}
          saveGroupBtnRef={saveGroupBtnRef}
          forceExpanded={guideStep === 1}
        />
        <main ref={mainRef} className={styles.main}>
          <TimeTable
            onSlotTap={onSlotTap}
            scrollToNowToken={scrollToNowToken}
            onNowLineVisibleChange={(visible) => setShowBackToNow(!visible)}
            selectedRanges={selectedRanges}
            pendingRangeStart={pendingRangeStart}
            selectionPanelOpen={rangeSelectionOpen || jumpOpen}
          />
        </main>
        <div className={styles.bottomFade} aria-hidden />
        <BottomBar
          onScrollToNow={() => setScrollToNowToken((token) => token + 1)}
          showBackToNow={showBackToNow}
        />
        <TimelineSideTabs
          anchorRef={mainRef}
          rangeActive={rangeSelectionOpen}
          jumpActive={jumpOpen}
          sidePanelOpen={sidePanelOpen}
          candidateCount={candidates.length}
          onToggleRange={toggleRangeSelection}
          onToggleJump={toggleJump}
          convertTabRef={convertTabRef}
          jumpTabRef={jumpTabRef}
        />
        {guideConfig && (
          <ContextualGuide
            targetRef={guideConfig.targetRef}
            message={guideConfig.message}
            placement={guideConfig.placement}
            active
            onDismiss={dismissGuide}
          />
        )}
        {home && (
          <TimelineSidePanel
            open={sidePanelOpen}
            tab={sidePanelTab}
            onClose={closeSidePanel}
            anchorRef={mainRef}
            home={home}
            timeFormat={state.settings.timeFormat}
            candidates={candidates}
            onCandidatesChange={setCandidates}
            pendingRangeStart={pendingRangeStart}
            onBaseCityChange={handleRangeBaseCityChange}
            onCopied={setSnack}
          />
        )}
      </div>
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onOpenHomeCity={openHomeCitySettings}
      />
      <HomeCityModal
        open={homeCityOpen}
        onClose={() => setHomeCityOpen(false)}
        onHomeChanged={onHomeCityChanged}
      />
      <CitySearchModal open={citySearchOpen} onClose={() => setCitySearchOpen(false)} />
      <GroupEditorModal
        open={groupEditorOpen}
        editId={groupEditId}
        onClose={() => setGroupEditorOpen(false)}
      />
      <Snackbar message={snack} onDone={() => setSnack(null)} />
    </>
  );
}
