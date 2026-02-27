'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCreditBadgeColor, CreditBalance } from '@/lib/credits';

interface CreditBadgeProps {
  onClick: () => void;
}

export function useCreditBalance() {
  const [balance, setBalance] = useState<CreditBalance | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      const res = await fetch('/api/credits/balance', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.success) setBalance(json.balance);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  return { balance, refetch: fetchBalance };
}

export default function CreditBadge({ onClick }: CreditBadgeProps) {
  const { balance } = useCreditBalance();

  if (!balance) return null;

  const badgeColor = getCreditBadgeColor(balance.total);
  const isLow = balance.total < 10;

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold transition-all hover:opacity-80 ${isLow ? 'animate-pulse' : ''}`}
      style={{ backgroundColor: `${badgeColor}15`, color: badgeColor, border: `1px solid ${badgeColor}30` }}
      title={`${balance.total} AI credits remaining (${balance.free_balance} free · ${balance.purchased_balance} purchased)`}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
      {balance.total}
    </button>
  );
}
