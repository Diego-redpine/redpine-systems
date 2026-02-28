// Portal Login — sends magic link to client email
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientId } from '@/lib/rate-limit';
import { getConfigBySubdomain } from '@/lib/subdomain';
import { createServerClient } from '@supabase/ssr';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: NextRequest) {
  const clientIp = getClientId(request);
  const limit = await rateLimit(`portal-login:${clientIp}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
  }

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { subdomain, email } = body;
  if (!subdomain || !email) {
    return NextResponse.json({ error: 'Email and subdomain are required' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  // Look up business
  const result = await getConfigBySubdomain(subdomain);
  if (!result) {
    // Don't reveal whether business exists — always show success
    return NextResponse.json({ success: true });
  }

  const userId = result.profile.id;
  const businessName = result.config.business_name || result.profile.business_name || 'Business';
  const supabase = getSupabaseAdmin();

  // Find client(s) by email or parent_email for this business
  // This supports multi-student portals (parent with multiple kids)
  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, email, parent_email')
    .eq('user_id', userId)
    .or(`email.eq.${email.toLowerCase()},parent_email.eq.${email.toLowerCase()}`);

  if (!clients || clients.length === 0) {
    // Don't reveal whether client exists
    return NextResponse.json({ success: true });
  }

  // Use first client as primary for session
  const client = clients[0];

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Clean up old sessions for this client
  await supabase
    .from('portal_sessions')
    .delete()
    .eq('client_id', client.id)
    .lt('expires_at', new Date().toISOString());

  // Create session — include all matched students for multi-student support
  const { error: sessionError } = await supabase
    .from('portal_sessions')
    .insert({
      client_id: client.id,
      user_id: userId,
      token,
      email: email.toLowerCase(),
      expires_at: expiresAt.toISOString(),
      metadata: { students: clients.map(c => ({ id: c.id, name: c.name, email: c.email })) },
    });

  if (sessionError) {
    console.error('Failed to create portal session:', sessionError);
    return NextResponse.json({ error: 'Failed to send login link' }, { status: 500 });
  }

  // Build magic link URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const magicLinkUrl = `${baseUrl}/portal/${subdomain}?token=${token}`;

  // Send email
  try {
    const { sendEmail } = await import('@/lib/email');
    const { portalMagicLinkEmail } = await import('@/lib/email-templates');

    await sendEmail({
      to: email,
      subject: `Sign in to ${businessName} Portal`,
      html: portalMagicLinkEmail(client.name, businessName, magicLinkUrl),
    });
  } catch (err) {
    console.error('Failed to send portal email:', err);
  }

  return NextResponse.json({ success: true });
}
