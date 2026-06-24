import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { catalogToCity, CITY_CATALOG, searchCities } from "../../lib/cities";
import { getUtcOffsetLabel } from "../../lib/timezone";
import { useStore } from "../../store/StoreContext";
import { selectDisplayCities } from "../../store/selectors";
import type { City, CityCatalogEntry } from "../../store/types";
import styles from "./TimeSearchModal.module.css";

interface CityComboProps {
  selectedId: string | null;
  onSelect: (city: City) => void;
  excludeIds?: Set<string>;
  disabled?: boolean;
  resetAfterSelect?: boolean;
  placeholder?: string;
}

function formatCityLabel(city: Pick<City, "countryFlag" | "name">): string {
  return `${city.countryFlag} ${city.name}`;
}

export function CityCombo({ selectedId, onSelect, excludeIds, disabled, resetAfterSelect, placeholder }: CityComboProps) {
  const { t } = useTranslation();
  const { state } = useStore();
  const activeCities = selectDisplayCities(state);
  const homeId = activeCities.find((city) => city.isHome)?.id;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(() => {
    if (!selectedId) return null;
    return (
      activeCities.find((city) => city.id === selectedId) ??
      CITY_CATALOG.find((entry) => entry.id === selectedId) ??
      null
    );
  }, [selectedId, activeCities]);

  useEffect(() => {
    if (selected && !open) {
      setQuery(formatCityLabel(selected));
    }
  }, [selected, open]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setOpen(false);
        if (selected) setQuery(formatCityLabel(selected));
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [selected]);

  const pool = useMemo(() => {
    const trimmed = query.trim();
    const showingSelected = selected && trimmed === formatCityLabel(selected);
    let items: CityCatalogEntry[];
    if (!trimmed || showingSelected) {
      const activeIds = new Set(activeCities.map((city) => city.id));
      const catalogRest = CITY_CATALOG.filter((entry) => !activeIds.has(entry.id));
      items = [
        ...activeCities.map(({ isHome, label, order, ...entry }) => entry),
        ...catalogRest,
      ];
    } else {
      items = searchCities(trimmed);
    }
    if (excludeIds) {
      items = items.filter((entry) => !excludeIds.has(entry.id));
    }
    return items;
  }, [query, activeCities, excludeIds, selected]);

  const pick = (entry: CityCatalogEntry) => {
    const active = activeCities.find((city) => city.id === entry.id);
    const city = active ?? catalogToCity(entry, entry.id === homeId);
    onSelect(city);
    setQuery(resetAfterSelect ? "" : formatCityLabel(city));
    setOpen(false);
  };

  return (
    <div className={styles.combo} ref={wrapRef}>
      <input
        className={styles.input}
        type="text"
        value={query}
        placeholder={placeholder ?? t("search.placeholder")}
        disabled={disabled}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />
      {open && !disabled && (
        <div className={styles.comboList} role="listbox">
          {pool.length === 0 ? (
            <div className={styles.comboEmpty}>{t("search.noResult")}</div>
          ) : (
            pool.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={styles.comboItem}
                role="option"
                onClick={() => pick(entry)}
              >
                <span>
                  {entry.countryFlag} {entry.name}
                </span>
                <span className={styles.comboMeta}>{getUtcOffsetLabel(entry.timezone)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
