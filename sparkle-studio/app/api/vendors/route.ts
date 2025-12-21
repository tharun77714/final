import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vendor from '@/models/Vendor';

// GET endpoint to fetch all vendors/stores
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const vendorType = searchParams.get('type') || '';

    // Build query
    const query: any = {};

    // Search by business name, owner name, city, or state
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } },
        { 'businessAddress.city': { $regex: search, $options: 'i' } },
        { 'businessAddress.state': { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by vendor type
    if (vendorType && ['Manufacturer', 'Wholesaler', 'Retailer'].includes(vendorType)) {
      query.vendorType = vendorType;
    }

    const vendors = await Vendor.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        vendors: vendors.map((v) => ({
          id: v._id.toString(),
          businessName: v.businessName || '',
          ownerName: v.ownerName || '',
          email: v.email || '',
          mobileNumber: v.mobileNumber || '',
          businessAddress: v.businessAddress || {
            street: '',
            city: '',
            state: '',
            pincode: '',
          },
          yearsInBusiness: v.yearsInBusiness || 0,
          vendorType: v.vendorType || '',
          createdAt: v.createdAt,
        })),
        total: vendors.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

