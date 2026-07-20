import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useSurfaceTransition } from "../hooks/useSurfaceTransition";
import { SURFACE_TRANSITION_MS } from "../lib/surfaceTransition";
import { IconClear } from "./icons/Icons";
import styles from "./Modal.module.css";

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  dialogClassName?: string;
}

export function Modal({ open, title, onClose, children, dialogClassName }: ModalProps) {
  const { t } = useTranslation();
  const { render, shown, openedAtRef } = useSurfaceTransition(open);

  if (!render) return null;

  const handleOverlayClick = () => {
    if (performance.now() - openedAtRef.current < SURFACE_TRANSITION_MS) return;
    onClose();
  };

  return (
    <div
      className={`${styles.overlay}${shown ? ` ${styles.overlayShown}` : ""}`}
      onClick={handleOverlayClick}
      role="presentation"
    >
      <div
        className={`${styles.dialog}${shown ? ` ${styles.dialogShown}` : ""}${dialogClassName ? ` ${dialogClassName}` : ""}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={t("copy.close")}
          >
            <IconClear width={16} height={16} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
