import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherLocation } from '@/lib/types';

interface SimpleMapProps {
  location?: WeatherLocation;
  locations?: WeatherLocation[];
  title?: string;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ location, locations, title }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Determine which locations to show
  const hasMultipleLocations = locations && locations.length > 0;
  const locationsToUse = hasMultipleLocations ? locations : (location ? [location] : []);
  
  useEffect(() => {
    if (!mapRef.current) return;

    // For empty state, return a world map
    if (locationsToUse.length === 0) {
      const iframe = document.createElement('iframe');
      iframe.src = `https://maps.google.com/maps?q=0,0&z=1&output=embed`;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.border = '0';
      mapRef.current.innerHTML = '';
      mapRef.current.appendChild(iframe);
      return;
    }

    // Create a map URL that works with multiple locations
    const createMapUrl = () => {
      // If there's just one location, use the standard URL format
      if (locationsToUse.length === 1) {
        const loc = locationsToUse[0];
        return `https://maps.google.com/maps?q=${loc.lat},${loc.lon}&z=7&output=embed`;
      }
      
      // For multiple locations, we'll use a base map and list the locations below
      // Calculate center point
      const totalLat = locationsToUse.reduce((sum, loc) => sum + loc.lat, 0);
      const totalLon = locationsToUse.reduce((sum, loc) => sum + loc.lon, 0);
      const centerLat = totalLat / locationsToUse.length;
      const centerLon = totalLon / locationsToUse.length;
      
      // Determine zoom level based on location spread
      let maxDistance = 0;
      locationsToUse.forEach(loc => {
        const distance = Math.sqrt(
          Math.pow(loc.lat - centerLat, 2) + Math.pow(loc.lon - centerLon, 2)
        );
        maxDistance = Math.max(maxDistance, distance);
      });
      
      // Calculate appropriate zoom level (lower value = zoomed out more)
      // This is a simplified calculation
      let zoomLevel = 10; // Default zoom level
      if (maxDistance > 20) zoomLevel = 1;
      else if (maxDistance > 10) zoomLevel = 2;
      else if (maxDistance > 5) zoomLevel = 3;
      else if (maxDistance > 2) zoomLevel = 4;
      else if (maxDistance > 1) zoomLevel = 5;
      else if (maxDistance > 0.5) zoomLevel = 6;
      else if (maxDistance > 0.1) zoomLevel = 7;
      
      return `https://maps.google.com/maps?q=${centerLat},${centerLon}&z=${zoomLevel}&output=embed`;
    };
    
    // Create and add the iframe
    const iframe = document.createElement('iframe');
    iframe.src = createMapUrl();
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = '0';
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    
    // Clear previous content and add the iframe
    mapRef.current.innerHTML = '';
    mapRef.current.appendChild(iframe);
    
  }, [locationsToUse]);
  
  // Create a list of locations for display below the map
  const LocationsList = () => {
    if (locationsToUse.length <= 1) return null;
    
    return (
      <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-2 max-h-[120px] overflow-y-auto">
        <h3 className="text-sm font-semibold mb-1">Saved Locations ({locationsToUse.length}):</h3>
        <ul className="text-xs">
          {locationsToUse.map((loc, index) => (
            <li key={`${loc.lat}-${loc.lon}`} className="mb-1">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${loc.lat},${loc.lon}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {loc.name}{loc.country ? `, ${loc.country}` : ''}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  return (
    <Card className="overflow-hidden">
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0 h-[400px] relative">
        <div ref={mapRef} className="w-full h-full"></div>
        <LocationsList />
      </CardContent>
    </Card>
  );
};

export default SimpleMap;
