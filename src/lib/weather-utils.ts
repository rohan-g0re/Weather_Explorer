
import { WeatherCondition, WeatherData } from "./types";

export function getWeatherIcon(condition: WeatherCondition): string {
  const iconCode = condition.icon;
  return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
}

export function getFormattedDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export function getFormattedTemperature(temp: number): string {
  return `${Math.round(temp)}°`;
}

export function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

export function getBackgroundClass(weatherData: WeatherData | null): string {
  if (!weatherData) return 'weather-gradient-day';
  
  const condition = weatherData.weather[0].main.toLowerCase();
  const isNight = weatherData.weather[0].icon.includes('n');
  
  if (isNight) return 'weather-gradient-night';
  if (condition.includes('cloud') || condition.includes('mist') || condition.includes('fog')) return 'weather-gradient-cloudy';
  if (condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm')) return 'weather-gradient-rainy';
  
  return 'weather-gradient-day';
}

export function formatDateForDisplay(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { 
    weekday: 'short',
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  });
}

export function convertKelvinToCelsius(kelvin: number): number {
  return kelvin - 273.15;
}

export function convertKelvinToFahrenheit(kelvin: number): number {
  return (kelvin - 273.15) * 9/5 + 32;
}
