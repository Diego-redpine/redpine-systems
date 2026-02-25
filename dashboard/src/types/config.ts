// New component-based config types

// View types available for components (F1-A Task 2)
export type ViewType = 'table' | 'calendar' | 'cards' | 'pipeline' | 'list' | 'route';

// Pipeline stage configuration (F1-B Task 8)
export interface PipelineStage {
  id: string;           // unique within component, e.g. 'stage_1'
  name: string;         // display name, e.g. 'New', 'In Progress'
  color: string;        // hex color, e.g. '#3B82F6'
  color_secondary?: string; // optional second hex color for dual-color stage headers
  textColor?: string;   // optional override for header text color (e.g. '#FFFFFF' for loyalty tiers)
  order: number;        // display sequence (0, 1, 2, ...)
  card_style?: 'default' | 'rounded' | 'arrow' | 'minimal';
}

export interface PipelineConfig {
  stages: PipelineStage[];
  default_stage_id: string;  // which stage new items land in
}

export interface TabComponent {
  id: string;      // unique ID for sub-tab switching (e.g., "pipeline", "contacts")
  label: string;   // custom display label (can differ from default)
  view?: ViewType; // user's preferred view (defaults to registry default if absent)
  dataSource?: string;  // entity for data/fields lookup (defaults to id if absent)
  availableViews?: ViewType[]; // override view-registry available views
  pipeline?: PipelineConfig; // pipeline configuration if view is 'pipeline'
}

export interface DashboardTab {
  id: string;       // unique tab ID (e.g., "tab_1", "clients_tab", "workstuff")
  label: string;    // display name shown in sidebar
  icon: string;     // icon name for the tab
  components: TabComponent[];  // components inside this tab
}

export interface DashboardColors {
  // Core brand
  primary?: string;
  secondary?: string;
  accent?: string;

  // Sidebar
  sidebar_bg?: string;
  sidebar_text?: string;
  sidebar_icons?: string;
  sidebar_buttons?: string;
  sidebar_hover?: string;
  sidebar_active?: string;

  // Header
  header_bg?: string;
  header_text?: string;

  // Content area
  background?: string;
  content_bg?: string;
  content_text?: string;

  // Cards
  cards?: string;
  card_bg?: string;
  card_border?: string;

  // Buttons
  buttons?: string;
  button_bg?: string;
  button_text?: string;

  // Text
  text?: string;
  headings?: string;
  links?: string;

  // Other UI
  icons?: string;
  highlights?: string;
  borders?: string;

  // Allow additional custom keys
  [key: string]: string | undefined;
}

export interface DashboardConfig {
  id: string;
  businessName: string;
  businessType: string;
  tabs: DashboardTab[];
  platformTabs: string[];  // always ["site", "analytics", "settings"]
  colors?: DashboardColors;
  headingFont?: string;
  bodyFont?: string;
}

// Legacy config format (for migration)
export interface LegacyConfig {
  id: string;
  business_name: string;
  business_type: string;
  visible_tabs: string[];
  labels: Record<string, string>;
  sub_items: Record<string, string[]>;
  nav_style?: string;
}

// Type guard to check if config is legacy format
export function isLegacyConfig(config: any): config is LegacyConfig {
  return config && 'visible_tabs' in config && !('tabs' in config);
}

// Config version for undo/restore functionality (F6)
export interface ConfigVersion {
  id: string;
  config_id: string;
  version_number: number;
  tabs_snapshot: DashboardTab[];
  colors_snapshot: Record<string, string> | null;
  created_at: string;
}
