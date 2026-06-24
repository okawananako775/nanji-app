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
    language: "en" as const,
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

export function loadState(): { state: AppState; reset: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { state: createInitialState(), reset: false };
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.cities?.byId || !parsed.settings) throw new Error("invalid");
    return { state: normalizeLoadedState(parsed), reset: false };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { state: createInitialState(), reset: true };
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
