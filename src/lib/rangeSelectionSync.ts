import { addHours, addMilliseconds } from "date-fns";
import {
  candidateEndDate,
  localDateTimeToUtc,
  type DateCandidate,
} from "./multiCandidateSearch";
import { jumpTargetFromUtc, isJumpTargetInTimelineRange } from "./timeSearchJump";
import { homeSlotToUtc, safeFormatInTimeZone } from "./timezone";
import { normalizeSlotRange, type SlotRange } from "./timeGrid";
import { generateId } from "./id";

export function dateCandidateToUtcRange(
  homeTimezone: string,
  candidate: DateCandidate,
): { startUtc: Date; endUtc: Date } {
  const endDate = candidateEndDate(candidate);
  return {
    startUtc: localDateTimeToUtc(
      homeTimezone,
      candidate.date,
      candidate.startHour,
      candidate.startMinute,
    ),
    endUtc: localDateTimeToUtc(
      homeTimezone,
      endDate,
      candidate.endHour,
      candidate.endMinute,
    ),
  };
}

export function slotRangeToDateCandidate(
  homeTimezone: string,
  range: SlotRange,
  id?: string,
): DateCandidate {
  const startUtc = homeSlotToUtc(homeTimezone, range.startDay, range.startHour);
  const endExclusive = addHours(homeSlotToUtc(homeTimezone, range.endDay, range.endHour), 1);

  return {
    id: id ?? generateId(),
    date: safeFormatInTimeZone(startUtc, homeTimezone, "yyyy-MM-dd"),
    startHour: range.startHour,
    startMinute: 0,
    endHour: Number(safeFormatInTimeZone(endExclusive, homeTimezone, "H")),
    endMinute: (Number(safeFormatInTimeZone(endExclusive, homeTimezone, "m")) >= 30 ? 30 : 0) as 0 | 30,
  };
}

export function dateCandidateToSlotRange(
  homeTimezone: string,
  candidate: DateCandidate,
): SlotRange | null {
  const { startUtc, endUtc } = dateCandidateToUtcRange(homeTimezone, candidate);
  const lastInstant = addMilliseconds(endUtc, -1);
  const start = jumpTargetFromUtc(homeTimezone, startUtc);
  const end = jumpTargetFromUtc(homeTimezone, lastInstant);

  if (!isJumpTargetInTimelineRange(start.day) || !isJumpTargetInTimelineRange(end.day)) {
    return null;
  }

  return normalizeSlotRange(
    { dayOffset: start.day, hour: start.hour },
    { dayOffset: end.day, hour: end.hour },
  );
}
