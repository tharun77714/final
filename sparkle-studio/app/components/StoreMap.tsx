'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Store } from './StoreCard';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

interface StoreMapProps {
  userLocation: { lat: number; lon: number } | null;
  stores: Store[];
  selectedStoreId?: string | null;
  onStoreClick?: (storeId: string) => void;
  theme?: 'purple' | 'blue';
  className?: string;
}

// Component to fit map bounds
function FitBounds({ stores, userLocation }: { stores: Store[]; userLocation: { lat: number; lon: number } | null }) {
  const map = useMap();

  useEffect(() => {
    if (stores.length === 0 && !userLocation) return;

    const bounds = L.latLngBounds([]);

    // Add user location
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lon]);
    }

    // Add store locations
    stores.forEach((store) => {
      if (store.location?.latitude && store.location?.longitude) {
        bounds.extend([store.location.latitude, store.location.longitude]);
      }
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stores, userLocation, map]);

  return null;
}

export default function StoreMap({
  userLocation,
  stores,
  selectedStoreId,
  onStoreClick,
  theme = 'purple',
  className = '',
}: StoreMapProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Create custom icons
  const userIcon = L.divIcon({
    className: 'custom-marker user-marker',
    html: `<div style="
      width: 20px;
      height: 20px;
      background-color: #3b82f6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const getStoreIcon = (storeId: string) => {
    const isSelected = storeId === selectedStoreId;
    const color = theme === 'purple' ? '#8b5cf6' : '#3b82f6';
    const selectedColor = theme === 'purple' ? '#a78bfa' : '#60a5fa';
    
    return L.divIcon({
      className: 'custom-marker store-marker',
      html: `<div style="
        width: ${isSelected ? '32px' : '24px'};
        height: ${isSelected ? '32px' : '24px'};
        background-color: ${isSelected ? selectedColor : color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        transition: all 0.2s;
      "></div>`,
      iconSize: [isSelected ? 32 : 24, isSelected ? 32 : 24],
      iconAnchor: [isSelected ? 16 : 12, isSelected ? 16 : 12],
    });
  };

  // Default center (fallback)
  const defaultCenter: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lon]
    : [28.6139, 77.209]; // Default to Delhi, India

  if (!userLocation && stores.length === 0) {
    return (
      <div className={`bg-gray-800 rounded-lg flex items-center justify-center ${className}`} style={{ minHeight: '400px' }}>
        <p className="text-gray-400">Select a location to view stores on map</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden border border-gray-700 ${className}`} style={{ minHeight: '400px' }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        ref={mapRef}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lon]} icon={userIcon}>
            <Popup>
              <div className="text-sm font-semibold">Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* Store Markers */}
        {stores.map((store) => {
          if (!store.location?.latitude || !store.location?.longitude) return null;

          return (
            <Marker
              key={store.id}
              position={[store.location.latitude, store.location.longitude]}
              icon={getStoreIcon(store.id)}
              eventHandlers={{
                click: () => {
                  if (onStoreClick) {
                    onStoreClick(store.id);
                  }
                },
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold mb-1">{store.name}</div>
                  {store.distance !== undefined && (
                    <div className="text-gray-600">
                      {store.distance.toFixed(1)} km away
                    </div>
                  )}
                  {store.rating && (
                    <div className="text-yellow-500 mt-1">
                      {'⭐'.repeat(Math.floor(store.rating))} {store.rating.toFixed(1)}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        <FitBounds stores={stores} userLocation={userLocation} />
      </MapContainer>
    </div>
  );
}

