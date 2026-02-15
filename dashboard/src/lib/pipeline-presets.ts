// Pipeline Stage Presets by Industry - F1-B Task 9
// Default stage configurations for pipeline-view components

import { PipelineStage } from '@/types/config';

type StagePreset = Omit<PipelineStage, 'id' | 'order'>[];

interface IndustryPresets {
  leads?: StagePreset;
  jobs?: StagePreset;
  projects?: StagePreset;
  workflows?: StagePreset;
  [key: string]: StagePreset | undefined;
}

// Pipeline presets organized by industry
export const PIPELINE_PRESETS: Record<string, IndustryPresets> = {
  // Martial arts / BJJ / Karate studios
  martial_arts: {
    leads: [
      { name: 'Inquiry', color: '#3B82F6' },
      { name: 'Trial Class', color: '#F59E0B' },
      { name: 'Enrolled', color: '#10B981' },
      { name: 'Lost', color: '#EF4444' },
    ],
    jobs: [
      { name: 'White Belt', color: '#F5F5F5' },
      { name: 'Yellow Belt', color: '#FDE047' },
      { name: 'Orange Belt', color: '#FB923C' },
      { name: 'Green Belt', color: '#22C55E' },
      { name: 'Blue Belt', color: '#3B82F6' },
      { name: 'Purple Belt', color: '#A855F7' },
      { name: 'Brown Belt', color: '#A16207' },
      { name: 'Black Belt', color: '#1a1a1a' },
    ],
    projects: [
      { name: 'Planning', color: '#3B82F6' },
      { name: 'Active', color: '#F59E0B' },
      { name: 'Complete', color: '#10B981' },
    ],
  },

  // Fitness / Gym
  fitness: {
    leads: [
      { name: 'Prospect', color: '#3B82F6' },
      { name: 'Tour Scheduled', color: '#F59E0B' },
      { name: 'Trial', color: '#8B5CF6' },
      { name: 'Member', color: '#10B981' },
      { name: 'Lost', color: '#EF4444' },
    ],
    jobs: [
      { name: 'Scheduled', color: '#3B82F6' },
      { name: 'In Session', color: '#F59E0B' },
      { name: 'Complete', color: '#10B981' },
      { name: 'No Show', color: '#EF4444' },
    ],
  },

  // Barber / Salon
  barber: {
    leads: [
      { name: 'New Inquiry', color: '#3B82F6' },
      { name: 'Booked', color: '#F59E0B' },
      { name: 'Regular', color: '#10B981' },
      { name: 'Inactive', color: '#6B7280' },
    ],
    jobs: [
      { name: 'Waiting', color: '#3B82F6' },
      { name: 'In Chair', color: '#F59E0B' },
      { name: 'Complete', color: '#10B981' },
    ],
  },

  salon: {
    leads: [
      { name: 'Inquiry', color: '#3B82F6' },
      { name: 'Consultation', color: '#F59E0B' },
      { name: 'Booked', color: '#8B5CF6' },
      { name: 'Regular', color: '#10B981' },
      { name: 'Lost', color: '#EF4444' },
    ],
    jobs: [
      { name: 'Checked In', color: '#3B82F6' },
      { name: 'In Service', color: '#F59E0B' },
      { name: 'Checkout', color: '#8B5CF6' },
      { name: 'Complete', color: '#10B981' },
    ],
  },

  // Restaurant / Food Service
  restaurant: {
    leads: [
      { name: 'Inquiry', color: '#3B82F6' },
      { name: 'Reserved', color: '#F59E0B' },
      { name: 'Confirmed', color: '#10B981' },
      { name: 'Cancelled', color: '#EF4444' },
    ],
    jobs: [
      { name: 'Order Placed', color: '#3B82F6' },
      { name: 'Preparing', color: '#F59E0B' },
      { name: 'Ready', color: '#8B5CF6' },
      { name: 'Served', color: '#10B981' },
    ],
  },

  // Real Estate
  real_estate: {
    leads: [
      { name: 'New Lead', color: '#3B82F6' },
      { name: 'Contacted', color: '#F59E0B' },
      { name: 'Showing Scheduled', color: '#8B5CF6' },
      { name: 'Offer Made', color: '#F97316' },
      { name: 'Under Contract', color: '#EC4899' },
      { name: 'Closed', color: '#10B981' },
      { name: 'Lost', color: '#EF4444' },
    ],
    jobs: [
      { name: 'Listed', color: '#3B82F6' },
      { name: 'Showings', color: '#F59E0B' },
      { name: 'Offers', color: '#8B5CF6' },
      { name: 'Under Contract', color: '#F97316' },
      { name: 'Closing', color: '#EC4899' },
      { name: 'Sold', color: '#10B981' },
    ],
  },

  // Landscaping
  landscaping: {
    leads: [
      { name: 'Inquiry', color: '#3B82F6' },
      { name: 'Site Visit', color: '#F59E0B' },
      { name: 'Quote Sent', color: '#8B5CF6' },
      { name: 'Won', color: '#10B981' },
      { name: 'Lost', color: '#EF4444' },
    ],
    jobs: [
      { name: 'Estimate', color: '#3B82F6' },
      { name: 'Approved', color: '#F59E0B' },
      { name: 'Scheduled', color: '#8B5CF6' },
      { name: 'In Progress', color: '#F97316' },
      { name: 'Complete', color: '#10B981' },
      { name: 'Invoiced', color: '#6366F1' },
    ],
    projects: [
      { name: 'Design', color: '#3B82F6' },
      { name: 'Materials', color: '#F59E0B' },
      { name: 'Installation', color: '#8B5CF6' },
      { name: 'Finishing', color: '#F97316' },
      { name: 'Complete', color: '#10B981' },
    ],
  },

  // Contractor / Construction
  contractor: {
    leads: [
      { name: 'Inquiry', color: '#3B82F6' },
      { name: 'Site Visit', color: '#F59E0B' },
      { name: 'Bid Submitted', color: '#8B5CF6' },
      { name: 'Won', color: '#10B981' },
      { name: 'Lost', color: '#EF4444' },
    ],
    jobs: [
      { name: 'Bid', color: '#3B82F6' },
      { name: 'Approved', color: '#F59E0B' },
      { name: 'Permits', color: '#8B5CF6' },
      { name: 'In Progress', color: '#F97316' },
      { name: 'Inspection', color: '#EC4899' },
      { name: 'Complete', color: '#10B981' },
      { name: 'Invoiced', color: '#6366F1' },
    ],
    projects: [
      { name: 'Planning', color: '#3B82F6' },
      { name: 'Permits', color: '#F59E0B' },
      { name: 'Foundation', color: '#8B5CF6' },
      { name: 'Framing', color: '#F97316' },
      { name: 'Systems', color: '#EC4899' },
      { name: 'Finishing', color: '#14B8A6' },
      { name: 'Punch List', color: '#A855F7' },
      { name: 'Complete', color: '#10B981' },
    ],
  },

  // Auto Shop / Mechanic
  auto_shop: {
    leads: [
      { name: 'Inquiry', color: '#3B82F6' },
      { name: 'Quote Sent', color: '#F59E0B' },
      { name: 'Approved', color: '#10B981' },
      { name: 'Lost', color: '#EF4444' },
    ],
    jobs: [
      { name: 'Checked In', color: '#3B82F6' },
      { name: 'Diagnosis', color: '#F59E0B' },
      { name: 'Waiting Parts', color: '#8B5CF6' },
      { name: 'In Progress', color: '#F97316' },
      { name: 'Quality Check', color: '#EC4899' },
      { name: 'Ready', color: '#10B981' },
      { name: 'Picked Up', color: '#6366F1' },
    ],
  },

  // Medical / Healthcare
  medical: {
    leads: [
      { name: 'Inquiry', color: '#3B82F6' },
      { name: 'Consultation', color: '#F59E0B' },
      { name: 'Patient', color: '#10B981' },
      { name: 'Inactive', color: '#6B7280' },
    ],
    jobs: [
      { name: 'Scheduled', color: '#3B82F6' },
      { name: 'Checked In', color: '#F59E0B' },
      { name: 'In Room', color: '#8B5CF6' },
      { name: 'With Provider', color: '#F97316' },
      { name: 'Checkout', color: '#10B981' },
    ],
  },

  // Retail
  retail: {
    leads: [
      { name: 'Browsing', color: '#3B82F6' },
      { name: 'Interested', color: '#F59E0B' },
      { name: 'Purchased', color: '#10B981' },
      { name: 'Lost', color: '#EF4444' },
    ],
    jobs: [
      { name: 'Order Placed', color: '#3B82F6' },
      { name: 'Processing', color: '#F59E0B' },
      { name: 'Shipped', color: '#8B5CF6' },
      { name: 'Delivered', color: '#10B981' },
      { name: 'Returned', color: '#EF4444' },
    ],
  },

  // Generic fallback
  generic: {
    leads: [
      { name: 'New', color: '#3B82F6' },
      { name: 'Contacted', color: '#F59E0B' },
      { name: 'Qualified', color: '#8B5CF6' },
      { name: 'Proposal', color: '#F97316' },
      { name: 'Negotiation', color: '#EC4899' },
      { name: 'Won', color: '#10B981' },
      { name: 'Lost', color: '#EF4444' },
    ],
    jobs: [
      { name: 'Pending', color: '#3B82F6' },
      { name: 'In Progress', color: '#F59E0B' },
      { name: 'Review', color: '#8B5CF6' },
      { name: 'Complete', color: '#10B981' },
    ],
    projects: [
      { name: 'Planning', color: '#3B82F6' },
      { name: 'Active', color: '#F59E0B' },
      { name: 'On Hold', color: '#8B5CF6' },
      { name: 'Complete', color: '#10B981' },
    ],
    workflows: [
      { name: 'Queued', color: '#3B82F6' },
      { name: 'Running', color: '#F59E0B' },
      { name: 'Done', color: '#10B981' },
      { name: 'Failed', color: '#EF4444' },
    ],
  },
};

/**
 * Get pipeline stage preset for an industry and component
 * Falls back to generic presets if no industry-specific preset exists
 */
export function getStagePreset(
  industry: string,
  componentId: string
): PipelineStage[] {
  // Normalize industry name
  const normalizedIndustry = industry?.toLowerCase().replace(/[^a-z_]/g, '_') || 'generic';

  // Try to find industry-specific preset
  const industryPresets = PIPELINE_PRESETS[normalizedIndustry];
  const componentPreset = industryPresets?.[componentId];

  if (componentPreset) {
    return convertToFullStages(componentPreset);
  }

  // Fall back to generic preset for this component
  const genericPresets = PIPELINE_PRESETS.generic;
  const genericPreset = genericPresets?.[componentId];

  if (genericPreset) {
    return convertToFullStages(genericPreset);
  }

  // Ultimate fallback - generic leads/jobs stages
  if (componentId === 'leads') {
    return convertToFullStages(PIPELINE_PRESETS.generic.leads!);
  }

  // Default to generic jobs stages
  return convertToFullStages(PIPELINE_PRESETS.generic.jobs!);
}

/**
 * Convert preset stages to full PipelineStage objects with id and order
 */
function convertToFullStages(preset: StagePreset): PipelineStage[] {
  return preset.map((stage, index) => ({
    id: `stage_${index + 1}`,
    name: stage.name,
    color: stage.color,
    order: index,
    card_style: stage.card_style,
  }));
}

/**
 * Get all available industries
 */
export function getAvailableIndustries(): string[] {
  return Object.keys(PIPELINE_PRESETS).filter(k => k !== 'generic');
}

/**
 * Create a default pipeline config for a component
 */
export function createDefaultPipelineConfig(
  industry: string,
  componentId: string
): { stages: PipelineStage[]; default_stage_id: string } {
  const stages = getStagePreset(industry, componentId);
  return {
    stages,
    default_stage_id: stages[0]?.id || 'stage_1',
  };
}
