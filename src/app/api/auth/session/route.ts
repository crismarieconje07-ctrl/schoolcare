
import {NextRequest, NextResponse} from 'next/server';
import {cookies} from 'next/headers';
import { initializeAdminApp } from '@/firebase/admin';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: NextRequest) {
  const adminApp = initializeAdminApp();
  const auth = getAuth(adminApp);

  try {
    const body = await request.json();
    const idToken = body.idToken;

    if (!idToken) {
      return NextResponse.json({error: 'ID token is required.'}, {status: 400});
    }
    
    // Set session expiration to 14 days.
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, {expiresIn});
    
    const response = NextResponse.json({success: true});
    response.cookies.set('session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Error creating session cookie:', error);
    return NextResponse.json({error: 'Failed to create session.'}, {status: 500});
  }
}

export async function DELETE() {
    try {
        const response = NextResponse.json({ success: true });
        response.cookies.set('session', '', {
            maxAge: 0,
            path: '/',
        });
        return response;
    } catch (error) {
        console.error('Error deleting session cookie:', error);
        return NextResponse.json({ error: 'Failed to clear session.' }, { status: 500 });
    }
}
