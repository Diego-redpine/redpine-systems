// Social Media Posts by ID — CRUD endpoints
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

const { handleGetById, handlePut, handleDelete } = createCrudHandlers<SocialMediaPost>('social_media_posts', {
  searchFields: ['post_title', 'content', 'platform'],
  requiredFields: ['post_title'],
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleGetById(request, id);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handlePut(request, id);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleDelete(request, id);
}
