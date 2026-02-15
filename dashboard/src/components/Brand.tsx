'use client';

import Link from 'next/link';

interface BrandProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  linkToHome?: boolean;
}

export default function Brand({
  size = 'md',
  showTagline = false,
  linkToHome = true,
}: BrandProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className="flex items-center gap-2">
      {/* Pine tree icon */}
      <div className={`${size === 'lg' ? 'w-8 h-8' : size === 'md' ? 'w-6 h-6' : 'w-5 h-5'} flex items-center justify-center`}>
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-full h-full text-primary"
        >
          <path d="M12 2L4 12h3l-2 4h3l-2 4h12l-2-4h3l-2-4h3L12 2zm0 3.5L16.5 11h-2l1.5 3h-2l1.5 3h-7l1.5-3h-2l1.5-3h-2L12 5.5z" />
        </svg>
      </div>
      <div>
        <span className={`font-bold text-primary ${sizeClasses[size]}`}>
          Red Pine
        </span>
        {showTagline && (
          <p className="text-xs text-muted -mt-0.5">Business OS</p>
        )}
      </div>
    </div>
  );

  if (linkToHome) {
    return (
      <Link href="/" className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

// Minimal version for headers
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-6 h-6 text-primary"
      >
        <path d="M12 2L4 12h3l-2 4h3l-2 4h12l-2-4h3l-2-4h3L12 2zm0 3.5L16.5 11h-2l1.5 3h-2l1.5 3h-7l1.5-3h-2l1.5-3h-2L12 5.5z" />
      </svg>
      <span className="font-bold text-primary text-xl">Red Pine</span>
    </Link>
  );
}
