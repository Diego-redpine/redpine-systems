// Inbound SMS Webhook — receives incoming SMS from Twilio
// POST: Twilio sends From, Body, To as form-encoded data
// Looks up business by phone number, creates/updates conversation + message
// Returns TwiML response

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/crud';

export const dynamic = 'force-dynamic';

// POST /api/public/sms/inbound — Twilio webhook for incoming SMS
export async function POST(request: NextRequest) {
  try {
    // Twilio sends application/x-www-form-urlencoded
    const formData = await request.formData();
    const from = formData.get('From') as string | null;
    const body = formData.get('Body') as string | null;
    const to = formData.get('To') as string | null;

    if (!from || !body || !to) {
      console.warn('[SMS Inbound] Missing required fields:', { from, body: !!body, to });
      return twimlResponse();
    }

    console.log(`[SMS Inbound] From: ${from}, To: ${to}, Body: ${body.substring(0, 100)}`);

    const supabase = getSupabaseAdmin();

    // Look up business by Twilio phone number stored in configs.integrations
    // We need to find a config where integrations->'twilio'->>'phone_number' matches the To number
    const { data: configs } = await supabase
      .from('configs')
      .select('id, user_id, business_name, integrations')
      .not('integrations', 'is', null);

    if (!configs || configs.length === 0) {
      console.warn('[SMS Inbound] No configs with integrations found');
      return twimlResponse();
    }

    // Find the config whose Twilio phone number matches the inbound To
    const cleanTo = to.replace(/\s/g, '');
    const matchingConfig = configs.find((c) => {
      const integrations = c.integrations as Record<string, unknown> | null;
      if (!integrations?.twilio) return false;
      const twilio = integrations.twilio as Record<string, unknown>;
      return twilio.phone_number === cleanTo;
    });

    if (!matchingConfig) {
      console.warn(`[SMS Inbound] No business found for phone number: ${cleanTo}`);
      return twimlResponse();
    }

    const businessOwnerId = matchingConfig.user_id;

    // Clean the from number
    const cleanFrom = from.replace(/\s/g, '');

    // Try to find an existing client by phone number
    const { data: client } = await supabase
      .from('clients')
      .select('id, name')
      .eq('user_id', businessOwnerId)
      .or(`phone.eq.${cleanFrom},phone.eq.${from}`)
      .limit(1)
      .single();

    const visitorName = client?.name || formatPhoneForDisplay(cleanFrom);

    // Find or create conversation for this phone number
    let conversation;

    // Look for existing active SMS conversation from this number
    const { data: existingConv } = await supabase
      .from('chat_conversations')
      .select('id')
      .eq('user_id', businessOwnerId)
      .eq('channel', 'sms')
      .eq('status', 'active')
      .eq('visitor_name', cleanFrom) // Store raw phone in visitor_name for lookup
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (existingConv) {
      conversation = existingConv;
    } else {
      // Create a new conversation
      const { data: newConv, error: convError } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: businessOwnerId,
          visitor_name: cleanFrom,
          visitor_email: null,
          visitor_page: null,
          channel: 'sms',
          status: 'active',
          source: 'sms',
          client_id: client?.id || null,
          metadata: {
            phone_number: cleanFrom,
            display_name: visitorName,
            twilio_to: cleanTo,
          },
          started_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (convError) {
        console.error('[SMS Inbound] Failed to create conversation:', convError);
        return twimlResponse();
      }

      conversation = newConv;
    }

    // Create message in chat_messages
    const { error: msgError } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversation!.id,
        content: body.trim(),
        sender_type: 'visitor',
        sender_name: visitorName,
        is_read: false,
        metadata: {
          channel: 'sms',
          from_number: cleanFrom,
          to_number: cleanTo,
        },
      });

    if (msgError) {
      console.error('[SMS Inbound] Failed to create message:', msgError);
      return twimlResponse();
    }

    // Update conversation timestamp
    await supabase
      .from('chat_conversations')
      .update({
        updated_at: new Date().toISOString(),
        metadata: {
          phone_number: cleanFrom,
          display_name: visitorName,
          twilio_to: cleanTo,
          last_message_preview: body.substring(0, 100),
        },
      })
      .eq('id', conversation!.id);

    console.log(`[SMS Inbound] Message saved to conversation ${conversation!.id}`);

    return twimlResponse();
  } catch (error) {
    console.error('[SMS Inbound] Error:', error);
    // Always return valid TwiML even on error so Twilio doesn't retry endlessly
    return twimlResponse();
  }
}

// Return empty TwiML response (Twilio expects XML)
function twimlResponse() {
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    }
  );
}

// Format phone number for display: +15551234567 -> (555) 123-4567
function formatPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    const area = digits.substring(1, 4);
    const prefix = digits.substring(4, 7);
    const line = digits.substring(7, 11);
    return `(${area}) ${prefix}-${line}`;
  }
  return phone;
}
