import { useState } from "react";
import { useTranslation } from "react-i18next";
import { copyToClipboard } from "../lib/copyToClipboard";
import { Modal } from "./Modal";
import { Snackbar } from "./Snackbar";
import styles from "./CopySheet.module.css";

interface CopySheetProps {
  open: boolean;
  heading?: string;
  textJa: string;
  textEn: string;
  onClose: () => void;
}

export function CopySheet({ open, heading, textJa, textEn, onClose }: CopySheetProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (lang: "ja" | "en") => {
    const text = lang === "ja" ? textJa : textEn;
    const ok = await copyToClipboard(text);
    setCopied(ok ? t("copy.success") : t("copy.failed"));
  };

  return (
    <Modal
      open={open}
      title={heading ?? t("copy.title")}
      onClose={onClose}
      dialogClassName={styles.dialog}
    >
      <section className={styles.block}>
        <div className={styles.label}>日本語</div>
        <pre className={styles.preview}>{textJa}</pre>
        <button type="button" className={styles.copyBtn} onClick={() => void handleCopy("ja")}>
          {t("copy.ja")}
        </button>
      </section>

      <section className={styles.block}>
        <div className={styles.label}>English</div>
        <pre className={styles.preview}>{textEn}</pre>
        <button type="button" className={styles.copyBtn} onClick={() => void handleCopy("en")}>
          {t("copy.en")}
        </button>
      </section>

      <Snackbar variant="inline" message={copied} onDone={() => setCopied(null)} />
    </Modal>
  );
}
