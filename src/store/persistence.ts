import type { AppState } from "./types";
import { createInitialState } from "./initialState";

const STORAGE_KEY = "nanji_v2";

function normalizeLoadedState(parsed: AppState): AppState {
  const ui = {
    ...createInitialState().ui,
    ...parsed.ui,
    pulseCityId: parsed.ui?.pulseCityId ?? null,
    lastTimeSearchTab: parsed.ui?.lastTimeSearchTab ?? "single",
    tempCities: parsed.ui?.tempCities ?? [],
    hiddenCityIds: parsed.ui?.hiddenCityIds ?? {},
  };

  const defaultGroupId = parsed.groups?.allIds?.find((id) => parsed.groups.byId[id]?.isDefault);

  if (ui.activeGroupId) {
    const activeGroup = parsed.groups?.byId[ui.activeGroupId];
    if (!activeGroup?.isDefault) {
      ui.activeGroupId = null;
    }
  }

  if (defaultGroupId && !ui.activeGroupId) {
    ui.activeGroupId = defaultGroupId;
  }

  const settings = {
    ...createInitialState().settings,
    ...parsed.settings,
    language: (parsed.settings?.language === "ja" ? "ja" : "en") as "ja" | "en",
    onboardingCompleted: parsed.settings?.onboardingCompleted ?? true,
    tourCompleted: parsed.settings?.tourCompleted ?? true,
    replayTour: false,
  };

  return {
    ...parsed,
    groups: parsed.groups ?? { byId: {}, allIds: [] },
    settings,
    ui,
  };
}

function assertLoadedStateShape(parsed: unknown): asserts parsed is AppState {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("invalid");
  }
  const record = parsed as Record<string, unknown>;
  const cities = record.cities;
  if (typeof cities !== "object" || cities === null || Array.isArray(cities)) {
    throw new Error("invalid");
  }
  const citiesRecord = cities as Record<string, unknown>;
  if (
    typeof citiesRecord.byId !== "object" ||
    citiesRecord.byId === null ||
    Array.isArray(citiesRecord.byId)
  ) {
    throw new Error("invalid");
  }
  if (!Array.isArray(citiesRecord.allIds)) {
    throw new Error("invalid");
  }
  if (
    typeof record.settings !== "object" ||
    record.settings === null ||
    Array.isArray(record.settings)
  ) {
    throw new Error("invalid");
  }
  if (record.groups !== undefined) {
    if (typeof record.groups !== "object" || record.groups === null || Array.isArray(record.groups)) {
      throw new Error("invalid");
    }
    const groups = record.groups as Record<string, unknown>;
    if (typeof groups.byId !== "object" || groups.byId === null || Array.isArray(groups.byId)) {
      throw new Error("invalid");
    }
    if (!Array.isArray(groups.allIds)) {
      throw new Error("invalid");
    }
  }
}

export function loadState(): { state: AppState; reset: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: createInitialState(), reset: false };
    const parsed: unknown = JSON.parse(raw);
    assertLoadedStateShape(parsed);
    return { state: normalizeLoadedState(parsed), reset: false };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { state: createInitialState(), reset: true };
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
