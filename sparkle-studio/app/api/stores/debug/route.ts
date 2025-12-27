import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vendor from '@/models/Vendor';

/**
 * GET /api/stores/debug
 * Debug endpoint to check if stores are saved correctly
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get all vendors
    const allVendors = await Vendor.find({}).select('-password').lean();
    
    // Get vendors with location
    const vendorsWithLocation = await Vendor.find({
      location: { $exists: true, $ne: null },
      'location.latitude': { $exists: true, $ne: null },
      'location.longitude': { $exists: true, $ne: null },
    }).select('-password').lean();

    // Get active vendors
    const activeVendors = await Vendor.find({
      isActive: { $ne: false },
    }).select('-password').lean();

    return NextResponse.json(
      {
        success: true,
        debug: {
          totalVendors: allVendors.length,
          vendorsWithLocation: vendorsWithLocation.length,
          activeVendors: activeVendors.length,
          allVendors: allVendors.map((v: any) => ({
            id: v._id.toString(),
            businessName: v.businessName,
            email: v.email,
            hasLocation: !!(v.location && v.location.latitude && v.location.longitude),
            location: v.location,
            isActive: v.isActive,
          })),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

