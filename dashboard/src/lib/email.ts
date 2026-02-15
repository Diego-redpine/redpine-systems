import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// From address - use onboarding@resend.dev for testing
// Change to noreply@redpine.systems after DNS verification
const FROM_ADDRESS = process.env.NODE_ENV === 'production'
  ? 'Red Pine <noreply@redpine.systems>'
  : 'Red Pine <onboarding@resend.dev>';

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      throw new Error(error.message);
    }

    console.log(`Email sent to ${to}: ${subject}`);
    return data;
  } catch (err) {
    console.error('Failed to send email:', err);
    throw err;
  }
}
