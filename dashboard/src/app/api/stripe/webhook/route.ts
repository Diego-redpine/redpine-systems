import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { sendEmail } from '@/lib/email';
import { paymentConfirmEmail, paymentFailedEmail, accountFrozenEmail, trialEndingEmail } from '@/lib/email-templates';

export const dynamic = 'force-dynamic';

// Get Supabase admin client (bypasses RLS)
function getSupabaseAdmin() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

// POST /api/stripe/webhook - Handle Stripe webhook events
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const appointmentId = paymentIntent.metadata?.appointment_id;
        if (!appointmentId) break;

        // Transition appointment from pending_deposit → scheduled
        await supabase
          .from('appointments')
          .update({
            status: 'scheduled',
            deposit_paid_at: new Date().toISOString(),
          })
          .eq('id', appointmentId)
          .eq('status', 'pending_deposit');

        console.log(`Deposit confirmed for appointment ${appointmentId}`);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Handle order payments
        const orderId = session.metadata?.order_id;
        if (orderId) {
          await supabase
            .from('online_orders')
            .update({
              payment_status: 'paid',
              status: 'confirmed',
            })
            .eq('id', orderId);
          console.log(`Order payment confirmed: ${orderId}`);
          break;
        }

        // Handle subscription activations
        const userId = session.metadata?.userId;

        if (userId && session.subscription) {
          // Check if subscription has a trial — set plan to 'trialing' or 'active'
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          const plan = sub.status === 'trialing' ? 'trialing' : 'active';

          // Update profile with subscription info
          await supabase
            .from('profiles')
            .update({
              plan,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          console.log(`Activated subscription for user ${userId}`);

          // Send payment confirmation email
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, business_name')
            .eq('id', userId)
            .single();

          if (profile?.email) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            try {
              await sendEmail({
                to: profile.email,
                subject: 'Payment Confirmed - Red Pine',
                html: paymentConfirmEmail(
                  profile.business_name || 'there',
                  '$29.00',
                  `${appUrl}/dashboard`
                ),
              });
            } catch (emailError) {
              console.error('Failed to send payment confirmation email:', emailError);
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          // Set plan to cancelled (account frozen)
          await supabase
            .from('profiles')
            .update({
              plan: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          console.log(`Cancelled subscription for user ${userId}`);

          // Send account frozen email
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, business_name')
            .eq('id', userId)
            .single();

          if (profile?.email) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            try {
              await sendEmail({
                to: profile.email,
                subject: 'Your Red Pine Subscription Has Been Cancelled',
                html: accountFrozenEmail(
                  profile.business_name || 'there',
                  `${appUrl}/dashboard`
                ),
              });
            } catch (emailError) {
              console.error('Failed to send account frozen email:', emailError);
            }
          }
        } else {
          // Try to find user by stripe_subscription_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single();

          if (profile) {
            await supabase
              .from('profiles')
              .update({
                plan: 'cancelled',
                updated_at: new Date().toISOString(),
              })
              .eq('id', profile.id);

            console.log(`Cancelled subscription for user ${profile.id}`);

            // Send account frozen email
            const { data: fullProfile } = await supabase
              .from('profiles')
              .select('email, business_name')
              .eq('id', profile.id)
              .single();

            if (fullProfile?.email) {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
              try {
                await sendEmail({
                  to: fullProfile.email,
                  subject: 'Your Red Pine Subscription Has Been Cancelled',
                  html: accountFrozenEmail(
                    fullProfile.business_name || 'there',
                    `${appUrl}/dashboard`
                  ),
                });
              } catch (emailError) {
                console.error('Failed to send account frozen email:', emailError);
              }
            }
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        // subscription can be string, Subscription object, or null
        const subscriptionId = typeof invoice.parent?.subscription_details?.subscription === 'string'
          ? invoice.parent.subscription_details.subscription
          : (invoice as any).subscription as string | null;

        if (subscriptionId) {
          // Find user by subscription ID
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, email')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (profile) {
            console.log(`Payment failed for user ${profile.id}`);

            // Send payment failed email
            const { data: fullProfile } = await supabase
              .from('profiles')
              .select('email, business_name')
              .eq('id', profile.id)
              .single();

            if (fullProfile?.email) {
              const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
              try {
                await sendEmail({
                  to: fullProfile.email,
                  subject: 'Payment Failed - Action Required',
                  html: paymentFailedEmail(
                    fullProfile.business_name || 'there',
                    `${appUrl}/api/stripe/portal`
                  ),
                });
              } catch (emailError) {
                console.error('Failed to send payment failed email:', emailError);
              }
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        // Handle subscription status changes
        if (subscription.status === 'active') {
          const targetId = userId || (await findUserBySubscription(supabase, subscription.id));
          if (targetId) {
            await supabase
              .from('profiles')
              .update({
                plan: 'active',
                updated_at: new Date().toISOString(),
              })
              .eq('id', targetId);
          }
        } else if (subscription.status === 'trialing') {
          const targetId = userId || (await findUserBySubscription(supabase, subscription.id));
          if (targetId) {
            await supabase
              .from('profiles')
              .update({
                plan: 'trialing',
                updated_at: new Date().toISOString(),
              })
              .eq('id', targetId);
          }
        } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
          const targetId = userId || (await findUserBySubscription(supabase, subscription.id));
          if (targetId) {
            await supabase
              .from('profiles')
              .update({
                plan: 'cancelled',
                updated_at: new Date().toISOString(),
              })
              .eq('id', targetId);
          }
        }
        break;
      }

      case 'customer.subscription.trial_will_end': {
        // Sent 3 days before trial expires
        const trialSub = event.data.object as Stripe.Subscription;
        const trialUserId = trialSub.metadata?.userId;
        const targetUserId = trialUserId || (await findUserBySubscription(supabase, trialSub.id));

        if (targetUserId) {
          const { data: trialProfile } = await supabase
            .from('profiles')
            .select('email, business_name')
            .eq('id', targetUserId)
            .single();

          if (trialProfile?.email) {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            try {
              await sendEmail({
                to: trialProfile.email,
                subject: 'Your Red Pine Trial Ends in 3 Days',
                html: trialEndingEmail(
                  trialProfile.business_name || 'there',
                  3,
                  `${appUrl}/dashboard`
                ),
              });
              console.log(`Sent trial ending email to user ${targetUserId}`);
            } catch (emailError) {
              console.error('Failed to send trial ending email:', emailError);
            }
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

// Helper to find user by subscription ID
async function findUserBySubscription(supabase: any, subscriptionId: string): Promise<string | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_subscription_id', subscriptionId)
    .single();

  return profile?.id || null;
}
