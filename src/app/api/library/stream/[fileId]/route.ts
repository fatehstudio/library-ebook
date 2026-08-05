import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { decryptToken } from '@/lib/encryption';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const userId = '00000000-0000-0000-0000-000000000000'; // Static UUID for single-user setup

  const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY || '';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const supabaseAdmin = getSupabaseAdmin();

  try {
    // 1. Fetch encrypted refresh token from profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('google_refresh_token')
      .eq('id', userId)
      .single();

    if (profileError || !profile || !profile.google_refresh_token) {
      return NextResponse.json(
        { error: 'Google Drive is not connected.' },
        { status: 400 }
      );
    }

    const refreshToken = decryptToken(profile.google_refresh_token, encryptionKey);

    // 2. Obtain a fresh access token from Google
    const tokenRefreshResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId || '',
        client_secret: clientSecret || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenRefreshResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to refresh Google access token.' },
        { status: 400 }
      );
    }

    const { access_token } = await tokenRefreshResponse.json();

    // 3. Negotiate range headers for byte-streaming
    const rangeHeader = request.headers.get('range');
    const googleHeaders: Record<string, string> = {
      Authorization: `Bearer ${access_token}`,
    };
    if (rangeHeader) {
      googleHeaders['Range'] = rangeHeader;
    }

    // 4. Fetch the file media content from Google Drive
    const googleResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
      {
        headers: googleHeaders,
      }
    );

    if (!googleResponse.ok) {
      const errText = await googleResponse.text();
      console.error('Google Drive streaming request failed:', googleResponse.status, errText);
      return NextResponse.json(
        { error: 'Failed to fetch media file from Google Drive.' },
        { status: googleResponse.status }
      );
    }

    // 5. Pipe Google Drive's response binary stream to the client
    const responseHeaders: Record<string, string> = {
      'Content-Type': googleResponse.headers.get('content-type') || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
    };

    const contentLength = googleResponse.headers.get('content-length');
    if (contentLength) responseHeaders['Content-Length'] = contentLength;

    const contentRange = googleResponse.headers.get('content-range');
    if (contentRange) responseHeaders['Content-Range'] = contentRange;

    // Return the response stream with the proper status code (supporting 206 Partial Content)
    return new Response(googleResponse.body, {
      status: googleResponse.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Error in streaming endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error during media streaming.' },
      { status: 500 }
    );
  }
}
