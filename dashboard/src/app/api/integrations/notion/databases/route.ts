// List user's Notion databases

import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  unauthorizedResponse,
  serverErrorResponse,
  successResponse,
} from '@/lib/api-helpers';
import { getNotionToken, notionHeaders } from '@/lib/notion-auth';

export const dynamic = 'force-dynamic';

interface NotionRichText {
  plain_text: string;
}

interface NotionDatabaseResult {
  id: string;
  title: NotionRichText[];
  properties: Record<string, { id: string; type: string; name: string }>;
}

interface NotionSearchResponse {
  results: NotionDatabaseResult[];
  has_more: boolean;
  next_cursor: string | null;
}

interface DatabaseInfo {
  id: string;
  title: string;
  properties: Record<string, string>; // property name -> property type
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser(request);
  if (!user) return unauthorizedResponse();

  const token = await getNotionToken(user.id);
  if (!token) {
    return successResponse({ databases: [], connected: false });
  }

  try {
    const response = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers: notionHeaders(token),
      body: JSON.stringify({
        filter: {
          value: 'database',
          property: 'object',
        },
        page_size: 20,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Notion search failed:', response.status, errorBody);

      // If 401, the token is invalid — mark connection inactive
      if (response.status === 401) {
        return successResponse({ databases: [], connected: false });
      }

      return serverErrorResponse(new Error(`Notion API error: ${response.status}`));
    }

    const data = (await response.json()) as NotionSearchResponse;

    const databases: DatabaseInfo[] = data.results.map((db) => {
      const title =
        db.title.length > 0
          ? db.title[0].plain_text
          : 'Untitled Database';

      const properties: Record<string, string> = {};
      for (const [propName, propConfig] of Object.entries(db.properties)) {
        properties[propName] = propConfig.type;
      }

      return { id: db.id, title, properties };
    });

    return successResponse({ databases, connected: true });
  } catch (err) {
    return serverErrorResponse(err);
  }
}
