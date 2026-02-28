// Send review request email to a customer

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseUser } from '@/lib/crud';
import { createServerClient } from '@supabase/ssr';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Get authenticated user
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { customerName, customerEmail } = body;

  if (!customerName || !customerEmail) {
    return NextResponse.json({ error: 'customerName and customerEmail are required' }, { status: 400 });
  }

  const admin = getSupabaseUser(request);

  // Get business config for subdomain + business name
  const { data: config } = await admin
    .from('configs')
    .select('subdomain, config')
    .eq('user_id', user.id)
    .single();

  if (!config?.subdomain) {
    return NextResponse.json({ error: 'Business subdomain not configured' }, { status: 400 });
  }

  const businessName = config.config?.business_name || 'Our Business';
  const reviewUrl = `https://${config.subdomain}.redpine.systems/review/${config.subdomain}`;

  try {
    const { sendEmail } = await import('@/lib/email');
    const { reviewRequestEmail } = await import('@/lib/email-templates');

    await sendEmail({
      to: customerEmail,
      subject: `${businessName} — We'd Love Your Feedback!`,
      html: reviewRequestEmail(customerName, businessName, reviewUrl),
    });

    return NextResponse.json({ success: true, message: 'Review request sent' });
  } catch (err) {
    console.error('Failed to send review request:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
