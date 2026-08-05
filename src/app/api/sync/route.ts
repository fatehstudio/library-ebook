import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabaseClient';
import { decryptToken } from '@/lib/encryption';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || '00000000-0000-0000-0000-000000000000';

  const encryptionKey = process.env.TOKEN_ENCRYPTION_KEY || '';
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const supabaseAdmin = getSupabaseAdmin();

  try {
    // 1. Fetch encrypted refresh token from profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('google_refresh_token, google_drive_folder_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile || !profile.google_refresh_token) {
      return NextResponse.json(
        { error: 'Google Drive is not connected. Please connect your Google account in Settings first.' },
        { status: 400 }
      );
    }

    // 2. Decrypt the refresh token
    let refreshToken: string;
    try {
      refreshToken = decryptToken(profile.google_refresh_token, encryptionKey);
    } catch (decErr) {
      return NextResponse.json(
        { error: 'Failed to decrypt credentials. Encryption key mismatch.' },
        { status: 500 }
      );
    }

    // 3. Obtain a fresh access token from Google
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
      const errResponse = await tokenRefreshResponse.json();
      return NextResponse.json(
        { error: 'Failed to refresh access token with Google.', details: errResponse },
        { status: 400 }
      );
    }

    const { access_token } = await tokenRefreshResponse.json();

    // 4. Locate or Create "/Knowledge Library" root folder in Google Drive
    let folderId = profile.google_drive_folder_id;

    if (!folderId) {
      // Look for it in Google Drive
      const folderSearchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        "name='Knowledge Library' and mimeType='application/vnd.google-apps.folder' and trashed=false"
      )}&fields=files(id)`;
      
      const folderSearchResp = await fetch(folderSearchUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (folderSearchResp.ok) {
        const searchResult = await folderSearchResp.json();
        console.log('Google Drive folder search result:', searchResult);
        const { files } = searchResult;
        if (files && files.length > 0) {
          folderId = files[0].id;
          console.log('Found existing folderId:', folderId);
        } else {
          console.warn('Folder "Knowledge Library" not found in the search results.');
        }
      } else {
        const errText = await folderSearchResp.text();
        console.error('Google Drive folder search failed:', folderSearchResp.status, errText);
      }

      // If still not found, create it dynamically
      if (!folderId) {
        const createFolderResp = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: 'Knowledge Library',
            mimeType: 'application/vnd.google-apps.folder',
          }),
        });

        if (createFolderResp.ok) {
          const newFolder = await createFolderResp.json();
          folderId = newFolder.id;
        } else {
          const errText = await createFolderResp.text();
          console.error('Failed to create folder in Google Drive:', errText);
          return NextResponse.json(
            { 
              error: 'Failed to create /Knowledge Library root folder in Google Drive. Because the app uses read-only scopes, please create a folder named "Knowledge Library" manually in your Google Drive first, then click Sync again.',
              details: errText 
            },
            { status: 500 }
          );
        }
      }

      // Save folder ID to profile row
      await supabaseAdmin
        .from('profiles')
        .update({ google_drive_folder_id: folderId, updated_at: new Date().toISOString() })
        .eq('id', userId);
    }

    // 5. Query files recursively inside "/Knowledge Library" including subfolders and shortcuts
    const discoveredFiles: Array<{ id: string, name: string, mimeType: string, size: string }> = [];
    const visitedFolders = new Set<string>();

    async function scanFolder(fId: string, depth = 0) {
      if (depth > 4 || visitedFolders.has(fId)) return;
      visitedFolders.add(fId);

      const query = `'${fId}' in parents and trashed=false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,shortcutDetails(targetId,targetMimeType))&pageSize=100`;

      try {
        const resp = await fetch(url, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        if (!resp.ok) {
          console.error(`Failed to scan folder ${fId}:`, await resp.text());
          return;
        }

        const data = await resp.json();
        const files = data.files || [];

        for (const file of files) {
          const isEbook = file.mimeType === 'application/pdf';
          const isVideo = file.mimeType === 'video/mp4';

          if (isEbook || isVideo) {
            discoveredFiles.push(file);
          } else if (file.mimeType === 'application/vnd.google-apps.folder') {
            await scanFolder(file.id, depth + 1);
          } else if (file.mimeType === 'application/vnd.google-apps.shortcut' && file.shortcutDetails) {
            const targetMime = file.shortcutDetails.targetMimeType;
            const targetId = file.shortcutDetails.targetId;
            if (targetMime === 'application/pdf' || targetMime === 'video/mp4') {
              discoveredFiles.push({
                id: targetId,
                name: file.name,
                mimeType: targetMime,
                size: file.size || '0'
              });
            } else if (targetMime === 'application/vnd.google-apps.folder') {
              await scanFolder(targetId, depth + 1);
            }
          }
        }
      } catch (err) {
        console.error(`Error scanning folder ${fId}:`, err);
      }
    }

    await scanFolder(folderId);

    // 6. Index and upsert discovered files into Supabase library_items table
    let syncedCount = 0;
    for (const file of discoveredFiles) {
      const type = file.mimeType === 'application/pdf' ? 'ebook' : 'video';
      const sizeBytes = file.size ? parseInt(file.size, 10) : 0;
      
      const { error: upsertErr } = await supabaseAdmin
        .from('library_items')
        .upsert({
          user_id: userId,
          google_drive_file_id: file.id,
          title: file.name.replace(/\.[^/.]+$/, ''), // Strip file extensions for clean UI titles
          type,
          mime_type: file.mimeType,
          size_bytes: sizeBytes,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,google_drive_file_id' });

      if (!upsertErr) {
        syncedCount++;
      } else {
        console.error(`Failed to upsert file ID ${file.id} in DB:`, upsertErr);
      }
    }

    return NextResponse.json({
      success: true,
      folderId,
      filesDiscovered: discoveredFiles.length,
      filesSynced: syncedCount
    });
  } catch (err: any) {
    console.error('Directory sync failed:', err);
    return NextResponse.json(
      { error: err.message || 'Directory synchronization failed.' },
      { status: 500 }
    );
  }
}
