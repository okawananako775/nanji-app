import type { AppState, City, Group } from "./types";

export type Action =
  | { type: "HYDRATE"; payload: AppState }
  | { type: "ADD_CITY"; payload: { city: City } }
  | { type: "REMOVE_CITY"; payload: { cityId: string } }
  | { type: "SET_HOME_CITY"; payload: { city: City } }
  | { type: "CLEAR_ALL_CITIES" }
  | { type: "UPDATE_SETTINGS"; payload: Partial<AppState["settings"]> }
  | { type: "SET_HIGHLIGHT"; payload: { day: number | null; hour: number | null } }
  | { type: "SET_PULSE_CITY"; payload: { cityId: string | null } }
  | { type: "SET_ACTIVE_GROUP"; payload: { groupId: string | null } }
  | { type: "SET_TIME_SEARCH_TAB"; payload: { tab: AppState["ui"]["lastTimeSearchTab"] } }
  | { type: "TOGGLE_HIDDEN"; payload: { cityId: string; hidden?: boolean } }
  | { type: "REORDER"; payload: { cityIds: string[] } }
  | { type: "ADD_TEMP_CITY"; payload: { city: City } }
  | { type: "REMOVE_TEMP_CITY"; payload: { cityId: string } }
  | { type: "ADD_TEMP_TO_GROUP"; payload: { cityId: string } }
  | { type: "SAVE_GROUP"; payload: { group: Group; activate?: boolean } }
  | { type: "DELETE_GROUP"; payload: { groupId: string } }
  | { type: "TOGGLE_GROUP_DEFAULT"; payload: { groupId: string; isDefault?: boolean } };

const MAX_CITIES = 10;
const MAX_GROUPS = 3;

function syncHomeFlags(state: AppState, homeId: string): AppState {
  const newById = { ...state.cities.byId };
  state.cities.allIds.forEach((id) => {
    newById[id] = { ...newById[id], isHome: id === homeId };
  });

  const newGroupsById = { ...state.groups.byId };
  state.groups.allIds.forEach((gid) => {
    const group = state.groups.byId[gid];
    if (!group) return;
    newGroupsById[gid] = {
      ...group,
      cities: group.cities.map((c) => ({ ...c, isHome: c.id === homeId })),
      updatedAt: Date.now(),
    };
  });

  const tempCities = state.ui.tempCities.map((c) => ({ ...c, isHome: c.id === homeId }));

  return {
    ...state,
    cities: { ...state.cities, byId: newById },
    groups: { ...state.groups, byId: newGroupsById },
    ui: { ...state.ui, tempCities },
  };
}

function withOrderedCities(cities: City[]): City[] {
  return cities.map((city, index) => ({ ...city, order: index }));
}

function moveHomeCityToFront(state: AppState, homeId: string): AppState {
  let next = state;

  if (next.cities.byId[homeId]) {
    const otherIds = next.cities.allIds.filter((id) => id !== homeId);
    const orderedIds = [homeId, ...otherIds];
    const newById = { ...next.cities.byId };
    orderedIds.forEach((id, order) => {
      newById[id] = { ...newById[id], order };
    });
    next = { ...next, cities: { byId: newById, allIds: orderedIds } };
  }

  const newGroupsById = { ...next.groups.byId };
  let groupsChanged = false;
  const { activeGroupId } = next.ui;

  next.groups.allIds.forEach((gid) => {
    const group = newGroupsById[gid];
    if (!group || !group.cities.some((c) => c.id === homeId)) return;
    const homeCity = group.cities.find((c) => c.id === homeId)!;
    const others = group.cities.filter((c) => c.id !== homeId);
    newGroupsById[gid] = {
      ...group,
      cities: [{ ...homeCity, isHome: true }, ...others.map((city) => ({ ...city, isHome: false }))].map(
        (city, order) => ({ ...city, order }),
      ),
      updatedAt: Date.now(),
    };
    groupsChanged = true;
  });

  if (groupsChanged) {
    next = { ...next, groups: { ...next.groups, byId: newGroupsById } };
  }

  const { tempCities } = next.ui;
  if (activeGroupId && tempCities.some((c) => c.id === homeId)) {
    const group = next.groups.byId[activeGroupId];
    const groupLen = group?.cities.length ?? 0;
    const homeTemp = tempCities.find((c) => c.id === homeId)!;
    const rest = tempCities.filter((c) => c.id !== homeId);
    next = {
      ...next,
      ui: {
        ...next.ui,
        tempCities: [{ ...homeTemp, isHome: true }, ...rest.map((city) => ({ ...city, isHome: false }))].map(
          (city, index) => ({
            ...city,
            order: groupLen + index,
          }),
        ),
      },
    };
  }

  return next;
}

function getDisplayCityList(state: AppState): City[] {
  const { activeGroupId, tempCities } = state.ui;
  if (activeGroupId && state.groups.byId[activeGroupId]) {
    const group = state.groups.byId[activeGroupId];
    const groupIds = new Set(group.cities.map((c) => c.id));
    const extras = tempCities.filter((c) => !groupIds.has(c.id));
    return withOrderedCities([...group.cities, ...extras]);
  }
  return withOrderedCities(state.cities.allIds.map((id) => state.cities.byId[id]).filter(Boolean));
}

function countDisplayCities(state: AppState): number {
  return getDisplayCityList(state).length;
}

function findDisplayCityConflict(state: AppState, city: City): City | undefined {
  return getDisplayCityList(state).find((c) => c.id === city.id);
}

function upsertCityInStore(state: AppState, city: City): AppState {
  const exists = state.cities.allIds.includes(city.id);
  if (exists) {
    return {
      ...state,
      cities: {
        ...state.cities,
        byId: { ...state.cities.byId, [city.id]: { ...state.cities.byId[city.id], ...city } },
      },
    };
  }
  return {
    ...state,
    cities: {
      byId: { ...state.cities.byId, [city.id]: { ...city, order: state.cities.allIds.length } },
      allIds: [...state.cities.allIds, city.id],
    },
  };
}

function upsertHomeCityInStore(state: AppState, city: City): AppState {
  const { activeGroupId } = state.ui;
  let source = city;

  if (activeGroupId) {
    const group = state.groups.byId[activeGroupId];
    const fromGroup = group?.cities.find((entry) => entry.id === city.id);
    if (fromGroup) {
      source = { ...fromGroup, ...city, isHome: true };
    }
  }

  const homeCity = { ...source, isHome: true };
  if (state.cities.allIds.includes(city.id)) {
    return {
      ...state,
      cities: {
        ...state.cities,
        byId: { ...state.cities.byId, [city.id]: { ...state.cities.byId[city.id], ...homeCity } },
      },
    };
  }
  return {
    ...state,
    cities: {
      byId: { ...state.cities.byId, [city.id]: { ...homeCity, order: state.cities.allIds.length } },
      allIds: [...state.cities.allIds, city.id],
    },
  };
}

function ensureHomeVisibleInGroupView(state: AppState, homeId: string, cityPayload?: City): AppState {
  const { activeGroupId, tempCities } = state.ui;
  if (!activeGroupId) return state;
  const group = state.groups.byId[activeGroupId];
  if (!group) return state;

  const tempWithoutDuplicate = tempCities.filter((city) => city.id !== homeId);

  if (group.cities.some((city) => city.id === homeId)) {
    if (tempWithoutDuplicate.length === tempCities.length) return state;
    return {
      ...state,
      ui: { ...state.ui, tempCities: tempWithoutDuplicate },
    };
  }

  if (tempCities.some((city) => city.id === homeId)) return state;

  const homeCity = state.cities.byId[homeId] ?? cityPayload;
  if (!homeCity) return state;

  const nextCity = {
    ...homeCity,
    isHome: true,
    order: group.cities.length + tempWithoutDuplicate.length,
  };

  return {
    ...state,
    ui: {
      ...state.ui,
      tempCities: [...tempWithoutDuplicate, nextCity],
    },
  };
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;

    case "ADD_CITY": {
      const { city } = action.payload;
      const { activeGroupId } = state.ui;

      if (activeGroupId && state.groups.byId[activeGroupId]) {
        const group = state.groups.byId[activeGroupId];
        const conflict =
          group.cities.find((c) => c.id === city.id) ??
          state.ui.tempCities.find((c) => c.id === city.id);
        if (conflict) {
          return { ...state, ui: { ...state.ui, pulseCityId: conflict.id } };
        }
        if (countDisplayCities(state) >= MAX_CITIES) return state;
        const nextCity = { ...city, isHome: false, order: group.cities.length + state.ui.tempCities.length };
        let next = upsertCityInStore(state, nextCity);
        next = {
          ...next,
          ui: { ...next.ui, tempCities: [...next.ui.tempCities, nextCity], pulseCityId: null },
        };
        return next;
      }

      const conflict = findDisplayCityConflict(state, city);
      if (conflict) {
        return { ...state, ui: { ...state.ui, pulseCityId: conflict.id } };
      }
      if (countDisplayCities(state) >= MAX_CITIES) return state;
      const nextCity = { ...city, order: state.cities.allIds.length };
      return {
        ...upsertCityInStore(state, nextCity),
        ui: { ...state.ui, pulseCityId: null },
      };
    }

    case "REMOVE_CITY": {
      const { cityId } = action.payload;
      const city = state.cities.byId[cityId];
      if (!city || city.isHome) return state;

      if (state.ui.activeGroupId) {
        const inTemp = state.ui.tempCities.some((c) => c.id === cityId);
        if (inTemp) {
          return {
            ...state,
            ui: {
              ...state.ui,
              tempCities: state.ui.tempCities.filter((c) => c.id !== cityId),
            },
          };
        }
      }

      const { [cityId]: _, ...rest } = state.cities.byId;
      const allIds = state.cities.allIds.filter((id) => id !== cityId);
      allIds.forEach((id, i) => {
        rest[id] = { ...rest[id], order: i };
      });
      const hiddenCityIds = { ...state.ui.hiddenCityIds };
      delete hiddenCityIds[cityId];
      return {
        ...state,
        cities: { byId: rest, allIds },
        ui: { ...state.ui, hiddenCityIds, tempCities: state.ui.tempCities.filter((c) => c.id !== cityId) },
      };
    }

    case "SET_HOME_CITY": {
      const homeId = action.payload.city.id;
      let next = upsertHomeCityInStore(state, action.payload.city);
      next = syncHomeFlags(next, homeId);
      next = moveHomeCityToFront(next, homeId);
      return ensureHomeVisibleInGroupView(next, homeId, action.payload.city);
    }

    case "CLEAR_ALL_CITIES": {
      const homeId = state.cities.allIds.find((id) => state.cities.byId[id]?.isHome);
      if (!homeId) return state;
      const home = { ...state.cities.byId[homeId], order: 0 };
      return {
        ...state,
        cities: { byId: { [homeId]: home }, allIds: [homeId] },
        ui: { ...state.ui, tempCities: [], hiddenCityIds: {}, activeGroupId: null },
      };
    }

    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case "SET_HIGHLIGHT":
      return {
        ...state,
        ui: {
          ...state.ui,
          highlightDay: action.payload.day,
          highlightHour: action.payload.hour,
        },
      };

    case "SET_PULSE_CITY":
      return { ...state, ui: { ...state.ui, pulseCityId: action.payload.cityId } };

    case "SET_ACTIVE_GROUP":
      return {
        ...state,
        ui: {
          ...state.ui,
          activeGroupId: action.payload.groupId,
          tempCities: [],
          pulseCityId: null,
          hiddenCityIds: {},
        },
      };

    case "SET_TIME_SEARCH_TAB":
      return { ...state, ui: { ...state.ui, lastTimeSearchTab: action.payload.tab } };

    case "TOGGLE_HIDDEN": {
      const { cityId, hidden } = action.payload;
      const nextHidden = hidden ?? !state.ui.hiddenCityIds[cityId];
      const hiddenCityIds = { ...state.ui.hiddenCityIds };
      if (nextHidden) hiddenCityIds[cityId] = true;
      else delete hiddenCityIds[cityId];
      return { ...state, ui: { ...state.ui, hiddenCityIds } };
    }

    case "REORDER": {
      const { cityIds } = action.payload;
      const homeId = cityIds.find((id) => state.cities.byId[id]?.isHome || getDisplayCityList(state).find((c) => c.id === id)?.isHome);
      const orderedIds = homeId ? [homeId, ...cityIds.filter((id) => id !== homeId)] : cityIds;

      if (state.ui.activeGroupId && state.groups.byId[state.ui.activeGroupId]) {
        const group = state.groups.byId[state.ui.activeGroupId];
        const groupIdSet = new Set(group.cities.map((c) => c.id));
        const reorderedGroup = orderedIds
          .filter((id) => groupIdSet.has(id))
          .map((id, order) => {
            const existing = group.cities.find((c) => c.id === id)!;
            return { ...existing, order };
          });
        const tempIds = orderedIds.filter((id) => !groupIdSet.has(id));
        const reorderedTemp = tempIds.map((id, i) => {
          const existing = state.ui.tempCities.find((c) => c.id === id)!;
          return { ...existing, order: reorderedGroup.length + i };
        });
        return {
          ...state,
          groups: {
            ...state.groups,
            byId: {
              ...state.groups.byId,
              [group.id]: { ...group, cities: reorderedGroup, updatedAt: Date.now() },
            },
          },
          ui: { ...state.ui, tempCities: reorderedTemp },
        };
      }

      const newById = { ...state.cities.byId };
      orderedIds.forEach((id, order) => {
        if (newById[id]) newById[id] = { ...newById[id], order };
      });
      return { ...state, cities: { ...state.cities, byId: newById, allIds: orderedIds.filter((id) => newById[id]) } };
    }

    case "ADD_TEMP_CITY": {
      const { city } = action.payload;
      const conflict = findDisplayCityConflict(state, city);
      if (conflict) {
        return { ...state, ui: { ...state.ui, pulseCityId: conflict.id } };
      }
      if (countDisplayCities(state) >= MAX_CITIES) return state;
      let next = upsertCityInStore(state, city);
      return {
        ...next,
        ui: { ...next.ui, tempCities: [...next.ui.tempCities, city], pulseCityId: null },
      };
    }

    case "REMOVE_TEMP_CITY":
      return {
        ...state,
        ui: { ...state.ui, tempCities: state.ui.tempCities.filter((c) => c.id !== action.payload.cityId) },
      };

    case "ADD_TEMP_TO_GROUP": {
      const { cityId } = action.payload;
      const temp = state.ui.tempCities.find((c) => c.id === cityId);
      if (!temp || !state.ui.activeGroupId) return state;
      const group = state.groups.byId[state.ui.activeGroupId];
      if (!group || group.cities.length >= MAX_CITIES) return state;
      if (group.cities.some((c) => c.id === cityId)) return state;
      return {
        ...state,
        groups: {
          ...state.groups,
          byId: {
            ...state.groups.byId,
            [group.id]: {
              ...group,
              cities: [...group.cities, { ...temp, order: group.cities.length }],
              updatedAt: Date.now(),
            },
          },
        },
        ui: { ...state.ui, tempCities: state.ui.tempCities.filter((c) => c.id !== cityId) },
      };
    }

    case "SAVE_GROUP": {
      const { group, activate = true } = action.payload;
      const exists = state.groups.allIds.includes(group.id);
      if (!exists && state.groups.allIds.length >= MAX_GROUPS) return state;

      const homeId = state.cities.allIds.find((id) => state.cities.byId[id]?.isHome);
      const cities = withOrderedCities(
        group.cities.map((c) => ({ ...c, isHome: c.id === homeId })),
      );

      const saved: Group = { ...group, cities, updatedAt: Date.now() };
      const groupsById = { ...state.groups.byId, [saved.id]: saved };
      const allIds = exists ? state.groups.allIds : [...state.groups.allIds, saved.id];

      let next: AppState = {
        ...state,
        groups: { byId: groupsById, allIds },
      };

      if (saved.isDefault) {
        allIds.forEach((gid) => {
          if (gid !== saved.id && groupsById[gid]) {
            groupsById[gid] = { ...groupsById[gid], isDefault: false };
          }
        });
      }

      if (activate) {
        next = {
          ...next,
          groups: { byId: groupsById, allIds },
          ui: { ...next.ui, activeGroupId: saved.id, tempCities: [] },
        };
      }

      return { ...next, groups: { byId: groupsById, allIds } };
    }

    case "DELETE_GROUP": {
      const { groupId } = action.payload;
      const { [groupId]: _, ...rest } = state.groups.byId;
      const allIds = state.groups.allIds.filter((id) => id !== groupId);
      return {
        ...state,
        groups: { byId: rest, allIds },
        ui: {
          ...state.ui,
          activeGroupId: state.ui.activeGroupId === groupId ? null : state.ui.activeGroupId,
        },
      };
    }

    case "TOGGLE_GROUP_DEFAULT": {
      const { groupId } = action.payload;
      const group = state.groups.byId[groupId];
      if (!group) return state;
      const isDefault = action.payload.isDefault ?? !group.isDefault;
      const groupsById = { ...state.groups.byId };
      state.groups.allIds.forEach((gid) => {
        const g = groupsById[gid];
        if (g) groupsById[gid] = { ...g, isDefault: gid === groupId ? isDefault : false };
      });
      const ui =
        !isDefault && state.ui.activeGroupId === groupId
          ? { ...state.ui, activeGroupId: null }
          : state.ui;
      return { ...state, groups: { ...state.groups, byId: groupsById }, ui };
    }

    default:
      return state;
  }
}

export { MAX_CITIES, MAX_GROUPS };

export function canAddDisplayCity(state: AppState): boolean {
  return countDisplayCities(state) < MAX_CITIES;
}
