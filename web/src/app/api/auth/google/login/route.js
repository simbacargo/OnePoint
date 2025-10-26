import { NextResponse } from 'next/server';
import { generateCodeVerifier, generateState } from 'oslo/oauth2';
import { cookies } from 'next/headers';
import { webcrypto } from 'node:crypto'; // 💡 Import Node's crypto for hashing

// Base URL for Google's authorization endpoint
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

// Helper function to create the code challenge
function base64UrlEncode(buffer) {
  return Buffer.from(buffer)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function deriveCodeChallenge(codeVerifier) {
    const hash = await webcrypto.subtle.digest('SHA-256', new TextEncoder().encode(codeVerifier));
    return base64UrlEncode(hash);
}


export async function GET() {
  const state = generateState();
  const codeVerifier = generateCodeVerifier(); // 💡 THIS is the secret you store

  // 1. DERIVE THE CODE CHALLENGE
  const codeChallenge = await deriveCodeChallenge(codeVerifier); // 💡 THIS is what you send

  // Store state and code verifier in http-only cookies
  cookies().set('google_oauth_state', state, { 
    path: '/', 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true, 
    maxAge: 60 * 10 
  }); 
  cookies().set('google_code_verifier', codeVerifier, { // Store the RAW verifier
    path: '/', 
    secure: process.env.NODE_ENV === 'production', 
    httpOnly: true, 
    maxAge: 60 * 10 
  }); 

  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile', 
    state: state,
    code_challenge: codeChallenge, // ✅ FIXED: Send the derived challenge
    code_challenge_method: 'S256',
    access_type: 'offline', 
    prompt: 'consent' 
  });

  const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;

  // Redirect the user to Google
  return NextResponse.redirect(authUrl);
}