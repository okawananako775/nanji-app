import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CITY_CATALOG, getCityDisplayName, POPULAR_CITY_IDS, searchCities, suggestSameOffsetCities } from "../../lib/cities";
import { getUtcOffsetLabel } from "../../lib/timezone";
import { useStore } from "../../store/StoreContext";
import { canAddDisplayCity } from "../../store/reducer";
import { selectDisplayCities, selectHomeCity } from "../../store/selectors";
import styles from "./CitySearchPanel.module.css";

export type CitySearchMode = "add" | "group";

interface CitySearchPanelProps {
  mode: CitySearchMode;
  takenIds?: Set<string>;
  onSelect: (cityId: string) => void;
}

export function CitySearchPanel({ mode, takenIds, onSelect }: CitySearchPanelProps) {
  const { t } = useTranslation();
  const { state } = useStore();
  const home = selectHomeCity(state);
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchCities(query), [query]);
  const displayCities = selectDisplayCities(state);
  const displayIds = useMemo(() => new Set(displayCities.map((city) => city.id)), [displayCities]);
  const taken = takenIds ?? (mode === "add" ? displayIds : new Set<string>());
  const suggestions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed || results.length > 0) return [];
    return suggestSameOffsetCities(trimmed, taken);
  }, [query, results.length, taken]);
  const displayCount = displayCities.length;
  const atMax = !canAddDisplayCity(state);

  const popular = POPULAR_CITY_IDS.map((id) => CITY_CATALOG.find((c) => c.id === id)!).filter(Boolean);

  const visiblePopular = mode === "add" ? popular.filter((city) => city.id !== home?.id) : popular;

  const visibleResults =
    mode === "add" ? results.filter((city) => city.id !== home?.id) : results;

  const visibleSuggestions =
    mode === "add" ? suggestions.filter((city) => city.id !== home?.id) : suggestions;

  const lang = state.settings.language;
  const cityName = (entry: (typeof CITY_CATALOG)[number]) => getCityDisplayName(entry, lang);

  const isUnavailable = (cityId: string) => taken.has(cityId) || (atMax && mode === "add" && !taken.has(cityId));

  const pick = (id: string) => {
    if (isUnavailable(id)) return;
    onSelect(id);
  };

  return (
    <>
      <input
        className={styles.input}
        placeholder={t("search.placeholder")}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {!query && (
        <>
          <div className={styles.section}>{t("search.popular")}</div>
          <div className={styles.chips}>
            {visiblePopular.map((city) => {
              const disabled = isUnavailable(city.id);
              return (
                <button
                  key={city.id}
                  type="button"
                  className={`${styles.chip} ${disabled ? styles.chipDisabled : ""}`}
                  disabled={disabled}
                  onClick={() => pick(city.id)}
                >
                  {cityName(city)}
                </button>
              );
            })}
          </div>
        </>
      )}
      {query && <div className={styles.section}>{t("search.title")}</div>}
      <div className={styles.list}>
        {visibleResults.length === 0 ? (
          <div className={styles.empty}>{t("search.noResult")}</div>
        ) : (
          visibleResults.map((city) => {
            const disabled = isUnavailable(city.id);
            const alreadyAdded = taken.has(city.id);
            return (
              <button
                key={city.id}
                type="button"
                className={`${styles.item} ${disabled ? styles.itemDisabled : ""}`}
                disabled={disabled}
                onClick={() => pick(city.id)}
              >
                <span>
                  {cityName(city)}, {city.country}
                </span>
                {alreadyAdded ? (
                  <span className={styles.itemBadge}>{t("search.alreadyAdded")}</span>
                ) : (
                  <span className={styles.itemMeta}>{getUtcOffsetLabel(city.timezone)}</span>
                )}
              </button>
            );
          })
        )}
      </div>
      {query && visibleResults.length === 0 && visibleSuggestions.length > 0 && (
        <>
          <div className={styles.section}>{t("search.sameOffsetSuggest")}</div>
          <div className={styles.list}>
            {visibleSuggestions.map((city) => {
              const disabled = isUnavailable(city.id);
              return (
                <button
                  key={city.id}
                  type="button"
                  className={`${styles.item} ${disabled ? styles.itemDisabled : ""}`}
                  disabled={disabled}
                  onClick={() => pick(city.id)}
                >
                  <span>
                    {cityName(city)}, {city.country}
                  </span>
                  <span className={styles.itemMeta}>{getUtcOffsetLabel(city.timezone)}</span>
                </button>
              );
            })}
          </div>
        </>
      )}
      {atMax && mode === "add" && <p className={styles.empty}>{t("search.max")}</p>}
    </>
  );
}
