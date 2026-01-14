/**
 * Client-side location utilities
 */

export interface Location {
  lat: number;
  lon: number;
  display_name?: string;
  place_id?: number;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    street?: string;
  };
}

/**
 * Get user's current location using browser geolocation API
 */
export function getCurrentLocation(): Promise<Location> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please allow location access or search for a location manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable. Please try searching for a location manually.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timeout. Please try again or search for a location manually.';
            break;
          default:
            errorMessage = 'Unable to get your location. Please search for a location manually.';
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false, // Changed to false for faster response
        timeout: 15000, // Increased to 15 seconds
        maximumAge: 60000, // Accept cached location up to 1 minute old
      }
    );
  });
}

/**
 * Format distance in kilometers to readable string
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`;
  }
  return `${km.toFixed(1)} km away`;
}

/**
 * Format address for display
 */
export function formatAddress(address: {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
}): string {
  const parts = [];
  if (address.street) parts.push(address.street);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.country) parts.push(address.country);
  return parts.join(', ') || 'Address not available';
}

/**
 * Search location using OpenStreetMap Nominatim
 */
export async function searchLocation(query: string): Promise<Location[]> {
  try {
    const response = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search location');
    }
    const data = await response.json();
    return data.locations || [];
  } catch (error) {
    console.error('Error searching location:', error);
    throw error;
  }
}

