import { LocationSearchResult, WeatherData, WeatherLocation } from "./types";

// In a real app, you'd store this securely or use environment variables
// Open-Meteo doesn't require an API key - it's completely free!
// const API_KEY = "00de254ce8422f4d1f1b80fb84ee69c2";

// Simulate database with localStorage
const STORAGE_KEY = "weather-app-data";

// API functions
export async function searchLocation(query: string): Promise<LocationSearchResult[]> {
  try {
    // Use Open-Meteo Geocoding API
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
    
    if (!response.ok) {
      console.error(`Geocoding API failed with status ${response.status}: ${await response.text()}`);
      throw new Error("Failed to search locations");
    }
    
    const data = await response.json();
    
    // Map the Open-Meteo API response to our LocationSearchResult type
    if (data.results && Array.isArray(data.results)) {
      const locations: LocationSearchResult[] = data.results.map((item: any) => ({
        name: item.name,
        lat: item.latitude,
        lon: item.longitude,
        country: item.country,
        state: item.admin1 || undefined
      }));
      
      return locations;
    }
    
    return [];
  } catch (error) {
    console.error("Error searching location:", error);
    return [];
  }
}

export async function getWeatherData(location: WeatherLocation): Promise<WeatherData | null> {
  try {
    // Use Open-Meteo Weather API
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
    );
    
    if (!response.ok) {
      console.error(`Weather API failed with status ${response.status}: ${await response.text()}`);
      throw new Error("Failed to get weather data");
    }
    
    const data = await response.json();
    
    // Map Open-Meteo's weather codes to conditions similar to OpenWeather
    const weatherCondition = mapWeatherCode(data.current.weather_code);
    
    // Map the API response to our WeatherData type
    const weatherData: WeatherData = {
      location,
      searchDate: new Date().toISOString(),
      date: new Date().toISOString(),
      temp: data.current.temperature_2m + 273.15, // Convert from Celsius to Kelvin to match OpenWeather
      feels_like: data.current.apparent_temperature + 273.15,
      temp_min: data.daily.temperature_2m_min[0] + 273.15,
      temp_max: data.daily.temperature_2m_max[0] + 273.15,
      pressure: data.current.surface_pressure,
      humidity: data.current.relative_humidity_2m,
      visibility: 10000, // Open-Meteo doesn't provide visibility, using default
      wind_speed: data.current.wind_speed_10m,
      wind_deg: data.current.wind_direction_10m,
      clouds: data.current.cloud_cover,
      weather: [weatherCondition],
      sunrise: Math.floor(new Date(data.daily.sunrise[0]).getTime() / 1000),
      sunset: Math.floor(new Date(data.daily.sunset[0]).getTime() / 1000)
    };
    
    // Add rain/snow data if available
    if (data.current.rain > 0) {
      weatherData.rain = { "1h": data.current.rain };
    }
    
    if (data.current.snowfall > 0) {
      weatherData.snow = { "1h": data.current.snowfall };
    }
    
    return weatherData;
  } catch (error) {
    console.error("Error getting weather data:", error);
    return null;
  }
}

export async function getHistoricalWeather(location: WeatherLocation, startDate: string, endDate: string): Promise<WeatherData[]> {
  try {
    // Format dates for Open-Meteo API (YYYY-MM-DD)
    const formattedStartDate = new Date(startDate).toISOString().split('T')[0];
    const formattedEndDate = new Date(endDate).toISOString().split('T')[0];
    
    // Use Open-Meteo Historical Weather API
    const response = await fetch(
      `https://archive-api.open-meteo.com/v1/archive?latitude=${location.lat}&longitude=${location.lon}&start_date=${formattedStartDate}&end_date=${formattedEndDate}&daily=weather_code,temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,rain_sum,snowfall_sum&timezone=auto`
    );
    
    if (!response.ok) {
      console.error(`Historical Weather API failed with status ${response.status}: ${await response.text()}`);
      console.warn("Historical data API access failed, falling back to mock data");
      return generateMockHistoricalData(location, startDate, endDate);
    }
    
    const data = await response.json();
    
    // Check if we have the expected data format
    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      console.warn("Historical data API returned unexpected format, falling back to mock data");
      return generateMockHistoricalData(location, startDate, endDate);
    }
    
    // Map the API response to our WeatherData type
    const weatherDataArray: WeatherData[] = [];
    
    for (let i = 0; i < data.daily.time.length; i++) {
      const date = data.daily.time[i];
      const weatherCode = data.daily.weather_code[i];
      const tempMax = data.daily.temperature_2m_max[i];
      const tempMin = data.daily.temperature_2m_min[i];
      const tempMean = data.daily.temperature_2m_mean[i];
      const rainSum = data.daily.rain_sum ? data.daily.rain_sum[i] : 0;
      const snowfallSum = data.daily.snowfall_sum ? data.daily.snowfall_sum[i] : 0;
      
      // Map weather code to condition
      const weatherCondition = mapWeatherCode(weatherCode);
      
      const weatherData: WeatherData = {
        location,
        searchDate: new Date().toISOString(),
        date: new Date(date).toISOString(),
        temp: tempMean + 273.15, // Convert from Celsius to Kelvin
        feels_like: tempMean + 273.15, // Feels like not available for historical data
        temp_min: tempMin + 273.15,
        temp_max: tempMax + 273.15,
        pressure: 1013, // Not available in historical data, using standard
        humidity: 70, // Not available in historical data, using average
        visibility: 10000, // Not available in historical data, using default
        wind_speed: 5, // Not available in historical data, using average
        wind_deg: 0, // Not available in historical data
        clouds: 50, // Not available in historical data, using average
        weather: [weatherCondition],
      };
      
      // Add rain/snow data if available
      if (rainSum > 0) {
        weatherData.rain = { "1h": rainSum / 24 }; // Convert daily sum to hourly average
      }
      
      if (snowfallSum > 0) {
        weatherData.snow = { "1h": snowfallSum / 24 }; // Convert daily sum to hourly average
      }
      
      weatherDataArray.push(weatherData);
    }
    
    return weatherDataArray;
  } catch (error) {
    console.error("Error getting historical weather data:", error);
    return generateMockHistoricalData(location, startDate, endDate);
  }
}

// CRUD operations for saved searches

// CREATE - Save a weather search
export function saveWeatherData(weatherData: WeatherData): string {
  const data = getAllWeatherData();
  const id = generateId();
  const newEntry = { ...weatherData, id };
  data.push(newEntry);
  saveAllWeatherData(data);
  return id;
}

// READ - Get all saved weather data
export function getAllWeatherData(): WeatherData[] {
  const dataString = localStorage.getItem(STORAGE_KEY);
  if (!dataString) return [];
  try {
    return JSON.parse(dataString);
  } catch {
    return [];
  }
}

// READ - Get weather data by ID
export function getWeatherDataById(id: string): WeatherData | null {
  const data = getAllWeatherData();
  return data.find(item => item.id === id) || null;
}

// UPDATE - Update saved weather data
export function updateWeatherData(id: string, updates: Partial<WeatherData>): boolean {
  const data = getAllWeatherData();
  const index = data.findIndex(item => item.id === id);
  
  if (index === -1) return false;
  
  data[index] = { ...data[index], ...updates };
  saveAllWeatherData(data);
  return true;
}

// DELETE - Remove saved weather data
export function deleteWeatherData(id: string): boolean {
  const data = getAllWeatherData();
  const filteredData = data.filter(item => item.id !== id);
  
  if (filteredData.length === data.length) return false;
  
  saveAllWeatherData(filteredData);
  return true;
}

// Helper functions
function saveAllWeatherData(data: WeatherData[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Mock data generators
function generateMockLocations(query: string): LocationSearchResult[] {
  // Simple logic to generate mock locations based on the query
  const baseLocations = [
    { name: query, lat: 40.7128, lon: -74.006, country: "US", state: "New York" },
    { name: `${query} City`, lat: 34.0522, lon: -118.2437, country: "US", state: "California" },
    { name: `${query} Town`, lat: 51.5074, lon: -0.1278, country: "UK" },
    { name: `${query} Village`, lat: 48.8566, lon: 2.3522, country: "FR" },
    { name: `North ${query}`, lat: 52.3676, lon: 4.9041, country: "NL" }
  ];
  
  // Add some randomization to make results seem different
  return baseLocations.map(loc => ({
    ...loc,
    lat: loc.lat + (Math.random() - 0.5) * 0.1,
    lon: loc.lon + (Math.random() - 0.5) * 0.1
  }));
}

function generateMockWeatherData(location: WeatherLocation): WeatherData {
  // Generate random weather condition
  const conditions = [
    { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
    { id: 801, main: "Clouds", description: "few clouds", icon: "02d" },
    { id: 500, main: "Rain", description: "light rain", icon: "10d" },
    { id: 200, main: "Thunderstorm", description: "thunderstorm with light rain", icon: "11d" },
    { id: 600, main: "Snow", description: "light snow", icon: "13d" },
    { id: 701, main: "Mist", description: "mist", icon: "50d" }
  ];
  
  const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
  const temp = Math.random() * 30 + 273.15; // Random temperature in Kelvin
  
  return {
    location,
    searchDate: new Date().toISOString(),
    date: new Date().toISOString(),
    temp,
    feels_like: temp - Math.random() * 2,
    temp_min: temp - Math.random() * 5,
    temp_max: temp + Math.random() * 5,
    pressure: Math.floor(Math.random() * 50) + 1000,
    humidity: Math.floor(Math.random() * 100),
    visibility: Math.floor(Math.random() * 10000),
    wind_speed: Math.random() * 10,
    wind_deg: Math.floor(Math.random() * 360),
    clouds: Math.floor(Math.random() * 100),
    weather: [randomCondition],
    sunrise: Math.floor(Date.now() / 1000) - 3600 * 6,
    sunset: Math.floor(Date.now() / 1000) + 3600 * 6
  };
}

function generateMockHistoricalData(location: WeatherLocation, startDate: string, endDate: string): WeatherData[] {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const dayMs = 24 * 60 * 60 * 1000;
  const data: WeatherData[] = [];
  
  // Generate one entry per day
  for (let day = start; day <= end; day += dayMs) {
    const mockData = generateMockWeatherData(location);
    mockData.date = new Date(day).toISOString();
    mockData.searchDate = new Date().toISOString();
    data.push(mockData);
  }
  
  return data;
}

// Simulate API fetch with delay
async function simulatedFetch<T>(url: string, mockResponse: { success: boolean; data: T }): Promise<{ success: boolean; data: T }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  
  // Log the URL that would be called in a real implementation
  console.log(`[Mock API] Fetching: ${url}`);
  
  return mockResponse;
}

// Helper function to map Open-Meteo weather codes to OpenWeather-like conditions
function mapWeatherCode(code: number): { id: number; main: string; description: string; icon: string } {
  // Open-Meteo WMO weather codes: https://open-meteo.com/en/docs
  const codeMap: Record<number, { id: number; main: string; description: string; icon: string }> = {
    0: { id: 800, main: "Clear", description: "clear sky", icon: "01d" },
    1: { id: 801, main: "Clouds", description: "few clouds", icon: "02d" },
    2: { id: 802, main: "Clouds", description: "scattered clouds", icon: "03d" },
    3: { id: 803, main: "Clouds", description: "broken clouds", icon: "04d" },
    45: { id: 701, main: "Mist", description: "fog", icon: "50d" },
    48: { id: 701, main: "Mist", description: "depositing rime fog", icon: "50d" },
    51: { id: 300, main: "Drizzle", description: "light drizzle", icon: "09d" },
    53: { id: 301, main: "Drizzle", description: "moderate drizzle", icon: "09d" },
    55: { id: 302, main: "Drizzle", description: "dense drizzle", icon: "09d" },
    56: { id: 511, main: "Rain", description: "freezing drizzle", icon: "13d" },
    57: { id: 511, main: "Rain", description: "dense freezing drizzle", icon: "13d" },
    61: { id: 500, main: "Rain", description: "slight rain", icon: "10d" },
    63: { id: 501, main: "Rain", description: "moderate rain", icon: "10d" },
    65: { id: 502, main: "Rain", description: "heavy rain", icon: "10d" },
    66: { id: 511, main: "Rain", description: "light freezing rain", icon: "13d" },
    67: { id: 511, main: "Rain", description: "heavy freezing rain", icon: "13d" },
    71: { id: 600, main: "Snow", description: "slight snow fall", icon: "13d" },
    73: { id: 601, main: "Snow", description: "moderate snow fall", icon: "13d" },
    75: { id: 602, main: "Snow", description: "heavy snow fall", icon: "13d" },
    77: { id: 611, main: "Snow", description: "snow grains", icon: "13d" },
    80: { id: 520, main: "Rain", description: "slight rain showers", icon: "09d" },
    81: { id: 521, main: "Rain", description: "moderate rain showers", icon: "09d" },
    82: { id: 522, main: "Rain", description: "violent rain showers", icon: "09d" },
    85: { id: 620, main: "Snow", description: "slight snow showers", icon: "13d" },
    86: { id: 621, main: "Snow", description: "heavy snow showers", icon: "13d" },
    95: { id: 200, main: "Thunderstorm", description: "thunderstorm", icon: "11d" },
    96: { id: 201, main: "Thunderstorm", description: "thunderstorm with slight hail", icon: "11d" },
    99: { id: 202, main: "Thunderstorm", description: "thunderstorm with heavy hail", icon: "11d" }
  };
  
  return codeMap[code] || { id: 800, main: "Clear", description: "clear sky", icon: "01d" };
}
