import { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSegmentIndicator } from "../../hooks/useSegmentIndicator";
import { useStore } from "../../store/StoreContext";
import { IconBusiness, IconReturn } from "../../components/icons/Icons";
import iconBtn from "../../components/IconActionButton.module.css";
import styles from "./BottomBar.module.css";

interface BottomBarProps {
  onScrollToNow: () => void;
  showBackToNow: boolean;
}

export function BottomBar({ onScrollToNow, showBackToNow }: BottomBarProps) {
  const { t } = useTranslation();
  const { state, dispatch } = useStore();
  const business = state.settings.businessHoursEnabled;
  const toggleRef = useRef<HTMLDivElement>(null);
  const segRef0 = useRef<HTMLButtonElement>(null);
  const segRef1 = useRef<HTMLButtonElement>(null);
  const segRefs = useMemo(() => [segRef0, segRef1], [segRef0, segRef1]);

  const activeIndex = business ? 1 : 0;
  const indicator = useSegmentIndicator(toggleRef, segRefs, activeIndex, { remeasureDeps: [t] });

  return (
    <div className={styles.bar}>
      <div className={styles.leftColumn}>
        {showBackToNow && (
          <button
            type="button"
            className={`${iconBtn.secondary} ${styles.backToNowBtn}`}
            aria-label={t("timeline.backToNow")}
            onClick={onScrollToNow}
          >
            <IconReturn />
          </button>
        )}
        <div className={styles.toggleWrap}>
          <div className={styles.toggle} ref={toggleRef} role="group" aria-label="Display mode">
            <span
              className={styles.indicator}
              style={{ transform: `translateX(${indicator.x}px)`, width: indicator.width }}
              aria-hidden
            />
            <button
              type="button"
              ref={segRef0}
              className={`${styles.seg} ${!business ? styles.segActive : styles.segOffLeft}`}
              onClick={() => dispatch({ type: "UPDATE_SETTINGS", payload: { businessHoursEnabled: false } })}
            >
              {t("toggle.default")}
            </button>
            <button
              type="button"
              ref={segRef1}
              className={`${styles.seg} ${business ? styles.segActive : styles.segOffRight}`}
              onClick={() => dispatch({ type: "UPDATE_SETTINGS", payload: { businessHoursEnabled: true } })}
            >
              <IconBusiness width={14} height={14} />
              {t("toggle.business")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
