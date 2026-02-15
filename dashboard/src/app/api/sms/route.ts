import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';
import { sendSMS, getOrderStatusMessage, isTwilioConfigured } from '@/lib/sms';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Get authenticated user
async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// POST /api/sms - Send order status SMS
export async function POST(request: NextRequest) {
  try {
    const { orderId, status, driverName } = await request.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status required' }, { status: 400 });
    }

    // Check if Twilio is configured
    if (!isTwilioConfigured()) {
      return NextResponse.json({
        success: false,
        message: 'SMS not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.',
        wouldSend: true,
      });
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    // Fetch order details
    const { data: order, error: orderError } = await supabase
      .from('online_orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (!order.customer_phone) {
      return NextResponse.json({ error: 'No phone number on order' }, { status: 400 });
    }

    // Fetch business name
    const { data: profile } = await supabase
      .from('profiles')
      .select('business_name')
      .eq('user_id', user.id)
      .single();

    const businessName = profile?.business_name || 'Your Restaurant';
    const message = getOrderStatusMessage(businessName, order.order_number, status, {
      estimatedMinutes: order.estimated_ready_at
        ? Math.round((new Date(order.estimated_ready_at).getTime() - Date.now()) / 60000)
        : 25,
      driverName,
    });

    const result = await sendSMS(order.customer_phone, message);

    // Update order status
    await supabase
      .from('online_orders')
      .update({ status })
      .eq('id', orderId);

    return NextResponse.json({ success: result.success, message });
  } catch (err) {
    console.error('[SMS API] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/sms/status - Check if SMS is configured
export async function GET() {
  return NextResponse.json({
    configured: isTwilioConfigured(),
    provider: 'twilio',
  });
}
