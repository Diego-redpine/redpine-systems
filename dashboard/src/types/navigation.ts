export interface NavItem {
  id: string;
  icon: string;
  label: string;
  defaultLabel: string;
  subItems: string[];
  locked?: boolean;
  lockedMessage?: string;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
  showDividerAbove?: boolean;
}

export type NavStyle = 'rounded' | 'half_rounded' | 'square';
export type NavDisplayMode = 'icon_only' | 'text_only' | 'icon_and_text';

export interface DashboardConfig {
  businessName: string;
  businessType: string;
  visibleTabs: string[];
  hiddenTabs: string[];
  labels: Record<string, string>;
  navStyle: NavStyle;
  navDisplayMode: NavDisplayMode;
}
