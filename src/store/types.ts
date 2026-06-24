export interface City {
  id: string;
  name: string;
  nameJa: string;
  country: string;
  countryFlag: string;
  timezone: string;
  isHome: boolean;
  label: string | null;
  order: number;
}

export interface Group {
  id: string;
  name: string;
  isDefault: boolean;
  cities: City[];
  createdAt: number;
  updatedAt: number;
}

export interface UIState {
  activeGroupId: string | null;
  highlightHour: number | null;
  highlightDay: number | null;
  pulseCityId: string | null;
  hiddenCityIds: Record<string, boolean>;
  tempCities: City[];
  lastTimeSearchTab: "single" | "relative" | "multi";
}

export interface UserSettings {
  language: "ja" | "en";
  timeFormat: "24h" | "12h";
  colorMode: "light" | "dark" | "system";
  locationSyncEnabled: boolean;
  businessHoursEnabled: boolean;
  onboardingCompleted: boolean;
  tourCompleted: boolean;
  replayTour?: boolean;
}

export interface NormalizedSlice<T> {
  byId: Record<string, T>;
  allIds: string[];
}

export interface AppState {
  cities: NormalizedSlice<City>;
  groups: NormalizedSlice<Group>;
  ui: UIState;
  settings: UserSettings;
}

export type CityCatalogEntry = Omit<City, "isHome" | "label" | "order">;
