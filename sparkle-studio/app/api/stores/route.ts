import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
import { processStoresByLocation } from '@/lib/location';

/**
 * GET /api/stores?lat={lat}&lon={lon}&radius={radius}&search={search}
 * Returns stores with distance calculation, sorted by nearest first
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const radius = searchParams.get('radius');
    const search = searchParams.get('search') || '';

    // Build query
    const query: any = {
      isActive: { $ne: false }, // Only active stores
    };
    
    // Only require location if lat/lon are provided (for distance calculation)
    // Otherwise, show all stores (even without location for testing)
    if (lat && lon) {
      query['location.latitude'] = { $exists: true, $ne: null, $type: 'number' };
      query['location.longitude'] = { $exists: true, $ne: null, $type: 'number' };
    }

    // Text search by business name, city, or state
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { 'businessAddress.city': { $regex: search, $options: 'i' } },
        { 'businessAddress.state': { $regex: search, $options: 'i' } },
        { categories: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    // Fetch all matching stores
    const vendors = await Vendor.find(query)
      .select('-password')
      .lean();

    // If location is provided, calculate distances and filter by radius
    if (lat && lon) {
      const userLat = parseFloat(lat);
      const userLon = parseFloat(lon);
      const radiusKm = radius ? parseFloat(radius) : 20; // Default 20km

      if (isNaN(userLat) || isNaN(userLon)) {
        return NextResponse.json(
          { error: 'Invalid latitude or longitude' },
          { status: 400 }
        );
      }

      // Process stores: calculate distance, filter by radius, sort by distance
      const storesWithDistance = processStoresByLocation(
        vendors as any[],
        userLat,
        userLon,
        radiusKm
      );

      // Format response
      const stores = storesWithDistance.map((store) => ({
        id: store._id.toString(),
        name: store.businessName,
        ownerName: store.ownerName,
        email: store.email,
        mobileNumber: store.mobileNumber,
        address: {
          street: store.businessAddress.street,
          city: store.businessAddress.city,
          state: store.businessAddress.state,
          pincode: store.businessAddress.pincode,
        },
        location: {
          latitude: store.location?.latitude,
          longitude: store.location?.longitude,
        },
        rating: store.rating || 0,
        images: store.images || [],
        categories: store.categories || [],
        items: store.items || [],
        vendorType: store.vendorType,
        yearsInBusiness: store.yearsInBusiness,
        distance: Math.round(store.distance * 10) / 10, // Round to 1 decimal
        createdAt: store.createdAt,
      }));

      return NextResponse.json(
        {
          success: true,
          stores,
          total: stores.length,
          userLocation: { lat: userLat, lon: userLon },
          radius: radiusKm,
        },
        { status: 200 }
      );
    } else {
      // No location provided, return stores without distance
      const stores = vendors.map((store: any) => ({
        id: store._id.toString(),
        name: store.businessName,
        ownerName: store.ownerName,
        email: store.email,
        mobileNumber: store.mobileNumber,
        address: {
          street: store.businessAddress.street,
          city: store.businessAddress.city,
          state: store.businessAddress.state,
          pincode: store.businessAddress.pincode,
        },
        location: store.location
          ? {
              latitude: store.location.latitude,
              longitude: store.location.longitude,
            }
          : null,
        rating: store.rating || 0,
        images: store.images || [],
        categories: store.categories || [],
        items: store.items || [],
        vendorType: store.vendorType,
        yearsInBusiness: store.yearsInBusiness,
        createdAt: store.createdAt,
      }));

      // Filter to only show stores with valid location data
      const storesWithLocation = stores.filter((store: any) => 
        store.location && 
        typeof store.location.latitude === 'number' && 
        typeof store.location.longitude === 'number'
      );

      return NextResponse.json(
        {
          success: true,
          stores: storesWithLocation,
          total: storesWithLocation.length,
          totalFound: stores.length,
          message: storesWithLocation.length === 0 
            ? 'No stores with location data found. Make sure stores have latitude and longitude.' 
            : 'Location not provided, distance not calculated',
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error('Error fetching stores:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

