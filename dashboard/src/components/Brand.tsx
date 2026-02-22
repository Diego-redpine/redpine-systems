'use client';

import Link from 'next/link';
import Image from 'next/image';

interface BrandProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean; // kept for backwards compat, no longer used
  linkToHome?: boolean;
}

export default function Brand({
  size = 'md',
  linkToHome = true,
}: BrandProps) {
  const logoSize = size === 'lg' ? 64 : size === 'md' ? 40 : 32;

  const content = (
    <div className="flex items-center justify-center">
      <Image
        src="/logo.png"
        alt="Red Pine"
        width={logoSize}
        height={logoSize}
        priority
      />
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
    <Link href="/" className={`flex items-center hover:opacity-80 transition-opacity ${className}`}>
      <Image
        src="/logo.png"
        alt="Red Pine"
        width={32}
        height={32}
      />
    </Link>
  );
}
