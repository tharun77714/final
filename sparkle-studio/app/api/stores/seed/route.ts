import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
import { hashPassword } from '@/lib/auth';

// Dummy stores with locations
const dummyStores = [
  {
    email: 'diamondjewels@example.com',
    password: 'password123',
    businessName: 'Diamond Jewels',
    ownerName: 'Rajesh Kumar',
    mobileNumber: '+91 9876543210',
    businessAddress: {
      street: '123 Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
    },
    location: {
      latitude: 28.6304,
      longitude: 77.2177,
    },
    rating: 4.5,
    images: ['/media/store1.jpg'],
    categories: ['Rings', 'Necklaces', 'Earrings'],
    items: ['Diamond Rings', 'Gold Necklaces', 'Pearl Earrings'],
    vendorType: 'Retailer' as const,
    yearsInBusiness: 15,
    isActive: true,
  },
  {
    email: 'goldensparkle@example.com',
    password: 'password123',
    businessName: 'Golden Sparkle',
    ownerName: 'Priya Sharma',
    mobileNumber: '+91 9876543211',
    businessAddress: {
      street: '456 MG Road',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
    },
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
    },
    rating: 4.8,
    images: ['/media/store2.jpg'],
    categories: ['Bracelets', 'Chains', 'Pendants'],
    items: ['Gold Bracelets', 'Platinum Chains', 'Diamond Pendants'],
    vendorType: 'Wholesaler' as const,
    yearsInBusiness: 20,
    isActive: true,
  },
  {
    email: 'pearlpalace@example.com',
    password: 'password123',
    businessName: 'Pearl Palace',
    ownerName: 'Amit Patel',
    mobileNumber: '+91 9876543212',
    businessAddress: {
      street: '789 Linking Road',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400052',
    },
    location: {
      latitude: 19.076,
      longitude: 72.8777,
    },
    rating: 4.3,
    images: ['/media/store3.jpg'],
    categories: ['Pearls', 'Bangles', 'Rings'],
    items: ['Pearl Sets', 'Gold Bangles', 'Silver Rings'],
    vendorType: 'Manufacturer' as const,
    yearsInBusiness: 12,
    isActive: true,
  },
  {
    email: 'platinumcrafts@example.com',
    password: 'password123',
    businessName: 'Platinum Crafts',
    ownerName: 'Sneha Reddy',
    mobileNumber: '+91 9876543213',
    businessAddress: {
      street: '321 Jubilee Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500033',
    },
    location: {
      latitude: 17.385,
      longitude: 78.4867,
    },
    rating: 4.6,
    images: ['/media/store4.jpg'],
    categories: ['Platinum', 'Diamonds', 'Custom'],
    items: ['Platinum Sets', 'Diamond Rings', 'Custom Designs'],
    vendorType: 'Retailer' as const,
    yearsInBusiness: 8,
    isActive: true,
  },
  {
    email: 'silverstreak@example.com',
    password: 'password123',
    businessName: 'Silver Streak',
    ownerName: 'Vikram Singh',
    mobileNumber: '+91 9876543214',
    businessAddress: {
      street: '654 Park Street',
      city: 'Kolkata',
      state: 'West Bengal',
      pincode: '700016',
    },
    location: {
      latitude: 22.5448,
      longitude: 88.3426,
    },
    rating: 4.2,
    images: ['/media/store5.jpg'],
    categories: ['Silver', 'Antique', 'Traditional'],
    items: ['Silver Jewelry', 'Antique Pieces', 'Traditional Sets'],
    vendorType: 'Retailer' as const,
    yearsInBusiness: 25,
    isActive: true,
  },
];

/**
 * POST /api/stores/seed
 * Seed dummy stores with locations (for development/testing)
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    let created = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const storeData of dummyStores) {
      try {
        // Check if store already exists
        const existing = await Vendor.findOne({ email: storeData.email });
        if (existing) {
          skipped++;
          continue;
        }

        // Hash password
        const hashedPassword = await hashPassword(storeData.password);

        // Create store
        const store = new Vendor({
          ...storeData,
          password: hashedPassword,
        });
        await store.save();
        console.log(`Created store: ${storeData.businessName}`, {
          hasLocation: !!(store.location && store.location.latitude && store.location.longitude),
          location: store.location,
        });
        created++;
      } catch (error: any) {
        errors.push(`${storeData.businessName}: ${error.message}`);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Seed completed',
        created,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed stores', message: error.message },
      { status: 500 }
    );
  }
}

