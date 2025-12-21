import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVendor extends Document {
  email: string;
  password: string;
  businessName: string;
  ownerName: string;
  mobileNumber: string;
  businessAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  yearsInBusiness: number;
  vendorType: 'Manufacturer' | 'Wholesaler' | 'Retailer';
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    businessName: {
      type: String,
      required: [true, 'Business Name is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner/Authorized Person Name is required'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile Number is required'],
      trim: true,
    },
    businessAddress: {
      street: {
        type: String,
        required: [true, 'Business Address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      pincode: {
        type: String,
        required: [true, 'Pincode is required'],
        trim: true,
      },
    },
    yearsInBusiness: {
      type: Number,
      required: [true, 'Years in Jewellery Business is required'],
      min: [0, 'Years in business cannot be negative'],
    },
    vendorType: {
      type: String,
      required: [true, 'Type of Vendor is required'],
      enum: ['Manufacturer', 'Wholesaler', 'Retailer'],
    },
  },
  {
    timestamps: true,
  }
);

const Vendor: Model<IVendor> =
  mongoose.models.Vendor || mongoose.model<IVendor>('Vendor', VendorSchema);

export default Vendor;

