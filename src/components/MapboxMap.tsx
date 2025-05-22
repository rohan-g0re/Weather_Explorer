import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherLocation } from '@/lib/types';
import { MapPin } from 'lucide-react';

// Public token - this is fine for client-side usage as it will be restricted by domain in Mapbox dashboard
mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA';

// Add console logging to verify Mapbox token is being set
console.log('Mapbox GL loaded, access token set:', !!mapboxgl.accessToken);

interface MapboxMapProps {
  locations: WeatherLocation[];
  title?: string;
}

const MapboxMap: React.FC<MapboxMapProps> = ({ locations, title }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    console.log('Initializing Mapbox map with', locations.length, 'locations');

    try {
      // Initialize map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [0, 0],
        zoom: 1,
        attributionControl: false // We'll add this in a more controlled way
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

      // Log success
      console.log('Mapbox map initialized successfully');

      // Set map as loaded when it's ready
      map.current.on('load', () => {
        console.log('Mapbox map loaded event fired');
        setIsMapLoaded(true);
      });

      // Handle errors
      map.current.on('error', (e) => {
        console.error('Mapbox map error:', e);
        setMapError('Map failed to load properly. Please try again later.');
      });
    } catch (error) {
      console.error('Error initializing Mapbox map:', error);
      setMapError('Failed to initialize map. Please try again later.');
    }

    // Clean up on unmount
    return () => {
      console.log('Cleaning up Mapbox map');
      markersRef.current = [];
      if (map.current) {
        try {
          map.current.remove();
        } catch (e) {
          console.error('Error removing map:', e);
        }
        map.current = null;
      }
    };
  }, []);

  // Add markers when map is loaded and locations change
  useEffect(() => {
    if (!isMapLoaded || !map.current || locations.length === 0) {
      console.log('Skipping marker addition -', 
        !isMapLoaded ? 'map not loaded' : 
        !map.current ? 'map ref null' : 
        'no locations');
      return;
    }

    console.log('Adding markers for', locations.length, 'locations');

    // Fit map to show all markers
    const bounds = new mapboxgl.LngLatBounds();
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each location
    locations.forEach((location, index) => {
      // Skip invalid locations
      if (typeof location.lat !== 'number' || typeof location.lon !== 'number') {
        console.warn('Skipping invalid location coordinates:', location);
        return;
      }

      console.log(`Adding marker ${index} at [${location.lon}, ${location.lat}]`);

      // Create custom marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'custom-marker';
      markerEl.style.width = '30px';
      markerEl.style.height = '30px';
      markerEl.style.cursor = 'pointer';
      markerEl.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      `;

      try {
        // Create marker and add popup
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([location.lon, location.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25, closeButton: false })
              .setHTML(`
                <div style="font-family: system-ui, sans-serif; padding: 6px 0;">
                  <h3 style="margin: 0 0 5px 0; font-weight: bold; font-size: 14px;">${location.name}</h3>
                  <p style="margin: 0; font-size: 12px;">${location.country || ''} ${location.state ? `(${location.state})` : ''}</p>
                </div>
              `)
          )
          .addTo(map.current);
        
        // Store reference to marker
        markersRef.current.push(marker);

        // Add to bounds
        bounds.extend([location.lon, location.lat]);
      } catch (error) {
        console.error('Error adding marker:', error);
      }
    });

    // If we have locations, fit the map to show all of them
    if (locations.length > 0 && markersRef.current.length > 0) {
      console.log('Fitting map to bounds');
      try {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 150, left: 50, right: 50 },
          maxZoom: 12
        });
      } catch (e) {
        console.error('Error fitting bounds:', e);
        
        // Fallback: center on first location
        if (locations.length > 0 && map.current) {
          console.log('Falling back to centering on first location');
          map.current.flyTo({
            center: [locations[0].lon, locations[0].lat],
            zoom: 5
          });
        }
      }
    }
  }, [isMapLoaded, locations]);

  return (
    <Card className="overflow-hidden">
      {title && (
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0 h-[500px] relative">
        <div 
          ref={mapContainer} 
          className="w-full h-full" 
          style={{ position: 'relative' }}
        />
        {mapError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm">
            <div className="text-center p-4">
              <p className="text-red-500 font-medium">{mapError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Reload Page
              </button>
            </div>
          </div>
        )}
        {locations.length > 0 && !mapError && (
          <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 max-h-[150px] overflow-y-auto border-t">
            <h3 className="text-sm font-semibold mb-2">Saved Locations ({locations.length}):</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              {locations.map((loc, index) => (
                <li key={`${loc.lat}-${loc.lon}-${index}`} className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1 text-blue-600" />
                  <button 
                    onClick={() => {
                      if (map.current) {
                        console.log(`Flying to ${loc.name} at [${loc.lon}, ${loc.lat}]`);
                        map.current.flyTo({
                          center: [loc.lon, loc.lat],
                          zoom: 10,
                          duration: 1500
                        });
                        
                        // Find and open the popup for this location
                        const marker = markersRef.current.find(m => {
                          const lngLat = m.getLngLat();
                          return lngLat.lng === loc.lon && lngLat.lat === loc.lat;
                        });
                        
                        if (marker) {
                          setTimeout(() => {
                            marker.togglePopup();
                          }, 1500);
                        }
                      }
                    }}
                    className="text-blue-600 hover:underline text-left"
                  >
                    {loc.name}{loc.country ? `, ${loc.country}` : ''}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MapboxMap; 