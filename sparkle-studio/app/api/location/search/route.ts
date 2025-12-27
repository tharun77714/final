import { NextRequest, NextResponse } from 'next/server';

/**
 * OpenStreetMap Nominatim API endpoint for location search
 * GET /api/location/search?q={query}
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // OpenStreetMap Nominatim API (free, no API key required)
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=10&addressdetails=1`;

    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'SparkleStudio/1.0', // Required by Nominatim
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform Nominatim response to our format
    const locations = data.map((item: any) => ({
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      address: {
        city: item.address?.city || item.address?.town || item.address?.village || '',
        state: item.address?.state || item.address?.region || '',
        country: item.address?.country || '',
        postcode: item.address?.postcode || '',
        street: item.address?.road || item.address?.street || '',
      },
      place_id: item.place_id,
      type: item.type,
      importance: item.importance,
    }));

    return NextResponse.json(
      {
        success: true,
        locations,
        count: locations.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error searching location:', error);
    return NextResponse.json(
      {
        error: 'Failed to search location',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}

