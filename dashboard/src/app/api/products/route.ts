import { NextRequest } from 'next/server';
import {
  getAuthenticatedUser,
  getSupabaseAdmin,
  parseQueryParams,
  unauthorizedResponse,
  badRequestResponse,
  serverErrorResponse,
  successResponse,
  createdResponse,
} from '@/lib/api-helpers';

export const dynamic = 'force-dynamic';

// GET /api/products - List all products for current user
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const { search, sort, order, limit, offset } = parseQueryParams(request);
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order(sort || 'created_at', { ascending: order === 'asc' })
      .range(offset || 0, (offset || 0) + (limit || 50) - 1);

    if (search) {
      query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,category.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return successResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    if (!body.name) {
      return badRequestResponse('Name is required');
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('products')
      .insert({
        user_id: user.id,
        name: body.name,
        description: body.description || null,
        price_cents: body.price_cents || null,
        sku: body.sku || null,
        quantity: body.quantity || 0,
        category: body.category || null,
        image_url: body.image_url || null,
        is_active: body.is_active !== false,
      })
      .select()
      .single();

    if (error) throw error;

    return createdResponse(data);
  } catch (error) {
    return serverErrorResponse(error);
  }
}
