// Social Media Posts API — CRUD endpoints
import { NextRequest } from 'next/server';
import { createCrudHandlers } from '@/lib/crud';

export const dynamic = 'force-dynamic';

interface SocialMediaPost {
  id: string;
  user_id: string;
  post_title: string;
  content: string;
  platform: string;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  image_urls: string[];
  hashtags: string[];
  engagement: Record<string, number>;
}

const { handleGet, handlePost } = createCrudHandlers<SocialMediaPost>('social_media_posts', {
  searchFields: ['post_title', 'content', 'platform'],
  requiredFields: ['post_title'],
});

export async function GET(request: NextRequest) {
  return handleGet(request);
}

export async function POST(request: NextRequest) {
  return handlePost(request);
}
