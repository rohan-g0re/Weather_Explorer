import React, { useState, useEffect, useMemo } from 'react';
import {
  getWeatherData,
  getHistoricalWeather,
  saveWeatherData,
  getAllWeatherData,
  updateWeatherData,
  deleteWeatherData
} from '@/lib/api';
import { DateRange, ExportFormat, LocationSearchResult, WeatherData, WeatherLocation } from '@/lib/types';
import { getBackgroundClass } from '@/lib/weather-utils';
import { exportData } from '@/lib/export-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Components
import LocationSearch from '@/components/LocationSearch';
import CurrentWeather from '@/components/CurrentWeather';
import DateRangePicker from '@/components/DateRangePicker';
import WeatherHistory from '@/components/WeatherHistory';
import EditWeatherRecord from '@/components/EditWeatherRecord';
import SimpleMap from '@/components/SimpleMap';

// Icons
import { Search, CloudRain, History, MapPin } from 'lucide-react';

const Index = () => {
  // State
  const [selectedLocation, setSelectedLocation] = useState<WeatherLocation | null>(null);
  const [currentWeather, setCurrentWeather] = useState<WeatherData | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [weatherHistory, setWeatherHistory] = useState<WeatherData[]>([]);
  const [savedWeather, setSavedWeather] = useState<WeatherData[]>([]);
  const [editRecord, setEditRecord] = useState<WeatherData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('weather');

  // Background class based on current weather
  const backgroundClass = useMemo(() => 
    getBackgroundClass(currentWeather), [currentWeather]
  );

  // Load saved weather data from local storage
  useEffect(() => {
    const loadSavedData = () => {
      const data = getAllWeatherData();
      setSavedWeather(data);
    };

    loadSavedData();
  }, []);

  // Handle location selection
  const handleSelectLocation = async (location: LocationSearchResult) => {
    const weatherLocation: WeatherLocation = {
      name: location.name,
      lat: location.lat,
      lon: location.lon,
      country: location.country,
      state: location.state
    };

    setSelectedLocation(weatherLocation);
    // Clear any previous weather data when selecting a new location
    setCurrentWeather(null);
    setWeatherHistory([]);
    toast.success(`Location set to ${location.name}`);
  };

  // Handle date range search
  const handleDateRangeSearch = async () => {
    if (!selectedLocation) {
      toast.error('Please select a location');
      return;
    }

    // Check if selected dates are in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for proper comparison
    
    if (dateRange?.from && dateRange.from > today) {
      toast.error('Cannot search for future dates. Please select dates in the past.');
      return;
    }
    
    if (dateRange?.to && dateRange.to > today) {
      toast.error('Cannot search for future dates. Please select dates in the past.');
      return;
    }

    try {
      // First, get the current weather for the selected location
      const currentData = await getWeatherData(selectedLocation);
      if (currentData) {
        setCurrentWeather(currentData);
        toast.success(`Current weather loaded for ${selectedLocation.name}`);
      }

      // If date range is selected, also get historical data
      if (dateRange?.from && dateRange?.to) {
        const startDate = dateRange.from.toISOString();
        const endDate = dateRange.to.toISOString();
        
        const data = await getHistoricalWeather(selectedLocation, startDate, endDate);
        
        if (data.length > 0) {
          setWeatherHistory(data);
          toast.success(`Found historical weather data for the selected period`);
        } else {
          setWeatherHistory([]);
          toast.info('No historical weather data available for the selected period');
        }
      } else {
        // Clear any historical data if only getting current weather
        setWeatherHistory([]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load weather data');
    }
  };

  // Handle save current weather
  const handleSaveCurrentWeather = () => {
    if (!currentWeather) return;

    try {
      const id = saveWeatherData(currentWeather);
      setSavedWeather(prev => [...prev, { ...currentWeather, id }]);
      toast.success('Weather data saved successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save weather data');
    }
  };

  // Handle edit record
  const handleEditRecord = (id: string) => {
    const record = savedWeather.find(item => item.id === id);
    if (record) {
      setEditRecord(record);
      setIsEditing(true);
    }
  };

  // Handle save edited record
  const handleSaveEditedRecord = (updatedData: WeatherData) => {
    try {
      if (updateWeatherData(updatedData.id!, updatedData)) {
        // Update the local state to reflect the changes
        setSavedWeather(prev => 
          prev.map(item => item.id === updatedData.id ? updatedData : item)
        );
        
        // Refresh the data from localStorage to ensure consistency
        const refreshedData = getAllWeatherData();
        setSavedWeather(refreshedData);
        
        setIsEditing(false);
        setEditRecord(null);
        toast.success('Weather record updated successfully');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update weather record');
    }
  };

  // Handle delete record
  const handleDeleteRecord = (id: string) => {
    try {
      if (deleteWeatherData(id)) {
        setSavedWeather(prev => prev.filter(item => item.id !== id));
        toast.success('Weather record deleted successfully');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete weather record');
    }
  };

  // Handle export
  const handleExport = (format: string) => {
    try {
      exportData(savedWeather, format as ExportFormat);
      toast.success(`Data exported in ${format.toUpperCase()} format`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to export data');
    }
  };

  // Add this new function to save historical weather data
  const handleSaveHistoricalWeather = () => {
    // Don't do anything if there's no historical weather data
    if (weatherHistory.length === 0) return;

    try {
      // Create a variable to track how many records were saved successfully
      let savedCount = 0;
      const newSavedRecords = [];

      // Loop through each historical weather record and save it individually
      for (const weatherRecord of weatherHistory) {
        // Skip records that might already have an ID (meaning they're already saved)
        if (weatherRecord.id) continue;

        // Save the weather record to localStorage
        const id = saveWeatherData(weatherRecord);
        
        // Add the newly saved record (with its ID) to our tracking array
        newSavedRecords.push({ ...weatherRecord, id });
        
        // Increment our counter
        savedCount++;
      }

      // Update the savedWeather state with the newly saved records
      if (newSavedRecords.length > 0) {
        setSavedWeather(prev => [...prev, ...newSavedRecords]);
      }

      // Show appropriate success message based on how many records were saved
      if (savedCount > 0) {
        toast.success(`Saved ${savedCount} historical weather records`);
      } else {
        toast.info('No new records to save');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to save historical weather data');
    }
  };

  return (
    <div className={`min-h-screen ${backgroundClass}`}>
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">Weather Dashboard</h1>
          <p className="text-white/80 mt-2">
            Search for current weather and historical data
          </p>
        </header>

        <Tabs 
          defaultValue="weather" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-3 max-w-md mx-auto mb-8 bg-white/20 backdrop-blur-sm">
            <TabsTrigger value="weather" className="text-white data-[state=active]:bg-white/30">
              <CloudRain className="h-4 w-4 mr-2" />
              Weather
            </TabsTrigger>
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-white/30">
              <History className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="map" className="text-white data-[state=active]:bg-white/30">
              <MapPin className="h-4 w-4 mr-2" />
              Map
            </TabsTrigger>
          </TabsList>

          {activeTab === 'weather' && (
            <div className="glass-card rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-2/3">
                  <LocationSearch onSelectLocation={handleSelectLocation} />
                </div>
                <div className="w-full md:w-1/3">
                  <DateRangePicker 
                    dateRange={dateRange} 
                    onDateRangeChange={setDateRange} 
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={handleDateRangeSearch}
                  className="bg-white/30 hover:bg-white/50 text-white px-6 py-2 rounded-md flex items-center"
                  disabled={!selectedLocation}
                >
                  <Search className="h-4 w-4 mr-2" />
                  GET WEATHER
                </button>
              </div>
            </div>
          )}

          <TabsContent value="weather" className="space-y-6">
            {currentWeather && (
              <CurrentWeather 
                weatherData={currentWeather} 
                onSave={handleSaveCurrentWeather}
              />
            )}
            
            {weatherHistory.length > 0 && (
              <div className="mb-6 mt-6 glass-card rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">Historical Weather</h2>
                  <button
                    onClick={handleSaveHistoricalWeather}
                    className="bg-white/30 hover:bg-white/50 text-white px-4 py-2 rounded-md flex items-center"
                  >
                    <History className="h-4 w-4 mr-2" />
                    Save Historical Data
                  </button>
                </div>
                <WeatherHistory 
                  weatherData={weatherHistory}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            )}
            
            {selectedLocation && (
              <SimpleMap 
                location={selectedLocation} 
                title={`Current Location: ${selectedLocation.name}`}
              />
            )}
            
            {!currentWeather && selectedLocation && (
              <div className="text-center py-8 glass-card rounded-xl">
                <p className="text-white text-lg">
                  Location selected: <strong>{selectedLocation.name}</strong>
                </p>
                <p className="text-white/80 mt-2">
                  Select a date range and click "GET WEATHER" to view weather data
                </p>
              </div>
            )}
            
            {!currentWeather && !selectedLocation && (
              <div className="text-center py-12">
                <CloudRain className="h-16 w-16 mx-auto text-white/50 mb-4 animate-float" />
                <h2 className="text-2xl font-medium text-white">Enter a location to get started</h2>
                <p className="text-white/80 mt-2">
                  Search for a city, zip code, or landmark above
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Saved Weather Records</h2>
                <WeatherHistory 
                  weatherData={savedWeather}
                  onEdit={handleEditRecord}
                  onDelete={handleDeleteRecord}
                  onExport={handleExport}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map">
            {savedWeather.length > 0 ? (
              <SimpleMap 
                locations={getUniqueLocations(savedWeather)}
                title="All Saved Locations"
              />
            ) : (
              <div className="text-center py-12 glass-card rounded-xl">
                <MapPin className="h-16 w-16 mx-auto text-white/50 mb-4" />
                <h2 className="text-2xl font-medium text-white">No locations saved</h2>
                <p className="text-white/80 mt-2">
                  Search for a location and save weather data to see it on the map
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit dialog */}
      <EditWeatherRecord
        isOpen={isEditing}
        weatherData={editRecord}
        onClose={() => {
          setIsEditing(false);
          setEditRecord(null);
        }}
        onSave={handleSaveEditedRecord}
      />
    </div>
  );
};

// Helper function to get unique locations from saved weather data
const getUniqueLocations = (weatherData: WeatherData[]): WeatherLocation[] => {
  const locationMap = new Map<string, WeatherLocation>();
  
  weatherData.forEach(data => {
    const key = `${data.location.lat}-${data.location.lon}`;
    if (!locationMap.has(key)) {
      locationMap.set(key, data.location);
    }
  });
  
  return Array.from(locationMap.values());
};

export default Index;
