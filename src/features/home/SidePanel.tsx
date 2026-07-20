import type { CSSProperties, ReactNode, RefObject } from "react";
import { useTranslation } from "react-i18next";
import { useSurfaceTransition } from "../../hooks/useSurfaceTransition";
import { IconClear } from "../../components/icons/Icons";
import styles from "./RangeSelectionModal.module.css";
import { useMobileBottomSheet } from "./useMobileBottomSheet";
import { useRangePanelAnchor } from "./useRangePanelAnchor";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  title: string;
  children: ReactNode;
}

export function SidePanel({ open, onClose, anchorRef, title, children }: SidePanelProps) {
  const { t } = useTranslation();
  const transition = useSurfaceTransition(open);
  const anchorStyle = useRangePanelAnchor(anchorRef, transition.render);
  const sheet = useMobileBottomSheet(open);

  if (!transition.render) return null;

  const mobileStyle: CSSProperties =
    sheet.isMobile && sheet.height !== null ? { height: sheet.height } : {};

  return (
    <aside
      className={[
        styles.panel,
        sheet.isMobile ? styles.panelMobile : styles.panelDesktop,
        transition.shown ? styles.panelShown : "",
        sheet.snap === "peek" ? styles.panelPeek : "",
        sheet.isDragging ? styles.panelDragging : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ...anchorStyle, ...mobileStyle }}
      aria-label={title}
      aria-hidden={!open}
    >
      <div
        className={styles.header}
        {...(sheet.isMobile ? sheet.headerHandlers : {})}
        style={sheet.isMobile ? { touchAction: "none", cursor: "grab" } : undefined}
      >
        {sheet.isMobile && <div className={styles.sheetHandle} aria-hidden />}
        <h2 className={styles.title}>{title}</h2>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label={t("copy.close")}>
          <IconClear width={16} height={16} />
        </button>
      </div>

      <div className={styles.body}>{children}</div>
    </aside>
  );
}
