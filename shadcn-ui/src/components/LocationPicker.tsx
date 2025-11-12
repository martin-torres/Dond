import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useLocation } from '@/hooks/useLocation';

interface LocationPickerProps {
  onLocationChange: (address: string) => void;
}

export default function LocationPicker({ onLocationChange }: LocationPickerProps) {
  const { t } = useLanguage();
  const { location, getCurrentLocation, loading } = useLocation();
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = () => {
    if (searchValue.trim()) {
      onLocationChange(searchValue);
    }
  };

  const handleCurrentLocation = () => {
    getCurrentLocation();
    onLocationChange('Current Location');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Search Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={t('searchLocation')}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-10 w-full"
          />
        </div>
        <Button 
          onClick={handleSearch}
          size="icon"
          className="flex-shrink-0"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Current Location Button */}
      <Button
        variant="outline"
        onClick={handleCurrentLocation}
        disabled={loading}
        className="w-full justify-start gap-2"
      >
        <MapPin className="w-4 h-4" />
        <span className="truncate">
          {loading ? 'Getting location...' : 
           location?.address || 'Use Current Location'}
        </span>
      </Button>
    </div>
  );
}