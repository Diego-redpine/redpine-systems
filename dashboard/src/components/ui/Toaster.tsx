'use client';

import { Toaster as SonnerToaster, toast } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          fontFamily: 'var(--font-fira-code)',
          fontSize: '13px',
        },
        classNames: {
          success: 'border-green-200 bg-green-50 text-green-800',
          error: 'border-red-200 bg-red-50 text-red-800',
          info: 'border-blue-200 bg-blue-50 text-blue-800',
          warning: 'border-yellow-200 bg-yellow-50 text-yellow-800',
        },
      }}
      richColors
      closeButton
    />
  );
}

export { toast };
