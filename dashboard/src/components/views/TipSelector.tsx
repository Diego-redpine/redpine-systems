'use client';

import { useState } from 'react';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';

interface TipSelectorProps {
  subtotalCents: number;
  onTipChange: (tipCents: number) => void;
  configColors: DashboardColors;
}

const PRESET_PERCENTAGES = [15, 18, 20] as const;

export default function TipSelector({
  subtotalCents,
  onTipChange,
  configColors,
}: TipSelectorProps) {
  const [selected, setSelected] = useState<number | 'custom' | 'none'>('none');
  const [customAmount, setCustomAmount] = useState('');
  const [tipCents, setTipCents] = useState(0);

  const buttonsBg = configColors.buttons || '#1A1A1A';
  const bordersColor = configColors.borders || '#E5E7EB';
  const textColor = configColors.text || '#1A1A1A';
  const bgColor = configColors.background || '#FFFFFF';

  const formatCents = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  const handlePresetSelect = (pct: number) => {
    setSelected(pct);
    setCustomAmount('');
    const tip = Math.round(subtotalCents * (pct / 100));
    setTipCents(tip);
    onTipChange(tip);
  };

  const handleCustomSelect = () => {
    setSelected('custom');
    const parsed = parseFloat(customAmount);
    const tip = isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100);
    setTipCents(tip);
    onTipChange(tip);
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    const parsed = parseFloat(value);
    const tip = isNaN(parsed) || parsed < 0 ? 0 : Math.round(parsed * 100);
    setTipCents(tip);
    onTipChange(tip);
  };

  const handleNoTip = () => {
    setSelected('none');
    setCustomAmount('');
    setTipCents(0);
    onTipChange(0);
  };

  const isPresetSelected = (pct: number) => selected === pct;
  const isCustomSelected = selected === 'custom';
  const isNoneSelected = selected === 'none';

  const selectedStyle = {
    backgroundColor: buttonsBg,
    color: getContrastText(buttonsBg),
    borderColor: buttonsBg,
  };

  const unselectedStyle = {
    backgroundColor: 'transparent',
    color: textColor,
    borderColor: bordersColor,
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {PRESET_PERCENTAGES.map((pct) => (
          <button
            key={pct}
            type="button"
            onClick={() => handlePresetSelect(pct)}
            className="px-4 py-2 text-sm font-medium border transition-colors"
            style={isPresetSelected(pct) ? selectedStyle : unselectedStyle}
          >
            {pct}%
          </button>
        ))}

        <button
          type="button"
          onClick={handleCustomSelect}
          className="px-4 py-2 text-sm font-medium border transition-colors"
          style={isCustomSelected ? selectedStyle : unselectedStyle}
        >
          Custom
        </button>

        <button
          type="button"
          onClick={handleNoTip}
          className="px-4 py-2 text-sm font-medium border transition-colors ml-2"
          style={isNoneSelected ? selectedStyle : unselectedStyle}
        >
          No tip
        </button>
      </div>

      {isCustomSelected && (
        <div className="flex items-center gap-2">
          <span style={{ color: textColor }} className="text-sm font-medium">$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={customAmount}
            onChange={(e) => handleCustomChange(e.target.value)}
            className="w-28 px-3 py-2 border text-sm outline-none"
            style={{
              backgroundColor: bgColor,
              borderColor: bordersColor,
              color: textColor,
            }}
          />
        </div>
      )}

      <p className="text-sm" style={{ color: textColor }}>
        Tip: {formatCents(tipCents)}
      </p>
    </div>
  );
}
