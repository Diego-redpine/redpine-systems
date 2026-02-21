import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';
import { getValidGoogleToken } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

interface SheetProperties {
  title: string;
  sheetId: number;
}

interface SpreadsheetSheet {
  properties: SheetProperties;
}

interface SpreadsheetMetadata {
  sheets: SpreadsheetSheet[];
}

interface SheetValuesResponse {
  values?: string[][];
}

// GET /api/integrations/google/sheets/[sheetId] - Read data from a spreadsheet
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sheetId: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { sheetId } = await params;

  if (!sheetId) {
    return badRequestResponse('Sheet ID is required');
  }

  try {
    const tokenResult = await getValidGoogleToken(user.id);

    if (!tokenResult) {
      return unauthorizedResponse();
    }

    const { accessToken } = tokenResult;

    // Get spreadsheet metadata (sheet/tab names)
    const metadataResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}?fields=sheets.properties.title,sheets.properties.sheetId`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error('Google Sheets metadata error:', errorText);

      if (metadataResponse.status === 404) {
        return badRequestResponse('Spreadsheet not found');
      }

      return serverErrorResponse(new Error(`Sheets API returned ${metadataResponse.status}`));
    }

    const metadata: SpreadsheetMetadata = await metadataResponse.json();

    const sheetNames = metadata.sheets.map((s) => s.properties.title);

    // Determine which tab to read
    const { searchParams } = new URL(request.url);
    const requestedSheet = searchParams.get('sheet');
    const targetSheet = requestedSheet && sheetNames.includes(requestedSheet)
      ? requestedSheet
      : sheetNames[0];

    if (!targetSheet) {
      return badRequestResponse('No sheets found in spreadsheet');
    }

    // Fetch the sheet data — use single quotes around sheet name for special characters
    const escapedSheetName = `'${targetSheet.replace(/'/g, "''")}'`;
    const range = `${escapedSheetName}!A:ZZ`;

    const valuesResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(sheetId)}/values/${encodeURIComponent(range)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!valuesResponse.ok) {
      const errorText = await valuesResponse.text();
      console.error('Google Sheets values error:', errorText);
      return serverErrorResponse(new Error(`Sheets values API returned ${valuesResponse.status}`));
    }

    const valuesData: SheetValuesResponse = await valuesResponse.json();

    const allRows = valuesData.values || [];
    const headers = allRows.length > 0 ? allRows[0] : [];
    const rows = allRows.length > 1 ? allRows.slice(1) : [];

    return successResponse({
      headers,
      rows,
      sheetNames,
      activeSheet: targetSheet,
      totalRows: rows.length,
    });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
