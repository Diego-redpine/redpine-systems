'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  buttonColor?: string; // platform primary color for hover/selected highlight
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = '',
  style,
  buttonColor,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Build full options list (placeholder as first item if provided)
  const allOptions: SelectOption[] = placeholder
    ? [{ value: '', label: placeholder }, ...options]
    : options;

  const selectedOption = allOptions.find(o => o.value === value);
  const displayText = selectedOption?.label || placeholder || 'Select...';
  const isPlaceholderShown = !options.find(o => o.value === value);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    if (!isOpen) {
      const idx = allOptions.findIndex(o => o.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
    setIsOpen(prev => !prev);
  }, [disabled, isOpen, allOptions, value]);

  const handleSelect = useCallback((optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => (i + 1) % allOptions.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => (i - 1 + allOptions.length) % allOptions.length);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < allOptions.length) {
          handleSelect(allOptions[highlightedIndex].value);
        }
        break;
      case 'Home':
        e.preventDefault();
        setHighlightedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setHighlightedIndex(allOptions.length - 1);
        break;
    }
  }, [isOpen, handleToggle, handleSelect, highlightedIndex, allOptions]);

  // Highlight colors from platform button color
  const accentColor = buttonColor || '#3B82F6';
  const hoverBg = `${accentColor}22`; // ~13% opacity for hover
  const selectedBg = `${accentColor}30`; // ~19% opacity for selected

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-lg border text-sm text-left flex items-center justify-between gap-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        style={style}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`truncate ${isPlaceholderShown ? 'opacity-50' : ''}`}>
          {displayText}
        </span>
        <svg
          className={`w-3.5 h-3.5 flex-shrink-0 opacity-50 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={listRef}
          role="listbox"
          className="absolute z-[60] top-full left-0 w-full mt-1 rounded-lg border shadow-lg overflow-y-auto"
          style={{
            backgroundColor: style?.backgroundColor || '#FFFFFF',
            borderColor: style?.borderColor || '#E5E7EB',
            maxHeight: 200,
          }}
        >
          {allOptions.map((opt, i) => {
            const isSelected = opt.value === value;
            const isHighlighted = i === highlightedIndex;
            return (
              <div
                key={opt.value + i}
                ref={el => { optionRefs.current[i] = el; }}
                role="option"
                aria-selected={isSelected}
                className="px-3 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors duration-75"
                style={{
                  backgroundColor: isSelected
                    ? selectedBg
                    : isHighlighted
                      ? hoverBg
                      : 'transparent',
                  color: isSelected ? accentColor : (style?.color || '#1A1A1A'),
                  fontWeight: isSelected ? 600 : 400,
                }}
                onClick={() => handleSelect(opt.value)}
                onMouseEnter={() => setHighlightedIndex(i)}
              >
                <span className={`truncate ${opt.value === '' && placeholder ? 'opacity-60' : ''}`}>
                  {opt.label}
                </span>
                {isSelected && (
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={accentColor} viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
