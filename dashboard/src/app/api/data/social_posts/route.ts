// Social Media Posts API — Full CRUD with scheduling support
// Stores multi-platform social posts with draft/scheduled/published/failed status

import { NextRequest, NextResponse } from 'next/server';
import {
  getBusinessContext,
  getSupabaseUser,
  parseQueryParams,
  logActivity,
} from '@/lib/crud';

export const dynamic = 'force-dynamic';

// ---------- GET: List posts with pagination & status filter ----------
export async function GET(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseUser(request);
    const { page, pageSize, sortBy, sortOrder, search, allParams } =
      parseQueryParams(request);

    let query = supabase
      .from('social_media_posts')
      .select('*', { count: 'exact' })
      .eq('user_id', context.businessOwnerId);

    // Status filter (draft | scheduled | published | failed)
    if (allParams.status) {
      query = query.eq('status', allParams.status);
    }

    // Platform filter
    if (allParams.platform) {
      query = query.contains('platforms', [allParams.platform]);
    }

    // Text search across content
    if (search) {
      query = query.or(
        `content.ilike.%${search}%,post_title.ilike.%${search}%`
      );
    }

    // Sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error('GET social_posts error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      count: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('GET social_posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch social posts' },
      { status: 500 }
    );
  }
}

// ---------- POST: Create a new social post (draft or scheduled) ----------
export async function POST(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.content && !body.post_title) {
      return NextResponse.json(
        { success: false, error: 'content or post_title is required' },
        { status: 400 }
      );
    }

    // Validate status enum
    const validStatuses = ['draft', 'scheduled', 'published', 'failed'];
    const status = body.status || 'draft';
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // If scheduling, validate scheduled_at is present and in the future
    if (status === 'scheduled' && !body.scheduled_at) {
      return NextResponse.json(
        { success: false, error: 'scheduled_at is required for scheduled posts' },
        { status: 400 }
      );
    }

    // Validate platforms is an array (if provided)
    if (body.platforms && !Array.isArray(body.platforms)) {
      return NextResponse.json(
        { success: false, error: 'platforms must be an array' },
        { status: 400 }
      );
    }

    // Validate media_urls is an array (if provided)
    if (body.media_urls && !Array.isArray(body.media_urls)) {
      return NextResponse.json(
        { success: false, error: 'media_urls must be an array' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseUser(request);

    const record = {
      user_id: context.businessOwnerId,
      content: body.content || '',
      post_title: body.post_title || '',
      media_urls: body.media_urls || [],
      platforms: body.platforms || [],
      scheduled_at: body.scheduled_at || null,
      published_at: body.published_at || null,
      status,
      hashtags: body.hashtags || [],
      error_message: body.error_message || null,
    };

    const { data, error } = await supabase
      .from('social_media_posts')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('POST social_posts error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    // Audit log
    logActivity({
      userId: context.businessOwnerId,
      actorId: context.userId,
      action: 'create',
      entityType: 'social_media_posts',
      entityId: data?.id,
      entityName: record.post_title || 'Social post',
    });

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('POST social_posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create social post' },
      { status: 500 }
    );
  }
}

// ---------- PUT: Update an existing social post ----------
export async function PUT(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id is required' },
        { status: 400 }
      );
    }

    // Validate status if being changed
    if (updates.status) {
      const validStatuses = ['draft', 'scheduled', 'published', 'failed'];
      if (!validStatuses.includes(updates.status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
    }

    // Don't allow overwriting protected fields
    delete updates.user_id;
    delete updates.created_at;
    updates.updated_at = new Date().toISOString();

    const supabase = getSupabaseUser(request);

    const { data, error } = await supabase
      .from('social_media_posts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', context.businessOwnerId)
      .select()
      .single();

    if (error) {
      console.error('PUT social_posts error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Post not found or not authorized' },
        { status: 404 }
      );
    }

    logActivity({
      userId: context.businessOwnerId,
      actorId: context.userId,
      action: 'update',
      entityType: 'social_media_posts',
      entityId: id,
      entityName: data.post_title || 'Social post',
      changes: updates,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('PUT social_posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update social post' },
      { status: 500 }
    );
  }
}

// ---------- DELETE: Remove a social post ----------
export async function DELETE(request: NextRequest) {
  try {
    const context = await getBusinessContext(request);
    if (!context) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'id query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseUser(request);

    // Fetch name for audit log before deleting
    const { data: existing } = await supabase
      .from('social_media_posts')
      .select('post_title')
      .eq('id', id)
      .eq('user_id', context.businessOwnerId)
      .single();

    const { error } = await supabase
      .from('social_media_posts')
      .delete()
      .eq('id', id)
      .eq('user_id', context.businessOwnerId);

    if (error) {
      console.error('DELETE social_posts error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    logActivity({
      userId: context.businessOwnerId,
      actorId: context.userId,
      action: 'delete',
      entityType: 'social_media_posts',
      entityId: id,
      entityName: existing?.post_title || 'Social post',
    });

    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('DELETE social_posts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete social post' },
      { status: 500 }
    );
  }
}
