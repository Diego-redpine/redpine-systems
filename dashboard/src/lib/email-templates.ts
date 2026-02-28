// Email template helpers and templates for Red Pine

// Base email wrapper with Red Pine branding
function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Red Pine</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px 40px; border-bottom: 1px solid #e4e4e7;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 24px; font-weight: 700; color: #dc2626;">Red Pine</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; border-top: 1px solid #e4e4e7; background-color: #fafafa; border-radius: 0 0 8px 8px;">
              <p style="margin: 0; font-size: 13px; color: #71717a; text-align: center;">
                Red Pine Systems<br>
                <a href="https://redpine.systems" style="color: #dc2626; text-decoration: none;">redpine.systems</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Styled button component
function button(text: string, url: string): string {
  return `
<table role="presentation" cellspacing="0" cellpadding="0" style="margin: 24px 0;">
  <tr>
    <td style="background-color: #dc2626; border-radius: 6px;">
      <a href="${url}" style="display: inline-block; padding: 12px 24px; font-size: 14px; font-weight: 600; color: #ffffff; text-decoration: none;">
        ${text}
      </a>
    </td>
  </tr>
</table>
  `.trim();
}

// Welcome email - sent after signup
export function welcomeEmail(userName: string, loginUrl: string): string {
  const content = `
<h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
  Welcome to Red Pine!
</h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi ${userName},
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Thank you for signing up for Red Pine. Your account has been created and you're ready to start building your business dashboard.
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  With Red Pine, you can:
</p>
<ul style="margin: 0 0 16px; padding-left: 24px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  <li>Customize your dashboard with the tools you need</li>
  <li>Manage your business operations in one place</li>
  <li>Access your dashboard from anywhere</li>
</ul>
${button('Go to Dashboard', loginUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a;">
  If you have any questions, just reply to this email. We're here to help!
</p>
  `.trim();

  return emailWrapper(content);
}

// Payment confirmation email - sent after successful checkout
export function paymentConfirmEmail(userName: string, amount: string, dashboardUrl: string): string {
  const content = `
<h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
  Payment Confirmed
</h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi ${userName},
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Thank you for your payment of <strong>${amount}</strong>. Your Red Pine subscription is now active!
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  You now have full access to all Red Pine features including:
</p>
<ul style="margin: 0 0 16px; padding-left: 24px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  <li>Unlimited dashboard customization</li>
  <li>All business management tools</li>
  <li>Priority support</li>
</ul>
${button('Open Dashboard', dashboardUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a;">
  You can manage your subscription anytime from your account settings.
</p>
  `.trim();

  return emailWrapper(content);
}

// Payment failed email - sent when invoice payment fails
export function paymentFailedEmail(userName: string, updateUrl: string): string {
  const content = `
<h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #dc2626;">
  Payment Failed
</h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi ${userName},
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  We were unable to process your payment for your Red Pine subscription. This could be due to an expired card or insufficient funds.
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Please update your payment method to keep your subscription active and avoid any interruption to your service.
</p>
${button('Update Payment Method', updateUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a;">
  If you need assistance, please reply to this email.
</p>
  `.trim();

  return emailWrapper(content);
}

// Booking confirmation email - sent to customer after booking
export function bookingConfirmationEmail(
  customerName: string,
  businessName: string,
  date: string,
  time: string,
  refNumber: string,
): string {
  const content = `
<h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
  Booking Confirmed
</h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi ${customerName},
</p>
<p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Your appointment with <strong>${businessName}</strong> has been confirmed.
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px; background-color: #f4f4f5; border-radius: 8px;">
  <tr>
    <td style="padding: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #71717a;">Date</td>
          <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #18181b; text-align: right;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #71717a;">Time</td>
          <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #18181b; text-align: right;">${time}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #71717a;">Reference</td>
          <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #18181b; text-align: right;">${refNumber}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<p style="margin: 0; font-size: 14px; color: #71717a;">
  If you need to make changes, please contact ${businessName} directly.
</p>
  `.trim();

  return emailWrapper(content);
}

// Booking notification email - sent to business owner when new booking arrives
export function bookingNotificationEmail(
  customerName: string,
  customerEmail: string,
  businessName: string,
  date: string,
  time: string,
  refNumber: string,
): string {
  const content = `
<h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
  New Booking Received
</h1>
<p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  A new booking has been made for <strong>${businessName}</strong>.
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px; background-color: #f4f4f5; border-radius: 8px;">
  <tr>
    <td style="padding: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #71717a;">Customer</td>
          <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #18181b; text-align: right;">${customerName}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #71717a;">Email</td>
          <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #18181b; text-align: right;">${customerEmail}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #71717a;">Date</td>
          <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #18181b; text-align: right;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #71717a;">Time</td>
          <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #18181b; text-align: right;">${time}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #71717a;">Reference</td>
          <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #18181b; text-align: right;">${refNumber}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<p style="margin: 0; font-size: 14px; color: #71717a;">
  This booking has been added to your calendar automatically.
</p>
  `.trim();

  return emailWrapper(content);
}

// Team invite email - sent to invite a new team member
export function teamInviteEmail(
  memberName: string,
  businessName: string,
  ownerName: string,
  inviteUrl: string,
): string {
  const content = `
<h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
  You're Invited to Join ${businessName}
</h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi${memberName ? ' ' + memberName : ''},
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  ${ownerName ? ownerName + ' has' : 'You have been'} invited you to join <strong>${businessName}</strong> on Red Pine. Accept the invitation below to create your account and get started.
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  As a team member, you'll be able to:
</p>
<ul style="margin: 0 0 16px; padding-left: 24px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  <li>View and manage your assigned tasks</li>
  <li>Access the business dashboard</li>
  <li>Collaborate with the team</li>
</ul>
${button('Accept Invitation', inviteUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a;">
  This invitation link expires in 7 days. If you didn't expect this email, you can safely ignore it.
</p>
  `.trim();

  return emailWrapper(content);
}

// Waiver signing request email - sent to client to sign a waiver remotely
export function waiverSigningEmail(
  clientName: string,
  businessName: string,
  waiverName: string,
  signingUrl: string,
): string {
  const content = `
<h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
  Signature Required
</h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi ${clientName},
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  <strong>${businessName}</strong> has sent you a document to sign: <strong>${waiverName}</strong>
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Please review the document and provide your electronic signature using the link below.
</p>
${button('Review & Sign', signingUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a;">
  If you have questions about this document, please contact ${businessName} directly.
</p>
  `.trim();

  return emailWrapper(content);
}

// Review request email - sent to customer asking them to leave a review
export function reviewRequestEmail(
  customerName: string,
  businessName: string,
  reviewUrl: string,
): string {
  const content = `
<h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
  How Was Your Experience?
</h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi ${customerName},
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Thank you for choosing <strong>${businessName}</strong>! We'd love to hear about your experience.
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Your feedback helps us improve and helps others discover our business. It only takes a minute!
</p>
${button('Leave a Review', reviewUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a;">
  Thank you for your support. If you have any concerns, please reply to this email and we'll address them directly.
</p>
  `.trim();

  return emailWrapper(content);
}

// Account frozen email - sent when subscription is cancelled
export function accountFrozenEmail(userName: string, resubscribeUrl: string): string {
  const content = `
<h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
  Your Subscription Has Been Cancelled
</h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi ${userName},
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Your Red Pine subscription has been cancelled and your account is now in read-only mode. You can still view your dashboard, but you won't be able to make changes.
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Your data is safe and will be kept for 30 days. To restore full access, you can resubscribe at any time.
</p>
${button('Resubscribe Now', resubscribeUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a;">
  We'd love to have you back. If you have any feedback about why you cancelled, please reply to this email.
</p>
  `.trim();

  return emailWrapper(content);
}

// Trial ending reminder - sent 3 days before trial expires
export function trialEndingEmail(userName: string, daysLeft: number, dashboardUrl: string): string {
  const content = `
<h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
  Your Free Trial Ends in ${daysLeft} Days
</h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi ${userName},
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Just a heads up — your 14-day Red Pine trial ends in ${daysLeft} days. After that, your subscription at $29/mo will begin automatically.
</p>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  No action needed if you'd like to continue. If you want to cancel, you can do so from your dashboard settings at any time.
</p>
${button('Go to Dashboard', dashboardUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a;">
  Questions? Just reply to this email.
</p>
  `.trim();

  return emailWrapper(content);
}

// Portal welcome email — sent when a client account is silently created
export function portalWelcomeEmail(
  clientName: string,
  businessName: string,
  portalUrl: string,
): string {
  const content = `
<h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b;">
  You have a personal portal at ${businessName}
</h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi ${clientName}, your account has been set up automatically. From your portal you can:
</p>
<ul style="margin: 0 0 16px; padding-left: 24px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  <li>View your appointment &amp; order history</li>
  <li>Rebook or reorder in one tap</li>
  <li>Manage your loyalty rewards</li>
  <li>Message ${businessName} directly</li>
</ul>
${button('Open Your Portal', portalUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a;">
  No password needed — just click the button above.
</p>
  `.trim();

  return emailWrapper(content);
}

// Portal magic link email
export function portalMagicLinkEmail(
  clientName: string,
  businessName: string,
  magicLinkUrl: string,
): string {
  const content = `
<h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 700; color: #18181b;">
  Sign in to your portal
</h1>
<p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi ${clientName}, click the button below to access your ${businessName} client portal. This link expires in 1 hour.
</p>
${button('Sign In to Portal', magicLinkUrl)}
<p style="margin: 0; font-size: 14px; color: #71717a;">
  If you didn't request this link, you can safely ignore this email.
</p>
  `.trim();

  return emailWrapper(content);
}

// Payment receipt email — sent to clients after successful payment
export interface PaymentReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export function paymentReceiptEmail(params: {
  businessName: string;
  customerName: string;
  items: PaymentReceiptItem[];
  total: number;
  date: string;
  portalUrl?: string;
}): string {
  const { businessName, customerName, items, total, date, portalUrl } = params;

  // Build line items rows
  const itemRows = items.map(item => `
        <tr>
          <td style="padding: 8px 0; font-size: 14px; color: #3f3f46; border-bottom: 1px solid #f4f4f5;">
            ${item.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}
          </td>
          <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #18181b; text-align: right; border-bottom: 1px solid #f4f4f5;">
            $${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>
  `).join('');

  const portalSection = portalUrl ? `
${button('View in Portal', portalUrl)}
  ` : '';

  const content = `
<h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #18181b;">
  Payment Receipt
</h1>
<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Hi ${customerName},
</p>
<p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #3f3f46;">
  Thank you for your payment to <strong>${businessName}</strong>. Here is your receipt:
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 24px; background-color: #f4f4f5; border-radius: 8px;">
  <tr>
    <td style="padding: 20px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #71717a;">Date</td>
          <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #18181b; text-align: right;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 14px; color: #71717a;">Business</td>
          <td style="padding: 4px 0; font-size: 14px; font-weight: 600; color: #18181b; text-align: right;">${businessName}</td>
        </tr>
      </table>
    </td>
  </tr>
</table>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 0 0 8px;">
  <thead>
    <tr>
      <td style="padding: 8px 0; font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 2px solid #e4e4e7;">
        Item
      </td>
      <td style="padding: 8px 0; font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; text-align: right; border-bottom: 2px solid #e4e4e7;">
        Amount
      </td>
    </tr>
  </thead>
  <tbody>
    ${itemRows}
  </tbody>
  <tfoot>
    <tr>
      <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #18181b;">
        Total
      </td>
      <td style="padding: 12px 0 0; font-size: 16px; font-weight: 700; color: #18181b; text-align: right;">
        $${total.toFixed(2)}
      </td>
    </tr>
  </tfoot>
</table>
${portalSection}
<p style="margin: 16px 0 0; font-size: 14px; color: #71717a;">
  If you have any questions about this payment, please contact ${businessName} directly.
</p>
  `.trim();

  return emailWrapper(content);
}
