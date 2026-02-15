import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900 hover:opacity-80">Red Pine</Link>
          <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900">Terms of Service</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: February 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p><strong>Account Information:</strong> When you create an account, we collect your email address, business name, and payment information (processed securely through Stripe).</p>
            <p className="mt-2"><strong>Business Data:</strong> Data you enter into the platform (clients, appointments, invoices, etc.) is stored to provide the Service.</p>
            <p className="mt-2"><strong>Usage Data:</strong> We collect anonymized usage data to improve the Service, including pages visited, features used, and error logs.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>To provide and maintain the Service</li>
              <li>To process payments and manage subscriptions</li>
              <li>To send transactional emails (booking confirmations, password resets)</li>
              <li>To improve the Service based on usage patterns</li>
              <li>To respond to support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Storage and Security</h2>
            <p>Your data is stored securely using Supabase (PostgreSQL) with Row Level Security (RLS) enabled on all tables. This ensures that your data is only accessible to you and authorized users of your account.</p>
            <p className="mt-2">We use HTTPS encryption for all data in transit and at rest. Payment information is processed by Stripe and never stored on our servers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We share data only with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Stripe</strong> — for payment processing</li>
              <li><strong>Supabase</strong> — for data storage (our database provider)</li>
              <li><strong>Resend</strong> — for transactional email delivery</li>
              <li><strong>Anthropic</strong> — for AI-powered features (business descriptions are processed to generate configurations; no business data is shared)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. No third-party tracking scripts are loaded on the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Access</strong> your data at any time through the platform</li>
              <li><strong>Export</strong> your data in standard formats</li>
              <li><strong>Delete</strong> your account and all associated data</li>
              <li><strong>Correct</strong> any inaccurate information</li>
              <li><strong>Opt out</strong> of non-essential communications</li>
            </ul>
            <p className="mt-2">To exercise any of these rights, contact us at <a href="mailto:support@redpine.systems" className="underline">support@redpine.systems</a> or use the Settings page in your dashboard.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account, we will delete all your data within 30 days, except where retention is required by law.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Children&apos;s Privacy</h2>
            <p>The Service is not intended for use by anyone under the age of 16. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes via email. The &quot;Last updated&quot; date at the top indicates when this policy was last revised.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
            <p>For privacy-related questions or concerns, contact us at <a href="mailto:support@redpine.systems" className="underline">support@redpine.systems</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
