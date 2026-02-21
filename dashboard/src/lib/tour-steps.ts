import { getTourContent } from './tour-content';

export interface TourStep {
  id: string;
  type: 'spotlight' | 'card';
  targetId?: string;
  title: string;
  description: string;
  tabId?: string;
  tooltipPreferredSide?: 'top' | 'bottom' | 'left' | 'right';
  cardContent?: 'welcome' | 'import-data' | 'sync-calendar' | 'payments' | 'finish';
}

export function buildTourSteps(
  tabs: { id: string; label: string }[],
  businessType: string,
): TourStep[] {
  const content = getTourContent(businessType);
  const steps: TourStep[] = [];

  // 1. Welcome card
  steps.push({
    id: 'welcome',
    type: 'card',
    title: 'Welcome!',
    description: 'Your custom platform is ready. Let\'s take a quick tour of what\'s been built for you.',
    cardContent: 'welcome',
  });

  // 2. Spotlight the top bar
  steps.push({
    id: 'topbar',
    type: 'spotlight',
    targetId: 'topbar',
    title: 'Your Tabs',
    description: 'These are the tabs built for your business. Each one manages a different part of your operations.',
    tooltipPreferredSide: 'bottom',
  });

  // 3. Each config tab — spotlight the tab button, switch to it
  let firstTabWithContent = true;
  for (const tab of tabs) {
    const desc = content.tabDescriptions[tab.label] || `Manage your ${tab.label.toLowerCase()}`;
    steps.push({
      id: `tab-${tab.id}`,
      type: 'spotlight',
      targetId: `topbar-tab-${tab.id}`,
      tabId: tab.id,
      title: tab.label,
      description: desc,
      tooltipPreferredSide: 'bottom',
    });

    // After switching to the first tab, spotlight the content area
    if (firstTabWithContent) {
      firstTabWithContent = false;

      steps.push({
        id: 'content-area',
        type: 'spotlight',
        targetId: 'content-area',
        title: 'Content Area',
        description: 'This is where your data lives. Each tab shows its records in the best layout for that type of information.',
        tooltipPreferredSide: 'left',
      });

      // View toggle
      steps.push({
        id: 'view-toggle',
        type: 'spotlight',
        targetId: 'view-toggle',
        title: 'View Options',
        description: 'Switch between different layouts: Table, Pipeline, Calendar, Cards, or List. Pick whichever works best for you.',
        tooltipPreferredSide: 'bottom',
      });

      // Add button
      steps.push({
        id: 'add-record',
        type: 'spotlight',
        targetId: 'add-record-btn',
        title: 'Add Records',
        description: `Click this button to add new records. ${content.firstRecordPrompt}`,
        tooltipPreferredSide: 'bottom',
      });

      // Search bar
      steps.push({
        id: 'search-bar',
        type: 'spotlight',
        targetId: 'search-bar',
        title: 'Search & Filter',
        description: 'Search through your records by name, email, or any field. Use filters to narrow down what you see.',
        tooltipPreferredSide: 'bottom',
      });
    }
  }

  // 4. Import Data card
  steps.push({
    id: 'import-data',
    type: 'card',
    title: 'Import Your Data',
    description: 'Already have data somewhere? Connect a source to import it automatically, or use CSV upload on any table.',
    cardContent: 'import-data',
  });

  // 5. Sync Calendar card
  steps.push({
    id: 'sync-calendar',
    type: 'card',
    title: 'Sync Your Calendar',
    description: 'Using Outlook for scheduling? Connect it to sync your existing calendar events into your dashboard.',
    cardContent: 'sync-calendar',
  });

  // 6. Set Up Payments card
  steps.push({
    id: 'payments',
    type: 'card',
    title: 'Set Up Payments',
    description: 'Accept payments from your clients. Connect Stripe or Square to get started.',
    cardContent: 'payments',
  });

  // 7. ToolsStrip spotlight
  steps.push({
    id: 'tools-strip',
    type: 'spotlight',
    targetId: 'tools-strip',
    title: 'Your Toolkit',
    description: 'These tools let you customize and extend your platform. You can drag this bar up and down or to the other side of the screen.',
    tooltipPreferredSide: 'right',
  });

  // 8. Individual tool buttons
  const toolDescriptions: Record<string, { title: string; description: string }> = {
    chat: {
      title: 'Chat',
      description: 'Talk to your AI assistant to make changes, add tabs, or get help with anything.',
    },
    editor: {
      title: 'Editor',
      description: 'Customize your colors, rearrange tabs, and tweak your dashboard layout.',
    },
    website: {
      title: 'Website',
      description: 'View and edit your public-facing website that customers see.',
    },
    marketplace: {
      title: 'Marketplace',
      description: 'Add AI agents to automate tasks like responding to reviews and writing content.',
    },
    marketing: {
      title: 'Marketing',
      description: 'Tools to grow your business — email campaigns, social media, and more.',
    },
  };

  for (const [toolId, info] of Object.entries(toolDescriptions)) {
    steps.push({
      id: `tool-${toolId}`,
      type: 'spotlight',
      targetId: `tool-${toolId}`,
      title: info.title,
      description: info.description,
      tooltipPreferredSide: 'right',
    });
  }

  // 9. Finish card
  steps.push({
    id: 'finish',
    type: 'card',
    title: 'You\'re All Set!',
    description: 'Here\'s your quick checklist to get started:',
    cardContent: 'finish',
  });

  return steps;
}
