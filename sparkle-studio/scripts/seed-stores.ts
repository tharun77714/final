/**
 * Seed script to add dummy store data with locations
 * Run with: npx ts-node scripts/seed-stores.ts
 * Or use the API endpoint: POST /api/stores/seed
 */

import mongoose from 'mongoose';
import Vendor from '../models/Vendor';
import connectDB from '../lib/mongodb';

// Dummy stores with locations (Delhi, Mumbai, Bangalore areas)
const dummyStores = [
  {
    email: 'diamondjewels@example.com',
    password: 'password123', // In production, this should be hashed
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
    vendorType: 'Retailer',
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
    vendorType: 'Wholesaler',
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
    vendorType: 'Manufacturer',
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
    vendorType: 'Retailer',
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
    vendorType: 'Retailer',
    yearsInBusiness: 25,
    isActive: true,
  },
];

async function seedStores() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Hash passwords (in production, use bcrypt)
    // For now, we'll skip password hashing in seed script
    // In real scenario, vendors would register through the API which hashes passwords

    let created = 0;
    let skipped = 0;

    for (const storeData of dummyStores) {
      try {
        // Check if store already exists
        const existing = await Vendor.findOne({ email: storeData.email });
        if (existing) {
          console.log(`Store ${storeData.businessName} already exists, skipping...`);
          skipped++;
          continue;
        }

        // Create store
        const store = new Vendor(storeData);
        await store.save();
        console.log(`Created store: ${storeData.businessName}`);
        created++;
      } catch (error: any) {
        console.error(`Error creating store ${storeData.businessName}:`, error.message);
      }
    }

    console.log(`\nSeed completed!`);
    console.log(`Created: ${created} stores`);
    console.log(`Skipped: ${skipped} stores (already exist)`);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run if executed directly
if (require.main === module) {
  seedStores();
}

export default seedStores;

