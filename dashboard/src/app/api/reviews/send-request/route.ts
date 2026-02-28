// Review Request — sends a review request email to a client

import { NextRequest, NextResponse } from 'next/server';
import { getBusinessContext, getSupabaseUser } from '@/lib/crud';
import { sendEmail } from '@/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

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
    const { client_id, trigger_type, channel } = body;

    if (!client_id || !trigger_type) {
      return NextResponse.json(
        { success: false, error: 'client_id and trigger_type are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseUser(request);

    // Fetch client details
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, name, email, phone')
      .eq('id', client_id)
      .eq('user_id', context.businessOwnerId)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    // Fetch business config for subdomain + name
    const { data: config } = await supabase
      .from('configs')
      .select('subdomain, config')
      .eq('user_id', context.businessOwnerId)
      .single();

    const subdomain = config?.subdomain || '';
    const businessName = config?.config?.business_name || 'Our Business';

    // Generate tracking token
    const trackingToken = crypto.randomUUID();

    // Create the review request record
    const { data: requestRecord, error: insertError } = await supabase
      .from('review_requests')
      .insert({
        user_id: context.businessOwnerId,
        client_id,
        trigger_type,
        channel: channel || 'email',
        sent_at: new Date().toISOString(),
        drip_step: 1,
        tracking_token: trackingToken,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create review request:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create review request' },
        { status: 500 }
      );
    }

    // Generate review link
    const reviewUrl = subdomain
      ? `https://${subdomain}.redpine.systems/portal/reviews?token=${trackingToken}`
      : `https://redpine.systems/review?token=${trackingToken}`;

    // Send email if client has email
    if (client.email && (channel === 'email' || channel === 'sms_email')) {
      try {
        await sendEmail({
          to: client.email,
          subject: `How was your experience with ${businessName}?`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
              <h2 style="font-size: 20px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px;">
                Hi ${client.name},
              </h2>
              <p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
                Thank you for choosing ${businessName}! We would love to hear about your experience. Your feedback helps us improve and helps others discover us.
              </p>
              <a href="${reviewUrl}" style="display: inline-block; padding: 14px 28px; background-color: #1A1A1A; color: #FFFFFF; text-decoration: none; border-radius: 12px; font-size: 15px; font-weight: 600;">
                Leave a Review
              </a>
              <p style="font-size: 13px; color: #9CA3AF; margin-top: 24px; line-height: 1.5;">
                It only takes a minute. Thank you for your time!
              </p>
              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
              <p style="font-size: 12px; color: #9CA3AF;">
                Sent by ${businessName} via Red Pine
              </p>
            </div>
          `,
        });
      } catch (emailErr) {
        console.warn('Email send failed (non-critical):', emailErr);
      }
    }

    // SMS placeholder — would integrate with Twilio or similar
    if (channel === 'sms' || channel === 'sms_email') {
      console.log(
        `[SMS placeholder] Would send review request to ${client.phone}: ${reviewUrl}`
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        request_id: requestRecord.id,
        tracking_token: trackingToken,
        review_url: reviewUrl,
      },
    });
  } catch (error) {
    console.error('POST /api/reviews/send-request error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
