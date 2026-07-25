import { useEffect, useMemo, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { fromZonedTime } from "date-fns-tz";
import { CalendarDatePicker } from "../../components/CalendarDatePicker";
import { catalogToCity, CITY_CATALOG } from "../../lib/cities";
import { clampDateInput, getTimelineDateBounds, jumpTargetFromUtc } from "../../lib/timeSearchJump";
import { getZonedParts, safeFormatInTimeZone } from "../../lib/timezone";
import { useStore } from "../../store/StoreContext";
import { selectDisplayCities, selectHomeCity, selectVisibleCities } from "../../store/selectors";
import type { City } from "../../store/types";
import { CityCombo } from "../time-search/CityCombo";
import formStyles from "../time-search/TimeSearchModal.module.css";
import { SidePanel } from "./SidePanel";

interface JumpPanelProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  embedded?: boolean;
}

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

export function JumpPanel({ open, onClose, anchorRef, embedded = false }: JumpPanelProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useStore();
  const home = selectHomeCity(state);
  const [cityId, setCityId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);

  useEffect(() => {
    if (!open || !home) return;
    setCityId(home.id);
    setDate(safeFormatInTimeZone(new Date(), home.timezone, "yyyy-MM-dd"));
    const parts = getZonedParts(new Date(), home.timezone);
    setHour(parts.hour);
    setMinute(parts.minute >= 30 ? 30 : 0);
  }, [open, home?.id, home?.timezone]);

  const resolveCity = (id: string): City | undefined => {
    const fromDisplay = selectDisplayCities(state).find((c) => c.id === id);
    if (fromDisplay) return fromDisplay;
    const entry = CITY_CATALOG.find((c) => c.id === id);
    if (!entry) return undefined;
    return catalogToCity(entry, id === home?.id, 0);
  };

  const base = resolveCity(cityId) ?? home;
  const dateBounds = getTimelineDateBounds(base?.timezone ?? "UTC");
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = [0, 30];

  const apply = () => {
    if (!home || !base) return;
    ensureCityVisibleOnTimeline(dispatch, state, base);

    const clampedDate = clampDateInput(date, dateBounds.minDate, dateBounds.maxDate);
    const utc = fromZonedTime(
      `${clampedDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
      base.timezone,
    );
    const jump = jumpTargetFromUtc(home.timezone, utc);
    dispatch({ type: "SET_HIGHLIGHT", payload: { day: jump.day, hour: jump.hour } });
    dispatch({ type: "INCREMENT_USAGE_ACTION" });
  };

  if (!home) return null;

  const content = (
    <>
      <div className={formStyles.fieldRelaxed}>
        <div className={formStyles.label}>{t("timeSearch.baseCity")}</div>
        <CityCombo selectedId={cityId || home.id} onSelect={(city) => setCityId(city.id)} />
      </div>
      <div className={formStyles.fieldRelaxed}>
        <div className={formStyles.label}>{t("timeSearch.date")}</div>
        <CalendarDatePicker
          value={date}
          min={dateBounds.minDate}
          max={dateBounds.maxDate}
          onChange={setDate}
        />
      </div>
      <div className={formStyles.fieldRelaxed}>
        <div className={formStyles.label}>{t("timeSearch.time")}</div>
        <div className={formStyles.row}>
          <select className={formStyles.select} value={hour} onChange={(e) => setHour(Number(e.target.value))}>
            {hours.map((h) => (
              <option key={h} value={h}>
                {String(h).padStart(2, "0")}
              </option>
            ))}
          </select>
          <select
            className={formStyles.select}
            value={minute}
            onChange={(e) => setMinute(Number(e.target.value))}
          >
            {minutes.map((m) => (
              <option key={m} value={m}>
                :{String(m).padStart(2, "0")}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button type="button" className={formStyles.apply} onClick={apply}>
        {t("jump.apply")}
      </button>
    </>
  );

  if (embedded) return content;

  return (
    <SidePanel open={open} onClose={onClose} anchorRef={anchorRef} title={t("jump.title")}>
      {content}
    </SidePanel>
  );
}
