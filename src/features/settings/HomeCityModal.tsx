import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../../components/Modal";
import { CITY_CATALOG, getCityDisplayName, searchCities, suggestSameOffsetCities } from "../../lib/cities";
import { setHomeCityFromCatalog, toggleLocationSync } from "../../lib/locationSyncToggle";
import { geolocationErrorMessage } from "../../lib/geolocationMessages";
import { getUtcOffsetLabel } from "../../lib/timezone";
import { useStore } from "../../store/StoreContext";
import { selectHomeCity } from "../../store/selectors";
import styles from "./HomeCityModal.module.css";

interface HomeCityModalProps {
  open: boolean;
  onClose: () => void;
  onHomeChanged?: (cityName: string) => void;
}

type SyncStatus = "idle" | "fetching" | "active" | "error";

export function HomeCityModal({ open, onClose, onHomeChanged }: HomeCityModalProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useStore();
  const home = selectHomeCity(state);
  const [query, setQuery] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [syncMessage, setSyncMessage] = useState("");

  const locSyncEnabled = state.settings.locationSyncEnabled;
  const lang = state.settings.language;

  useEffect(() => {
    if (!open) return;
    setQuery("");
    if (locSyncEnabled) {
      setSyncStatus("active");
      setSyncMessage(t("settings.locSyncActive"));
    } else {
      setSyncStatus("idle");
      setSyncMessage(t("settings.locSyncHint"));
    }
    // Initialize status when the modal opens; in-modal toggles update via callbacks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, t]);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return CITY_CATALOG.filter((entry) => entry.id !== home?.id).slice(0, 8);
    }
    return searchCities(trimmed);
  }, [query, home?.id]);

  const suggestions = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed || results.length > 0) return [];
    const exclude = new Set(home?.id ? [home.id] : []);
    return suggestSameOffsetCities(trimmed, exclude);
  }, [query, results.length, home?.id]);

  const pickHome = (cityId: string) => {
    if (cityId === home?.id) return;
    const entry = CITY_CATALOG.find((c) => c.id === cityId);
    if (!entry) return;
    const ok = setHomeCityFromCatalog(dispatch, state, cityId);
    if (!ok) return;
    onHomeChanged?.(getCityDisplayName(entry, lang));
    onClose();
  };

  const onToggleLocSync = () => {
    if (locSyncEnabled) {
      toggleLocationSync(dispatch, state, false);
      setSyncStatus("idle");
      setSyncMessage(t("settings.locSyncHint"));
      return;
    }

    toggleLocationSync(dispatch, state, true, {
      onFetching: () => {
        setSyncStatus("fetching");
        setSyncMessage(t("settings.locSyncFetching"));
      },
      onDetected: (cityName) => {
        setSyncStatus("active");
        setSyncMessage(t("settings.locSyncDetected", { city: cityName }));
      },
      onError: (reason) => {
        setSyncStatus("error");
        setSyncMessage(geolocationErrorMessage(reason, t));
      },
      onNoCity: () => {
        setSyncStatus("error");
        setSyncMessage(t("settings.locationNoCity"));
      },
    });
  };

  if (!home) return null;

  return (
    <Modal open={open} title={t("settings.homeCityTitle")} onClose={onClose}>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t("settings.currentHome")}</div>
        <div className={styles.currentHome}>
          <span className={styles.currentHomeFlag} aria-hidden>
            {home.countryFlag}
          </span>
          <div>
            <div>{getCityDisplayName(home, lang)}</div>
            <div className={styles.currentHomeMeta}>{getUtcOffsetLabel(home.timezone)}</div>
          </div>
          {locSyncEnabled && <span className={styles.syncBadge}>{t("settings.autoSyncBadge")}</span>}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t("settings.locSyncSection")}</div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("settings.locSyncDetail")}</span>
          <button
            type="button"
            className={`${styles.toggle} ${locSyncEnabled ? styles.toggleOn : ""}`}
            onClick={onToggleLocSync}
            aria-pressed={locSyncEnabled}
          >
            <span className={styles.knob} />
          </button>
        </div>
        <p className={`${styles.status} ${syncStatus === "error" ? styles.statusError : ""}`}>{syncMessage}</p>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t("settings.manualHomePick")}</div>
        <input
          className={styles.searchInput}
          type="search"
          value={query}
          placeholder={t("search.placeholder")}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className={styles.resultList}>
          {results.length === 0 ? (
            <div className={styles.empty}>{t("search.noResult")}</div>
          ) : (
            results.map((entry) => {
              const isCurrent = entry.id === home.id;
              const name = getCityDisplayName(entry, lang);
              return (
                <button
                  key={entry.id}
                  type="button"
                  className={`${styles.resultItem} ${isCurrent ? styles.resultItemDisabled : ""}`}
                  disabled={isCurrent}
                  onClick={() => pickHome(entry.id)}
                >
                  <span className={styles.resultLeft}>
                    <span aria-hidden>{entry.countryFlag}</span>
                    <span>
                      {name} <span className={styles.resultTz}>{getUtcOffsetLabel(entry.timezone)}</span>
                    </span>
                  </span>
                  {isCurrent ? (
                    <span className={styles.resultBadge}>{t("settings.currentHomeBadge")}</span>
                  ) : (
                    <span className={styles.pickBtn} aria-hidden>
                      🏠
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
        {query.trim() && results.length === 0 && suggestions.length > 0 && (
          <>
            <div className={styles.sectionTitle}>{t("search.sameOffsetSuggest")}</div>
            <div className={styles.resultList}>
              {suggestions.map((entry) => {
                const name = getCityDisplayName(entry, lang);
                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={styles.resultItem}
                    onClick={() => pickHome(entry.id)}
                  >
                    <span className={styles.resultLeft}>
                      <span aria-hidden>{entry.countryFlag}</span>
                      <span>
                        {name} <span className={styles.resultTz}>{getUtcOffsetLabel(entry.timezone)}</span>
                      </span>
                    </span>
                    <span className={styles.pickBtn} aria-hidden>
                      🏠
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>
    </Modal>
  );
}
