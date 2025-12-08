import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
import Customer from '@/models/Customer';

// GET endpoint to view all users (for testing purposes)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const vendors = await Vendor.find({}).select('-password').lean();
    const customers = await Customer.find({}).select('-password').lean();

    return NextResponse.json(
      {
        success: true,
        vendors: vendors.map((v) => ({
          id: v._id.toString(),
          email: v.email,
          name: v.name,
          createdAt: v.createdAt,
        })),
        customers: customers.map((c) => ({
          id: c._id.toString(),
          email: c.email,
          name: c.name,
          createdAt: c.createdAt,
        })),
        totalVendors: vendors.length,
        totalCustomers: customers.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

