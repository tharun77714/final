import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Vendor from '@/models/Vendor';
import Customer from '@/models/Customer';
import { hashPassword, generateToken } from '@/lib/auth';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { email, password, name, role, googleIdToken } = await request.json();

    // Verify Google authentication if provided
    if (googleIdToken) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: googleIdToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        
        if (!payload || !payload.email_verified || payload.email !== email?.toLowerCase()) {
          return NextResponse.json(
            { error: 'Google email verification failed' },
            { status: 401 }
          );
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid Google authentication token' },
          { status: 401 }
        );
      }
    } else {
      // If no Google token, require it for registration
      return NextResponse.json(
        { error: 'Google authentication is required for registration' },
        { status: 400 }
      );
    }

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { error: 'Email, password, name, and role are required' },
        { status: 400 }
      );
    }

    if (role !== 'vendor' && role !== 'customer') {
      return NextResponse.json(
        { error: 'Invalid role. Must be vendor or customer' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists in BOTH collections (email must be unique across vendor and customer)
    const existingVendor = await Vendor.findOne({ email: email.toLowerCase() });
    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });

    if (existingVendor || existingCustomer) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user in the appropriate collection
    const UserModel = role === 'vendor' ? Vendor : Customer;
    const user = await UserModel.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
    });

    // Generate token
    const token = generateToken({
      userId: user._id.toString(),
      role: role as 'vendor' | 'customer',
      email: user.email,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Registration successful',
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: role,
        },
      },
      { status: 201 }
    );

    // Set HTTP-only cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

