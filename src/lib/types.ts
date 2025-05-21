
export type WeatherLocation = {
  id?: string;
  name: string;
  lat: number;
  lon: number;
  country?: string;
  state?: string;
};

export type WeatherCondition = {
  id: number;
  main: string;
  description: string;
  icon: string;
};

export type WeatherData = {
  id?: string;
  location: WeatherLocation;
  searchDate: string;
  date: string;
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  clouds: number;
  weather: WeatherCondition[];
  rain?: { "1h"?: number; "3h"?: number };
  snow?: { "1h"?: number; "3h"?: number };
  sunrise?: number;
  sunset?: number;
};

export type SavedSearch = {
  id: string;
  location: WeatherLocation;
  startDate: string;
  endDate: string;
  createdAt: string;
};

export interface LocationSearchResult {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export type ExportFormat = 'json' | 'csv' | 'xml' | 'pdf' | 'md';
