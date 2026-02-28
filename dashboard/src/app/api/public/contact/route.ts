// Public Contact Form API — creates client + chat conversation from website contact form
import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getClientId } from '@/lib/rate-limit';
import { getConfigBySubdomain } from '@/lib/subdomain';
import { getSupabaseAdmin } from '@/lib/crud';
import { findOrCreateClient } from '@/lib/silent-client';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const clientIp = getClientId(request);
  const limit = await rateLimit(`contact:${clientIp}`, 5, 60_000);
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { subdomain, name, email, phone, message } = body;

  if (!subdomain || !name || !email || !message) {
    return NextResponse.json(
      { error: 'Missing required fields: subdomain, name, email, message' },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  // Look up business
  const result = await getConfigBySubdomain(subdomain);
  if (!result) {
    return NextResponse.json({ error: 'Business not found' }, { status: 404 });
  }

  const userId = result.profile.id;
  const businessName = result.config.business_name || result.profile.business_name || 'Business';

  // Silent client creation
  const clientResult = await findOrCreateClient({
    userId,
    name,
    email,
    phone,
    source: 'contact',
    subdomain,
    visitorCookieId: body.visitorCookieId,
  });

  // Create a chat conversation with the contact message
  const supabase = getSupabaseAdmin();
  try {
    const { data: conversation } = await supabase
      .from('chat_conversations')
      .insert({
        user_id: userId,
        visitor_name: name,
        visitor_email: email,
        visitor_cookie_id: body.visitorCookieId || null,
        client_id: clientResult.clientId || null,
        source: 'contact',
        status: 'open',
      })
      .select('id')
      .single();

    if (conversation) {
      // Insert the contact message as the first message
      await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversation.id,
          sender_type: 'visitor',
          sender_name: name,
          content: message,
        });
    }
  } catch (err) {
    // Chat creation is non-critical — client was already created
    console.error('[contact] Failed to create conversation:', err);
  }

  return NextResponse.json({
    success: true,
    businessName,
    clientId: clientResult.clientId,
    portalToken: clientResult.portalToken,
    isNewClient: clientResult.isNew,
  });
}
