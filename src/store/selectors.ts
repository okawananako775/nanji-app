import type { AppState, City, Group } from "./types";

function sortByOrder(cities: City[]): City[] {
  return [...cities].sort((a, b) => {
    if (a.isHome !== b.isHome) return a.isHome ? -1 : 1;
    return a.order - b.order;
  });
}

/** Cities currently shown on the home screen (group + temp or home view). */
export function selectDisplayCities(state: AppState): City[] {
  const { activeGroupId, tempCities } = state.ui;
  if (activeGroupId && state.groups.byId[activeGroupId]) {
    const group = state.groups.byId[activeGroupId];
    const groupIds = new Set(group.cities.map((c) => c.id));
    const extras = tempCities.filter((c) => !groupIds.has(c.id));
    return sortByOrder([...group.cities, ...extras]);
  }
  return sortByOrder(state.cities.allIds.map((id) => state.cities.byId[id]).filter(Boolean));
}

/** @deprecated alias */
export const selectActiveCities = selectDisplayCities;

export function selectVisibleCities(state: AppState): City[] {
  return selectDisplayCities(state).filter((c) => !state.ui.hiddenCityIds[c.id]);
}

export function selectHomeCity(state: AppState): City | undefined {
  const homeId = state.cities.allIds.find((id) => state.cities.byId[id]?.isHome);
  if (homeId) return state.cities.byId[homeId];
  return selectDisplayCities(state).find((c) => c.isHome);
}

export function selectActiveGroup(state: AppState): Group | undefined {
  const id = state.ui.activeGroupId;
  return id ? state.groups.byId[id] : undefined;
}

export function selectDefaultGroup(state: AppState): Group | undefined {
  return state.groups.allIds.map((id) => state.groups.byId[id]).find((g) => g?.isDefault);
}

export function selectTempCityIds(state: AppState): Set<string> {
  return new Set(state.ui.tempCities.map((c) => c.id));
}

export function selectIsTempCity(state: AppState, cityId: string): boolean {
  if (!state.ui.activeGroupId) return false;
  const group = state.groups.byId[state.ui.activeGroupId];
  if (!group) return false;
  return !group.cities.some((c) => c.id === cityId) && state.ui.tempCities.some((c) => c.id === cityId);
}

export function selectIsCityInActiveGroup(state: AppState, cityId: string): boolean {
  const groupId = state.ui.activeGroupId;
  if (!groupId) return false;
  const group = state.groups.byId[groupId];
  if (!group) return false;
  return group.cities.some((c) => c.id === cityId);
}
