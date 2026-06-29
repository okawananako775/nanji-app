import { addHours } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CopySheet } from "../../components/CopySheet";
import { Snackbar } from "../../components/Snackbar";
import { getCityDisplayName } from "../../lib/cities";
import { formatCopyLinesRange } from "../../lib/copyFormat";
import { applyLocationSync } from "../../lib/locationSync";
import { timelineRowIndex, type SlotRange } from "../../lib/timeGrid";
import { formatHour, homeSlotToUtc } from "../../lib/timezone";
import { useStore } from "../../store/StoreContext";
import { selectHomeCity, selectVisibleCities } from "../../store/selectors";
import { SettingsModal } from "../settings/SettingsModal";
import { HomeCityModal } from "../settings/HomeCityModal";
import { TimeSearchModal } from "../time-search/TimeSearchModal";
import { CitySearchModal } from "../city-search/CitySearchModal";
import { GroupEditorModal } from "../groups/GroupEditorModal";
import { BottomBar } from "./BottomBar";
import { NavBar } from "./NavBar";
import { TagBar } from "./TagBar";
import { TimeTable } from "./TimeTable";
import styles from "./HomePage.module.css";

interface HomeLocationState {
  openSettings?: boolean;
}

export function HomePage() {
  const { state, dispatch, storageReset, clearStorageReset } = useStore();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyHeading, setCopyHeading] = useState<string | undefined>();
  const [copyJa, setCopyJa] = useState("");
  const [copyEn, setCopyEn] = useState("");
  const [snack, setSnack] = useState<string | null>(null);
  const [timeSearchOpen, setTimeSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [homeCityOpen, setHomeCityOpen] = useState(false);
  const [citySearchOpen, setCitySearchOpen] = useState(false);
  const [groupEditorOpen, setGroupEditorOpen] = useState(false);
  const [groupEditId, setGroupEditId] = useState<string | null>(null);
  const [scrollToNowToken, setScrollToNowToken] = useState(0);
  const [showBackToNow, setShowBackToNow] = useState(false);
  const [rangeHighlight, setRangeHighlight] = useState<SlotRange | null>(null);

  const resetRange = useCallback(() => {
    setRangeHighlight(null);
  }, []);

  useEffect(() => {
    if (!state.settings.locationSyncEnabled) return;
    applyLocationSync(dispatch, state, {
      onError: (reason) => {
        if (import.meta.env.DEV && reason !== "timeout") {
          console.warn("[locationSync] background sync failed", reason);
        }
        // Only disable sync when the environment blocks geolocation permanently.
        if (reason === "denied" || reason === "insecure" || reason === "unsupported") {
          dispatch({ type: "UPDATE_SETTINGS", payload: { locationSyncEnabled: false } });
        }
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const onSlotRangeSelect = useCallback(
    (range: SlotRange) => {
      const cities = selectVisibleCities(state);
      const currentHome = selectHomeCity(state);
      if (!currentHome) return;

      const { startDay, startHour, endDay, endHour } = range;
      const orderedStartUtc = homeSlotToUtc(currentHome.timezone, startDay, startHour);
      const rangeEndUtc = addHours(
        homeSlotToUtc(currentHome.timezone, endDay, endHour),
        1,
      );

      setRangeHighlight(range);
      setCopyHeading(
        t("copy.rangeHeading", {
          start: formatHour(startHour, state.settings.timeFormat),
          end: formatHour((endHour + 1) % 24, state.settings.timeFormat),
          city: getCityDisplayName(currentHome, state.settings.language),
        }),
      );
      setCopyJa(
        formatCopyLinesRange(cities, orderedStartUtc, rangeEndUtc, "ja", state.settings.timeFormat),
      );
      setCopyEn(
        formatCopyLinesRange(cities, orderedStartUtc, rangeEndUtc, "en", state.settings.timeFormat),
      );
      setCopyOpen(true);
    },
    [state, t],
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

  const closeCopySheet = useCallback(() => {
    setCopyOpen(false);
    resetRange();
  }, [resetRange]);

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
        />
        <main className={styles.main}>
          <TimeTable
            onSlotRangeSelect={onSlotRangeSelect}
            scrollToNowToken={scrollToNowToken}
            onNowLineVisibleChange={(visible) => setShowBackToNow(!visible)}
            rangeHighlight={rangeHighlight}
          />
        </main>
        <BottomBar
          onOpenTimeSearch={() => setTimeSearchOpen(true)}
          onScrollToNow={() => setScrollToNowToken((token) => token + 1)}
          showBackToNow={showBackToNow}
        />
      </div>
      <CopySheet
        open={copyOpen}
        heading={copyHeading}
        textJa={copyJa}
        textEn={copyEn}
        onClose={closeCopySheet}
      />
      <TimeSearchModal
        open={timeSearchOpen}
        onClose={() => setTimeSearchOpen(false)}
        onCopied={setSnack}
      />
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
