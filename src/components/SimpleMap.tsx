import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherLocation } from '@/lib/types';

interface SimpleMapProps {
  location?: WeatherLocation;
  locations?: WeatherLocation[];
  title?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ location, locations, title }) => {
  // Determine which locations to show
  const hasMultipleLocations = locations && locations.length > 0;
  
  // If we have multiple locations, create a URL with multiple markers
  let mapUrl;
  
  if (hasMultipleLocations) {
    // Calculate center point for multiple locations
    const totalLat = locations!.reduce((sum, loc) => sum + loc.lat, 0);
    const totalLon = locations!.reduce((sum, loc) => sum + loc.lon, 0);
    const centerLat = totalLat / locations!.length;
    const centerLon = totalLon / locations!.length;
    
    // Start with center coordinates and zoom level
    // Use a lower zoom level (2) for better overview of multiple locations
    mapUrl = `https://maps.google.com/maps?q=${centerLat},${centerLon}&z=2&output=embed`;
  } else if (location) {
    // Just show the single location with a more zoomed out view
    mapUrl = `https://maps.google.com/maps?q=${location.lat},${location.lon}&z=7&output=embed`;
  } else {
    // Default to world map if no locations provided
    mapUrl = `https://maps.google.com/maps?q=0,0&z=1&output=embed`;
  }

  return (
    <Card className="overflow-hidden">
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0 h-[400px]">
        <iframe
          title="Location Map"
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src={mapUrl}
        ></iframe>
      </CardContent>
    </Card>
  );
};

export default SimpleMap;
