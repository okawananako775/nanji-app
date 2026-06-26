import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  parse,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { enUS, ja as jaLocale } from "date-fns/locale";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { IconArrow } from "./icons/Icons";
import styles from "./CalendarDatePicker.module.css";

interface CalendarDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  className?: string;
  compact?: boolean;
}

function parseDateValue(value: string): Date {
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toDateValue(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function isDateDisabled(date: Date, min?: string, max?: string): boolean {
  const value = toDateValue(date);
  if (min && value < min) return true;
  if (max && value > max) return true;
  return false;
}

export function CalendarDatePicker({
  value,
  onChange,
  min,
  max,
  className,
  compact = false,
}: CalendarDatePickerProps) {
  const { t, i18n } = useTranslation();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<CSSProperties>({});
  const selectedDate = useMemo(() => parseDateValue(value), [value]);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(selectedDate));

  const locale = i18n.language === "ja" ? jaLocale : enUS;

  const dateDisplayPattern = i18n.language === "ja" ? "yyyy年M月d日" : "MMM d, yyyy";
  const monthDisplayPattern = i18n.language === "ja" ? "yyyy年M月" : "MMMM yyyy";

  useEffect(() => {
    if (open) setViewMonth(startOfMonth(selectedDate));
  }, [open, selectedDate]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (popoverRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const width = Math.min(288, window.innerWidth - 32);
      const left = Math.min(Math.max(16, rect.left), window.innerWidth - width - 16);
      const estimatedHeight = 320;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < estimatedHeight && rect.top > estimatedHeight;

      setPopoverStyle({
        position: "fixed",
        left,
        top: openUp ? rect.top - estimatedHeight - 6 : rect.bottom + 6,
        width,
      });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, viewMonth]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  const weekdayLabels = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
    return Array.from({ length: 7 }, (_, index) =>
      format(new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index), "EEEEE", {
        locale,
      }),
    );
  }, [locale]);

  const displayValue = format(selectedDate, dateDisplayPattern, { locale });

  const monthLabel = format(viewMonth, monthDisplayPattern, { locale });

  const canGoPrev =
    !min || toDateValue(endOfMonth(subMonths(viewMonth, 1))) >= min;
  const canGoNext =
    !max || toDateValue(startOfMonth(addMonths(viewMonth, 1))) <= max;

  const selectDate = (date: Date) => {
    if (isDateDisabled(date, min, max)) return;
    onChange(toDateValue(date));
    setOpen(false);
  };

  const popover =
    open &&
    createPortal(
      <div
        ref={popoverRef}
        id={listboxId}
        className={styles.popover}
        style={popoverStyle}
        role="dialog"
        aria-label={t("calendar.title")}
      >
        <div className={styles.header}>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navBtnPrev}`}
            aria-label={t("calendar.prevMonth")}
            disabled={!canGoPrev}
            onClick={() => setViewMonth((month) => subMonths(month, 1))}
          >
            <IconArrow width={14} height={14} />
          </button>
          <span className={styles.monthLabel}>{monthLabel}</span>
          <button
            type="button"
            className={`${styles.navBtn} ${styles.navBtnNext}`}
            aria-label={t("calendar.nextMonth")}
            disabled={!canGoNext}
            onClick={() => setViewMonth((month) => addMonths(month, 1))}
          >
            <IconArrow width={14} height={14} />
          </button>
        </div>

        <div className={styles.weekdays}>
          {weekdayLabels.map((label) => (
            <span key={label} className={styles.weekday}>
              {label}
            </span>
          ))}
        </div>

        <div className={styles.grid}>
          {days.map((day) => {
            const outside = !isSameMonth(day, viewMonth);
            const selected = isSameDay(day, selectedDate);
            const today = isToday(day);
            const disabled = isDateDisabled(day, min, max);

            return (
              <button
                key={toDateValue(day)}
                type="button"
                className={[
                  styles.day,
                  outside ? styles.dayOutside : "",
                  today ? styles.dayToday : "",
                  selected ? styles.daySelected : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={disabled}
                aria-pressed={selected}
                onClick={() => selectDate(day)}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>,
      document.body,
    );

  return (
    <div
      ref={rootRef}
      className={[styles.root, compact ? styles.compact : "", className].filter(Boolean).join(" ")}
    >
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{displayValue}</span>
        <IconArrow className={styles.triggerIcon} width={14} height={14} />
      </button>

      {popover}
    </div>
  );
}
