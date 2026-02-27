'use client';

/**
 * Animation Picker Modal
 * Modal for selecting element animations with live previews
 */

import { useState, useEffect, useRef } from 'react';
import { X, Check, Play, Zap, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';
import { ELEMENT_ANIMATIONS, ANIMATION_SPEEDS, getAnimationById } from '@/hooks/useFreeFormEditor';
import type { AnimationPreset, AnimationConfig } from '@/hooks/useFreeFormEditor';

// ── Types ──────────────────────────────────────────────────────────────────

interface AnimationPreviewProps {
  animation: AnimationPreset;
  isSelected: boolean;
  onClick: () => void;
  theme: string;
  accentColor?: string;
}

interface SpeedSelectorProps {
  value: number;
  onChange: (value: number) => void;
  theme: string;
  accentColor?: string;
}

interface DelayInputProps {
  value: number;
  onChange: (value: number) => void;
  theme: string;
}

interface AnimationPreviewLiveProps {
  animationId: string;
  speed: number;
  delay: number;
  theme: string;
  accentColor?: string;
}

interface AnimationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAnimation?: AnimationConfig | null;
  onSelect: (animation: AnimationConfig | null) => void;
  onPreview?: (animation: AnimationConfig) => void;
  theme?: string;
  accentColor?: string;
}

// ── Animation Preview Box ──────────────────────────────────────────────────

/**
 * Animation Preview Box - Shows looping animation demo
 */
function AnimationPreview({ animation, isSelected, onClick, theme, accentColor = '#E11D48' }: AnimationPreviewProps) {
  const [key, setKey] = useState(0);
  const previewRef = useRef<HTMLDivElement>(null);

  // Restart animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setKey(k => k + 1);
    }, (animation.defaultDuration * 1000) + 1000); // Duration + pause

    return () => clearInterval(interval);
  }, [animation.defaultDuration]);

  // Generate inline keyframes style
  const keyframeStyle = `
    @keyframes preview-${animation.id} {
      ${animation.keyframes}
    }
  `;

  const animationStyle: React.CSSProperties = {
    animation: `preview-${animation.id} ${animation.defaultDuration}s ease-out ${animation.iterationCount === 'infinite' ? 'infinite' : '1'} both`,
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative p-3 border-2 transition-all duration-200 text-left
        ${isSelected
          ? ''
          : 'border-gray-200 hover:border-gray-300 bg-white'
        }
      `}
      style={isSelected ? { borderColor: '#1A1A1A', backgroundColor: '#F3F4F6' } : undefined}
    >
      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1A1A1A' }}>
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Animation preview area */}
      <div
        className="w-full h-16 mb-2 flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: '#f5f5f5' }}
      >
        <style>{keyframeStyle}</style>
        <div
          key={key}
          ref={previewRef}
          className="w-10 h-10"
          style={{ ...animationStyle, background: 'linear-gradient(135deg, #374151, #6B7280)' }}
        />
      </div>

      {/* Animation name and description */}
      <p className="text-sm font-medium font-['Fira_Code']" style={{ color: '#1A1A1A' }}>
        {animation.name}
      </p>
      <p className="text-xs font-['Fira_Code']" style={{ color: '#6B7280' }}>
        {animation.description}
      </p>
    </button>
  );
}

// ── Speed Selector ─────────────────────────────────────────────────────────

/**
 * Speed Selector
 */
function SpeedSelector({ value, onChange, theme, accentColor = '#E11D48' }: SpeedSelectorProps) {
  return (
    <div className="mb-4">
      <label
        className="block text-xs font-medium mb-2 font-['Fira_Code'] uppercase tracking-wider"
        style={{ color: '#6B7280' }}
      >
        Animation Speed
      </label>
      <div className="flex gap-2">
        {ANIMATION_SPEEDS.map((speed: { value: number; label: string }) => (
          <button
            key={speed.value}
            onClick={() => onChange(speed.value)}
            className={`flex-1 py-2 px-3 text-xs font-['Fira_Code'] transition-colors ${
              value === speed.value
                ? 'text-white'
                : 'bg-gray-100 text-gray-600 hover:text-gray-800 hover:bg-gray-200'
            }`}
            style={value === speed.value ? { backgroundColor: '#1A1A1A' } : undefined}
          >
            {speed.value}x
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Delay Input ────────────────────────────────────────────────────────────

/**
 * Delay Input
 */
function DelayInput({ value, onChange, theme }: DelayInputProps) {
  return (
    <div className="mb-4">
      <label
        className="block text-xs font-medium mb-2 font-['Fira_Code'] uppercase tracking-wider"
        style={{ color: '#6B7280' }}
      >
        Delay (seconds)
      </label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
        min={0}
        max={10}
        step={0.1}
        className="w-full px-3 py-2 text-sm font-['Fira_Code'] border"
        style={{
          backgroundColor: '#ffffff',
          borderColor: '#E5E7EB',
          color: '#1A1A1A',
        }}
      />
    </div>
  );
}

// ── Live Preview ───────────────────────────────────────────────────────────

/**
 * Live preview with configurable speed and delay
 */
function AnimationPreviewLive({ animationId, speed, delay, theme, accentColor = '#E11D48' }: AnimationPreviewLiveProps) {
  const [key, setKey] = useState(0);
  const animation = getAnimationById(animationId);

  if (!animation) return null;

  const duration = animation.defaultDuration / speed;

  // Restart animation
  const handleRestart = () => {
    setKey(k => k + 1);
  };

  // Auto restart for one-shot animations
  useEffect(() => {
    if (animation.iterationCount !== 'infinite') {
      const timeout = setTimeout(() => {
        setKey(k => k + 1);
      }, (duration + delay + 1) * 1000);
      return () => clearTimeout(timeout);
    }
  }, [key, duration, delay, animation.iterationCount]);

  const keyframeStyle = `
    @keyframes live-preview-${animationId} {
      ${animation.keyframes}
    }
  `;

  const animationStyle: React.CSSProperties = {
    animation: `live-preview-${animationId} ${duration}s ease-out ${animation.iterationCount === 'infinite' ? 'infinite' : '1'} both`,
    animationDelay: `${delay}s`,
  };

  return (
    <div className="relative">
      <style>{keyframeStyle}</style>
      <div
        key={key}
        className="w-14 h-14"
        style={{ ...animationStyle, background: 'linear-gradient(135deg, #374151, #6B7280)' }}
      />
      <button
        onClick={handleRestart}
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 p-1"
        style={{ color: '#6B7280' }}
        title="Replay"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

/**
 * Animation Picker Modal
 */
export default function AnimationPickerModal({
  isOpen,
  onClose,
  currentAnimation,
  onSelect,
  onPreview,
  theme = 'light',
  accentColor = '#E11D48',
}: AnimationPickerModalProps) {
  const [selectedAnimation, setSelectedAnimation] = useState<string | null>(currentAnimation?.type || null);
  const [speed, setSpeed] = useState(currentAnimation?.speed || 1);
  const [delay, setDelay] = useState(currentAnimation?.delay || 0);
  const [activeCategory, setActiveCategory] = useState('all');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAnimation(currentAnimation?.type || null);
      setSpeed(currentAnimation?.speed || 1);
      setDelay(currentAnimation?.delay || 0);
    }
  }, [isOpen, currentAnimation]);

  if (!isOpen) return null;

  // Group animations by category
  const categories = ['all', 'Entrance', 'Attention'];
  const filteredAnimations: AnimationPreset[] = activeCategory === 'all'
    ? ELEMENT_ANIMATIONS
    : ELEMENT_ANIMATIONS.filter((a: AnimationPreset) => a.category === activeCategory);

  const handleConfirm = () => {
    if (selectedAnimation) {
      onSelect({
        type: selectedAnimation,
        speed,
        delay,
      });
    }
    onClose();
  };

  const handlePreview = () => {
    if (selectedAnimation) {
      onPreview?.({
        type: selectedAnimation,
        speed,
        delay,
      });
    }
  };

  const handleRemove = () => {
    onSelect(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl max-h-[90vh] mx-4 shadow-2xl flex flex-col overflow-hidden"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #374151, #6B7280)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2
                className="text-lg font-semibold font-['Fira_Code']"
                style={{ color: '#1A1A1A' }}
              >
                Add Animation
              </h2>
              <p className="text-xs font-['Fira_Code']" style={{ color: '#6B7280' }}>
                Select an animation effect for this element
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 transition-colors hover:bg-gray-100"
            style={{ color: '#6B7280' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category tabs */}
        <div
          className="flex gap-2 px-6 py-3 border-b"
          style={{ borderColor: '#E5E7EB' }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 text-xs font-['Fira_Code'] font-medium capitalize transition-colors ${
                activeCategory === category
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:text-gray-800'
              }`}
              style={activeCategory === category ? { backgroundColor: '#1A1A1A' } : undefined}
            >
              {category === 'all' ? 'All Animations' : category}
            </button>
          ))}
        </div>

        {/* Animation grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-3">
            {filteredAnimations.map((animation: AnimationPreset) => (
              <AnimationPreview
                key={animation.id}
                animation={animation}
                isSelected={selectedAnimation === animation.id}
                onClick={() => setSelectedAnimation(animation.id)}
                theme={theme}
                accentColor={accentColor}
              />
            ))}
          </div>
        </div>

        {/* Settings panel (when animation selected) */}
        {selectedAnimation && (
          <div
            className="px-6 py-4 border-t"
            style={{ borderColor: '#E5E7EB', backgroundColor: '#f5f5f5' }}
          >
            <div className="flex items-start gap-6">
              {/* Selected animation info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4" style={{ color: '#1A1A1A' }} />
                  <span
                    className="text-sm font-medium font-['Fira_Code']"
                    style={{ color: '#1A1A1A' }}
                  >
                    {getAnimationById(selectedAnimation)?.name}
                  </span>
                </div>
                <SpeedSelector value={speed} onChange={setSpeed} theme={theme} accentColor={accentColor} />
                <DelayInput value={delay} onChange={setDelay} theme={theme} />
              </div>

              {/* Preview area */}
              <div
                className="w-32 h-32 flex items-center justify-center"
                style={{ backgroundColor: '#f5f5f5' }}
              >
                <AnimationPreviewLive
                  animationId={selectedAnimation}
                  speed={speed}
                  delay={delay}
                  theme={theme}
                  accentColor={accentColor}
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="flex gap-2">
            {currentAnimation && (
              <button
                onClick={handleRemove}
                className="px-4 py-2 text-sm font-['Fira_Code'] font-medium transition-colors bg-gray-100 text-red-600 hover:bg-gray-200"
              >
                Remove Animation
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePreview}
              disabled={!selectedAnimation}
              className="px-4 py-2 text-sm font-['Fira_Code'] font-medium transition-colors flex items-center gap-2 disabled:opacity-50 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <Play className="w-4 h-4" />
              Preview
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-['Fira_Code'] font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedAnimation}
              className="px-6 py-2 text-sm font-['Fira_Code'] font-medium text-white transition-colors disabled:opacity-50 flex items-center gap-2 hover:opacity-90"
              style={{ backgroundColor: '#1A1A1A' }}
            >
              Apply Animation
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
