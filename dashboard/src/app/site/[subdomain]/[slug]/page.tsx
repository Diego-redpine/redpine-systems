'use client';

import { useParams } from 'next/navigation';

export default function SiteSlugPage() {
  const params = useParams();
  const slug = params.slug as string;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">{slug}</h1>
        <p className="text-gray-500 text-sm">
          This page is being built with the new editor. Check back soon!
        </p>
      </div>
    </div>
  );
}
