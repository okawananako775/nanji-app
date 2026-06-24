import { type KeyboardEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../../store/StoreContext";
import { canAddDisplayCity } from "../../store/reducer";
import {
  selectDisplayCities,
  selectIsCityInActiveGroup,
  selectIsTempCity,
} from "../../store/selectors";
import {
  IconArrow,
  IconAdd,
  IconClear,
  IconClearAll,
  IconGroup,
  IconHide,
  IconHome,
  IconSave,
  IconShow,
} from "../../components/icons/Icons";
import iconBtn from "../../components/IconActionButton.module.css";
import styles from "./TagBar.module.css";

const MOBILE_MQ = "(max-width: 640px)";

export function TagBar({
  onEditHomeCity,
  onAddCity,
  onSaveAsGroup,
  onEditGroup,
}: {
  onEditHomeCity?: () => void;
  onAddCity?: () => void;
  onSaveAsGroup?: () => void;
  onEditGroup?: (groupId: string) => void;
}) {
  const { t } = useTranslation();
  const { state, dispatch } = useStore();
  const cities = selectDisplayCities(state);
  const atMaxCities = !canAddDisplayCity(state);
  const activeGroupId = state.ui.activeGroupId;
  const isGroupView = !!activeGroupId;
  const showSave = cities.length >= 2 && !activeGroupId;
  const showBlink = cities.length <= 1;
  const canToggleVisibility = cities.length >= 2;
  const [collapsed, setCollapsed] = useState(
    () => typeof window !== "undefined" && window.matchMedia(MOBILE_MQ).matches,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ);
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setCollapsed(true);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.collapseToggle}
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
        >
          <IconArrow className={collapsed ? styles.chevronDown : styles.chevronUp} width={15} height={15} />
          <span>{collapsed ? t("tag.expand") : t("tag.collapse")}</span>
          <span className={styles.cityCount}>{cities.length}</span>
        </button>
      </div>
      <div className={`${styles.bar} ${collapsed ? styles.barCollapsed : ""}`}>
      {cities.map((city) => {
        const isTemp = selectIsTempCity(state, city.id);
        const isInGroup = selectIsCityInActiveGroup(state, city.id);
        const isHidden = !!state.ui.hiddenCityIds[city.id];
        const pulse = state.ui.pulseCityId === city.id;

        const showRemove = !city.isHome && (!isGroupView || isTemp);
        const showAddToGroup = !city.isHome && isGroupView && isTemp;
        const useStrongBorder = !city.isHome && isGroupView && isInGroup;

        return (
          <div key={city.id} className={styles.tagWrap}>
            <div
              className={[
                styles.tag,
                city.isHome ? `${styles.home}${onEditHomeCity ? ` ${styles.homeInteractive}` : ""}` : styles.city,
                showRemove ? styles.cityWithClear : "",
                !city.isHome && isHidden ? styles.hiddenTag : "",
                useStrongBorder ? styles.cityInGroup : "",
                pulse ? styles.pulse : "",
              ]
                .filter(Boolean)
                .join(" ")}
              {...(city.isHome && onEditHomeCity
                ? {
                    role: "button" as const,
                    tabIndex: 0,
                    onClick: onEditHomeCity,
                    onKeyDown: (e: KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onEditHomeCity();
                      }
                    },
                  }
                : {})}
            >
              {city.isHome && <IconHome className={styles.iconBtn} />}
              {showRemove && (
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={t("tag.removeCity")}
                  onClick={() =>
                    dispatch({
                      type: isTemp ? "REMOVE_TEMP_CITY" : "REMOVE_CITY",
                      payload: { cityId: city.id },
                    })
                  }
                >
                  <IconClear />
                </button>
              )}
              <span>{city.isHome ? city.name : `${city.countryFlag} ${city.name}`}</span>
              {!city.isHome && canToggleVisibility && (
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={isHidden ? t("tag.showCity") : t("tag.hideCity")}
                  aria-pressed={isHidden}
                  onClick={() => dispatch({ type: "TOGGLE_HIDDEN", payload: { cityId: city.id } })}
                >
                  {isHidden ? <IconHide /> : <IconShow />}
                </button>
              )}
              {showAddToGroup && (
                <button
                  type="button"
                  className={styles.iconBtn}
                  aria-label={t("tag.addToGroup")}
                  onClick={() => dispatch({ type: "ADD_TEMP_TO_GROUP", payload: { cityId: city.id } })}
                >
                  <IconAdd width={14} height={14} />
                </button>
              )}
            </div>
          </div>
        );
      })}
      <span
        className={styles.addBtnWrap}
        title={atMaxCities ? t("search.max") : undefined}
      >
        <button
          type="button"
          className={`${styles.addBtn} ${showBlink ? styles.addBtnBlink : ""} ${atMaxCities ? styles.addBtnAtMax : ""}`}
          onClick={() => {
            if (atMaxCities) return;
            onAddCity?.();
          }}
          aria-disabled={atMaxCities}
          aria-label={atMaxCities ? t("search.max") : t("tag.addCity")}
        >
          <IconAdd />
          <span>{t("tag.addCity")}</span>
        </button>
      </span>
      {cities.length > 1 && activeGroupId && (
        <button
          type="button"
          className={styles.clearBtn}
          onClick={() => onEditGroup?.(activeGroupId)}
        >
          <IconGroup width={16} height={16} />
          <span>{t("group.edit")}</span>
        </button>
      )}
      {cities.length > 1 && !activeGroupId && (
        <button type="button" className={styles.clearBtn} onClick={() => dispatch({ type: "CLEAR_ALL_CITIES" })}>
          <IconClearAll />
          <span>{t("tag.clearAll")}</span>
        </button>
      )}
      <div className={styles.right}>
        {showSave && (
          <button
            type="button"
            className={iconBtn.primary}
            aria-label={t("tag.saveAsGroup")}
            title={t("tag.saveAsGroup")}
            onClick={() => onSaveAsGroup?.()}
          >
            <IconSave width={18} height={18} />
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
