import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconClear } from "../../components/icons/Icons";
import { submitSurvey } from "../../lib/submitSurvey";
import { useStore } from "../../store/StoreContext";
import { FACE_ICONS } from "./FaceIcons";
import styles from "./SurveyCard.module.css";

const APP_VERSION = "1.0.0";

interface SurveyCardProps {
  open: boolean;
  onClose: () => void;
  /** Auto-prompt close marks dismissed; settings close without status change if still pending */
  dismissOnClose?: boolean;
  onSubmitted?: () => void;
}

export function SurveyCard({ open, onClose, dismissOnClose = true, onSubmitted }: SurveyCardProps) {
  const { t, i18n } = useTranslation();
  const { dispatch } = useStore();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setRating(null);
      setComment("");
      setSubmitting(false);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    if (dismissOnClose) {
      dispatch({ type: "UPDATE_SETTINGS", payload: { surveyStatus: "dismissed" } });
    }
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === null || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await submitSurvey({
        rating,
        comment: comment.trim(),
        locale: i18n.language === "ja" ? "ja" : "en",
        submittedAt: new Date().toISOString(),
        appVersion: APP_VERSION,
      });
      dispatch({ type: "UPDATE_SETTINGS", payload: { surveyStatus: "submitted" } });
      onSubmitted?.();
      onClose();
    } catch {
      setError(t("survey.error"));
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.anchor}>
      <aside className={styles.card} role="dialog" aria-label={t("survey.title")}>
        <div className={styles.header}>
          <p className={styles.question}>{t("survey.question")}</p>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label={t("copy.close")}
          >
            <IconClear width={16} height={16} />
          </button>
        </div>

        <fieldset className={styles.faces}>
          <legend className={styles.facesLegend}>{t("survey.ratingLegend")}</legend>
          {FACE_ICONS.map((Icon, index) => {
            const value = index + 1;
            const selected = rating === value;
            const label =
              value === 1 ? t("survey.veryBad") : value === 5 ? t("survey.veryGood") : undefined;
            return (
              <button
                key={value}
                type="button"
                className={`${styles.faceBtn} ${selected ? styles.faceBtnSelected : ""}`}
                aria-label={
                  label ?? t("survey.ratingValue", { value })
                }
                aria-pressed={selected}
                onClick={() => setRating(value)}
              >
                <Icon />
                {label ? (
                  <span className={styles.faceLabel}>{label}</span>
                ) : (
                  <span className={styles.faceLabelSpacer} aria-hidden />
                )}
              </button>
            );
          })}
        </fieldset>

        {rating !== null && (
          <div className={styles.stepTwo}>
            <label className={styles.commentLabel} htmlFor="survey-comment">
              {t("survey.commentLabel")}
            </label>
            <textarea
              id="survey-comment"
              className={styles.comment}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t("survey.commentPlaceholder")}
              rows={3}
            />
            <div className={styles.actions}>
              {error && <p className={styles.error}>{error}</p>}
              <button
                type="button"
                className={styles.submit}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? t("survey.sending") : t("survey.submit")}
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
