import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white overflow-y-auto fixed inset-0" style={{ fontFamily: "'Fira Code', monospace" }}>
      {/* Login button — top right like landing page */}
      <nav className="absolute top-0 left-0 right-0 flex justify-end items-center px-6 py-4">
        <Link
          href="/login"
          className="flex items-center gap-2 border-2 border-black px-4 py-2 bg-white text-black font-semibold text-sm hover:bg-black hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/>
          </svg>
          Log in
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-20 pb-12">
        {/* Centered logo + title */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="Red Pine" width={80} height={80} />
          </Link>
          <h1 className="text-2xl font-bold mb-1">Privacy Policy</h1>
          <p className="text-sm text-gray-500">Last updated: February 2026</p>
        </div>

        <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-black mb-3">1. Information We Collect</h2>
            <p><strong>Account Information:</strong> When you create an account, we collect your email address, business name, and payment information (processed securely through Stripe).</p>
            <p className="mt-2"><strong>Business Data:</strong> Data you enter into the platform (clients, appointments, invoices, etc.) is stored to provide the Service.</p>
            <p className="mt-2"><strong>Usage Data:</strong> We collect anonymized usage data to improve the Service, including pages visited, features used, and error logs.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">2. How We Use Your Information</h2>
            <ul className="list-none pl-0 space-y-1">
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> To provide and maintain the Service</li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> To process payments and manage subscriptions</li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> To send transactional emails (booking confirmations, password resets)</li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> To improve the Service based on usage patterns</li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> To respond to support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">3. Data Storage and Security</h2>
            <p>Your data is stored securely using Supabase (PostgreSQL) with Row Level Security (RLS) enabled on all tables. This ensures that your data is only accessible to you and authorized users of your account.</p>
            <p className="mt-2">We use HTTPS encryption for all data in transit and at rest. Payment information is processed by Stripe and never stored on our servers.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">4. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We share data only with:</p>
            <ul className="list-none pl-0 mt-2 space-y-1">
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> <span><strong>Stripe</strong> — for payment processing</span></li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> <span><strong>Supabase</strong> — for data storage (our database provider)</span></li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> <span><strong>Resend</strong> — for transactional email delivery</span></li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> <span><strong>Anthropic</strong> — for AI-powered features (business descriptions are processed to generate configurations; no business data is shared)</span></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">5. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use advertising or tracking cookies. No third-party tracking scripts are loaded on the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-none pl-0 mt-2 space-y-1">
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> <span><strong>Access</strong> your data at any time through the platform</span></li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> <span><strong>Export</strong> your data in standard formats</span></li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> <span><strong>Delete</strong> your account and all associated data</span></li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> <span><strong>Correct</strong> any inaccurate information</span></li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> <span><strong>Opt out</strong> of non-essential communications</span></li>
            </ul>
            <p className="mt-2">To exercise any of these rights, contact us at <a href="mailto:support@redpine.systems" className="text-[#ce0707] hover:underline font-semibold">support@redpine.systems</a> or use the Settings page in your dashboard.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">7. Data Retention</h2>
            <p>We retain your data for as long as your account is active. If you delete your account, we will delete all your data within 30 days, except where retention is required by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">8. Children&apos;s Privacy</h2>
            <p>The Service is not intended for use by anyone under the age of 16. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of material changes via email. The &quot;Last updated&quot; date at the top indicates when this policy was last revised.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">10. Contact</h2>
            <p>For privacy-related questions or concerns, contact us at <a href="mailto:support@redpine.systems" className="text-[#ce0707] hover:underline font-semibold">support@redpine.systems</a>.</p>
          </section>
        </div>

        {/* Footer with Terms link */}
        <div className="mt-16 text-center space-y-4">
          <Link href="/terms" className="text-[#ce0707] hover:underline font-semibold text-sm">
            Terms of Service
          </Link>
          <p className="text-sm text-gray-400">
            Powered by <span className="font-semibold text-[#ce0707]">Red Pine</span>
          </p>
        </div>
      </main>
    </div>
  );
}
