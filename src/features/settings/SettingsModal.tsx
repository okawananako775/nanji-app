import { useTranslation } from "react-i18next";
import { Modal } from "../../components/Modal";
import { IconArrow } from "../../components/icons/Icons";
import { getCityDisplayName } from "../../lib/cities";
import { geolocationErrorMessage } from "../../lib/geolocationMessages";
import { toggleLocationSync } from "../../lib/locationSyncToggle";
import { useStore } from "../../store/StoreContext";
import { selectHomeCity } from "../../store/selectors";
import styles from "./SettingsModal.module.css";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onOpenHomeCity: () => void;
}

export function SettingsModal({ open, onClose, onOpenHomeCity }: SettingsModalProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useStore();
  const home = selectHomeCity(state);
  const s = state.settings;

  const onToggleLocSync = () => {
    toggleLocationSync(dispatch, state, !s.locationSyncEnabled, {
      onError: (reason) => alert(geolocationErrorMessage(reason, t)),
      onNoCity: () => alert(t("settings.locationNoCity")),
    });
  };

  const onReplayTour = () => {
    dispatch({
      type: "UPDATE_SETTINGS",
      payload: { onboardingCompleted: false, tourCompleted: false, replayTour: true },
    });
    onClose();
  };

  const homeLabel = home ? `${home.countryFlag} ${getCityDisplayName(home, s.language)}` : "—";

  return (
    <Modal
      open={open}
      title={t("settings.title")}
      onClose={onClose}
      dialogClassName={styles.settingsDialog}
    >
      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t("settings.general")}</div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("settings.language")}</span>
          <select
            className={styles.select}
            value={s.language}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_SETTINGS",
                payload: { language: e.target.value as "ja" | "en" },
              })
            }
          >
            <option value="ja">{t("settings.langJa")}</option>
            <option value="en">{t("settings.langEn")}</option>
          </select>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("settings.timeFormat")}</span>
          <select
            className={styles.select}
            value={s.timeFormat}
            onChange={(e) =>
              dispatch({ type: "UPDATE_SETTINGS", payload: { timeFormat: e.target.value as "24h" | "12h" } })
            }
          >
            <option value="24h">{t("settings.format24")}</option>
            <option value="12h">{t("settings.format12")}</option>
          </select>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("settings.colorMode")}</span>
          <select
            className={styles.select}
            value={s.colorMode}
            onChange={(e) =>
              dispatch({
                type: "UPDATE_SETTINGS",
                payload: { colorMode: e.target.value as "light" | "dark" | "system" },
              })
            }
          >
            <option value="light">{t("settings.colorModeLight")}</option>
            <option value="dark">{t("settings.colorModeDark")}</option>
            <option value="system">{t("settings.colorModeSystem")}</option>
          </select>
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t("settings.locSyncSection")}</div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("settings.locSync")}</span>
          <button
            type="button"
            className={`${styles.toggle} ${s.locationSyncEnabled ? styles.toggleOn : ""}`}
            onClick={onToggleLocSync}
            aria-pressed={s.locationSyncEnabled}
          >
            <span className={styles.knob} />
          </button>
        </div>
        <button type="button" className={styles.linkRow} onClick={onOpenHomeCity}>
          <span className={styles.rowLabel}>{t("settings.homeCity")}</span>
          <span className={styles.linkValue}>
            {homeLabel}
            <IconArrow className={styles.linkArrow} width={15} height={15} />
          </span>
        </button>
      </section>
      <section className={styles.section}>
        <div className={styles.sectionTitle}>{t("settings.appInfo")}</div>
        <button type="button" className={styles.linkRow} onClick={onReplayTour}>
          <span className={styles.rowLabel}>{t("settings.replayTour")}</span>
          <IconArrow className={styles.linkArrow} width={15} height={15} />
        </button>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t("settings.version")}</span>
          <span className={styles.rowValue}>1.0.0</span>
        </div>
      </section>
    </Modal>
  );
}
