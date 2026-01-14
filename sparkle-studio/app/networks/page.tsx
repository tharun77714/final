'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LocationSearch from '@/app/components/LocationSearch';
import StoreCard, { Store } from '@/app/components/StoreCard';
import StoreMap from '@/app/components/StoreMap';
import { getCurrentLocation, Location } from '@/lib/location-client';
import dynamic from 'next/dynamic';

// Dynamically import StoreMap to avoid SSR issues with Leaflet
const DynamicStoreMap = dynamic(() => import('@/app/components/StoreMap'), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-800 rounded-lg flex items-center justify-center" style={{ minHeight: '400px' }}>
      <div className="text-gray-400">Loading map...</div>
    </div>
  ),
});

export default function NetworksPage() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const router = useRouter();

  // Fetch stores when location changes
  useEffect(() => {
    if (!userLocation) return;

    const fetchStores = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/stores?lat=${userLocation.lat}&lon=${userLocation.lon}&radius=20`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch stores');
        }

        const data = await response.json();
        setStores(data.stores || []);
      } catch (err: any) {
        console.error('Error fetching stores:', err);
        setError(err.message || 'Failed to load stores');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, [userLocation]);

  // Handle location selection from search
  const handleLocationSelect = (location: Location) => {
    setUserLocation(location);
    setLocationError(null);
  };

  // Handle current location button click
  const handleCurrentLocation = async () => {
    setLocationError(null);
    setIsLoading(true);

    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
    } catch (err: any) {
      console.error('Error getting location:', err);
      setLocationError(err.message || 'Failed to get your location');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle store card click
  const handleStoreClick = (storeId: string) => {
    setSelectedStoreId(storeId === selectedStoreId ? null : storeId);
  };

  // Handle map marker click
  const handleMapStoreClick = (storeId: string) => {
    setSelectedStoreId(storeId);
    // Scroll to store card
    const element = document.getElementById(`store-${storeId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Handle seed stores button
  const handleSeedStores = async () => {
    setIsSeeding(true);
    setSeedMessage(null);

    try {
      const response = await fetch('/api/stores/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setSeedMessage(
          `Successfully seeded ${data.created} stores! ${data.skipped > 0 ? `${data.skipped} already existed.` : ''} Search for "Delhi", "Mumbai", "Bangalore", "Hyderabad", or "Kolkata" to see them.`
        );
        // If user has a location, refresh stores with larger radius
        if (userLocation) {
          const storesResponse = await fetch(
            `/api/stores?lat=${userLocation.lat}&lon=${userLocation.lon}&radius=1000`
          );
          if (storesResponse.ok) {
            const storesData = await storesResponse.json();
            setStores(storesData.stores || []);
          }
        }
      } else {
        setSeedMessage(`Error: ${data.error || 'Failed to seed stores'}`);
      }
    } catch (err: any) {
      setSeedMessage(`Error: ${err.message || 'Failed to seed stores'}`);
    } finally {
      setIsSeeding(false);
    }
  };

  // Fetch all stores (without location requirement) for testing
  const handleShowAllStores = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First check debug endpoint
      let debugData = null;
      try {
        const debugResponse = await fetch('/api/stores/debug');
        if (debugResponse.ok) {
          debugData = await debugResponse.json();
          console.log('Debug info:', debugData);
        }
      } catch (debugErr) {
        console.warn('Debug endpoint failed:', debugErr);
      }

      const response = await fetch('/api/stores');
      console.log('Stores API response status:', response.status);

      if (!response.ok) {
        let errorMessage = `Failed to fetch stores (Status: ${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          console.error('API error response:', errorData);
        } catch (e) {
          const text = await response.text();
          console.error('API error text:', text);
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Stores response:', data);
      
      if (data.stores && data.stores.length > 0) {
        // Set a default location (Delhi) to show stores on map
        if (!userLocation) {
          setUserLocation({ lat: 28.6139, lon: 77.209, display_name: 'New Delhi, India' });
        }
        setStores(data.stores || []);
      } else {
        const debugInfo = debugData?.debug || {};
        setError(
          `No stores found. Debug info: Total vendors in DB: ${debugInfo.totalVendors || 0}, Vendors with location: ${debugInfo.vendorsWithLocation || 0}, Active vendors: ${debugInfo.activeVendors || 0}. Message: ${data.message || 'No stores returned'}. Check browser console for details.`
        );
        // Log full debug info to console
        console.log('Full debug data:', debugInfo);
        console.log('API response data:', data);
      }
    } catch (err: any) {
      console.error('Error fetching stores:', err);
      setError(err.message || 'Failed to load stores. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/home/customer" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white">Sparkle Studio</span>
            </Link>
            <Link
              href="/home/customer"
              className="px-4 py-2 text-gray-300 hover:text-purple-400 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Top Section - Search and Current Location */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <LocationSearch
                onLocationSelect={handleLocationSelect}
                placeholder="Search your location"
              />
            </div>
            <button
              onClick={handleCurrentLocation}
              disabled={isLoading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center justify-center space-x-2 whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Current Location</span>
            </button>
          </div>

          {/* Location Error */}
          {locationError && (
            <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {locationError}
            </div>
          )}

          {/* Current Location Display */}
          {userLocation && userLocation.display_name && (
            <div className="mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-gray-300">
                <span className="text-purple-400 font-medium">Location:</span>{' '}
                {userLocation.display_name}
              </p>
            </div>
          )}
        </div>

        {/* Main Content - Split Layout */}
        {userLocation ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Store Cards (2/3 on desktop) */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading stores...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-center">
                  <p className="text-red-400 mb-2">{error}</p>
                  <button
                    onClick={() => userLocation && handleLocationSelect(userLocation)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : stores.length === 0 ? (
                <div className="bg-gray-800 rounded-lg p-12 text-center">
                  <svg
                    className="w-16 h-16 text-gray-600 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">No stores found</h3>
                  <p className="text-gray-400 mb-4">
                    The dummy stores are in India. Try searching for "Delhi", "Mumbai", "Bangalore", "Hyderabad", or "Kolkata". Or click below to see all stores.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={handleShowAllStores}
                      disabled={isLoading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                    >
                      {isLoading ? 'Loading...' : 'Show All Stores'}
                    </button>
                    <button
                      onClick={handleSeedStores}
                      disabled={isSeeding}
                      className="block mx-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                    >
                      {isSeeding ? 'Seeding...' : 'Seed Dummy Stores'}
                    </button>
                  </div>
                  {seedMessage && (
                    <p className={`mt-4 text-sm ${seedMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                      {seedMessage}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">
                      Stores Near You ({stores.length})
                    </h2>
                  </div>
                  <div className="space-y-4 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                    {stores.map((store) => (
                      <div key={store.id} id={`store-${store.id}`}>
                        <StoreCard
                          store={store}
                          onClick={() => handleStoreClick(store.id)}
                          isSelected={selectedStoreId === store.id}
                          theme="purple"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Mini Map (1/3 on desktop) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <DynamicStoreMap
                  userLocation={userLocation}
                  stores={stores}
                  selectedStoreId={selectedStoreId}
                  onStoreClick={handleMapStoreClick}
                  theme="purple"
                  className="h-[600px] lg:h-[calc(100vh-150px)]"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-12 text-center">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              Find Stores Near You
            </h3>
            <p className="text-gray-400 mb-6">
              Search for a location or use your current location to discover nearby stores.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={handleSeedStores}
                disabled={isSeeding}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
              >
                {isSeeding ? 'Seeding...' : 'Seed Dummy Stores'}
              </button>
              <button
                onClick={handleShowAllStores}
                disabled={isLoading}
                className="block mx-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
              >
                {isLoading ? 'Loading...' : 'Show All Stores (Test)'}
              </button>
              {seedMessage && (
                <p className={`mt-4 text-sm ${seedMessage.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
                  {seedMessage}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

