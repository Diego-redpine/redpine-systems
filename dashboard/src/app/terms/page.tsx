import Link from 'next/link';
import Image from 'next/image';

export default function TermsPage() {
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
          <h1 className="text-2xl font-bold mb-1">Terms of Service</h1>
          <p className="text-sm text-gray-500">Last updated: February 2026</p>
        </div>

        <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
          <section>
            <h2 className="text-lg font-bold text-black mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Red Pine (&quot;Service&quot;), operated by Red Pine Systems (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">2. Description of Service</h2>
            <p>Red Pine provides a platform for creating and managing business dashboards, including client management, scheduling, payments, and other business operations tools. The Service is provided &quot;as is&quot; and &quot;as available.&quot;</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">3. Account Registration</h2>
            <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">4. Subscription and Payment</h2>
            <p>Access to certain features requires a paid subscription at $29/month. Payments are processed through Stripe. Subscriptions renew automatically unless cancelled. You may cancel your subscription at any time through your account settings.</p>
            <p className="mt-2">Refunds are handled on a case-by-case basis. Contact support for refund requests within 14 days of payment.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-none pl-0 mt-2 space-y-1">
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> Use the Service for any unlawful purpose</li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> Attempt to gain unauthorized access to any part of the Service</li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> Interfere with or disrupt the Service</li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> Upload malicious code or content</li>
              <li className="flex items-start gap-2"><span className="text-[#ce0707] font-bold">—</span> Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">6. Your Data</h2>
            <p>You retain ownership of all data you upload to the Service. We do not sell your data to third parties. You may export or delete your data at any time. See our <Link href="/privacy" className="text-[#ce0707] hover:underline font-semibold">Privacy Policy</Link> for details on how we handle your information.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">7. Intellectual Property</h2>
            <p>The Service, including its design, code, and branding, is owned by Red Pine Systems. Your subscription grants you a license to use the platform for your business operations. It does not grant ownership of any part of the Service itself.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">8. Service Availability</h2>
            <p>We strive for high availability but do not guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect availability. We will provide reasonable notice for planned downtime when possible.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Red Pine Systems shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">10. Termination</h2>
            <p>We may terminate or suspend your account if you violate these Terms. You may terminate your account at any time. Upon termination, your right to use the Service ceases immediately. We will make your data available for export for 30 days after termination.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">11. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of material changes via email or through the Service. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">12. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:support@redpine.systems" className="text-[#ce0707] hover:underline font-semibold">support@redpine.systems</a>.</p>
          </section>
        </div>

        {/* Footer with Privacy link */}
        <div className="mt-16 text-center space-y-4">
          <Link href="/privacy" className="text-[#ce0707] hover:underline font-semibold text-sm">
            Privacy Policy
          </Link>
          <p className="text-sm text-gray-400">
            Powered by <span className="font-semibold text-[#ce0707]">Red Pine</span>
          </p>
        </div>
      </main>
    </div>
  );
}
