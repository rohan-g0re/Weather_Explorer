
import { LocationSearchResult, WeatherData, WeatherLocation } from "./types";

// In a real app, you'd store this securely or use environment variables
const API_KEY = "YOUR_OPENWEATHER_API_KEY";

// Simulate database with localStorage
const STORAGE_KEY = "weather-app-data";

// API functions
export async function searchLocation(query: string): Promise<LocationSearchResult[]> {
  try {
    // In a real app, you would call the OpenWeatherMap Geocoding API
    // For now, simulate an API call with a fake delayed response
    const response = await simulatedFetch(`http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${API_KEY}`, {
      success: true,
      data: generateMockLocations(query)
    });
    
    if (!response.success) {
      throw new Error("Failed to search locations");
    }
    
    return response.data;
  } catch (error) {
    console.error("Error searching location:", error);
    return [];
  }
}

export async function getWeatherData(location: WeatherLocation): Promise<WeatherData | null> {
  try {
    // In a real app, you would call the OpenWeatherMap Current Weather API
    // For now, simulate an API call with a fake delayed response
    const response = await simulatedFetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${location.lat}&lon=${location.lon}&appid=${API_KEY}`,
      {
        success: true,
        data: generateMockWeatherData(location)
      }
    );
    
    if (!response.success) {
      throw new Error("Failed to get weather data");
    }
    
    return response.data;
  } catch (error) {
    console.error("Error getting weather data:", error);
    return null;
  }
}

export async function getHistoricalWeather(location: WeatherLocation, startDate: string, endDate: string): Promise<WeatherData[]> {
  try {
    // In a real app, you would call the OpenWeatherMap Historical API
    // For now, simulate an API call with a fake delayed response
    const response = await simulatedFetch(
      `https://api.openweathermap.org/data/2.5/history/city?lat=${location.lat}&lon=${location.lon}&start=${startDate}&end=${endDate}&appid=${API_KEY}`,
      {
        success: true,
        data: generateMockHistoricalData(location, startDate, endDate)
      }
    );
    
    if (!response.success) {
      throw new Error("Failed to get historical weather data");
    }
    
    return response.data;
  } catch (error) {
    console.error("Error getting historical weather data:", error);
    return [];
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
