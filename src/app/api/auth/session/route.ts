
import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import {initializeAdminApp} from '@/lib/firebase-admin';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin SDK
initializeAdminApp();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken = body.idToken;

    if (!idToken) {
      return NextResponse.json({error: 'ID token is required.'}, {status: 400});
    }

    // Set session expiration to 14 days.
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await getAuth().createSessionCookie(idToken, {expiresIn});
    
    // Set cookie policy for session cookie.
    cookies().set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({error: 'Failed to create session.'}, {status: 500});
  }
}

export async function DELETE() {
    try {
        cookies().delete('session');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting session cookie:', error);
        return NextResponse.json({ error: 'Failed to clear session.' }, { status: 500 });
    }
}
