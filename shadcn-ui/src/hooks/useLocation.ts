import { useState, useEffect } from 'react';

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export const useLocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      // Set default location
      setLocation({
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'Downtown Area'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        try {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        } catch (error) {
          console.error('Error setting location:', error);
          setError('Error processing location data');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError(error.message);
        setLoading(false);
        // Set default location (downtown area)
        setLocation({
          latitude: 40.7128,
          longitude: -74.0060,
          address: 'Downtown Area'
        });
      },
      {
        timeout: 10000,
        enableHighAccuracy: false,
        maximumAge: 300000
      }
    );
  };

  const setCustomLocation = (lat: number, lng: number, address?: string) => {
    try {
      setLocation({
        latitude: lat,
        longitude: lng,
        address
      });
    } catch (error) {
      console.error('Error setting custom location:', error);
    }
  };

  useEffect(() => {
    // Don't automatically get location on mount to avoid permission prompts
    // Set default location instead
    setLocation({
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'Downtown Area'
    });
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
    setCustomLocation
  };
};