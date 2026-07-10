import { useTranslation } from "react-i18next";
import type { RefObject } from "react";
import { IconConvert, IconJump } from "../../components/icons/Icons";
import iconBtn from "../../components/IconActionButton.module.css";
import styles from "./TimelineSideTabs.module.css";
import { useTimelineTabsAnchor } from "./useTimelineTabsAnchor";

interface TimelineSideTabsProps {
  anchorRef: RefObject<HTMLElement | null>;
  rangeActive: boolean;
  jumpActive: boolean;
  sidePanelOpen: boolean;
  candidateCount: number;
  onToggleRange: () => void;
  onToggleJump: () => void;
  convertTabRef?: RefObject<HTMLButtonElement | null>;
  jumpTabRef?: RefObject<HTMLButtonElement | null>;
}

export function TimelineSideTabs({
  anchorRef,
  rangeActive,
  jumpActive,
  sidePanelOpen,
  candidateCount,
  onToggleRange,
  onToggleJump,
  convertTabRef,
  jumpTabRef,
}: TimelineSideTabsProps) {
  const { t } = useTranslation();
  const anchorStyle = useTimelineTabsAnchor(anchorRef, sidePanelOpen);

  return (
    <div
      className={`${styles.rail} ${sidePanelOpen ? styles.railWithPanel : ""}`}
      style={anchorStyle}
      role="tablist"
      aria-label={t("timelineSideTabs.label")}
    >
      <button
        ref={convertTabRef}
        type="button"
        role="tab"
        aria-selected={rangeActive}
        className={`${iconBtn.secondary} ${styles.tab} ${rangeActive ? styles.tabActive : ""}`}
        onClick={onToggleRange}
      >
        <span className={styles.tabInner}>
          <IconConvert className={styles.tabIcon} aria-hidden />
          <span className={styles.tabLabel}>{t("timelineSideTabs.convert")}</span>
        </span>
        {candidateCount > 0 && !rangeActive && (
          <span className={styles.tabBadge} aria-hidden>
            {candidateCount}
          </span>
        )}
      </button>
      <button
        ref={jumpTabRef}
        type="button"
        role="tab"
        aria-selected={jumpActive}
        className={`${iconBtn.secondary} ${styles.tab} ${jumpActive ? styles.tabActive : ""}`}
        onClick={onToggleJump}
      >
        <span className={styles.tabInner}>
          <IconJump className={styles.tabIcon} aria-hidden />
          <span className={styles.tabLabel}>{t("timelineSideTabs.jump")}</span>
        </span>
      </button>
    </div>
  );
}
