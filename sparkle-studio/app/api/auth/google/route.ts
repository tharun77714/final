import { NextRequest, NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Extract user information
    const email = payload.email;
    const name = payload.name || payload.given_name || '';
    const emailVerified = payload.email_verified;

    if (!email || !emailVerified) {
      return NextResponse.json(
        { error: 'Email not verified by Google' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        email,
        name,
        emailVerified,
        picture: payload.picture,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Google authentication failed' },
      { status: 401 }
    );
  }
}

