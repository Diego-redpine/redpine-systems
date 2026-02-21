import { useState, useCallback, useEffect, useRef } from 'react';
import { TourStep, buildTourSteps } from '@/lib/tour-steps';

interface UseSpotlightTourOptions {
  tabs: { id: string; label: string }[];
  businessType: string;
  onTabChange: (tabId: string) => void;
}

interface UseSpotlightTourReturn {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  step: TourStep | null;
  targetRect: DOMRect | null;
  start: () => void;
  finish: () => void;
  next: () => void;
  back: () => void;
}

function findElement(tourId: string): HTMLElement | null {
  return document.querySelector(`[data-tour-id="${tourId}"]`);
}

export function useSpotlightTour({
  tabs,
  businessType,
  onTabChange,
}: UseSpotlightTourOptions): UseSpotlightTourReturn {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [steps, setSteps] = useState<TourStep[]>([]);

  // Track the previous element so we can restore its z-index
  const prevElementRef = useRef<{
    el: HTMLElement;
    originalPosition: string;
    originalZIndex: string;
    originalRelative: string;
  } | null>(null);

  // Build steps when tabs/businessType change
  useEffect(() => {
    if (tabs.length > 0) {
      setSteps(buildTourSteps(tabs, businessType));
    }
  }, [tabs, businessType]);

  const restorePrevElement = useCallback(() => {
    if (prevElementRef.current) {
      const { el, originalPosition, originalZIndex } = prevElementRef.current;
      el.style.position = originalPosition;
      el.style.zIndex = originalZIndex;
      prevElementRef.current = null;
    }
  }, []);

  const boostElement = useCallback((el: HTMLElement) => {
    restorePrevElement();
    const originalPosition = el.style.position;
    const originalZIndex = el.style.zIndex;
    el.style.position = 'relative';
    el.style.zIndex = '101';
    prevElementRef.current = {
      el,
      originalPosition,
      originalZIndex,
      originalRelative: el.style.position,
    };
  }, [restorePrevElement]);

  const spotlightElement = useCallback((tourId: string) => {
    const el = findElement(tourId);
    if (el) {
      boostElement(el);
      setTargetRect(el.getBoundingClientRect());
      return true;
    }
    return false;
  }, [boostElement]);

  // Poll for element after tab switch
  const pollForElement = useCallback((tourId: string, maxWait = 2000) => {
    return new Promise<boolean>((resolve) => {
      const start = Date.now();
      const check = () => {
        if (spotlightElement(tourId)) {
          resolve(true);
          return;
        }
        if (Date.now() - start > maxWait) {
          // Element not found after max wait — skip spotlight, show card-like fallback
          setTargetRect(null);
          resolve(false);
          return;
        }
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });
  }, [spotlightElement]);

  const goToStep = useCallback(async (stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= steps.length) return;

    restorePrevElement();
    setCurrentStep(stepIndex);

    const step = steps[stepIndex];

    if (step.type === 'card') {
      setTargetRect(null);
      return;
    }

    // Spotlight step — may need to switch tabs first
    if (step.tabId) {
      onTabChange(step.tabId);
      // Wait a frame for React to re-render, then poll
      await new Promise(r => setTimeout(r, 100));
    }

    if (step.targetId) {
      await pollForElement(step.targetId);
    }
  }, [steps, onTabChange, pollForElement, restorePrevElement]);

  const start = useCallback(() => {
    if (steps.length === 0) return;
    setIsActive(true);
    setCurrentStep(0);
    // First step is always the welcome card
    setTargetRect(null);
  }, [steps]);

  const finish = useCallback(() => {
    restorePrevElement();
    setIsActive(false);
    setCurrentStep(0);
    setTargetRect(null);
    localStorage.setItem('redpine_tour_completed', 'true');
  }, [restorePrevElement]);

  const next = useCallback(() => {
    if (currentStep >= steps.length - 1) {
      finish();
      return;
    }
    goToStep(currentStep + 1);
  }, [currentStep, steps.length, finish, goToStep]);

  const back = useCallback(() => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  }, [currentStep, goToStep]);

  // Update targetRect on window resize/scroll
  useEffect(() => {
    if (!isActive) return;
    const step = steps[currentStep];
    if (!step || step.type === 'card' || !step.targetId) return;

    const handleUpdate = () => {
      const el = findElement(step.targetId!);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
      }
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [isActive, currentStep, steps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      restorePrevElement();
    };
  }, [restorePrevElement]);

  const step = steps[currentStep] || null;

  return {
    isActive,
    currentStep,
    totalSteps: steps.length,
    step,
    targetRect,
    start,
    finish,
    next,
    back,
  };
}
