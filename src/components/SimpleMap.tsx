
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { WeatherLocation } from '@/lib/types';

interface SimpleMapProps {
  location: WeatherLocation;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ location }) => {
  // Create a Google Maps embed URL
  const mapUrl = `https://maps.google.com/maps?q=${location.lat},${location.lon}&z=10&output=embed`;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 h-[300px]">
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
