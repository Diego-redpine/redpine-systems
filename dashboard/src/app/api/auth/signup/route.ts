import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { linkConfigToUser } from '@/lib/config-link';
import { rateLimit, getClientId } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

function getSupabaseAnon() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function POST(request: NextRequest) {
  // Rate limit: 3 signups per minute per IP
  const clientId = getClientId(request);
  const rl = await rateLimit(`auth-signup:${clientId}`, 3);
  if (!rl.success) {
    return NextResponse.json(
      { success: false, error: 'Too many signup attempts. Please wait.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.reset / 1000)) } },
    );
  }

  try {
    const { name, email, password, config_id } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required.' },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters.' },
        { status: 400 },
      );
    }

    const adminClient = getSupabaseAdmin();

    // 1. Create user via admin (auto-confirms email)
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { business_name: name || '' },
    });

    if (createError) {
      // Handle duplicate email
      if (createError.message?.includes('already') || createError.message?.includes('exists')) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists. Please log in.' },
          { status: 409 },
        );
      }
      console.error('Signup create error:', createError);
      return NextResponse.json(
        { success: false, error: createError.message || 'Failed to create account.' },
        { status: 400 },
      );
    }

    const userId = createData.user.id;

    // 2. Sign in to get session tokens
    const anonClient = getSupabaseAnon();
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      console.error('Signup sign-in error:', signInError);
      // User was created but sign-in failed — still return success with user info
      // The landing page can redirect to login instead
      return NextResponse.json({
        success: true,
        auth: { user_id: userId, access_token: null, refresh_token: null },
        message: 'Account created. Please log in.',
      });
    }

    // 3. If config_id provided, link config to user (handles profile + subdomain + welcome email)
    if (config_id) {
      const linkResult = await linkConfigToUser(userId, email, config_id);
      if (!linkResult.success) {
        console.warn('Config link failed during signup:', linkResult.error);
        // Non-fatal — user can link later
      }
    } else {
      // No config yet — create a basic profile so RLS works
      const { error: profileError } = await adminClient
        .from('profiles')
        .upsert({
          id: userId,
          email,
          business_name: name || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    return NextResponse.json({
      success: true,
      auth: {
        user_id: userId,
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
