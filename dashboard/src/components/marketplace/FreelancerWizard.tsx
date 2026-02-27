'use client';

import { useState } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from '@/components/ui/Toaster';

interface FreelancerWizardProps {
  isOpen: boolean;
  onClose: () => void;
  colors: DashboardColors;
  onComplete: () => void;
}

const STEPS = ['Profile', 'Skills', 'First Gig', 'Review'];

const SKILL_OPTIONS = [
  'React', 'Node.js', 'Python', 'TypeScript', 'UI/UX Design', 'Logo Design',
  'Brand Identity', 'Figma', 'SEO', 'Google Ads', 'Social Media', 'Content Writing',
  'Copywriting', 'Video Editing', 'Photography', 'Illustration', 'Consulting',
  'Financial Planning', 'Project Management', 'Data Analysis', 'Automation', 'API Integration',
];

const CATEGORY_OPTIONS = [
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'writing', label: 'Writing' },
  { value: 'video', label: 'Video & Photo' },
  { value: 'business', label: 'Business' },
];

export default function FreelancerWizard({ isOpen, onClose, colors, onComplete }: FreelancerWizardProps) {
  const [step, setStep] = useState(0);

  // Step 1: Profile
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  // Step 2: Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [category, setCategory] = useState('');

  // Step 3: First Gig
  const [gigTitle, setGigTitle] = useState('');
  const [gigDescription, setGigDescription] = useState('');
  const [basicPrice, setBasicPrice] = useState('');
  const [standardPrice, setStandardPrice] = useState('');
  const [premiumPrice, setPremiumPrice] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('7');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : prev.length < 8 ? [...prev, skill] : prev
    );
  };

  const canAdvance = () => {
    if (step === 0) return displayName.trim().length >= 2 && bio.trim().length >= 10;
    if (step === 1) return selectedSkills.length >= 1 && category;
    if (step === 2) return gigTitle.trim().length >= 5 && basicPrice;
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate creation delay
    await new Promise(r => setTimeout(r, 1500));
    setIsSubmitting(false);
    toast.success('You are now a freelancer! Your first gig is live.');
    onComplete();
  };

  const stepTitle = ['Create Your Profile', 'Skills & Expertise', 'Create Your First Gig', 'Review & Go Live'][step];

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={step === 3 && isSubmitting ? () => {} : onClose}
      title={stepTitle}
      subtitle={step === 0 ? 'Tell clients about yourself' : undefined}
      maxWidth="max-w-md"
      configColors={colors}
    >
      {/* Progress */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div className="h-1 w-full transition-colors" style={{ backgroundColor: i <= step ? buttonColor : borderColor }} />
            <span className="text-[10px] font-medium" style={{ color: i <= step ? buttonColor : textMuted }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Step 0: Profile Info */}
      {step === 0 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="How clients will see you"
              autoFocus
              className="w-full px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
              style={{ borderColor, color: textMain }}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your experience, what you offer, and what makes you unique..."
              rows={4}
              className="w-full px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20 resize-none"
              style={{ borderColor, color: textMain }}
            />
            <p className="text-xs mt-1" style={{ color: textMuted }}>{bio.length}/500</p>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Austin, TX"
              className="w-full px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
              style={{ borderColor, color: textMain }}
            />
          </div>
          {/* Profile photo placeholder */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>Profile Photo</label>
            <div
              className="flex items-center gap-3 px-4 py-3 border-2 border-dashed cursor-pointer transition-colors hover:bg-black/[0.02]"
              style={{ borderColor }}
            >
              <div className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: textMain }}>Upload photo</p>
                <p className="text-xs" style={{ color: textMuted }}>Recommended: square, 400x400px</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Skills & Category */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>Primary Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORY_OPTIONS.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className="px-3 py-2 text-xs font-medium transition-colors text-center"
                  style={{
                    backgroundColor: category === cat.value ? `${buttonColor}10` : 'transparent',
                    color: category === cat.value ? buttonColor : textMain,
                    border: `1px solid ${category === cat.value ? buttonColor : borderColor}`,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>
              Skills ({selectedSkills.length}/8)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_OPTIONS.map(skill => {
                const selected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className="px-2.5 py-1 text-xs font-medium transition-colors"
                    style={{
                      backgroundColor: selected ? buttonColor : 'transparent',
                      color: selected ? buttonText : textMain,
                      border: `1px solid ${selected ? buttonColor : borderColor}`,
                    }}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
          {/* Portfolio upload placeholder */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>Portfolio Images (optional)</label>
            <div
              className="flex items-center justify-center px-4 py-6 border-2 border-dashed cursor-pointer transition-colors hover:bg-black/[0.02]"
              style={{ borderColor }}
            >
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V4.5a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15a1.5 1.5 0 001.5 1.5z" />
                </svg>
                <p className="text-xs font-medium" style={{ color: textMuted }}>Drag photos here or click to upload</p>
                <p className="text-[10px]" style={{ color: textMuted }}>Up to 6 images, 5MB each</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: First Gig */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>Gig Title</label>
            <input
              type="text"
              value={gigTitle}
              onChange={(e) => setGigTitle(e.target.value)}
              placeholder="I will..."
              autoFocus
              className="w-full px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
              style={{ borderColor, color: textMain }}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>Description</label>
            <textarea
              value={gigDescription}
              onChange={(e) => setGigDescription(e.target.value)}
              placeholder="Describe what you'll deliver, your process, and what clients can expect..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20 resize-none"
              style={{ borderColor, color: textMain }}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-2" style={{ color: textMuted }}>Pricing (3 Tiers)</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Basic', value: basicPrice, onChange: setBasicPrice },
                { label: 'Standard', value: standardPrice, onChange: setStandardPrice },
                { label: 'Premium', value: premiumPrice, onChange: setPremiumPrice },
              ].map(tier => (
                <div key={tier.label}>
                  <p className="text-[10px] font-semibold mb-1 uppercase" style={{ color: textMuted }}>{tier.label}</p>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: textMuted }}>$</span>
                    <input
                      type="number"
                      value={tier.value}
                      onChange={(e) => tier.onChange(e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-2 py-2 text-sm border focus:outline-none"
                      style={{ borderColor, color: textMain }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>Delivery Time (days)</label>
            <input
              type="number"
              value={deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border focus:outline-none"
              style={{ borderColor, color: textMain }}
            />
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="space-y-4">
          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-10 h-10 border-4 rounded-full animate-spin mb-4" style={{ borderColor, borderTopColor: buttonColor }} />
              <p className="text-sm font-medium" style={{ color: textMain }}>Setting up your profile...</p>
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="p-4" style={{ backgroundColor: `${buttonColor}06`, border: `1px solid ${borderColor}` }}>
                <p className="text-xs font-semibold uppercase mb-2" style={{ color: textMuted }}>Profile</p>
                <p className="text-sm font-bold" style={{ color: textMain }}>{displayName}</p>
                <p className="text-xs" style={{ color: textMuted }}>{location}</p>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: textMain }}>{bio}</p>
              </div>

              <div className="p-4" style={{ backgroundColor: `${buttonColor}06`, border: `1px solid ${borderColor}` }}>
                <p className="text-xs font-semibold uppercase mb-2" style={{ color: textMuted }}>Skills</p>
                <div className="flex flex-wrap gap-1">
                  {selectedSkills.map(s => (
                    <span key={s} className="px-2 py-0.5 text-xs " style={{ backgroundColor: `${buttonColor}15`, color: buttonColor }}>{s}</span>
                  ))}
                </div>
              </div>

              <div className="p-4" style={{ backgroundColor: `${buttonColor}06`, border: `1px solid ${borderColor}` }}>
                <p className="text-xs font-semibold uppercase mb-2" style={{ color: textMuted }}>First Gig</p>
                <p className="text-sm font-bold" style={{ color: textMain }}>{gigTitle || 'Untitled'}</p>
                <div className="flex items-center gap-3 mt-1">
                  {basicPrice && <span className="text-xs" style={{ color: textMuted }}>Basic: ${basicPrice}</span>}
                  {standardPrice && <span className="text-xs" style={{ color: textMuted }}>Standard: ${standardPrice}</span>}
                  {premiumPrice && <span className="text-xs" style={{ color: textMuted }}>Premium: ${premiumPrice}</span>}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      {!isSubmitting && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor }}>
          <button
            onClick={step === 0 ? onClose : handleBack}
            className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: textMuted }}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={step === 3 ? handleSubmit : handleNext}
            disabled={!canAdvance()}
            className="px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: buttonColor, color: buttonText }}
          >
            {step === 3 ? 'Go Live' : 'Continue'}
          </button>
        </div>
      )}
    </CenterModal>
  );
}
