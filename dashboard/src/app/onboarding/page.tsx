'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingChat from '@/components/onboarding/OnboardingChat';
import SignUpModal from '@/components/onboarding/SignUpModal';
import BuildingAnimation from '@/components/onboarding/BuildingAnimation';

type Phase = 'CHAT' | 'SIGNUP' | 'BUILDING' | 'COMPLETE';

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('CHAT');
  const configPromiseRef = useRef<Promise<{ config: any; configId: string }> | null>(null);

  const handleChatReady = (configPromise: Promise<{ config: any; configId: string }>) => {
    configPromiseRef.current = configPromise;
    setPhase('SIGNUP');
  };

  const handleSignUpComplete = () => {
    setPhase('BUILDING');
  };

  const handleBuildingComplete = (configId: string) => {
    setPhase('COMPLETE');
    // Brand Board integration point — replace this redirect when Brand Board is wired up
    router.push(`/dashboard?config_id=${configId}`);
  };

  return (
    <div className="relative min-h-screen">
      {/* Chat layer — visible during CHAT and SIGNUP (dimmed behind modal) */}
      {(phase === 'CHAT' || phase === 'SIGNUP') && (
        <OnboardingChat
          onReady={handleChatReady}
          dimmed={phase === 'SIGNUP'}
        />
      )}

      {/* Sign-up modal — overlays the dimmed chat */}
      {phase === 'SIGNUP' && (
        <SignUpModal
          isOpen={true}
          onComplete={handleSignUpComplete}
        />
      )}

      {/* Building animation — replaces everything */}
      {phase === 'BUILDING' && configPromiseRef.current && (
        <BuildingAnimation
          configPromise={configPromiseRef.current}
          onComplete={handleBuildingComplete}
        />
      )}
    </div>
  );
}
