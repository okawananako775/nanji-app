import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fromZonedTime } from "date-fns-tz";
import { Modal } from "../../components/Modal";
import { CalendarDatePicker } from "../../components/CalendarDatePicker";
import { useSegmentIndicator } from "../../hooks/useSegmentIndicator";
import { catalogToCity, CITY_CATALOG, getCityDisplayName } from "../../lib/cities";
import {
  clampDateInput,
  getTimelineDateBounds,
  jumpTargetFromUtc,
  jumpTargetRelative,
  TIMELINE_MAX_RELATIVE_HOURS,
} from "../../lib/timeSearchJump";
import { getZonedParts, safeFormatInTimeZone } from "../../lib/timezone";
import { useStore } from "../../store/StoreContext";
import { selectDisplayCities, selectHomeCity, selectVisibleCities } from "../../store/selectors";
import type { City } from "../../store/types";
import {
  buildDefaultTargets,
  createDateCandidate,
  type DateCandidate,
  type MultiCandidateBlock,
} from "../../lib/multiCandidateSearch";
import { MultiCandidatePanel } from "./MultiCandidatePanel";
import { MultiCandidateResults } from "./MultiCandidateResults";
import { CityCombo } from "./CityCombo";
import styles from "./TimeSearchModal.module.css";

type Tab = "single" | "relative" | "multi";

interface TimeSearchModalProps {
  open: boolean;
  onClose: () => void;
  onCopied?: (message: string) => void;
}

/** Ensure a city appears on the home timeline (unhide, add, or temp-add in group view). */
function ensureCityVisibleOnTimeline(
  dispatch: ReturnType<typeof useStore>["dispatch"],
  state: ReturnType<typeof useStore>["state"],
  city: City,
) {
  if (selectVisibleCities(state).some((c) => c.id === city.id)) return;

  const displayed = selectDisplayCities(state);
  if (displayed.some((c) => c.id === city.id)) {
    dispatch({ type: "TOGGLE_HIDDEN", payload: { cityId: city.id, hidden: false } });
    return;
  }

  if (state.ui.activeGroupId) {
    dispatch({ type: "ADD_TEMP_CITY", payload: { city } });
  } else if (!state.cities.allIds.includes(city.id)) {
    dispatch({ type: "ADD_CITY", payload: { city } });
  }
}

export function TimeSearchModal({ open, onClose, onCopied }: TimeSearchModalProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useStore();
  const lang = state.settings.language;
  const home = selectHomeCity(state);
  const [tab, setTab] = useState<Tab>(state.ui.lastTimeSearchTab);
  const [multiView, setMultiView] = useState<"form" | "results">("form");
  const [multiResults, setMultiResults] = useState<MultiCandidateBlock[] | null>(null);
  const [baseCityId, setBaseCityId] = useState<string>("");
  const [singleCityId, setSingleCityId] = useState<string>("");
  const [singleTargetCityId, setSingleTargetCityId] = useState<string>("");
  const [relativeCityId, setRelativeCityId] = useState<string>("");
  const [candidates, setCandidates] = useState<DateCandidate[]>([]);
  const [targetCities, setTargetCities] = useState<City[]>([]);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [relativeHours, setRelativeHours] = useState(3);
  const [direction, setDirection] = useState<"after" | "before">("after");
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabSegRef0 = useRef<HTMLButtonElement>(null);
  const tabSegRef1 = useRef<HTMLButtonElement>(null);
  const tabSegRef2 = useRef<HTMLButtonElement>(null);
  const tabSegRefs = useMemo(
    () => [tabSegRef0, tabSegRef1, tabSegRef2],
    [tabSegRef0, tabSegRef1, tabSegRef2],
  );

  const initMultiState = useCallback(() => {
    if (!home) return;
    setBaseCityId(home.id);
    setSingleCityId(home.id);
    setSingleTargetCityId("");
    setRelativeCityId(home.id);
    setCandidates([createDateCandidate(home.timezone)]);
    setTargetCities(buildDefaultTargets(selectVisibleCities(state), home.id));
    setMultiView("form");
    setMultiResults(null);
    setDate(safeFormatInTimeZone(new Date(), home.timezone, "yyyy-MM-dd"));
    const parts = getZonedParts(new Date(), home.timezone);
    setHour(parts.hour);
    setMinute(parts.minute >= 30 ? 30 : 0);
  }, [home]);

  useEffect(() => {
    if (open && home) {
      setTab(state.ui.lastTimeSearchTab);
    }
  }, [open, home?.id, state.ui.lastTimeSearchTab]);

  useEffect(() => {
    if (!open || !home) return;
    initMultiState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, home?.id]);

  const setTabAndRemember = (next: Tab) => {
    setTab(next);
    dispatch({ type: "SET_TIME_SEARCH_TAB", payload: { tab: next } });
    if (next === "multi") setMultiView("form");
  };

  const activeTabIndex = tab === "single" ? 0 : tab === "relative" ? 1 : 2;

  const showTabs = !(tab === "multi" && multiView === "results");

  const [measureTick, setMeasureTick] = useState(0);
  useEffect(() => {
    if (!open || !showTabs) return;
    let raf1 = 0;
    let raf2 = 0;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMeasureTick((value) => value + 1));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open, showTabs, tab]);

  const tabIndicator = useSegmentIndicator(tabsRef, tabSegRefs, activeTabIndex, {
    enabled: open && showTabs,
    remeasureDeps: [open, showTabs, tab, multiView, measureTick, t],
  });

  const indicatorReady = tabIndicator.width > 0;

  const resolveCity = (cityId: string): City | undefined => {
    const fromDisplay = selectDisplayCities(state).find((c) => c.id === cityId);
    if (fromDisplay) return fromDisplay;
    const entry = CITY_CATALOG.find((c) => c.id === cityId);
    if (!entry) return undefined;
    return catalogToCity(entry, cityId === home?.id, 0);
  };

  const singleBase = resolveCity(singleCityId) ?? home;
  const singleDateBounds = getTimelineDateBounds(singleBase?.timezone ?? "UTC");

  const applySingle = () => {
    if (!home || !singleBase) return;
    const base = singleBase;
    ensureCityVisibleOnTimeline(dispatch, state, base);

    if (singleTargetCityId && singleTargetCityId !== base.id) {
      const target = resolveCity(singleTargetCityId);
      if (target) ensureCityVisibleOnTimeline(dispatch, state, target);
    }

    const clampedDate = clampDateInput(date, singleDateBounds.minDate, singleDateBounds.maxDate);
    const utc = fromZonedTime(
      `${clampedDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
      base.timezone,
    );
    const jump = jumpTargetFromUtc(home.timezone, utc);
    dispatch({ type: "SET_HIGHLIGHT", payload: { day: jump.day, hour: jump.hour } });
    onClose();
  };

  const clampedRelativeHours = Math.min(
    TIMELINE_MAX_RELATIVE_HOURS,
    Math.max(1, relativeHours || 1),
  );

  const applyRelative = () => {
    if (!home) return;
    const target = resolveCity(relativeCityId) ?? home;
    ensureCityVisibleOnTimeline(dispatch, state, target);
    const jump = jumpTargetRelative(home.timezone, clampedRelativeHours, direction);
    dispatch({ type: "SET_HIGHLIGHT", payload: { day: jump.day, hour: jump.hour } });
    onClose();
  };

  const handleMultiSearch = (results: MultiCandidateBlock[]) => {
    setMultiResults(results);
    setMultiView("results");
  };

  const handleCopied = (message: string) => {
    onCopied?.(message);
  };

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = [0, 30];
  const singleBaseCityId = singleCityId || home?.id || "";
  const singleTargetTagCities = useMemo(() => {
    if (!singleBaseCityId) return [];
    return selectVisibleCities(state).filter((city) => city.id !== singleBaseCityId);
  }, [state, singleBaseCityId]);
  const modalTitle =
    tab === "multi" && multiView === "results" ? t("timeSearch.resultsTitle") : t("timeSearch.title");

  return (
    <Modal
      open={open}
      title={modalTitle}
      onClose={onClose}
      dialogClassName={tab === "multi" ? styles.modalWide : undefined}
    >
      {showTabs && (
        <div className={styles.tabs} ref={tabsRef} role="tablist" aria-label={t("timeSearch.title")}>
          <span
            className={styles.tabIndicator}
            style={{
              transform: `translateX(${tabIndicator.x}px)`,
              width: tabIndicator.width,
              opacity: indicatorReady ? 1 : 0,
            }}
            aria-hidden
          />
          <button
            type="button"
            ref={tabSegRef0}
            role="tab"
            aria-selected={tab === "single"}
            className={`${styles.tab} ${tab === "single" && indicatorReady ? styles.tabActive : ""}`}
            onClick={() => setTabAndRemember("single")}
          >
            {t("timeSearch.tabSingle")}
          </button>
          <button
            type="button"
            ref={tabSegRef1}
            role="tab"
            aria-selected={tab === "relative"}
            className={`${styles.tab} ${tab === "relative" && indicatorReady ? styles.tabActive : ""}`}
            onClick={() => setTabAndRemember("relative")}
          >
            {t("timeSearch.tabRelative")}
          </button>
          <button
            type="button"
            ref={tabSegRef2}
            role="tab"
            aria-selected={tab === "multi"}
            className={`${styles.tab} ${tab === "multi" && indicatorReady ? styles.tabActive : ""}`}
            onClick={() => setTabAndRemember("multi")}
          >
            {t("timeSearch.tabMulti")}
          </button>
        </div>
      )}

      {tab === "single" && home && (
        <>
          <div className={styles.field}>
            <div className={styles.label}>{t("timeSearch.baseCity")}</div>
            <CityCombo
              selectedId={singleCityId || home.id}
              onSelect={(city) => {
                setSingleCityId(city.id);
                if (singleTargetCityId === city.id) setSingleTargetCityId("");
              }}
            />
          </div>
          <div className={styles.field}>
            <div className={styles.label}>{t("timeSearch.targetCity")}</div>
            {singleTargetTagCities.length > 0 && (
              <div className={styles.displayCityTags}>
                {singleTargetTagCities.map((city) => {
                  const selected = singleTargetCityId === city.id;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      className={`${styles.displayCityTag} ${selected ? styles.displayCityTagSelected : ""} ${city.isHome ? styles.displayCityTagHome : ""}`}
                      aria-pressed={selected}
                      onClick={() => setSingleTargetCityId(selected ? "" : city.id)}
                    >
                      {city.isHome && "🏠 "}
                      {city.countryFlag} {getCityDisplayName(city, lang)}
                    </button>
                  );
                })}
              </div>
            )}
            <CityCombo
              selectedId={singleTargetCityId || null}
              excludeIds={new Set([singleBaseCityId])}
              placeholder={t("timeSearch.addTargetPlaceholder")}
              onSelect={(city) => setSingleTargetCityId(city.id)}
            />
          </div>
          <div className={styles.field}>
            <div className={styles.label}>{t("timeSearch.date")}</div>
            <CalendarDatePicker
              value={date}
              min={singleDateBounds.minDate}
              max={singleDateBounds.maxDate}
              onChange={setDate}
            />
          </div>
          <div className={styles.field}>
            <div className={styles.label}>{t("timeSearch.time")}</div>
            <div className={styles.row}>
              <select className={styles.select} value={hour} onChange={(e) => setHour(Number(e.target.value))}>
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}
                  </option>
                ))}
              </select>
              <select className={styles.select} value={minute} onChange={(e) => setMinute(Number(e.target.value))}>
                {minutes.map((m) => (
                  <option key={m} value={m}>
                    :{String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button type="button" className={styles.apply} onClick={applySingle}>
            {t("timeSearch.apply")}
          </button>
        </>
      )}

      {tab === "relative" && home && (
        <>
          <div className={styles.field}>
            <div className={styles.label}>{t("timeSearch.targetCity")}</div>
            <CityCombo
              selectedId={relativeCityId || home.id}
              onSelect={(city) => setRelativeCityId(city.id)}
            />
          </div>
          <div className={styles.field}>
            <div className={styles.label}>{t("timeSearch.relativeLabel")}</div>
            <div className={styles.row}>
              <button
                type="button"
                className={styles.step}
                onClick={() => setRelativeHours((v) => Math.max(1, v - 1))}
              >
                −
              </button>
              <input
                className={styles.input}
                type="number"
                min={1}
                max={TIMELINE_MAX_RELATIVE_HOURS}
                value={relativeHours}
                onChange={(e) =>
                  setRelativeHours(
                    Math.min(TIMELINE_MAX_RELATIVE_HOURS, Math.max(1, Number(e.target.value) || 1)),
                  )
                }
              />
              <button
                type="button"
                className={styles.step}
                onClick={() => setRelativeHours((v) => Math.min(TIMELINE_MAX_RELATIVE_HOURS, v + 1))}
              >
                ＋
              </button>
              <select
                className={styles.select}
                value={direction}
                onChange={(e) => setDirection(e.target.value as "after" | "before")}
              >
                <option value="after">{t("timeSearch.after")}</option>
                <option value="before">{t("timeSearch.before")}</option>
              </select>
            </div>
          </div>
          <button type="button" className={styles.apply} onClick={applyRelative}>
            {t("timeSearch.apply")}
          </button>
        </>
      )}

      {tab === "multi" && multiView === "form" && home && (
        <MultiCandidatePanel
          baseCityId={baseCityId || home.id}
          onBaseCityChange={(city) => setBaseCityId(city.id)}
          candidates={candidates}
          onCandidatesChange={setCandidates}
          targetCities={targetCities}
          onTargetCitiesChange={setTargetCities}
          onSearch={handleMultiSearch}
        />
      )}

      {tab === "multi" && multiView === "results" && multiResults && (
        <MultiCandidateResults
          results={multiResults}
          onBack={() => setMultiView("form")}
          onCopied={handleCopied}
        />
      )}
    </Modal>
  );
}
