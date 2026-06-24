import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CopySheet } from "../../components/CopySheet";
import { Snackbar } from "../../components/Snackbar";
import { formatCopyLinesRange } from "../../lib/copyFormat";
import { applyLocationSync } from "../../lib/locationSync";
import { timelineRowIndex } from "../../lib/timeGrid";
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
import { TimeTable, type SlotSelection } from "./TimeTable";
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
  const [rangeStart, setRangeStart] = useState<{ day: number; hour: number } | null>(null);
  const [rangeHighlight, setRangeHighlight] = useState<{
    startDay: number;
    startHour: number;
    endDay: number;
    endHour: number;
  } | null>(null);

  const resetRange = useCallback(() => {
    setRangeStart(null);
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

  const onCellClick = useCallback(
    (slot: SlotSelection) => {
      const cities = selectVisibleCities(state);
      const currentHome = selectHomeCity(state);
      if (!currentHome) return;

      if (!rangeStart) {
        setRangeStart({ day: slot.dayOffset, hour: slot.hour });
        setSnack(
          t("copy.rangeHint", {
            time: formatHour(slot.hour, state.settings.timeFormat),
          }),
        );
        return;
      }

      const startUtc = homeSlotToUtc(currentHome.timezone, rangeStart.day, rangeStart.hour);
      const startFlat = timelineRowIndex(rangeStart.day, rangeStart.hour);
      const endFlat = timelineRowIndex(slot.dayOffset, slot.hour);
      const [startDay, startHour, endDay, endHour] =
        startFlat <= endFlat
          ? [rangeStart.day, rangeStart.hour, slot.dayOffset, slot.hour]
          : [slot.dayOffset, slot.hour, rangeStart.day, rangeStart.hour];
      const orderedStartUtc = startFlat <= endFlat ? startUtc : slot.utc;
      const orderedEndUtc = startFlat <= endFlat ? slot.utc : startUtc;

      setRangeHighlight({ startDay, startHour, endDay, endHour });
      setCopyHeading(
        t("copy.rangeHeading", {
          start: formatHour(startHour, state.settings.timeFormat),
          end: formatHour(endHour, state.settings.timeFormat),
          city: currentHome.name,
        }),
      );
      setCopyJa(
        formatCopyLinesRange(cities, orderedStartUtc, orderedEndUtc, "ja", state.settings.timeFormat),
      );
      setCopyEn(
        formatCopyLinesRange(cities, orderedStartUtc, orderedEndUtc, "en", state.settings.timeFormat),
      );
      setCopyOpen(true);
    },
    [state, t, rangeStart],
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
            onCellClick={onCellClick}
            scrollToNowToken={scrollToNowToken}
            onNowLineVisibleChange={(visible) => setShowBackToNow(!visible)}
            rangeStart={rangeStart}
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
