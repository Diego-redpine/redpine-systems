// Query rows from a specific Notion database

import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';
import { getNotionToken, notionHeaders } from '@/lib/notion-auth';

export const dynamic = 'force-dynamic';

// --- Notion property value types ---

interface NotionRichTextItem {
  plain_text: string;
}

interface NotionSelectOption {
  name: string;
}

interface NotionDate {
  start: string;
  end: string | null;
}

interface NotionPropertyValue {
  type: string;
  title?: NotionRichTextItem[];
  rich_text?: NotionRichTextItem[];
  email?: string | null;
  phone_number?: string | null;
  number?: number | null;
  select?: NotionSelectOption | null;
  multi_select?: NotionSelectOption[];
  date?: NotionDate | null;
  checkbox?: boolean;
  url?: string | null;
  status?: NotionSelectOption | null;
  // Fallback for less common types
  [key: string]: unknown;
}

interface NotionPage {
  id: string;
  properties: Record<string, NotionPropertyValue>;
}

interface NotionQueryResponse {
  results: NotionPage[];
  has_more: boolean;
  next_cursor: string | null;
}

/**
 * Extract a plain value from a Notion property object.
 */
function extractPropertyValue(prop: NotionPropertyValue): string | number | boolean | null {
  switch (prop.type) {
    case 'title':
      return prop.title && prop.title.length > 0 ? prop.title[0].plain_text : null;
    case 'rich_text':
      return prop.rich_text && prop.rich_text.length > 0 ? prop.rich_text[0].plain_text : null;
    case 'email':
      return prop.email ?? null;
    case 'phone_number':
      return prop.phone_number ?? null;
    case 'number':
      return prop.number ?? null;
    case 'select':
      return prop.select ? prop.select.name : null;
    case 'multi_select':
      return prop.multi_select ? prop.multi_select.map((s) => s.name).join(', ') : null;
    case 'date':
      return prop.date ? prop.date.start : null;
    case 'checkbox':
      return prop.checkbox ?? false;
    case 'url':
      return prop.url ?? null;
    case 'status':
      return prop.status ? prop.status.name : null;
    default: {
      // Try to get a sensible string for unknown property types
      const raw = prop[prop.type];
      if (raw === null || raw === undefined) return null;
      if (typeof raw === 'string' || typeof raw === 'number' || typeof raw === 'boolean') return raw;
      return String(raw);
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dbId: string }> }
) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const { dbId } = await params;

  const token = await getNotionToken(user.id);
  if (!token) {
    return unauthorizedResponse();
  }

  try {
    // Fetch all rows with pagination (up to 300 rows across pages)
    const allPages: NotionPage[] = [];
    let cursor: string | null = null;
    const MAX_PAGES = 3; // 3 x 100 = 300 rows max
    let pageCount = 0;

    do {
      const body: Record<string, unknown> = { page_size: 100 };
      if (cursor) body.start_cursor = cursor;

      const response = await fetch(
        `https://api.notion.com/v1/databases/${dbId}/query`,
        {
          method: 'POST',
          headers: notionHeaders(token),
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Notion database query failed:', response.status, errorBody);
        return serverErrorResponse(
          new Error(`Notion query error: ${response.status}`)
        );
      }

      const data = (await response.json()) as NotionQueryResponse;
      allPages.push(...data.results);
      cursor = data.has_more ? data.next_cursor : null;
      pageCount++;
    } while (cursor && pageCount < MAX_PAGES);

    // Determine headers and property types from the first result
    if (allPages.length === 0) {
      return successResponse({ headers: [], rows: [], propertyTypes: {} });
    }

    const sampleProps = allPages[0].properties;
    const headers = Object.keys(sampleProps);
    const propertyTypes: Record<string, string> = {};
    for (const [propName, propValue] of Object.entries(sampleProps)) {
      propertyTypes[propName] = propValue.type;
    }

    // Extract flat row values
    const rows: Record<string, string | number | boolean | null>[] = allPages.map(
      (page) => {
        const row: Record<string, string | number | boolean | null> = {};
        for (const header of headers) {
          const prop = page.properties[header];
          row[header] = prop ? extractPropertyValue(prop) : null;
        }
        return row;
      }
    );

    return successResponse({ headers, rows, propertyTypes });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
