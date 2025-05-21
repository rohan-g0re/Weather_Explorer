
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LocationSearchResult } from '@/lib/types';
import { searchLocation } from '@/lib/api';
import { toast } from 'sonner';

interface LocationSearchProps {
  onSelectLocation: (location: LocationSearchResult) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({ onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a location');
      return;
    }
    
    setLoading(true);
    
    try {
      const locations = await searchLocation(query);
      setResults(locations);
      
      if (locations.length === 0) {
        toast.info('No locations found. Try a different search term.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to search for locations');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (location: LocationSearchResult) => {
    setQuery('');
    setResults([]);
    onSelectLocation(location);
  };

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search city, zip code, or landmark..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Searching...' : <Search className="h-4 w-4 mr-2" />}
          {loading ? '' : 'Search'}
        </Button>
      </form>

      {results.length > 0 && (
        <Card className="overflow-hidden">
          <ul className="divide-y">
            {results.map((location, index) => (
              <li key={`${location.name}-${index}`}>
                <button
                  onClick={() => handleSelectLocation(location)}
                  className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{location.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {location.state ? `${location.state}, ` : ''}{location.country}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};

export default LocationSearch;
