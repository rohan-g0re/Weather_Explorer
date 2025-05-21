
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WeatherData } from '@/lib/types';
import { getWeatherIcon, getFormattedTemperature, getWindDirection, convertKelvinToCelsius, convertKelvinToFahrenheit } from '@/lib/weather-utils';
import { Cloud, Wind, Droplets, ThermometerSun, Compass, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface CurrentWeatherProps {
  weatherData: WeatherData;
  onSave?: () => void;
}

const CurrentWeather: React.FC<CurrentWeatherProps> = ({ weatherData, onSave }) => {
  const weather = weatherData.weather[0];
  const iconUrl = getWeatherIcon(weather);
  const tempC = convertKelvinToCelsius(weatherData.temp);
  const tempF = convertKelvinToFahrenheit(weatherData.temp);
  const feelsLikeC = convertKelvinToCelsius(weatherData.feels_like);
  const minTempC = convertKelvinToCelsius(weatherData.temp_min);
  const maxTempC = convertKelvinToCelsius(weatherData.temp_max);

  return (
    <div className="w-full">
      <Card className="overflow-hidden glass-card">
        <CardContent className="p-6">
          {/* Header with location */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">{weatherData.location.name}</h2>
            <p className="text-muted-foreground">
              {weatherData.location.country}
              {weatherData.location.state && `, ${weatherData.location.state}`}
            </p>
          </div>

          {/* Main weather display */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-6 mb-6">
            <div className="flex items-center flex-1 min-w-[200px]">
              <img 
                src={iconUrl} 
                alt={weather.description} 
                className="w-24 h-24 mr-4" 
              />
              <div>
                <div className="text-5xl font-bold">
                  {Math.round(tempC)}°C
                </div>
                <div className="text-lg text-muted-foreground">
                  {Math.round(tempF)}°F
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-1">
              <Badge variant="outline" className="capitalize mb-2">
                {weather.description}
              </Badge>
              
              <div className="flex items-center gap-1">
                <ThermometerSun className="h-4 w-4 text-weather-yellow" />
                <span className="text-sm">Feels like {Math.round(feelsLikeC)}°C</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Compass className="h-4 w-4 text-weather-blue" />
                <span className="text-sm">
                  Wind: {Math.round(weatherData.wind_speed * 3.6)} km/h {getWindDirection(weatherData.wind_deg)}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Droplets className="h-4 w-4 text-weather-light-blue" />
                <span className="text-sm">Humidity: {weatherData.humidity}%</span>
              </div>
            </div>
          </div>

          {/* Details section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 dark:bg-gray-800/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <ThermometerSun className="h-4 w-4 text-weather-orange" />
                <span className="text-xs font-medium">MIN/MAX</span>
              </div>
              <div className="text-sm">
                {Math.round(minTempC)}°C / {Math.round(maxTempC)}°C
              </div>
            </div>
            
            <div className="bg-white/20 dark:bg-gray-800/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Cloud className="h-4 w-4 text-weather-gray" />
                <span className="text-xs font-medium">CLOUDS</span>
              </div>
              <div className="text-sm">{weatherData.clouds}%</div>
            </div>
            
            <div className="bg-white/20 dark:bg-gray-800/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="h-4 w-4 text-weather-light-blue" />
                <span className="text-xs font-medium">VISIBILITY</span>
              </div>
              <div className="text-sm">{(weatherData.visibility / 1000).toFixed(1)} km</div>
            </div>
            
            <div className="bg-white/20 dark:bg-gray-800/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Wind className="h-4 w-4 text-weather-blue" />
                <span className="text-xs font-medium">PRESSURE</span>
              </div>
              <div className="text-sm">{weatherData.pressure} hPa</div>
            </div>
          </div>

          {/* Save button */}
          {onSave && (
            <div className="mt-6">
              <Button 
                onClick={onSave}
                variant="outline"
                className="w-full bg-white/30 dark:bg-gray-800/30 hover:bg-white/50 dark:hover:bg-gray-800/50"
              >
                Save to History
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrentWeather;
