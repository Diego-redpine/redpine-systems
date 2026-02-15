// Twilio SMS wrapper
// Falls back gracefully if TWILIO env vars not configured

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export function isTwilioConfigured(): boolean {
  return !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);
}

export async function sendSMS(to: string, body: string): Promise<{ success: boolean; error?: string }> {
  if (!isTwilioConfigured()) {
    console.log(`[SMS] Twilio not configured. Would send to ${to}: ${body}`);
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: TWILIO_PHONE_NUMBER!,
        Body: body,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[SMS] Twilio error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error('[SMS] Send failed:', err);
    return { success: false, error: String(err) };
  }
}

// Order status message templates
export function getOrderStatusMessage(
  businessName: string,
  orderNumber: string,
  status: string,
  extras?: { estimatedMinutes?: number; driverName?: string }
): string {
  switch (status) {
    case 'confirmed':
      return `${businessName}: Order ${orderNumber} confirmed! Estimated ready in ${extras?.estimatedMinutes || 25} min.`;
    case 'preparing':
      return `${businessName}: Your order ${orderNumber} is being prepared!`;
    case 'ready':
      return `${businessName}: Your order ${orderNumber} is ready for pickup!`;
    case 'picked_up':
      return extras?.driverName
        ? `${businessName}: Your driver ${extras.driverName} is on the way with order ${orderNumber}!`
        : `${businessName}: Order ${orderNumber} is on its way!`;
    case 'delivered':
      return `${businessName}: Order ${orderNumber} delivered! Thanks for ordering. Reply 1-5 to rate your experience.`;
    case 'completed':
      return `${businessName}: Thanks for dining with us! Order ${orderNumber} complete.`;
    default:
      return `${businessName}: Order ${orderNumber} status updated to ${status}.`;
  }
}
