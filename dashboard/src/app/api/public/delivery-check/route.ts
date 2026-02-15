import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';
import { haversineDistanceMiles, geocodeAddress } from '@/lib/geo';

// GET /api/public/delivery-check?subdomain=X&address=Y
// Returns whether address is within delivery radius
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');
    const address = searchParams.get('address');

    if (!subdomain || !address) {
      return NextResponse.json({ error: 'subdomain and address required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Look up business profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_address, delivery_radius_miles')
      .eq('subdomain', subdomain)
      .single();

    const radiusMiles = profile?.delivery_radius_miles || 5;

    // If business has no address set, allow delivery (can't check)
    const businessAddr = profile?.business_address;
    if (!businessAddr || (!businessAddr.lat && !businessAddr.street)) {
      return NextResponse.json({
        success: true,
        inZone: true,
        distance: null,
        radius: radiusMiles,
        message: 'Delivery zone check not configured',
      });
    }

    // Get business coordinates
    let businessLat: number, businessLon: number;
    if (businessAddr.lat && businessAddr.lon) {
      businessLat = businessAddr.lat;
      businessLon = businessAddr.lon;
    } else {
      const businessGeo = await geocodeAddress(businessAddr.street || businessAddr.address || '');
      if (!businessGeo) {
        return NextResponse.json({ success: true, inZone: true, message: 'Could not verify business location' });
      }
      businessLat = businessGeo.lat;
      businessLon = businessGeo.lon;
    }

    // Geocode customer address
    const customerGeo = await geocodeAddress(address);
    if (!customerGeo) {
      return NextResponse.json({
        success: true,
        inZone: false,
        message: 'Could not locate your address. Please check and try again.',
      });
    }

    const distance = haversineDistanceMiles(businessLat, businessLon, customerGeo.lat, customerGeo.lon);
    const inZone = distance <= radiusMiles;

    return NextResponse.json({
      success: true,
      inZone,
      distance: Math.round(distance * 10) / 10,
      radius: radiusMiles,
      message: inZone
        ? `You're ${Math.round(distance * 10) / 10} miles away — delivery available!`
        : `Sorry, you're ${Math.round(distance * 10) / 10} miles away. We deliver within ${radiusMiles} miles. Pickup is available!`,
    });
  } catch (err) {
    console.error('[Delivery Check] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
