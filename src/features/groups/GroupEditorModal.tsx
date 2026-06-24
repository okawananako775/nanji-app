import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../../components/Modal";
import { CitySearchModal } from "../city-search/CitySearchModal";
import { generateId } from "../../lib/id";
import { useStore } from "../../store/StoreContext";
import { MAX_CITIES, MAX_GROUPS } from "../../store/reducer";
import { selectDisplayCities, selectHomeCity } from "../../store/selectors";
import type { City, Group } from "../../store/types";
import { IconClear, IconHome } from "../../components/icons/Icons";
import styles from "./GroupEditorModal.module.css";

interface GroupEditorModalProps {
  open: boolean;
  editId?: string | null;
  onClose: () => void;
}

export function GroupEditorModal({ open, editId = null, onClose }: GroupEditorModalProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useStore();
  const home = selectHomeCity(state);
  const existing = editId ? state.groups.byId[editId] : undefined;

  const [name, setName] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [isDefault, setIsDefault] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    if (editId && existing) {
      setName(existing.name);
      setCities(existing.cities);
      setIsDefault(existing.isDefault);
      return;
    }

    setName("");
    setCities(selectDisplayCities(state));
    setIsDefault(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset form only when the modal opens
  }, [open, editId]);

  const addCityFromSearch = (city: City) => {
    setCities((prev) => {
      if (prev.some((entry) => entry.id === city.id)) return prev;
      return [...prev, { ...city, order: prev.length, isHome: false }];
    });
  };

  const removeCity = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    if (!city || city.isHome) return;
    if (!window.confirm(t("group.removeCityConfirm"))) return;
    setCities(cities.filter((c) => c.id !== cityId).map((c, i) => ({ ...c, order: i })));
  };

  const save = () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const isNew = !editId;
    if (isNew && state.groups.allIds.length >= MAX_GROUPS) {
      alert(t("group.maxGroups"));
      return;
    }

    const homeId = home?.id ?? cities.find((c) => c.isHome)?.id;
    const ordered = cities.map((c, order) => ({
      ...c,
      order,
      isHome: c.id === homeId,
    }));

    const group: Group = {
      id: editId ?? generateId(),
      name: trimmed.slice(0, 20),
      isDefault,
      cities: ordered,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
    };

    dispatch({ type: "SAVE_GROUP", payload: { group, activate: true } });
    if (isDefault) {
      dispatch({ type: "TOGGLE_GROUP_DEFAULT", payload: { groupId: group.id, isDefault: true } });
    }
    onClose();
  };

  const destroy = () => {
    if (!editId || !window.confirm(t("group.deleteConfirm"))) return;
    dispatch({ type: "DELETE_GROUP", payload: { groupId: editId } });
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        title={editId ? t("group.title") : t("tag.saveAsGroup")}
        onClose={onClose}
      >
        <section className={styles.section}>
          <label className={styles.label}>{t("group.name")}</label>
          <input
            className={styles.input}
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("group.namePlaceholder")}
          />
        </section>

        <section className={styles.section}>
          <div className={styles.label}>{t("group.cities")}</div>
          <div className={styles.tags}>
            {cities.map((city) => (
              <div key={city.id} className={`${styles.tag} ${city.isHome ? styles.tagHome : ""}`}>
                {city.isHome && <IconHome width={14} height={14} />}
                <span>{city.isHome ? city.name : `${city.countryFlag} ${city.name}`}</span>
                {!city.isHome && (
                  <button type="button" className={styles.remove} aria-label="Remove" onClick={() => removeCity(city.id)}>
                    <IconClear width={14} height={14} />
                  </button>
                )}
              </div>
            ))}
            <span
              className={styles.addBtnWrap}
              title={cities.length >= MAX_CITIES ? t("search.max") : undefined}
            >
              <button
                type="button"
                className={`${styles.addBtn} ${cities.length >= MAX_CITIES ? styles.addBtnAtMax : ""}`}
                aria-disabled={cities.length >= MAX_CITIES}
                onClick={() => {
                  if (cities.length >= MAX_CITIES) return;
                  setSearchOpen(true);
                }}
              >
                + {t("group.addCity")}
              </button>
            </span>
          </div>
        </section>

        <section className={styles.row}>
          <span>{t("group.setDefault")}</span>
          <button
            type="button"
            className={`${styles.toggle} ${isDefault ? styles.toggleOn : ""}`}
            aria-pressed={isDefault}
            onClick={() => setIsDefault((v) => !v)}
          >
            <span className={styles.knob} />
          </button>
        </section>

        {editId && (
          <button type="button" className={styles.deleteBtn} onClick={destroy}>
            {t("group.delete")}
          </button>
        )}

        <button type="button" className={styles.primaryBtn} onClick={save} disabled={!name.trim()}>
          {t("common.save")}
        </button>
      </Modal>
      <CitySearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        mode="group"
        takenIds={new Set(cities.map((city) => city.id))}
        onGroupSelect={addCityFromSearch}
      />
    </>
  );
}
