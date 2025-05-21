
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { WeatherData } from '@/lib/types';
import { convertKelvinToCelsius } from '@/lib/weather-utils';
import { toast } from 'sonner';

interface EditWeatherRecordProps {
  isOpen: boolean;
  weatherData: WeatherData | null;
  onClose: () => void;
  onSave: (updatedData: WeatherData) => void;
}

const EditWeatherRecord: React.FC<EditWeatherRecordProps> = ({ 
  isOpen, 
  weatherData, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState<Partial<WeatherData>>({});

  useEffect(() => {
    if (weatherData) {
      setFormData({
        ...weatherData,
        temp: convertKelvinToCelsius(weatherData.temp),
        feels_like: convertKelvinToCelsius(weatherData.feels_like),
        temp_min: convertKelvinToCelsius(weatherData.temp_min),
        temp_max: convertKelvinToCelsius(weatherData.temp_max),
      });
    }
  }, [weatherData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('temp') || name === 'feels_like' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weatherData) return;
    
    // Validate temperature values
    if (
      formData.temp === undefined || 
      formData.feels_like === undefined || 
      formData.temp_min === undefined || 
      formData.temp_max === undefined
    ) {
      toast.error('All temperature fields are required');
      return;
    }

    if (formData.temp_min > formData.temp_max) {
      toast.error('Minimum temperature cannot be higher than maximum temperature');
      return;
    }

    // Convert Celsius back to Kelvin for storage
    const convertedData: WeatherData = {
      ...weatherData,
      ...formData,
      temp: (formData.temp as number) + 273.15,
      feels_like: (formData.feels_like as number) + 273.15,
      temp_min: (formData.temp_min as number) + 273.15,
      temp_max: (formData.temp_max as number) + 273.15,
    };
    
    onSave(convertedData);
  };

  if (!weatherData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Weather Record</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temp" className="text-right">
                Temperature (°C)
              </Label>
              <Input
                id="temp"
                name="temp"
                type="number"
                step="0.1"
                value={formData.temp !== undefined ? formData.temp : ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feels_like" className="text-right">
                Feels Like (°C)
              </Label>
              <Input
                id="feels_like"
                name="feels_like"
                type="number"
                step="0.1"
                value={formData.feels_like !== undefined ? formData.feels_like : ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temp_min" className="text-right">
                Min Temp (°C)
              </Label>
              <Input
                id="temp_min"
                name="temp_min"
                type="number"
                step="0.1"
                value={formData.temp_min !== undefined ? formData.temp_min : ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="temp_max" className="text-right">
                Max Temp (°C)
              </Label>
              <Input
                id="temp_max"
                name="temp_max"
                type="number"
                step="0.1"
                value={formData.temp_max !== undefined ? formData.temp_max : ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="humidity" className="text-right">
                Humidity (%)
              </Label>
              <Input
                id="humidity"
                name="humidity"
                type="number"
                min="0"
                max="100"
                value={formData.humidity || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="wind_speed" className="text-right">
                Wind Speed (m/s)
              </Label>
              <Input
                id="wind_speed"
                name="wind_speed"
                type="number"
                step="0.1"
                min="0"
                value={formData.wind_speed || ''}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditWeatherRecord;
