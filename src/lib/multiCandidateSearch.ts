import { fromZonedTime } from "date-fns-tz";
import { generateId } from "./id";
import { formatClockTime, formatDateHeading, safeFormatInTimeZone } from "./timezone";
import type { City } from "../store/types";

export interface DateCandidate {
  id: string;
  date: string;
  startHour: number;
  startMinute: 0 | 30;
  endHour: number;
  endMinute: 0 | 30;
}

export interface MultiCandidateBlock {
  baseCity: City;
  date: string;
  startUtc: Date;
  endUtc: Date;
  entries: { city: City; startUtc: Date; endUtc: Date }[];
}

export function localDateTimeToUtc(timezone: string, date: string, hour: number, minute: number): Date {
  const [y, m, d] = date.split("-").map(Number);
  const local = new Date(y, m - 1, d, hour, minute, 0, 0);
  return fromZonedTime(local, timezone);
}

export function normalizeCandidateTimes(candidate: DateCandidate): DateCandidate {
  const startTotal = candidate.startHour * 60 + candidate.startMinute;
  const endTotal = candidate.endHour * 60 + candidate.endMinute;
  if (endTotal >= startTotal) return candidate;
  return {
    ...candidate,
    startHour: candidate.endHour,
    startMinute: candidate.endMinute,
    endHour: candidate.startHour,
    endMinute: candidate.startMinute,
  };
}

export function buildDefaultTargets(
  visibleCities: City[],
  baseCityId: string,
  maxTargets = 10,
): City[] {
  return visibleCities
    .filter((city) => city.id !== baseCityId)
    .slice(0, maxTargets)
    .map((city) => ({ ...city }));
}

export function buildMultiCandidateResults(
  baseCity: City,
  candidates: DateCandidate[],
  targetCities: City[],
): MultiCandidateBlock[] {
  return candidates.map((raw) => {
    const candidate = normalizeCandidateTimes(raw);
    const startUtc = localDateTimeToUtc(
      baseCity.timezone,
      candidate.date,
      candidate.startHour,
      candidate.startMinute,
    );
    const endUtc = localDateTimeToUtc(
      baseCity.timezone,
      candidate.date,
      candidate.endHour,
      candidate.endMinute,
    );
    return {
      baseCity,
      date: candidate.date,
      startUtc,
      endUtc,
      entries: targetCities.map((city) => ({ city, startUtc, endUtc })),
    };
  });
}

function formatRangeTimes(
  startUtc: Date,
  endUtc: Date,
  timezone: string,
  timeFormat: "24h" | "12h",
): string {
  const start = formatClockTime(startUtc, timezone, timeFormat);
  const end = formatClockTime(endUtc, timezone, timeFormat);
  return `${start}〜${end}`;
}

export function formatCandidateLabel(index: number, lang: "ja" | "en", label: string): string {
  if (lang === "ja") return `${label}${index + 1}:`;
  return `${label} ${index + 1}:`;
}

export function formatCandidateEntryLine(
  city: City,
  startUtc: Date,
  endUtc: Date,
  lang: "ja" | "en",
  timeFormat: "24h" | "12h",
): string {
  const name = lang === "ja" ? city.nameJa : city.name;
  const datePart = formatDateHeading(startUtc, city.timezone, lang);
  const timePart = formatRangeTimes(startUtc, endUtc, city.timezone, timeFormat);
  if (lang === "ja") {
    return `${city.countryFlag} ${name}：${datePart} ${timePart}`;
  }
  return `${city.countryFlag} ${name}: ${datePart}, ${timePart.replace("〜", " – ")}`;
}

export function formatCandidateBlockCopy(
  block: MultiCandidateBlock,
  index: number,
  lang: "ja" | "en",
  timeFormat: "24h" | "12h",
  label: string,
): string {
  const heading = formatCandidateLabel(index, lang, label);
  const baseLine = formatCandidateEntryLine(
    block.baseCity,
    block.startUtc,
    block.endUtc,
    lang,
    timeFormat,
  );
  const lines = block.entries.map((entry) =>
    formatCandidateEntryLine(entry.city, entry.startUtc, entry.endUtc, lang, timeFormat),
  );
  return [heading, baseLine, ...lines].join("\n");
}

export function formatAllCandidatesCopy(
  blocks: MultiCandidateBlock[],
  lang: "ja" | "en",
  timeFormat: "24h" | "12h",
  label: string,
): string {
  return blocks
    .map((block, index) => formatCandidateBlockCopy(block, index, lang, timeFormat, label))
    .join("\n\n");
}

export function defaultCandidateDate(homeTimezone: string): string {
  return safeFormatInTimeZone(new Date(), homeTimezone, "yyyy-MM-dd");
}

export function createDateCandidate(homeTimezone: string, seed?: Partial<DateCandidate>): DateCandidate {
  const hour = Number(safeFormatInTimeZone(new Date(), homeTimezone, "H"));
  const minute = Number(safeFormatInTimeZone(new Date(), homeTimezone, "m"));
  const startMinute = minute >= 30 ? 30 : 0;
  return {
    id: generateId(),
    date: defaultCandidateDate(homeTimezone),
    startHour: hour,
    startMinute,
    endHour: Math.min(23, hour + 1),
    endMinute: startMinute,
    ...seed,
  };
}
