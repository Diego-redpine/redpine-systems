// Subdomain Config API - F7 Public endpoint for subdomain dashboard data

import { NextRequest, NextResponse } from 'next/server';
import { getConfigBySubdomain } from '@/lib/subdomain';

export const dynamic = 'force-dynamic';

// GET /api/subdomain - Get config data for current subdomain
export async function GET(request: NextRequest) {
  try {
    // Get subdomain from header (set by middleware)
    const subdomain = request.headers.get('x-subdomain');

    if (!subdomain) {
      return NextResponse.json(
        { success: false, error: 'Not a subdomain request' },
        { status: 400 }
      );
    }

    // Look up config by subdomain
    const result = await getConfigBySubdomain(subdomain);

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'Subdomain not found' },
        { status: 404 }
      );
    }

    const { profile, config } = result;

    // Return public config data (no auth required for reading)
    return NextResponse.json({
      success: true,
      data: {
        id: config.id,
        businessName: config.business_name || profile.business_name,
        businessType: config.business_type,
        tabs: config.tabs,
        colors: config.colors,
        navStyle: config.nav_style,
        subdomain: profile.subdomain,
        // Don't expose sensitive profile data
      },
    });
  } catch (error) {
    console.error('GET subdomain config error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subdomain config' },
      { status: 500 }
    );
  }
}
