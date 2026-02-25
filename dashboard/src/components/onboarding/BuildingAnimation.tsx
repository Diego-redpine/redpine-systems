'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Brand from '@/components/Brand';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BuildingAnimationProps {
  configPromise: Promise<{ config: any; configId: string }>;
  onComplete: (configId: string) => void;
}

type StepStatus = 'pending' | 'active' | 'done' | 'error';

interface Step {
  label: string;
  status: StepStatus;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MIN_STEP_DURATION = 700; // ms — minimum time per step
const FINAL_DELAY = 500; // ms — pause after all steps before onComplete

const INITIAL_STEPS: Step[] = [
  { label: 'Setting up your dashboard', status: 'pending' },
  { label: 'Configuring your services', status: 'pending' },
  { label: 'Adding your booking system', status: 'pending' },
  { label: 'Finalizing', status: 'pending' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a promise that resolves after `ms` milliseconds. */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ensures at least `minMs` has elapsed since `startTime`.
 * Resolves immediately if enough time has already passed.
 */
async function ensureMinDuration(startTime: number, minMs: number): Promise<void> {
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, minMs - elapsed);
  if (remaining > 0) {
    await wait(remaining);
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function BuildingAnimation({
  configPromise,
  onComplete,
}: BuildingAnimationProps) {
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  // Derive progress from completed steps
  const completedCount = steps.filter((s) => s.status === 'done').length;
  const progress = (completedCount / steps.length) * 100;

  // -------------------------------------------------------------------------
  // Step state helpers
  // -------------------------------------------------------------------------
  const activateStep = useCallback((index: number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status: 'active' } : s)),
    );
  }, []);

  const completeStep = useCallback((index: number) => {
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, status: 'done' } : s)),
    );
  }, []);

  // -------------------------------------------------------------------------
  // Run the build sequence
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    let cancelled = false;

    const run = async () => {
      let configId = '';

      // ---- Step 0: "Setting up your dashboard" ----
      {
        const start = Date.now();
        if (cancelled) return;
        activateStep(0);

        try {
          const result = await configPromise;
          configId = result.configId;

          // Link config to authenticated user
          const linkRes = await fetch('/api/config/link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ configId }),
          });

          const linkData = await linkRes.json();

          if (!linkData.success) {
            throw new Error(linkData.error || 'Failed to link configuration');
          }
        } catch (err) {
          if (cancelled) return;
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to set up your dashboard. Please try again.',
          );
          return;
        }

        await ensureMinDuration(start, MIN_STEP_DURATION);
        if (cancelled) return;
        completeStep(0);
      }

      // ---- Step 1: "Configuring your services" (theatrical pause) ----
      {
        const start = Date.now();
        if (cancelled) return;
        activateStep(1);

        await ensureMinDuration(start, MIN_STEP_DURATION);
        if (cancelled) return;
        completeStep(1);
      }

      // ---- Step 2: "Adding your booking system" (Stripe subscription) ----
      {
        const start = Date.now();
        if (cancelled) return;
        activateStep(2);

        try {
          const subRes = await fetch('/api/stripe/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });

          const subData = await subRes.json();

          if (!subData.success) {
            // Non-fatal — log and continue
            console.warn(
              'Stripe subscription creation failed (non-fatal):',
              subData.error || 'Unknown error',
            );
          }
        } catch (err) {
          // Non-fatal — log and continue
          console.warn(
            'Stripe subscription creation failed (non-fatal):',
            err instanceof Error ? err.message : err,
          );
        }

        await ensureMinDuration(start, MIN_STEP_DURATION);
        if (cancelled) return;
        completeStep(2);
      }

      // ---- Step 3: "Finalizing" (brief pause) ----
      {
        const start = Date.now();
        if (cancelled) return;
        activateStep(3);

        await ensureMinDuration(start, MIN_STEP_DURATION);
        if (cancelled) return;
        completeStep(3);
      }

      // ---- Done — wait briefly then fire callback ----
      await wait(FINAL_DELAY);
      if (!cancelled) {
        onComplete(configId);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [configPromise, onComplete, activateStep, completeStep]);

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <div className="h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center w-full max-w-sm px-6">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Brand size="lg" linkToHome={false} />
        </div>

        {/* Heading */}
        <h1 className="text-xl font-bold text-gray-900 mb-8">
          Building your platform...
        </h1>

        {/* Progress bar */}
        <div className="w-72 h-2 bg-gray-200 rounded-full mx-auto mb-8">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps checklist */}
        <div className="space-y-3 text-left inline-block">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              {/* Icon */}
              {step.status === 'done' && (
                <svg
                  className="w-5 h-5 text-green-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
              {step.status === 'active' && (
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 bg-gray-900 rounded-full animate-pulse" />
                </div>
              )}
              {step.status === 'pending' && (
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 bg-gray-300 rounded-full" />
                </div>
              )}
              {step.status === 'error' && (
                <svg
                  className="w-5 h-5 text-red-500 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}

              {/* Label */}
              <span
                className={`text-sm ${
                  step.status === 'active'
                    ? 'text-gray-900 font-medium'
                    : step.status === 'done'
                      ? 'text-gray-400'
                      : step.status === 'error'
                        ? 'text-red-600'
                        : 'text-gray-300'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-left">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
