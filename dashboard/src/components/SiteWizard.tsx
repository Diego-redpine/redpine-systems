'use client';

import { useState } from 'react';
import CenterModal from '@/components/ui/CenterModal';
import { DashboardColors } from '@/types/config';
import { getContrastText } from '@/lib/view-colors';
import { toast } from '@/components/ui/Toaster';
import { getPortalPages } from '@/lib/portal-templates';

interface SiteWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: { id: string; name: string; project_type: string }) => void;
  colors: DashboardColors;
  businessName?: string;
  businessType?: string;
}

type ProjectType = 'website' | 'link_tree' | 'portal';

const STEPS = ['Type', 'Details', 'Creating'];

export default function SiteWizard({ isOpen, onClose, onProjectCreated, colors, businessName, businessType }: SiteWizardProps) {
  const [step, setStep] = useState(0);
  const [projectType, setProjectType] = useState<ProjectType | null>(null);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  const buttonColor = colors.buttons || '#1A1A1A';
  const buttonText = getContrastText(buttonColor);
  const textMain = colors.headings || '#1A1A1A';
  const textMuted = colors.icons || '#6B7280';
  const borderColor = colors.borders || '#E5E7EB';
  const cardBg = colors.cards || '#FFFFFF';

  const canAdvance = step === 0 ? !!projectType : step === 1 ? !!projectName.trim() : false;

  const handleNext = async () => {
    if (step === 0 && projectType) {
      setStep(1);
      if (!projectName) {
        const typeLabel = projectType === 'website' ? 'Website' : projectType === 'portal' ? 'Client Portal' : 'Link Tree';
        setProjectName(businessName ? `${businessName} ${typeLabel}` : '');
      }
    } else if (step === 1 && projectName.trim()) {
      setStep(2);
      await createProject();
    }
  };

  const handleBack = () => {
    if (step > 0 && step < 2) setStep(step - 1);
  };

  const createProject = async () => {
    setIsCreating(true);
    setProgressMsg('Creating project...');

    try {
      // Create the project
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName.trim(),
          description: description.trim() || null,
          project_type: projectType,
          metadata: { businessName, businessType },
        }),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to create project');
      }

      const { data: project } = await res.json();
      setProgressMsg('Setting up pages...');

      // Create default pages for this project
      let defaultPages: { title: string; slug: string; blocks?: unknown[] }[];

      if (projectType === 'portal') {
        // Use business-type-specific portal templates with pre-built widget blocks
        const accentColor = colors.buttons || '#1A1A1A';
        defaultPages = getPortalPages(businessType, accentColor);
      } else if (projectType === 'website') {
        defaultPages = [
          { title: 'Home', slug: 'home' },
          { title: 'About', slug: 'about' },
          { title: 'Services', slug: 'services' },
          { title: 'Contact', slug: 'contact' },
        ];
      } else {
        defaultPages = [
          { title: 'Links', slug: 'links' },
        ];
      }

      await Promise.all(
        defaultPages.map((p, i) =>
          fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...p,
              project_id: project.id,
              sort_order: i,
              blocks: p.blocks || undefined,
            }),
          })
        )
      );

      setProgressMsg('Done!');
      toast.success(`"${projectName.trim()}" created`);
      onProjectCreated(project);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
      // Go back to step 1 so user can retry
      setStep(1);
    } finally {
      setIsCreating(false);
    }
  };

  const stepTitle = step === 0 ? 'New Project' : step === 1 ? 'Project Details' : 'Creating Your Project';

  return (
    <CenterModal
      isOpen={isOpen}
      onClose={step === 2 ? () => {} : onClose}
      title={stepTitle}
      subtitle={step === 0 ? 'Choose a project type to get started' : step === 1 ? 'Tell us about your project' : undefined}
      maxWidth="max-w-md"
      configColors={colors}
    >
      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-6">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div
              className="h-1 transition-colors"
              style={{ backgroundColor: i <= step ? buttonColor : borderColor }}
            />
          </div>
        ))}
      </div>

      {/* Step 0: Choose type */}
      {step === 0 && (
        <div className="grid grid-cols-3 gap-3">
          <TypeCard
            title="Website"
            desc="Multi-page site with drag-and-drop editor"
            selected={projectType === 'website'}
            onClick={() => setProjectType('website')}
            textMain={textMain}
            textMuted={textMuted}
            borderColor={borderColor}
            buttonColor={buttonColor}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
              </svg>
            }
          />
          <TypeCard
            title="Client Portal"
            desc="Secure portal for clients to manage their account"
            selected={projectType === 'portal'}
            onClick={() => setProjectType('portal')}
            textMain={textMain}
            textMuted={textMuted}
            borderColor={borderColor}
            buttonColor={buttonColor}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            }
          />
          <TypeCard
            title="Link Tree"
            desc="Single-page link hub for profiles and links"
            selected={projectType === 'link_tree'}
            onClick={() => setProjectType('link_tree')}
            textMain={textMain}
            textMuted={textMuted}
            borderColor={borderColor}
            buttonColor={buttonColor}
            icon={
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.798" />
              </svg>
            }
          />
        </div>
      )}

      {/* Step 1: Project details */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder={`e.g. ${businessName || 'My Business'} Website`}
              autoFocus
              className="w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20"
              style={{ borderColor, color: textMain, outlineColor: buttonColor }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && projectName.trim()) handleNext();
              }}
            />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: textMuted }}>
              Description <span className="font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you want on your website in a sentence or paragraph..."
              rows={3}
              className="w-full px-3 py-2 text-sm border focus:outline-none focus:ring-2 focus:ring-opacity-20 resize-none"
              style={{ borderColor, color: textMain, outlineColor: buttonColor }}
            />
            <p className="text-xs mt-1" style={{ color: textMuted }}>
              This helps our AI design a starting point for you.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Creating */}
      {step === 2 && (
        <div className="flex flex-col items-center justify-center py-8">
          {isCreating ? (
            <>
              <div
                className="w-10 h-10 border-4 rounded-full animate-spin mb-4"
                style={{ borderColor: borderColor, borderTopColor: buttonColor }}
              />
              <p className="text-sm font-medium" style={{ color: textMain }}>{progressMsg}</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: buttonColor }}>
                <svg className="w-6 h-6" fill="none" stroke={buttonText} viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: textMain }}>Project created!</p>
            </>
          )}
        </div>
      )}

      {/* Footer buttons */}
      {step < 2 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t" style={{ borderColor }}>
          <button
            onClick={step === 0 ? onClose : handleBack}
            className="px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: textMuted }}
          >
            {step === 0 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={handleNext}
            disabled={!canAdvance}
            className="px-5 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ backgroundColor: buttonColor, color: buttonText }}
          >
            {step === 0 ? 'Continue' : 'Create Project'}
          </button>
        </div>
      )}
    </CenterModal>
  );
}

function TypeCard({ title, desc, icon, selected, onClick, textMain, textMuted, borderColor, buttonColor }: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  textMain: string;
  textMuted: string;
  borderColor: string;
  buttonColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center text-center p-5 border-2 transition-colors"
      style={{
        borderColor: selected ? buttonColor : borderColor,
        backgroundColor: selected ? `${buttonColor}08` : 'transparent',
      }}
    >
      <div
        className="mb-3"
        style={{ color: selected ? buttonColor : textMuted }}
      >
        {icon}
      </div>
      <p className="text-sm font-semibold mb-1" style={{ color: textMain }}>{title}</p>
      <p className="text-xs leading-relaxed" style={{ color: textMuted }}>{desc}</p>
    </button>
  );
}
