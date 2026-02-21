'use client';

import React, { useEffect } from 'react';
import { DashboardColors } from '@/types/config';
import { useSpotlightTour } from '@/hooks/useSpotlightTour';
import SpotlightOverlay from './SpotlightOverlay';

interface SpotlightTourProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  businessType: string;
  subdomain: string;
  tabs: { id: string; label: string }[];
  colors: DashboardColors;
  onTabChange: (tabId: string) => void;
}

export default function SpotlightTour({
  isOpen,
  onClose,
  businessName,
  businessType,
  subdomain,
  tabs,
  colors,
  onTabChange,
}: SpotlightTourProps) {
  const {
    isActive,
    currentStep,
    totalSteps,
    step,
    targetRect,
    start,
    finish,
    next,
    back,
  } = useSpotlightTour({
    tabs,
    businessType,
    onTabChange,
  });

  // Start tour when isOpen becomes true
  useEffect(() => {
    if (isOpen && !isActive) {
      start();
    }
  }, [isOpen, isActive, start]);

  // Handle finish — sync with parent
  const handleFinish = () => {
    finish();
    onClose();
  };

  if (!isOpen || !isActive || !step) {
    return null;
  }

  return (
    <SpotlightOverlay
      targetRect={targetRect}
      stepType={step.type}
      title={step.title}
      description={step.description}
      cardContent={step.cardContent}
      step={currentStep}
      totalSteps={totalSteps}
      onNext={currentStep >= totalSteps - 1 ? handleFinish : next}
      onBack={back}
      showBack={currentStep > 0}
      isLastStep={currentStep >= totalSteps - 1}
      colors={colors}
      businessName={businessName}
      subdomain={subdomain}
      businessType={businessType}
    />
  );
}
