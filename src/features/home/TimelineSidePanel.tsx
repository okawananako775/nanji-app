import { useEffect, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import type { DateCandidate } from "../../lib/multiCandidateSearch";
import type { City } from "../../store/types";
import { JumpPanel } from "./JumpPanel";
import { RangeSelectionModal } from "./RangeSelectionModal";
import { SidePanel } from "./SidePanel";
import styles from "./RangeSelectionModal.module.css";

export type TimelineSidePanelTab = "convert" | "jump";

interface TimelineSidePanelProps {
  open: boolean;
  tab: TimelineSidePanelTab | null;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  home: City;
  timeFormat: "24h" | "12h";
  candidates: DateCandidate[];
  onCandidatesChange: (candidates: DateCandidate[]) => void;
  pendingRangeStart: { dayOffset: number; hour: number } | null;
  onBaseCityChange: (city: City) => void;
  onCopied: (message: string) => void;
}

export function TimelineSidePanel({
  open,
  tab,
  onClose,
  anchorRef,
  home,
  timeFormat,
  candidates,
  onCandidatesChange,
  pendingRangeStart,
  onBaseCityChange,
  onCopied,
}: TimelineSidePanelProps) {
  const { t } = useTranslation();
  const [convertTitle, setConvertTitle] = useState(() => t("rangeSelection.title"));

  useEffect(() => {
    if (tab !== "convert") {
      setConvertTitle(t("rangeSelection.title"));
    }
  }, [tab, t]);

  const title = tab === "jump" ? t("jump.title") : convertTitle;

  return (
    <SidePanel open={open} onClose={onClose} anchorRef={anchorRef} title={title}>
      {tab === "convert" && (
        <div key="convert" className={styles.panelContentSwap}>
          <RangeSelectionModal
            embedded
            open
            onClose={onClose}
            anchorRef={anchorRef}
            home={home}
            timeFormat={timeFormat}
            candidates={candidates}
            onCandidatesChange={onCandidatesChange}
            pendingRangeStart={pendingRangeStart}
            onBaseCityChange={onBaseCityChange}
            onCopied={onCopied}
            onTitleChange={setConvertTitle}
          />
        </div>
      )}
      {tab === "jump" && (
        <div key="jump" className={styles.panelContentSwap}>
          <JumpPanel embedded open onClose={onClose} anchorRef={anchorRef} />
        </div>
      )}
    </SidePanel>
  );
}
