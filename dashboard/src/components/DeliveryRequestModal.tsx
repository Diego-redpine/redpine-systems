'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';

interface DeliveryRequestModalProps {
  order: {
    order_number: string;
    customer_name: string;
    delivery_address?: { street?: string };
  };
  businessAddress?: string;
  colors: DashboardColors;
  onClose: () => void;
}

export default function DeliveryRequestModal({
  order,
  businessAddress,
  colors,
  onClose,
}: DeliveryRequestModalProps) {
  const [step, setStep] = useState(1);
  const buttonBg = colors.buttons || '#3B82F6';
  const textMain = colors.headings || '#1A1A1A';

  const steps = [
    {
      title: 'Open DoorDash Drive',
      description: 'Go to the DoorDash Drive portal to request a delivery driver.',
      action: (
        <a
          href="https://drive.doordash.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-colors hover:opacity-90"
          style={{ backgroundColor: buttonBg }}
          onClick={() => setStep(2)}
        >
          Open DoorDash Drive
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      ),
    },
    {
      title: 'Enter Pickup Address',
      description: 'Copy your restaurant address into the pickup field.',
      detail: businessAddress || 'Your business address (set in Settings)',
    },
    {
      title: 'Enter Delivery Address',
      description: 'Copy the customer delivery address.',
      detail: order.delivery_address?.street || 'Customer address not available',
    },
    {
      title: 'Request Driver',
      description: 'Review the delivery quote and confirm. Typical cost: $9.75 - $13.00. The customer already paid the delivery fee — you pay nothing extra.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold" style={{ color: textMain }}>Request Delivery Driver</h2>
              <p className="text-sm text-gray-500">Order {order.order_number} · {order.customer_name}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {steps.map((s, idx) => {
              const stepNum = idx + 1;
              const isActive = stepNum === step;
              const isCompleted = stepNum < step;

              return (
                <div
                  key={stepNum}
                  className={`rounded-xl p-4 border transition-colors cursor-pointer ${
                    isActive ? 'border-blue-300 bg-blue-50' : isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-100'
                  }`}
                  onClick={() => setStep(stepNum)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isCompleted ? 'bg-green-500 text-white' : isActive ? 'text-white' : 'bg-gray-200 text-gray-500'
                    }`} style={isActive ? { backgroundColor: buttonBg } : {}}>
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : stepNum}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold" style={{ color: textMain }}>{s.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>
                      {s.detail && isActive && (
                        <div className="mt-2 px-3 py-2 bg-white rounded-lg border border-gray-200 text-sm font-mono text-gray-700">
                          {s.detail}
                        </div>
                      )}
                      {s.action && isActive && (
                        <div className="mt-3">{s.action}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-800">
              <p className="font-medium mb-1">Cost Comparison</p>
              <p>DoorDash Drive: ~$9.75 flat fee per delivery</p>
              <p>vs. DoorDash Marketplace: 15-30% of order total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
