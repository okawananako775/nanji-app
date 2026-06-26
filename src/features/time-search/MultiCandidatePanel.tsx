import { addDays } from "date-fns";
import { useTranslation } from "react-i18next";
import { catalogToCity, CITY_CATALOG, getCityDisplayName } from "../../lib/cities";
import { generateId } from "../../lib/id";
import {
  buildMultiCandidateResults,
  createDateCandidate,
  type DateCandidate,
  type MultiCandidateBlock,
} from "../../lib/multiCandidateSearch";
import { safeFormatInTimeZone } from "../../lib/timezone";
import { useStore } from "../../store/StoreContext";
import { selectDisplayCities, selectHomeCity, selectVisibleCities } from "../../store/selectors";
import type { City } from "../../store/types";
import { CityCombo } from "./CityCombo";
import { CalendarDatePicker } from "../../components/CalendarDatePicker";
import { IconClear } from "../../components/icons/Icons";
import styles from "./TimeSearchModal.module.css";

const MAX_CANDIDATES = 10;
const MAX_TARGETS = 10;

interface MultiCandidatePanelProps {
  baseCityId: string;
  onBaseCityChange: (city: City) => void;
  candidates: DateCandidate[];
  onCandidatesChange: (candidates: DateCandidate[]) => void;
  targetCities: City[];
  onTargetCitiesChange: (cities: City[]) => void;
  onSearch: (results: MultiCandidateBlock[]) => void;
}

function cityDisplayName(city: City, lang: "ja" | "en"): string {
  return getCityDisplayName(city, lang);
}

export function MultiCandidatePanel({
  baseCityId,
  onBaseCityChange,
  candidates,
  onCandidatesChange,
  targetCities,
  onTargetCitiesChange,
  onSearch,
}: MultiCandidatePanelProps) {
  const { t } = useTranslation();
  const { state } = useStore();
  const lang = state.settings.language;
  const home = selectHomeCity(state);
  const activeCities = selectDisplayCities(state);
  const visibleCities = selectVisibleCities(state);
  const groups = state.groups.allIds.map((id) => state.groups.byId[id]).filter(Boolean);
  const atMaxTargets = targetCities.length >= MAX_TARGETS;

  const homeTimezone = home?.timezone ?? "UTC";
  const minDate = safeFormatInTimeZone(addDays(new Date(), -30), homeTimezone, "yyyy-MM-dd");
  const maxDate = safeFormatInTimeZone(addDays(new Date(), 30), homeTimezone, "yyyy-MM-dd");
  const targetExclude = new Set([...targetCities.map((city) => city.id), baseCityId]);
  const visibleTargets = targetCities;

  const isGroupAdded = (groupId: string) => {
    const group = state.groups.byId[groupId];
    if (!group) return false;
    const relevant = group.cities.filter((city) => city.id !== baseCityId);
    if (relevant.length === 0) return true;
    return relevant.every((city) => targetCities.some((entry) => entry.id === city.id));
  };

  const handleBaseChange = (city: City) => {
    onBaseCityChange(city);
    onTargetCitiesChange(targetCities.filter((entry) => entry.id !== city.id));
  };

  const updateCandidate = (index: number, patch: Partial<DateCandidate>) => {
    onCandidatesChange(
      candidates.map((candidate, i) => (i === index ? { ...candidate, ...patch } : candidate)),
    );
  };

  const addCandidate = () => {
    if (candidates.length >= MAX_CANDIDATES) return;
    const last = candidates[candidates.length - 1];
    onCandidatesChange([...candidates, createDateCandidate(homeTimezone, { ...last, id: generateId() })]);
  };

  const removeCandidate = (index: number) => {
    if (candidates.length <= 1) return;
    onCandidatesChange(candidates.filter((_, i) => i !== index));
  };

  const addTarget = (city: City) => {
    if (city.id === baseCityId || targetCities.some((entry) => entry.id === city.id) || atMaxTargets) return;
    onTargetCitiesChange([...targetCities, { ...city, isHome: city.id === home?.id }]);
  };

  const removeTarget = (cityId: string) => {
    onTargetCitiesChange(targetCities.filter((city) => city.id !== cityId));
  };

  const toggleTarget = (city: City) => {
    if (city.id === baseCityId) return;
    if (targetCities.some((entry) => entry.id === city.id)) {
      removeTarget(city.id);
      return;
    }
    addTarget(city);
  };

  const addGroupTargets = (groupId: string) => {
    const group = state.groups.byId[groupId];
    if (!group || atMaxTargets) return;
    const next = [...targetCities];
    for (const city of group.cities) {
      if (next.length >= MAX_TARGETS) break;
      if (city.id === baseCityId) continue;
      if (next.some((entry) => entry.id === city.id)) continue;
      next.push({ ...city, isHome: city.id === home?.id });
    }
    onTargetCitiesChange(next);
  };

  const runSearch = () => {
    if (!home) return;
    const baseCity =
      activeCities.find((city) => city.id === baseCityId) ??
      (() => {
        const entry = CITY_CATALOG.find((city) => city.id === baseCityId);
        return entry ? catalogToCity(entry, baseCityId === home.id) : null;
      })();
    if (!baseCity || targetCities.length === 0) return;
    onSearch(buildMultiCandidateResults(baseCity, candidates, targetCities));
  };

  const renderTargetLabel = (city: City) => {
    const name = cityDisplayName(city, lang);
    const parts: string[] = [];
    if (city.isHome) parts.push("🏠");
    parts.push(city.countryFlag);
    parts.push(name);
    return parts.join(" ");
  };

  return (
    <>
      <div className={styles.field}>
        <div className={styles.label}>{t("timeSearch.multiBase")}</div>
        <p className={styles.fieldHint}>{t("timeSearch.multiBaseHint")}</p>
        {visibleCities.length > 0 && (
          <div className={styles.displayCityTags}>
            {visibleCities.map((city) => {
              const selected = baseCityId === city.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  className={`${styles.displayCityTag} ${selected ? styles.displayCityTagSelected : ""} ${city.isHome ? styles.displayCityTagHome : ""}`}
                  aria-pressed={selected}
                  onClick={() => handleBaseChange(city)}
                >
                  {city.isHome && "🏠 "}
                  {city.countryFlag} {cityDisplayName(city, lang)}
                </button>
              );
            })}
          </div>
        )}
        <CityCombo selectedId={baseCityId} onSelect={handleBaseChange} />
      </div>

      <div className={styles.field}>
        <div className={styles.label}>{t("timeSearch.multiCandidates")}</div>
        <div className={styles.candidateList}>
          {candidates.map((candidate, index) => (
            <div key={candidate.id} className={styles.candidateRow}>
              <div className={styles.candidateHead}>
                <span className={styles.candidateNum}>{index + 1}</span>
                <CalendarDatePicker
                  className={styles.candidateDate}
                  compact
                  value={candidate.date}
                  min={minDate}
                  max={maxDate}
                  onChange={(nextDate) => updateCandidate(index, { date: nextDate })}
                />
              </div>
              <div className={styles.candidateTimeRange}>
                <div className={styles.candidateTimeGroup}>
                  <select
                    className={`${styles.select} ${styles.candidateHour}`}
                    value={candidate.startHour}
                    onChange={(e) => updateCandidate(index, { startHour: Number(e.target.value) })}
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <option key={hour} value={hour}>
                        {String(hour).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <select
                    className={`${styles.select} ${styles.candidateMin}`}
                    value={candidate.startMinute}
                    onChange={(e) =>
                      updateCandidate(index, { startMinute: Number(e.target.value) as 0 | 30 })
                    }
                  >
                    <option value={0}>00</option>
                    <option value={30}>30</option>
                  </select>
                </div>
                <span className={styles.candidateSep}>〜</span>
                <div className={styles.candidateTimeGroup}>
                  <select
                    className={`${styles.select} ${styles.candidateHour}`}
                    value={candidate.endHour}
                    onChange={(e) => updateCandidate(index, { endHour: Number(e.target.value) })}
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <option key={hour} value={hour}>
                        {String(hour).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <select
                    className={`${styles.select} ${styles.candidateMin}`}
                    value={candidate.endMinute}
                    onChange={(e) =>
                      updateCandidate(index, { endMinute: Number(e.target.value) as 0 | 30 })
                    }
                  >
                    <option value={0}>00</option>
                    <option value={30}>30</option>
                  </select>
                </div>
              </div>
              {candidates.length > 1 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label={t("timeSearch.removeCandidate")}
                  onClick={() => removeCandidate(index)}
                >
                  <IconClear width={14} height={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className={styles.addCandidateBtn}
          disabled={candidates.length >= MAX_CANDIDATES}
          onClick={addCandidate}
        >
          {t("timeSearch.addCandidate")}
        </button>
        {candidates.length >= MAX_CANDIDATES && (
          <p className={styles.hint}>{t("timeSearch.maxCandidates")}</p>
        )}
      </div>

      <div className={styles.field}>
        <div className={styles.label}>{t("timeSearch.multiTargets")}</div>
        <p className={styles.fieldHint}>{t("timeSearch.multiTargetsHint")}</p>

        {visibleCities.filter((city) => city.id !== baseCityId).length > 0 && (
          <div className={styles.displayCityTags}>
            {visibleCities
              .filter((city) => city.id !== baseCityId)
              .map((city) => {
                const selected = targetCities.some((entry) => entry.id === city.id);
                const disabled = !selected && atMaxTargets;
                return (
                  <button
                    key={city.id}
                    type="button"
                    className={`${styles.displayCityTag} ${selected ? styles.displayCityTagSelected : ""} ${city.isHome ? styles.displayCityTagHome : ""}`}
                    aria-pressed={selected}
                    disabled={disabled}
                    onClick={() => toggleTarget(city)}
                  >
                    {city.isHome && "🏠 "}
                    {city.countryFlag} {cityDisplayName(city, lang)}
                  </button>
                );
              })}
          </div>
        )}

        {groups.length > 0 && (
          <div className={styles.targetGroupSection}>
            <div className={styles.subLabel}>{t("timeSearch.multiTargetsGroupHint")}</div>
            <div className={styles.groupTags}>
              {groups.map((group) => {
                const added = isGroupAdded(group.id);
                const disabled = atMaxTargets || added;
                return (
                  <button
                    key={group.id}
                    type="button"
                    className={`${styles.groupTag} ${disabled ? styles.groupTagAdded : ""}`}
                    disabled={disabled}
                    onClick={() => addGroupTargets(group.id)}
                  >
                    {group.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.targetTags}>
          {visibleTargets.map((city) => (
            <div
              key={city.id}
              className={`${styles.targetTag} ${city.isHome ? styles.targetTagHome : ""}`}
            >
                <span>{renderTargetLabel(city)}</span>
                <button
                  type="button"
                  className={styles.targetRemove}
                  aria-label={t("timeSearch.removeTarget")}
                  onClick={() => removeTarget(city.id)}
                >
                  <IconClear width={12} height={12} />
                </button>
              </div>
            ))}
        </div>

        <div className={atMaxTargets ? styles.comboDisabled : undefined}>
          <CityCombo
            selectedId={null}
            excludeIds={targetExclude}
            disabled={atMaxTargets}
            resetAfterSelect
            placeholder={t("timeSearch.addTargetPlaceholder")}
            onSelect={addTarget}
          />
        </div>
        {atMaxTargets && <p className={styles.error}>{t("timeSearch.maxTargets")}</p>}
      </div>

      <button type="button" className={styles.apply} onClick={runSearch} disabled={!home || targetCities.length === 0}>
        {t("timeSearch.search")}
      </button>
    </>
  );
}
