import { useEffect, useState, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import {
  buildDefaultTargets,
  type DateCandidate,
  type MultiCandidateBlock,
} from "../../lib/multiCandidateSearch";
import { formatClockTime, homeSlotToUtc } from "../../lib/timezone";
import { useStore } from "../../store/StoreContext";
import { selectVisibleCities } from "../../store/selectors";
import type { City } from "../../store/types";
import { MultiCandidatePanel } from "../time-search/MultiCandidatePanel";
import { MultiCandidateResults } from "../time-search/MultiCandidateResults";
import searchStyles from "../time-search/TimeSearchModal.module.css";
import { SidePanel } from "./SidePanel";

interface RangeSelectionModalProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  home: City;
  timeFormat: "24h" | "12h";
  candidates: DateCandidate[];
  onCandidatesChange: (candidates: DateCandidate[]) => void;
  pendingRangeStart: { dayOffset: number; hour: number } | null;
  onBaseCityChange: (city: City) => void;
  onCopied: (message: string) => void;
  embedded?: boolean;
  onTitleChange?: (title: string) => void;
}

export function RangeSelectionModal({
  open,
  onClose,
  anchorRef,
  home,
  timeFormat,
  candidates,
  onCandidatesChange,
  pendingRangeStart,
  onBaseCityChange,
  onCopied,
  embedded = false,
  onTitleChange,
}: RangeSelectionModalProps) {
  const { t } = useTranslation();
  const { state } = useStore();
  const [view, setView] = useState<"form" | "results">("form");
  const [results, setResults] = useState<MultiCandidateBlock[] | null>(null);
  const [baseCityId, setBaseCityId] = useState(home.id);
  const [targetCities, setTargetCities] = useState<City[]>([]);

  useEffect(() => {
    if (!open) return;
    setView("form");
    setResults(null);
    setBaseCityId(home.id);
    setTargetCities(buildDefaultTargets(selectVisibleCities(state), home.id));
    onBaseCityChange(home);
  }, [open, home, onBaseCityChange, state.cities, state.ui.activeGroupId, state.ui.hiddenCityIds]);

  const pendingTimeLabel =
    pendingRangeStart !== null
      ? formatClockTime(
          homeSlotToUtc(home.timezone, pendingRangeStart.dayOffset, pendingRangeStart.hour),
          home.timezone,
          timeFormat,
        )
      : null;

  const handleBaseCityChange = (city: City) => {
    setBaseCityId(city.id);
    onBaseCityChange(city);
  };

  const handleConvert = (converted: MultiCandidateBlock[]) => {
    setResults(converted);
    setView("results");
  };

  const title = view === "results" ? t("timeSearch.resultsTitle") : t("rangeSelection.title");

  useEffect(() => {
    onTitleChange?.(title);
  }, [title, onTitleChange]);

  const content = (
    <>
      {view === "form" && (
        <>
          {pendingTimeLabel && (
            <p className={searchStyles.fieldHint}>{t("copy.rangeHint", { time: pendingTimeLabel })}</p>
          )}
          <MultiCandidatePanel
            baseCityId={baseCityId}
            onBaseCityChange={handleBaseCityChange}
            candidates={candidates}
            onCandidatesChange={onCandidatesChange}
            targetCities={targetCities}
            onTargetCitiesChange={setTargetCities}
            onSearch={handleConvert}
            submitLabel={t("rangeSelection.convert")}
            candidatesAllowEmpty
            relaxedFieldSpacing
          />
        </>
      )}
      {view === "results" && results && (
        <MultiCandidateResults results={results} onBack={() => setView("form")} onCopied={onCopied} />
      )}
    </>
  );

  if (embedded) return content;

  return (
    <SidePanel open={open} onClose={onClose} anchorRef={anchorRef} title={title}>
      {content}
    </SidePanel>
  );
}
