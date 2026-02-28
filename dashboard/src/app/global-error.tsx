"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}>
          <h2>Something went wrong</h2>
          <p style={{ color: '#666', marginBottom: 20 }}>
            The error has been reported and we are looking into it.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '10px 24px',
              backgroundColor: '#1a1a1a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
