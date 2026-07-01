import coordinates from "../data/cityCoordinates.json";

export interface CityCoordinate {
  lat: number;
  lng: number;
}

const CITY_COORDINATES = coordinates as Record<string, CityCoordinate>;

export function getCityCoordinate(cityId: string): CityCoordinate | undefined {
  return CITY_COORDINATES[cityId];
}
