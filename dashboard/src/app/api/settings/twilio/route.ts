// Twilio Settings — save/check per-business Twilio credentials
// POST: Save Twilio credentials to configs.integrations JSONB
// GET: Return whether Twilio is configured (never return secrets)

import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser, getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// POST /api/settings/twilio — Save Twilio credentials
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
    const { account_sid, auth_token, phone_number } = body;

    if (!account_sid || !auth_token || !phone_number) {
      return NextResponse.json(
        { success: false, error: 'account_sid, auth_token, and phone_number are required' },
        { status: 400 }
      );
    }

    // Validate SID format (starts with AC)
    if (!account_sid.startsWith('AC') || account_sid.length < 30) {
      return NextResponse.json(
        { success: false, error: 'Invalid Account SID format. It should start with AC.' },
        { status: 400 }
      );
    }

    // Validate phone number format (E.164)
    const cleanPhone = phone_number.replace(/\s/g, '');
    if (!cleanPhone.startsWith('+') || cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Phone number must be in E.164 format (e.g. +15551234567)' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for JSONB merge on configs
    const supabaseAdmin = getSupabaseAdmin();

    // Fetch current config to merge integrations
    const { data: config, error: fetchError } = await supabaseAdmin
      .from('configs')
      .select('id, integrations')
      .eq('user_id', context.businessOwnerId)
      .single();

    if (fetchError || !config) {
      return NextResponse.json(
        { success: false, error: 'Business config not found' },
        { status: 404 }
      );
    }

    // Merge Twilio credentials into integrations JSONB
    const currentIntegrations = (config.integrations as Record<string, unknown>) || {};
    const updatedIntegrations = {
      ...currentIntegrations,
      twilio: {
        account_sid,
        auth_token,
        phone_number: cleanPhone,
        configured_at: new Date().toISOString(),
      },
    };

    const { error: updateError } = await supabaseAdmin
      .from('configs')
      .update({
        integrations: updatedIntegrations,
        updated_at: new Date().toISOString(),
      })
      .eq('id', config.id);

    if (updateError) {
      console.error('[Twilio Settings] Update error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to save Twilio credentials' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Twilio credentials saved successfully',
      configured: true,
      phone_number: cleanPhone,
    });
  } catch (error) {
    console.error('[Twilio Settings] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/settings/twilio — Check if Twilio is configured (no secrets returned)
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

    const { data: config } = await supabase
      .from('configs')
      .select('integrations')
      .eq('user_id', context.businessOwnerId)
      .single();

    const integrations = (config?.integrations as Record<string, unknown>) || {};
    const twilio = integrations.twilio as Record<string, unknown> | undefined;

    if (!twilio?.account_sid || !twilio?.auth_token || !twilio?.phone_number) {
      return NextResponse.json({
        success: true,
        configured: false,
      });
    }

    // Return status without secrets — mask the SID and phone
    const sid = twilio.account_sid as string;
    const phone = twilio.phone_number as string;

    return NextResponse.json({
      success: true,
      configured: true,
      phone_number: phone,
      account_sid_last4: sid.slice(-4),
      configured_at: twilio.configured_at || null,
    });
  } catch (error) {
    console.error('[Twilio Settings] GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
