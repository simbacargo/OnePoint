import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  const cookieStore = cookies(); 

  // 1. Verify State (Check for CSRF)
  const storedState = cookieStore.get('google_oauth_state')?.value ?? null; 
  if (!code || !state || state !== storedState) {
    console.error('State/CSRF mismatch. State:', { received: state, stored: storedState });
    return new NextResponse('Invalid request: State mismatch or missing parameters.', { status: 400 });
  }

  // Retrieve the PKCE Code Verifier
  const codeVerifier = cookieStore.get('google_code_verifier')?.value ?? null;
  if (!codeVerifier) {
    console.error('Missing code verifier. Check cookie setting in the initial route.');
    return new NextResponse('Missing code verifier', { status: 400 });
  }

  try {
    // 2. Exchange Code for Tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: 'authorization_code',
        code_verifier: codeVerifier, // Required for PKCE
      }),
    });

    const tokens = await tokenResponse.json();
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    console.log('Token response status:', tokenResponse.status);
    console.log('Tokens object received:', tokens);
    
    // CRITICAL: Log the actual error returned by Google
    if (tokens.error) {
      console.error('Token exchange failed. Google Error:', {
        error: tokens.error,
        description: tokens.error_description,
      });
      // Return the specific error description if available, otherwise generic
      const errorMessage = tokens.error_description || 'Failed to exchange code for tokens.';
      return new NextResponse(errorMessage, { status: 400 });
    }

    const accessToken = tokens.access_token;

    // 3. Fetch User Profile
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const googleUser = await userResponse.json();

    // 4. Session Management 
    const userId = googleUser.sub; 
    
    // Set a secure, http-only session cookie (FIXED: Using 'session_id' key)
    cookieStore.set('session_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // 5. Cleanup and Redirect
    cookieStore.delete('google_oauth_state');
    cookieStore.delete('google_code_verifier');
    
    // Redirect to the protected page
    return NextResponse.redirect(new URL('/', request.url)); 
    
  } catch (e) {
    console.error('OAuth flow error during token exchange or profile fetch:', e);
    return new NextResponse('Authentication failed due to server error.', { status: 500 });
  }
}
