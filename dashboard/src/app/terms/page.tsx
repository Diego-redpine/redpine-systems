import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-gray-900 hover:opacity-80">Red Pine</Link>
          <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-900">Privacy Policy</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: February 2026</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-[15px] leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Red Pine (&quot;Service&quot;), operated by Red Pine Systems (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>Red Pine provides a platform for creating and managing business dashboards, including client management, scheduling, payments, and other business operations tools. The Service is provided &quot;as is&quot; and &quot;as available.&quot;</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Account Registration</h2>
            <p>You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Subscription and Payment</h2>
            <p>Access to certain features requires a paid subscription at $29/month. Payments are processed through Stripe. Subscriptions renew automatically unless cancelled. You may cancel your subscription at any time through your account settings.</p>
            <p className="mt-2">Refunds are handled on a case-by-case basis. Contact support for refund requests within 14 days of payment.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the Service for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Upload malicious code or content</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Data</h2>
            <p>You retain ownership of all data you upload to the Service. We do not sell your data to third parties. You may export or delete your data at any time. See our <Link href="/privacy" className="underline">Privacy Policy</Link> for details on how we handle your information.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
            <p>The Service, including its design, code, and branding, is owned by Red Pine Systems. Your subscription grants you a license to use the platform for your business operations. It does not grant ownership of any part of the Service itself.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Service Availability</h2>
            <p>We strive for high availability but do not guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect availability. We will provide reasonable notice for planned downtime when possible.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Red Pine Systems shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Termination</h2>
            <p>We may terminate or suspend your account if you violate these Terms. You may terminate your account at any time. Upon termination, your right to use the Service ceases immediately. We will make your data available for export for 30 days after termination.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Changes to Terms</h2>
            <p>We may update these Terms from time to time. We will notify you of material changes via email or through the Service. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:support@redpine.systems" className="underline">support@redpine.systems</a>.</p>
          </section>
        </div>
      </main>
    </div>
  );
}
