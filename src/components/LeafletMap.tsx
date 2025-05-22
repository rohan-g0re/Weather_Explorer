import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherLocation } from '@/lib/types';
import { MapPin } from 'lucide-react';

interface LeafletMapProps {
  locations: WeatherLocation[];
  title?: string;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ locations, title }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Dynamically load Leaflet to avoid SSR issues
    const loadLeaflet = async () => {
      if (!mapContainerRef.current) return;
      
      // Clear any previous content
      mapContainerRef.current.innerHTML = '';
      
      try {
        // Create the map container
        const mapDiv = document.createElement('div');
        mapDiv.style.width = '100%';
        mapDiv.style.height = '100%';
        mapContainerRef.current.appendChild(mapDiv);
        
        // Inject Leaflet CSS
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link');
          link.id = 'leaflet-css';
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
        }
        
        // Wait for the script to load
        if (!window.L) {
          await new Promise<void>((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
            script.crossOrigin = '';
            script.onload = () => resolve();
            document.head.appendChild(script);
          });
        }
        
        // Create map and set view
        const L = window.L;
        const map = L.map(mapDiv).setView([0, 0], 2);
        
        // Add OpenStreetMap tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        if (locations.length > 0) {
          // Create a bounds object to fit all markers
          const bounds = L.latLngBounds();
          
          // Add markers for each location
          locations.forEach((location, index) => {
            if (typeof location.lat !== 'number' || typeof location.lon !== 'number') {
              console.warn('Invalid location coordinates:', location);
              return;
            }
            
            // Create marker
            const icon = L.divIcon({
              className: 'custom-map-marker',
              html: `
                <div style="
                  width: 30px; 
                  height: 30px; 
                  background-color: rgba(59, 130, 246, 0.8); 
                  border-radius: 50%; 
                  border: 3px solid white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                ">
                  <span style="color: white; font-weight: bold; font-size: 12px;">${index + 1}</span>
                </div>
              `,
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            });
            
            const marker = L.marker([location.lat, location.lon], { icon })
              .addTo(map)
              .bindPopup(`
                <div style="font-family: system-ui, sans-serif; padding: 8px 0;">
                  <h3 style="margin: 0 0 5px 0; font-weight: bold; font-size: 16px;">${location.name}</h3>
                  <p style="margin: 0 0 5px 0; font-size: 13px;">${location.country || ''} ${location.state ? `(${location.state})` : ''}</p>
                  <p style="margin: 0; font-size: 11px; color: #666;">Coordinates: ${location.lat.toFixed(4)}, ${location.lon.toFixed(4)}</p>
                </div>
              `, {
                offset: [0, -15],
                className: 'custom-popup'
              });
            
            // Extend bounds to include this marker
            bounds.extend([location.lat, location.lon]);
          });
          
          // Fit the map to show all markers
          if (bounds.isValid()) {
            map.fitBounds(bounds, {
              padding: [50, 50],
              maxZoom: 12
            });
          }
        }
        
        // Add resize handler to ensure map renders correctly
        const resizeMap = () => {
          if (map) {
            map.invalidateSize();
          }
        };
        
        window.addEventListener('resize', resizeMap);
        
        // Force a resize after a small delay to ensure the map renders correctly
        setTimeout(resizeMap, 500);
        
        // Clean up
        return () => {
          window.removeEventListener('resize', resizeMap);
          map.remove();
        };
      } catch (error) {
        console.error('Error initializing Leaflet map:', error);
        
        // Show error message
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; background-color: rgba(255,255,255,0.8);">
              <div style="text-align: center; padding: 20px;">
                <p style="color: #e11d48; margin-bottom: 10px;">Failed to load map. Please try again later.</p>
                <button 
                  style="background-color: #3b82f6; color: white; padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer;"
                  onclick="window.location.reload()"
                >
                  Reload Page
                </button>
              </div>
            </div>
          `;
        }
      }
    };
    
    loadLeaflet();
  }, [locations]);
  
  return (
    <Card className="overflow-hidden">
      {title && (
        <CardHeader className="pb-2">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0 h-[500px] relative">
        <div ref={mapContainerRef} className="w-full h-full" />
      </CardContent>
    </Card>
  );
};

// Add TypeScript declaration for Leaflet
declare global {
  interface Window {
    L: any;
  }
}

export default LeafletMap; 