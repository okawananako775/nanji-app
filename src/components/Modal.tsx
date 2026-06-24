import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconClear } from "./icons/Icons";
import styles from "./Modal.module.css";

const CLOSE_ANIMATION_MS = 250;

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  dialogClassName?: string;
}

export function Modal({ open, title, onClose, children, dialogClassName }: ModalProps) {
  const { t } = useTranslation();
  const openedAtRef = useRef(0);
  const [render, setRender] = useState(open);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (open) {
      setRender(true);
      openedAtRef.current = performance.now();
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(() => setShown(true));
      });
      return () => cancelAnimationFrame(frame);
    }
    setShown(false);
  }, [open]);

  useEffect(() => {
    if (!shown && !open && render) {
      const timer = window.setTimeout(() => setRender(false), CLOSE_ANIMATION_MS);
      return () => window.clearTimeout(timer);
    }
  }, [shown, open, render]);

  if (!render) return null;

  const handleOverlayClick = () => {
    if (performance.now() - openedAtRef.current < CLOSE_ANIMATION_MS) return;
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
