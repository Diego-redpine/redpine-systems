import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';
import { getValidGoogleToken } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

interface GoogleDriveFilesResponse {
  files: GoogleDriveFile[];
}

// GET /api/integrations/google/sheets - List user's Google Spreadsheets
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  try {
    const tokenResult = await getValidGoogleToken(user.id);

    if (!tokenResult) {
      return successResponse({ sheets: [], connected: false });
    }

    const { accessToken } = tokenResult;

    // Query Google Drive for spreadsheet files
    const params = new URLSearchParams({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id,name,modifiedTime)',
      orderBy: 'modifiedTime desc',
      pageSize: '20',
    });

    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?${params.toString()}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Drive API error:', errorText);

      // If 401, token might be invalid even after refresh
      if (response.status === 401) {
        return successResponse({ sheets: [], connected: false });
      }

      return serverErrorResponse(new Error(`Google Drive API returned ${response.status}`));
    }

    const data: GoogleDriveFilesResponse = await response.json();

    const sheets = (data.files || []).map((file) => ({
      id: file.id,
      name: file.name,
      modifiedTime: file.modifiedTime,
    }));

    return successResponse({ sheets, connected: true });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
