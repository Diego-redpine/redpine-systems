// View Registry API - F1-A Task 3
// Public endpoint to get view configurations

import { NextRequest, NextResponse } from 'next/server';
import { VIEW_REGISTRY, getDefaultView, getAvailableViews } from '@/lib/view-registry';

export const dynamic = 'force-dynamic';

// GET /api/views - Get view registry (full or single component)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const componentId = searchParams.get('componentId');

    // If componentId provided, return just that component's config
    if (componentId) {
      const config = VIEW_REGISTRY[componentId];

      if (!config) {
        return NextResponse.json(
          { success: false, error: `Unknown component: ${componentId}` },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          componentId,
          defaultView: getDefaultView(componentId),
          availableViews: getAvailableViews(componentId),
        },
      });
    }

    // Return full registry
    return NextResponse.json({
      success: true,
      data: VIEW_REGISTRY,
    });
  } catch (error) {
    console.error('GET views error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch view registry' },
      { status: 500 }
    );
  }
}
