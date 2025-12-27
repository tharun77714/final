/**
 * Calculate the distance between two points on Earth using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filter stores within a specified radius from user location
 * @param stores Array of stores with location data
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param radiusKm Radius in kilometers
 * @returns Filtered stores with distance property
 */
export function getStoresWithinRadius<T extends { location?: { latitude: number; longitude: number } }>(
  stores: T[],
  userLat: number,
  userLon: number,
  radiusKm: number
): (T & { distance: number })[] {
  const storesWithDistance = stores
    .filter((store) => store.location?.latitude && store.location?.longitude)
    .map((store) => {
      const distance = haversineDistance(
        userLat,
        userLon,
        store.location!.latitude,
        store.location!.longitude
      );
      return { ...store, distance };
    })
    .filter((store) => store.distance <= radiusKm);

  return storesWithDistance;
}

/**
 * Sort stores by distance from user location (nearest first)
 * @param stores Array of stores with distance property
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @returns Sorted stores
 */
export function sortStoresByDistance<T extends { distance: number }>(
  stores: T[],
  userLat: number,
  userLon: number
): T[] {
  return [...stores].sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate distance and sort stores in one operation
 * @param stores Array of stores with location data
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param radiusKm Optional radius filter
 * @returns Sorted stores with distance property
 */
export function processStoresByLocation<T extends { location?: { latitude: number; longitude: number } }>(
  stores: T[],
  userLat: number,
  userLon: number,
  radiusKm?: number
): (T & { distance: number })[] {
  let processedStores: (T & { distance: number })[];

  if (radiusKm) {
    processedStores = getStoresWithinRadius(stores, userLat, userLon, radiusKm);
  } else {
    processedStores = stores
      .filter((store) => store.location?.latitude && store.location?.longitude)
      .map((store) => {
        const distance = haversineDistance(
          userLat,
          userLon,
          store.location!.latitude,
          store.location!.longitude
        );
        return { ...store, distance };
      });
  }

  return sortStoresByDistance(processedStores, userLat, userLon);
}

