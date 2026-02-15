'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain as string;
  const orderId = searchParams.get('order');

  const [order, setOrder] = useState<{
    order_number: string;
    status: string;
    total_cents: number;
    estimated_ready_at?: string;
  } | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        // Fetch business name
        const configRes = await fetch('/api/subdomain', {
          headers: { 'x-subdomain': subdomain },
        });
        if (configRes.ok) {
          const configData = await configRes.json();
          if (configData.success) {
            setBusinessName(configData.data?.businessName || '');
          }
        }

        // For demo, just show a confirmation
        if (orderId) {
          setOrder({
            order_number: '#' + orderId.slice(-6),
            status: 'confirmed',
            total_cents: 0,
            estimated_ready_at: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
          });
        }
      } catch {
        // Fallback
      }
      setIsLoading(false);
    }
    fetchOrder();
  }, [subdomain, orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
        {businessName && (
          <p className="text-gray-500 mb-4">Thank you for ordering from {businessName}</p>
        )}
        {order && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order</span>
              <span className="font-medium">{order.order_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            {order.estimated_ready_at && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Estimated Ready</span>
                <span className="font-medium">
                  {new Date(order.estimated_ready_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
        )}
        <p className="text-sm text-gray-500 mb-6">
          You&apos;ll receive updates about your order via text or email.
        </p>
        <a
          href={`/order/${subdomain}`}
          className="inline-block px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          Order Again
        </a>
        <div className="text-xs text-gray-400 pt-6 mt-6 border-t border-gray-100">
          Powered by <span className="font-medium">Red Pine</span>
        </div>
      </div>
    </div>
  );
}
