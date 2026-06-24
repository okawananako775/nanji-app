import type { AppState, City } from "./types";
import catalog from "../data/citiesCatalog.json";
import type { CityCatalogEntry } from "./types";

const homeCatalog = (catalog as CityCatalogEntry[]).find((c) => c.id === "America/Vancouver")!;

function toCity(entry: CityCatalogEntry, isHome: boolean, order: number): City {
  return { ...entry, isHome, label: null, order };
}

export function createInitialState(): AppState {
  const home = toCity(homeCatalog, true, 0);
  return {
    cities: { byId: { [home.id]: home }, allIds: [home.id] },
    groups: { byId: {}, allIds: [] },
    ui: {
      activeGroupId: null,
      highlightHour: null,
      highlightDay: null,
      pulseCityId: null,
      hiddenCityIds: {},
      tempCities: [],
      lastTimeSearchTab: "single",
    },
    settings: {
      language: "en",
      timeFormat: "24h",
      colorMode: "system",
      locationSyncEnabled: false,
      businessHoursEnabled: false,
      onboardingCompleted: false,
      tourCompleted: false,
    },
  };
}
