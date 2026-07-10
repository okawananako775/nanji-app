import { useTranslation } from "react-i18next";
import { generateId } from "../../lib/id";
import { createDateCandidate, type DateCandidate } from "../../lib/multiCandidateSearch";
import { clampDateInput, getTimelineDateBounds } from "../../lib/timeSearchJump";
import { CalendarDatePicker } from "../../components/CalendarDatePicker";
import { IconClear } from "../../components/icons/Icons";
import styles from "./TimeSearchModal.module.css";

const MAX_CANDIDATES = 10;

interface DateCandidateListEditorProps {
  baseTimezone: string;
  candidates: DateCandidate[];
  onCandidatesChange: (candidates: DateCandidate[]) => void;
  label?: string;
  allowEmpty?: boolean;
  relaxedFieldSpacing?: boolean;
}

export function DateCandidateListEditor({
  baseTimezone,
  candidates,
  onCandidatesChange,
  label,
  allowEmpty = false,
  relaxedFieldSpacing = false,
}: DateCandidateListEditorProps) {
  const { t } = useTranslation();
  const { minDate, maxDate } = getTimelineDateBounds(baseTimezone);
  const fieldClass = relaxedFieldSpacing ? styles.fieldRelaxed : styles.field;

  const updateCandidate = (index: number, patch: Partial<DateCandidate>) => {
    onCandidatesChange(
      candidates.map((candidate, i) => (i === index ? { ...candidate, ...patch } : candidate)),
    );
  };

  const addCandidate = () => {
    if (candidates.length >= MAX_CANDIDATES) return;
    const last = candidates[candidates.length - 1];
    const seed = last ? { ...last, id: generateId() } : undefined;
    onCandidatesChange([...candidates, createDateCandidate(baseTimezone, seed)]);
  };

  const removeCandidate = (index: number) => {
    if (!allowEmpty && candidates.length <= 1) return;
    onCandidatesChange(candidates.filter((_, i) => i !== index));
  };

  return (
    <div className={fieldClass}>
      <div className={styles.label}>{label ?? t("timeSearch.multiCandidates")}</div>
      {candidates.length > 0 && (
        <div className={styles.candidateList}>
          {candidates.map((candidate, index) => (
            <div key={candidate.id} className={styles.candidateRow}>
              <div className={styles.candidateHead}>
                <span className={styles.candidateNum}>{index + 1}</span>
                <CalendarDatePicker
                  className={styles.candidateDate}
                  compact
                  value={candidate.date}
                  min={minDate}
                  max={maxDate}
                  onChange={(nextDate) =>
                    updateCandidate(index, { date: clampDateInput(nextDate, minDate, maxDate) })
                  }
                />
              </div>
              <div className={styles.candidateTimeRange}>
                <div className={styles.candidateTimeGroup}>
                  <select
                    className={`${styles.select} ${styles.candidateHour}`}
                    value={candidate.startHour}
                    onChange={(e) => updateCandidate(index, { startHour: Number(e.target.value) })}
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <option key={hour} value={hour}>
                        {String(hour).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <select
                    className={`${styles.select} ${styles.candidateMin}`}
                    value={candidate.startMinute}
                    onChange={(e) =>
                      updateCandidate(index, { startMinute: Number(e.target.value) as 0 | 30 })
                    }
                  >
                    <option value={0}>00</option>
                    <option value={30}>30</option>
                  </select>
                </div>
                <span className={styles.candidateSep}>〜</span>
                <div className={styles.candidateTimeGroup}>
                  <select
                    className={`${styles.select} ${styles.candidateHour}`}
                    value={candidate.endHour}
                    onChange={(e) => updateCandidate(index, { endHour: Number(e.target.value) })}
                  >
                    {Array.from({ length: 24 }, (_, hour) => (
                      <option key={hour} value={hour}>
                        {String(hour).padStart(2, "0")}
                      </option>
                    ))}
                  </select>
                  <select
                    className={`${styles.select} ${styles.candidateMin}`}
                    value={candidate.endMinute}
                    onChange={(e) =>
                      updateCandidate(index, { endMinute: Number(e.target.value) as 0 | 30 })
                    }
                  >
                    <option value={0}>00</option>
                    <option value={30}>30</option>
                  </select>
                </div>
              </div>
              {(allowEmpty || candidates.length > 1) && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  aria-label={t("timeSearch.removeCandidate")}
                  onClick={() => removeCandidate(index)}
                >
                  <IconClear width={14} height={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      <button
        type="button"
        className={styles.addCandidateBtn}
        disabled={candidates.length >= MAX_CANDIDATES}
        onClick={addCandidate}
      >
        {t("timeSearch.addCandidate")}
      </button>
      {candidates.length >= MAX_CANDIDATES && (
        <p className={styles.hint}>{t("timeSearch.maxCandidates")}</p>
      )}
    </div>
  );
}
