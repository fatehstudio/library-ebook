import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { encryptToken } from '@/lib/encryption';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const userId = searchParams.get('state') || '00000000-0000-0000-0000-000000000000';
  const error = searchParams.get('error');

  const origin = new URL(request.url).origin;

  if (error) {
    return NextResponse.redirect(`${origin}/settings?auth_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/settings?auth_error=no_authorization_code`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY || '';

  try {
    // Exchange the authorization code for access and refresh tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri || '',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      return NextResponse.redirect(
        `${origin}/settings?auth_error=${encodeURIComponent(JSON.stringify(errorData))}`
      );
    }

    const tokens = await tokenResponse.json();
    const { refresh_token } = tokens;

    if (!refresh_token) {
      // If a refresh token is not returned, the user might need to revoke access and re-consent
      return NextResponse.redirect(`${origin}/settings?auth_warning=refresh_token_not_returned`);
    }

    // Encrypt the sensitive offline refresh token before database storage
    const encryptedRefreshToken = encryptToken(refresh_token, encryptionKey);

    // Upsert the encrypted token in profiles using administrative client
    const supabaseAdmin = getSupabaseAdmin();
    const { error: upsertError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        google_refresh_token: encryptedRefreshToken,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (upsertError) {
      console.error('Database update error during token exchange:', upsertError);
      return NextResponse.redirect(
        `${origin}/settings?auth_error=db_save_failed&details=${encodeURIComponent(upsertError.message)}`
      );
    }

    return NextResponse.redirect(`${origin}/settings?sync=connected`);
  } catch (err: any) {
    console.error('Callback token exchange failed:', err);
    return NextResponse.redirect(`${origin}/settings?auth_error=${encodeURIComponent(err.message || 'unknown')}`);
  }
}
