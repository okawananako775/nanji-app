import { useTranslation } from "react-i18next";
import {
  formatAllCandidatesCopy,
  formatCandidateBlockCopy,
  formatCandidateEntryLine,
  formatCandidateHeading,
  type MultiCandidateBlock,
} from "../../lib/multiCandidateSearch";
import { copyToClipboard } from "../../lib/copyToClipboard";
import { useStore } from "../../store/StoreContext";
import styles from "./TimeSearchModal.module.css";

interface MultiCandidateResultsProps {
  results: MultiCandidateBlock[];
  onBack: () => void;
  onCopied: (message: string) => void;
}

export function MultiCandidateResults({ results, onBack, onCopied }: MultiCandidateResultsProps) {
  const { t } = useTranslation();
  const { state } = useStore();
  const lang = state.settings.language;
  const timeFormat = state.settings.timeFormat;
  const label = t("timeSearch.candidateLabel");

  const copyText = async (text: string) => {
    const ok = await copyToClipboard(text);
    onCopied(ok ? t("copy.success") : t("copy.failed"));
  };

  return (
    <>
      <div className={styles.copyActions}>
        <button
          type="button"
          className={styles.copyAllBtn}
          onClick={() => void copyText(formatAllCandidatesCopy(results, "ja", timeFormat, label))}
        >
          {t("timeSearch.copyAllJa")}
        </button>
        <button
          type="button"
          className={styles.copyAllBtn}
          onClick={() => void copyText(formatAllCandidatesCopy(results, "en", timeFormat, label))}
        >
          {t("timeSearch.copyAllEn")}
        </button>
      </div>

      <div className={styles.resultList}>
        {results.map((block, index) => (
          <div key={`${block.startUtc.toISOString()}-${index}`} className={styles.resultBlock}>
            <div className={styles.resultHeading}>
              {formatCandidateHeading(index, block, lang, timeFormat, label)}
            </div>
            <div className={styles.resultLines}>
              {block.entries.map((entry) => (
                <div key={entry.city.id}>
                  {formatCandidateEntryLine(
                    entry.city,
                    entry.startUtc,
                    entry.endUtc,
                    lang,
                    timeFormat,
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              className={styles.copyOneBtn}
              onClick={() =>
                void copyText(formatCandidateBlockCopy(block, index, lang, timeFormat, label))
              }
            >
              {t("timeSearch.copyOne")}
            </button>
          </div>
        ))}
      </div>

      <button type="button" className={styles.backBtn} onClick={onBack}>
        {t("timeSearch.backToInput")}
      </button>
    </>
  );
}
