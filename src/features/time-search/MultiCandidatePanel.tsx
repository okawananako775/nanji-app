import { useTranslation } from "react-i18next";
import { catalogToCity, CITY_CATALOG, getCityDisplayName } from "../../lib/cities";
import {
  buildMultiCandidateResults,
  type DateCandidate,
  type MultiCandidateBlock,
} from "../../lib/multiCandidateSearch";
import { clampDateInput, getTimelineDateBounds } from "../../lib/timeSearchJump";
import { useStore } from "../../store/StoreContext";
import { selectDisplayCities, selectHomeCity, selectVisibleCities } from "../../store/selectors";
import type { City } from "../../store/types";
import { CityCombo } from "./CityCombo";
import { DateCandidateListEditor } from "./DateCandidateListEditor";
import { IconClear } from "../../components/icons/Icons";
import styles from "./TimeSearchModal.module.css";

const MAX_TARGETS = 10;

interface MultiCandidatePanelProps {
  baseCityId: string;
  onBaseCityChange: (city: City) => void;
  candidates: DateCandidate[];
  onCandidatesChange: (candidates: DateCandidate[]) => void;
  targetCities: City[];
  onTargetCitiesChange: (cities: City[]) => void;
  onSearch: (results: MultiCandidateBlock[]) => void;
  submitLabel?: string;
  candidatesAllowEmpty?: boolean;
  relaxedFieldSpacing?: boolean;
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
  submitLabel,
  candidatesAllowEmpty = false,
  relaxedFieldSpacing = false,
}: MultiCandidatePanelProps) {
  const { t } = useTranslation();
  const { state } = useStore();
  const lang = state.settings.language;
  const home = selectHomeCity(state);
  const activeCities = selectDisplayCities(state);
  const visibleCities = selectVisibleCities(state);
  const groups = state.groups.allIds.map((id) => state.groups.byId[id]).filter(Boolean);
  const atMaxTargets = targetCities.length >= MAX_TARGETS;
  const fieldClass = relaxedFieldSpacing ? styles.fieldRelaxed : styles.field;

  const resolveBaseCity = (): City | null => {
    const fromDisplay = activeCities.find((city) => city.id === baseCityId);
    if (fromDisplay) return fromDisplay;
    const entry = CITY_CATALOG.find((city) => city.id === baseCityId);
    if (!entry) return null;
    return catalogToCity(entry, baseCityId === home?.id);
  };

  const baseCity = resolveBaseCity();
  const baseTimezone = baseCity?.timezone ?? home?.timezone ?? "UTC";
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
    if (!home || !baseCity || targetCities.length === 0) return;
    const { minDate, maxDate } = getTimelineDateBounds(baseTimezone);
    const clampedCandidates = candidates.map((candidate) => ({
      ...candidate,
      date: clampDateInput(candidate.date, minDate, maxDate),
    }));
    onSearch(buildMultiCandidateResults(baseCity, clampedCandidates, targetCities));
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
      <div className={fieldClass}>
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

      <DateCandidateListEditor
        baseTimezone={baseTimezone}
        candidates={candidates}
        onCandidatesChange={onCandidatesChange}
        allowEmpty={candidatesAllowEmpty}
        relaxedFieldSpacing={relaxedFieldSpacing}
      />

      <div className={fieldClass}>
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

      <button
        type="button"
        className={styles.apply}
        onClick={runSearch}
        disabled={!home || !baseCity || targetCities.length === 0 || candidates.length === 0}
      >
        {submitLabel ?? t("timeSearch.search")}
      </button>
    </>
  );
}
