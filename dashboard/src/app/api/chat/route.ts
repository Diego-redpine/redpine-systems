import { NextRequest, NextResponse } from 'next/server';
import { componentRegistry, availableIcons } from '@/lib/component-registry';
import { VIEW_REGISTRY } from '@/lib/view-registry';
import { rateLimit, getClientId } from '@/lib/rate-limit';

// Force dynamic rendering to avoid build-time evaluation
export const dynamic = 'force-dynamic';

// NOTE: This route returns AI changes to the frontend, which then saves via PUT /api/config.
// Config versioning is handled in the PUT endpoint (see api/config/route.ts task F6-6).
// Every chat edit is automatically versioned and can be undone via /api/config/versions/undo.

/**
 * COLOR SYSTEM DOCUMENTATION (CC Task 11)
 *
 * The dashboard supports 10 color targets stored in configs.colors (JSONB):
 *
 * SIDEBAR:
 * - sidebar_bg: Sidebar background color
 * - sidebar_text: Sidebar text/label color
 * - sidebar_icons: Sidebar icon color
 * - sidebar_buttons: Sidebar hover/active highlight color
 *
 * CONTENT AREA:
 * - background: Main content area background
 * - text: Primary text color
 * - headings: Heading text color
 * - cards: Card/panel background color
 * - borders: Border color for cards and dividers
 *
 * INTERACTIVE:
 * - buttons: Button background color (content area buttons)
 *
 * The AI can modify any of these via natural language commands.
 * Examples: "make sidebar dark", "blue buttons", "dark mode", "light background"
 */

/**
 * VIEW SYSTEM DOCUMENTATION (F1-A)
 *
 * Each component can have multiple views. The 5 view types are:
 * - table: Spreadsheet/grid view with columns and rows
 * - calendar: Time-based grid showing events/appointments
 * - cards: Visual grid of cards with images/avatars
 * - pipeline: Kanban-style columns (stages) for workflow management
 * - list: Simple vertical list of items
 *
 * Components have a 'view' field that stores the user's preferred view.
 * Components with view='pipeline' MUST also have a 'pipeline' object with stages.
 */

// Pipeline stage interface for components with pipeline view
interface PipelineStage {
  id: string;
  name: string;
  color: string;
  order: number;
  card_style?: 'default' | 'rounded' | 'arrow' | 'minimal';
}

interface PipelineConfig {
  stages: PipelineStage[];
  default_stage_id: string;
}

// Component and tab types matching the new architecture
interface TabComponent {
  id: string;
  label: string;
  view?: string;
  pipeline?: PipelineConfig;
}

interface DashboardTab {
  id: string;
  label: string;
  icon: string;
  components: TabComponent[];
}

interface DashboardColors {
  // Sidebar
  sidebar_bg?: string;
  sidebar_text?: string;
  sidebar_icons?: string;
  sidebar_buttons?: string;
  // Content
  background?: string;
  text?: string;
  headings?: string;
  cards?: string;
  borders?: string;
  // Interactive
  buttons?: string;
  [key: string]: string | undefined;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  message?: string;
  messages?: ChatMessage[];
  config?: {
    tabs?: DashboardTab[];
    colors?: DashboardColors;
  };
  history?: ChatMessage[];
  context?: 'platform' | 'website_edit';
  pageSlug?: string;
  pageTitle?: string;
  pageContext?: {
    sections?: Array<{ id: string; type: string; index: number; properties: Record<string, unknown> }>;
    elements?: Array<{ id: string; type: string; sectionId?: string; properties: Record<string, unknown> }>;
  };
}

interface ChatResponse {
  action: 'update' | 'none';
  changes: {
    tabs?: DashboardTab[];
    colors?: DashboardColors;
  };
  response: string;
}

// Format component registry for AI prompt
function formatComponentsForPrompt(): string {
  const categories = ['people', 'things', 'time', 'money', 'tasks', 'comms', 'files'] as const;
  const sections: string[] = [];

  for (const category of categories) {
    const components = componentRegistry.filter(c => c.category === category);
    const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
    const items = components.map(c => `  - ${c.id}: ${c.defaultLabel} - ${c.description}`).join('\n');
    sections.push(`**${categoryName}:**\n${items}`);
  }

  return sections.join('\n\n');
}

// Format view registry for AI prompt (F1-A Task 5)
function formatViewRegistryForPrompt(): string {
  const lines: string[] = [];
  for (const [componentId, config] of Object.entries(VIEW_REGISTRY)) {
    lines.push(`  - ${componentId}: default='${config.defaultView}', available=[${config.availableViews.map(v => `'${v}'`).join(', ')}]`);
  }
  return lines.join('\n');
}


export async function POST(request: NextRequest) {
  // Rate limit: 20 requests per minute per IP
  const clientId = getClientId(request);
  const rateLimitResult = rateLimit(`chat:${clientId}`, 20);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(rateLimitResult.reset / 1000)) } }
    );
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set in environment variables');
      return NextResponse.json(
        {
          success: false,
          error: 'API key not configured',
          data: {
            action: 'none',
            changes: {},
            response: "Chat is not configured yet. Missing API key."
          }
        },
        { status: 500 }
      );
    }

    // Validate request body size (reject payloads > 100KB)
    const rawBody = await request.text();
    if (rawBody.length > 100_000) {
      return NextResponse.json(
        { success: false, error: 'Request too large', data: { action: 'none', changes: {}, response: 'Message too long.' } },
        { status: 413 }
      );
    }

    const body: ChatRequest = JSON.parse(rawBody);
    const { context, pageSlug, pageTitle } = body;

    // Support both SiteEditor format (messages array) and ChatPanel format (message string + history)
    const isWebsiteEdit = context === 'website_edit';
    let userMessage = body.message || (body.messages && body.messages.length > 0 ? body.messages[body.messages.length - 1].content : '');
    // Truncate individual message to 5000 chars
    if (userMessage && userMessage.length > 5000) {
      userMessage = userMessage.slice(0, 5000);
    }

    // Truncate history to last 20 messages to prevent token abuse
    const rawHistory = body.history || (body.messages ? body.messages.slice(0, -1) : []);
    const chatHistory = rawHistory.slice(-20);

    const config = body.config || { tabs: [], colors: {} };

    // Sanitize config data before injecting into prompt — only keep known safe fields
    const currentTabs = Array.isArray(config.tabs) ? config.tabs.map((tab: any) => ({
      id: String(tab.id || '').slice(0, 50),
      label: String(tab.label || '').slice(0, 100),
      icon: String(tab.icon || '').slice(0, 30),
      components: Array.isArray(tab.components) ? tab.components.map((c: any) => ({
        id: String(c.id || '').slice(0, 50),
        label: String(c.label || '').slice(0, 100),
        view: c.view ? String(c.view).slice(0, 20) : undefined,
        pipeline: c.pipeline,
      })) : [],
    })) : [];
    const currentColors = (config.colors && typeof config.colors === 'object')
      ? Object.fromEntries(
          Object.entries(config.colors)
            .filter(([k, v]) => typeof k === 'string' && typeof v === 'string' && k.length < 30 && (v as string).length < 20)
        )
      : {};

    if (!userMessage) {
      return NextResponse.json({
        success: false,
        error: 'No message provided',
        data: { action: 'none', changes: {}, response: 'Please type a message.' }
      }, { status: 400 });
    }

    // Website editing mode — tool_use enabled for direct page manipulation
    if (isWebsiteEdit) {
      // Build page context from request body
      const pageContext = body.pageContext as {
        sections?: Array<{ id: string; type: string; index: number; properties: Record<string, unknown> }>;
        elements?: Array<{ id: string; type: string; sectionId?: string; x?: number; y?: number; width?: number; height?: number; properties: Record<string, unknown> }>;
      } | undefined;

      let pageContentStr = 'No page content available.';
      if (pageContext?.sections) {
        const lines: string[] = [];
        for (const section of pageContext.sections) {
          lines.push(`Section ${section.index} [id=${section.id}] (${section.type})${section.properties?.backgroundColor ? ` bg:${section.properties.backgroundColor}` : ''}:`);
          const sectionElements = (pageContext.elements || []).filter(el => el.sectionId === section.id);
          if (sectionElements.length === 0) {
            lines.push('  (empty)');
          }
          for (const el of sectionElements) {
            const p = el.properties || {};
            const content = typeof p.content === 'string' ? p.content.slice(0, 100) : '';
            const details: string[] = [];
            if (p.color) details.push(`color:${p.color}`);
            if (p.fontSize) details.push(`fontSize:${p.fontSize}`);
            if (p.backgroundColor) details.push(`bg:${p.backgroundColor}`);
            if (p.fontFamily) details.push(`font:${p.fontFamily}`);
            if (p.textAlign) details.push(`align:${p.textAlign}`);
            if (p.src) details.push(`src:${(p.src as string).slice(0, 60)}`);
            const posStr = el.x != null ? ` @(${el.x},${el.y} ${el.width}x${el.height})` : '';
            lines.push(`  [id=${el.id}] ${el.type}: "${content}"${posStr}${details.length ? ` (${details.join(', ')})` : ''}`);
          }
        }
        pageContentStr = lines.join('\n');
      }

      const websiteSystemPrompt = `You are an AI website editor. You can directly edit the user's website using tools.

Current page: "${pageTitle || 'Untitled'}" (/${pageSlug || ''})

CURRENT PAGE CONTENT:
${pageContentStr}

RULES:
- When the user asks to add, change, or remove something — USE TOOLS. Do not describe steps. Do not give instructions. Just do it.
- You can call multiple tools in one response (e.g., add heading + text + button for a hero section).
- Keep your text response to 1-2 sentences confirming what you did.
- If the request is ambiguous (e.g., "make it bigger" with multiple elements), ask which element they mean.
- If the user asks a question or wants advice (not an edit), respond with text only — no tools.
- Never use emojis.
- When adding elements, use real content that fits the business — never use placeholder text like "New Heading" or "Click Me".
- For headings, keep them 3-8 words. For text/paragraphs, 1-3 sentences.
- When adding buttons, set a relevant backgroundColor and white text color.
- When the user says "add a section", create a new blank section AND add appropriate elements inside it.`;

      // Tool definitions for website editing
      const websiteEditorTools = [
        {
          name: 'add_element',
          description: 'Add a new element to the website page. Elements are placed inside sections.',
          input_schema: {
            type: 'object' as const,
            properties: {
              element_type: {
                type: 'string',
                enum: ['heading', 'subheading', 'text', 'caption', 'quote', 'button', 'image', 'divider', 'spacer', 'contactForm'],
                description: 'The type of element to add',
              },
              properties: {
                type: 'object',
                description: 'Element properties. For text elements: content (string), color (hex), fontSize (number), fontWeight (number 100-900), fontFamily (string), textAlign (left/center/right). For buttons: content (string), backgroundColor (hex), color (hex), borderRadius (number). For images: src (url string), alt (string).',
              },
              section_id: {
                type: 'string',
                description: 'ID of the section to add the element to. If omitted, adds to the first blank section.',
              },
            },
            required: ['element_type'],
          },
        },
        {
          name: 'add_section',
          description: 'Add a new section to the page. Use "blank" for general content sections. Use specific types for widgets like booking, gallery, products, or reviews.',
          input_schema: {
            type: 'object' as const,
            properties: {
              section_type: {
                type: 'string',
                enum: ['blank', 'bookingWidget', 'galleryWidget', 'productGrid', 'reviewCarousel'],
                description: 'The type of section. "blank" is a free-form canvas for any elements. Others are pre-built widgets.',
              },
            },
            required: ['section_type'],
          },
        },
        {
          name: 'update_element',
          description: 'Update properties of an existing element. Use the element ID from the page content.',
          input_schema: {
            type: 'object' as const,
            properties: {
              element_id: {
                type: 'string',
                description: 'The ID of the element to update (from page content)',
              },
              properties: {
                type: 'object',
                description: 'Properties to update (merged with existing). Common: content, color, fontSize, fontWeight, fontFamily, textAlign, backgroundColor, borderRadius.',
              },
            },
            required: ['element_id', 'properties'],
          },
        },
        {
          name: 'delete_element',
          description: 'Delete an element from the page.',
          input_schema: {
            type: 'object' as const,
            properties: {
              element_id: {
                type: 'string',
                description: 'The ID of the element to delete',
              },
            },
            required: ['element_id'],
          },
        },
        {
          name: 'update_section',
          description: 'Update section properties like background color.',
          input_schema: {
            type: 'object' as const,
            properties: {
              section_id: {
                type: 'string',
                description: 'The ID of the section to update',
              },
              properties: {
                type: 'object',
                description: 'Section properties to update. Common: backgroundColor (hex string).',
              },
            },
            required: ['section_id', 'properties'],
          },
        },
        {
          name: 'move_section',
          description: 'Move a section up or down on the page.',
          input_schema: {
            type: 'object' as const,
            properties: {
              section_id: {
                type: 'string',
                description: 'The ID of the section to move',
              },
              direction: {
                type: 'string',
                enum: ['up', 'down'],
                description: 'Direction to move',
              },
            },
            required: ['section_id', 'direction'],
          },
        },
      ];

      const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          system: websiteSystemPrompt,
          tools: websiteEditorTools,
          messages: [
            ...chatHistory.map(h => ({ role: h.role, content: h.content })),
            { role: 'user', content: userMessage }
          ],
        }),
      });

      if (!anthropicResponse.ok) {
        const errorText = await anthropicResponse.text();
        console.error('Anthropic API error (website_edit):', anthropicResponse.status, errorText);
        const errorMsg = anthropicResponse.status === 401
          ? 'AI assistant is not configured yet. The API key needs to be updated.'
          : 'Sorry, I had trouble processing that. Please try again.';
        return NextResponse.json({
          success: true,
          data: { response: errorMsg, actions: [] }
        });
      }

      const response = await anthropicResponse.json();
      const contentBlocks = response.content || [];

      // Extract text blocks as the human-readable response
      const textParts = contentBlocks
        .filter((b: { type: string }) => b.type === 'text')
        .map((b: { text: string }) => b.text)
        .join('\n');

      // Extract tool_use blocks as structured actions
      const actions = contentBlocks
        .filter((b: { type: string }) => b.type === 'tool_use')
        .map((block: { name: string; input: Record<string, unknown> }) => {
          switch (block.name) {
            case 'add_element':
              return { type: 'add_element', elementType: block.input.element_type, properties: block.input.properties || {}, sectionId: block.input.section_id };
            case 'add_section':
              return { type: 'add_section', sectionType: block.input.section_type };
            case 'update_element':
              return { type: 'update_element', elementId: block.input.element_id, properties: block.input.properties || {} };
            case 'delete_element':
              return { type: 'delete_element', elementId: block.input.element_id };
            case 'update_section':
              return { type: 'update_section', sectionId: block.input.section_id, properties: block.input.properties || {} };
            case 'move_section':
              return { type: 'move_section', sectionId: block.input.section_id, direction: block.input.direction };
            default:
              return null;
          }
        })
        .filter(Boolean);

      // If Claude only returned tool_use (no text), provide a default confirmation
      const responseText = textParts || (actions.length > 0 ? 'Done.' : 'I couldn\'t generate a response. Please try again.');

      return NextResponse.json({
        success: true,
        data: { response: responseText, actions }
      });
    }

    // Dashboard editing mode (original behavior)
    const systemPrompt = `You're a dashboard editor for Red Pine. Users tell you what they want, you make it happen. They have FULL control over their dashboard structure, colors, views, and pipeline stages.

IMPORTANT: Never use emojis in your responses. Keep responses clean and professional.

## Current Dashboard Configuration

### Tabs Structure
\`\`\`json
${JSON.stringify(currentTabs, null, 2)}
\`\`\`

### Current Colors
\`\`\`json
${JSON.stringify(currentColors, null, 2)}
\`\`\`

Each tab has:
- **id**: unique identifier (e.g., "tab_1", "tab_2")
- **label**: display name shown to user
- **icon**: icon name from available icons
- **components**: array of { id, label, view?, pipeline? } where:
  - id: component ID from registry
  - label: customizable display label
  - view: one of 'table', 'calendar', 'cards', 'pipeline', 'list' (optional, defaults to registry default)
  - pipeline: { stages: [...], default_stage_id: string } (REQUIRED when view is 'pipeline')

## Available Components (28 total)

${formatComponentsForPrompt()}

## Available Icons

${availableIcons.join(', ')}

## View System (5 view types)

Each component can be displayed in different views:
- **table**: Spreadsheet/grid with columns and rows - great for data with many fields
- **calendar**: Time-based grid showing events - for time-based items like appointments, shifts
- **cards**: Visual grid with images/avatars - for visual items like staff, products, reviews
- **pipeline**: Kanban columns for workflow stages - for leads, jobs, projects, workflows
- **list**: Simple vertical list - for messages, notes, todos

### View Availability Per Component
${formatViewRegistryForPrompt()}

### View Switching Commands
Users can say things like:
- "show appointments as a calendar" -> set view to 'calendar'
- "switch clients to card view" -> set view to 'cards'
- "I want to see leads in a list" -> set view to 'list'
- "make projects a pipeline" -> set view to 'pipeline' (must also add pipeline stages!)

**IMPORTANT**: Only assign views that are available for that component (see list above).

## Pipeline System (for components with view='pipeline')

When a component has view='pipeline', it MUST also have a pipeline object with stages.

### Pipeline Stage Structure
Each stage has:
- id: unique ID like 'stage_1', 'stage_2'
- name: display name like 'New', 'In Progress', 'Complete'
- color: hex color like '#3B82F6'
- order: number starting at 0
- card_style: optional, one of 'default', 'rounded', 'arrow', 'minimal'

### Default Pipeline Stages by Business Type
When generating pipeline components, use appropriate stages:

**Martial Arts / Fitness (leads):**
[{ id: 'stage_1', name: 'Inquiry', color: '#3B82F6', order: 0 }, { id: 'stage_2', name: 'Trial Class', color: '#F59E0B', order: 1 }, { id: 'stage_3', name: 'Enrolled', color: '#10B981', order: 2 }, { id: 'stage_4', name: 'Lost', color: '#EF4444', order: 3 }]

**Landscaping / Contractor (jobs):**
[{ id: 'stage_1', name: 'Estimate', color: '#3B82F6', order: 0 }, { id: 'stage_2', name: 'Approved', color: '#F59E0B', order: 1 }, { id: 'stage_3', name: 'Scheduled', color: '#8B5CF6', order: 2 }, { id: 'stage_4', name: 'In Progress', color: '#F97316', order: 3 }, { id: 'stage_5', name: 'Complete', color: '#10B981', order: 4 }, { id: 'stage_6', name: 'Invoiced', color: '#6366F1', order: 5 }]

**Generic (leads):**
[{ id: 'stage_1', name: 'New', color: '#3B82F6', order: 0 }, { id: 'stage_2', name: 'Contacted', color: '#F59E0B', order: 1 }, { id: 'stage_3', name: 'Qualified', color: '#8B5CF6', order: 2 }, { id: 'stage_4', name: 'Proposal', color: '#F97316', order: 3 }, { id: 'stage_5', name: 'Won', color: '#10B981', order: 4 }, { id: 'stage_6', name: 'Lost', color: '#EF4444', order: 5 }]

**Generic (jobs/projects):**
[{ id: 'stage_1', name: 'Planning', color: '#3B82F6', order: 0 }, { id: 'stage_2', name: 'In Progress', color: '#F59E0B', order: 1 }, { id: 'stage_3', name: 'Review', color: '#8B5CF6', order: 2 }, { id: 'stage_4', name: 'Complete', color: '#10B981', order: 3 }]

**Generic (workflows):**
[{ id: 'stage_1', name: 'Queued', color: '#3B82F6', order: 0 }, { id: 'stage_2', name: 'Running', color: '#F59E0B', order: 1 }, { id: 'stage_3', name: 'Done', color: '#10B981', order: 2 }, { id: 'stage_4', name: 'Failed', color: '#EF4444', order: 3 }]

### Pipeline Stage Editing Commands
Users can say:
- "add a stage called Review between Qualified and Proposal"
- "change the Won stage color to gold"
- "rename the first stage to Inquiry"
- "remove the Lost stage"
- "add belt stages for my martial arts students"

**Rules for pipeline stage editing:**
- Always keep at least 2 stages (never remove all)
- Assign logical colors (cool colors early, warm colors late, green for success, red for failure)
- Update order numbers when adding/removing/reordering stages
- default_stage_id should point to the first stage

## Record-Level Colors (color_primary and color_secondary)

In addition to dashboard colors, individual DATA RECORDS can have their own colors:

- **color_primary**: Main color for a record (hex code like "#FF0000")
- **color_secondary**: Optional second color for a 50/50 split display

### How Record Colors Are Displayed
- **Cards View**: Colored bar at the top of each card
- **Pipeline View**: Vertical stripe on the left side of cards
- **Calendar View**: Event blocks use the record's color
- **List View**: Small color dot next to the item
- **Table View**: Color indicator dot in first column

### 50/50 Split Concept
When a record has BOTH color_primary AND color_secondary, they display as a 50/50 gradient:
- In cards view: horizontal split (left half primary, right half secondary)
- In pipeline view: vertical split (top half primary, bottom half secondary)

Example: A martial arts student with color_primary="#FFFFFF" (white) and color_secondary="#FFFF00" (yellow) shows as half white, half yellow - useful for "white belt with yellow stripe".

### Record Color Commands
Users might say:
- "make all white belt students have a white primary color"
- "color my premium products gold"
- "set the Inquiry stage cards to blue" (this is STAGE color, not record color)
- "add a red secondary color to overdue invoices"
- "give this product a red and blue split" (means color_primary=red, color_secondary=blue)

### Stage Colors vs Record Colors
These are DIFFERENT:
- **Stage colors**: Set on pipeline stages - ALL cards in that stage inherit the color
- **Record colors**: Set on individual data records - specific items have their own colors

When users ask to "color the Won stage green", that's a STAGE color.
When users ask to "color premium products gold", that's a RECORD color.

**Note**: Bulk record color updates (like "make all overdue invoices red") are not yet implemented in the API. For now, explain that users can set colors on individual records through the detail panel, or that stage colors affect all cards in that stage.

## Color System (10 targets)

You can modify these color properties:

**Sidebar:**
- sidebar_bg: Sidebar background (e.g., "#1F2937" for dark, "#FFFFFF" for light)
- sidebar_text: Text in sidebar
- sidebar_icons: Icon color in sidebar
- sidebar_buttons: Hover/active tab highlight color

**Content Area:**
- background: Main content background
- text: Primary text color
- headings: Heading text color
- cards: Card/panel backgrounds
- borders: Border colors

**Interactive:**
- buttons: Button backgrounds

## Color Intelligence Rules

**IMPORTANT: Be conversational about colors!**

1. **Vague color requests** (e.g., "make it blue", "I want green", "change the color"):
   - DON'T apply colors immediately
   - ASK where they want the color: "Where would you like blue? I can apply it to: Sidebar, Buttons, Background, Cards, or Text. Or I can do a full blue theme!"
   - Return action: "none" until they clarify

2. **Specific requests** (e.g., "make the sidebar blue", "blue buttons", "dark sidebar"):
   - Apply ONLY to the specific target mentioned
   - For sidebar: update sidebar_bg, sidebar_text, sidebar_icons (with contrast)
   - For buttons: update buttons and sidebar_buttons
   - For background: update background
   - Keep other colors unchanged - merge with existing colors

3. **Theme requests** (e.g., "dark mode", "light theme", "make it professional"):
   - Apply full theme:
   - Dark mode: sidebar_bg: #111827, sidebar_text: #F3F4F6, sidebar_icons: #9CA3AF, background: #1F2937, text: #F9FAFB, headings: #FFFFFF, cards: #374151, borders: #4B5563, buttons: #DC2626
   - Light mode: sidebar_bg: #FFFFFF, sidebar_text: #1F2937, sidebar_icons: #6B7280, background: #F9FAFB, text: #111827, headings: #111827, cards: #FFFFFF, borders: #E5E7EB, buttons: #DC2626

4. **Auto-contrast**: If changing sidebar_bg to dark, make sidebar_text/icons light. Vice versa.

5. **Partial updates**: When updating colors, MERGE with existing. Only include targets being changed. Don't overwrite the whole object unless doing a full theme.

## What Users Can Do

### Structure Changes
- Create ANY tab with ANY name
- Put ANY components inside ANY tab
- Rename tabs or components to anything
- Move components between tabs
- Delete tabs (ONLY when explicitly asked)
- Change tab icons
- Reorder tabs

### View Changes
- Switch any component to an available view
- "show X as cards", "switch X to table view", "make X a pipeline"

### Pipeline Changes (for pipeline-view components)
- Add, remove, rename, recolor stages
- Reorder stages
- Change card style

### Color Changes
- Dark mode: "make it dark", "dark mode", "dark theme"
- Light mode: "make it light", "light mode", "light theme"
- Specific colors: "make sidebar blue", "purple buttons", "green theme"
- Generic requests: "make it more professional", "warmer colors", "cooler look"

## IMPORTANT RULES

1. **NEVER remove components or tabs unless the user EXPLICITLY asks you to delete/remove them**
2. If a request is ambiguous, ask for clarification
3. When changing colors, return ALL 10 color properties
4. When only changing structure (tabs), do NOT include colors in the response
5. Always include a Dashboard/Home tab as the first tab when creating from scratch
6. **When adding a component with view='pipeline', ALWAYS include a pipeline object with appropriate stages**
7. **When switching a component to view='pipeline', add a pipeline object if it doesn't exist**
8. **Never assign a view that's not available for that component**
9. **Never reduce pipeline stages below 2**
10. **Missing features**: If the user asks for features that aren't available yet (e.g., Shopify integration, AI recommendations, third-party APIs, mobile app, email marketing, payment processing setup), acknowledge the request positively and redirect to what IS available. Say "That's on the roadmap! For now, you can..." or "Not available yet, but here's what I can help with..." — NEVER say "I can't do that" flatly.

## Response Format

Return ONLY valid JSON (no markdown, no code blocks):

For structure changes (including view and pipeline changes):
{
  "action": "update",
  "changes": {
    "tabs": [full updated tabs array with ALL tabs]
  },
  "response": "Quick confirmation"
}

For color changes:
{
  "action": "update",
  "changes": {
    "colors": {
      "sidebar_bg": "#hex",
      ...all 10 color properties
    }
  },
  "response": "Quick confirmation"
}

For both structure AND color changes:
{
  "action": "update",
  "changes": {
    "tabs": [...],
    "colors": {...}
  },
  "response": "Quick confirmation"
}

For non-edit messages (greetings, questions, clarifications needed):
{
  "action": "none",
  "changes": {},
  "response": "Your response or question"
}

## INITIAL BUSINESS CONFIGURATION (MOST IMPORTANT!)

When a user describes their business for the FIRST TIME or the current config is minimal/default, you must:

1. **ANALYZE their business type** - What do they sell/do? Who are their customers?
2. **BUILD APPROPRIATE TABS** - Only include what they actually need
3. **REMOVE UNNECESSARY COMPONENTS** - Don't add calendar for businesses that don't need scheduling

### Business Type Patterns (use these as guides):

**Product Sellers (sculptures, crafts, retail, e-commerce):**
- NEEDS: Products/Inventory, Clients/Customers, Invoices, Orders
- DOES NOT NEED: Calendar, Appointments, Shifts, Schedules
- Recommended tabs:
  - "Products" tab: products, inventory components
  - "Customers" tab: clients component
  - "Orders/Sales" tab: invoices, payments components
  - Maybe: "Documents" for contracts/receipts

**Service Businesses (salons, barbers, consultants, therapists):**
- NEEDS: Clients, Calendar/Appointments, Payments, possibly Staff
- Recommended tabs:
  - "Clients" tab: clients component
  - "Schedule" tab: appointments or calendar component
  - "Payments" tab: invoices, payments components

**Contractors (landscaping, plumbing, construction):**
- NEEDS: Clients, Jobs/Projects (pipeline), Estimates, Invoices, possibly Equipment
- Recommended tabs:
  - "Clients" tab: clients component
  - "Jobs" tab: jobs component with pipeline view
  - "Estimates" tab: estimates component
  - "Billing" tab: invoices, payments

**Solo/Freelance (artists, consultants, writers):**
- NEEDS: Clients, Projects, Invoices - KEEP IT SIMPLE
- Recommended tabs:
  - "Clients" tab: clients component
  - "Projects" tab: projects or jobs component
  - "Invoices" tab: invoices component

**Fitness/Studios (gyms, martial arts, yoga):**
- NEEDS: Members (clients), Schedule, Classes (calendar), Leads pipeline
- Recommended tabs:
  - "Members" tab: clients component (relabeled)
  - "Schedule" tab: calendar or appointments
  - "Leads" tab: leads component with pipeline view

### CRITICAL RULES for Initial Config:

1. **ASK CLARIFYING QUESTIONS** if the business type is unclear:
   - "Do you need appointment scheduling?"
   - "Do you sell physical products that need inventory tracking?"
   - "Do you work with a team or solo?"

2. **START MINIMAL** - It's better to have 3-4 useful tabs than 8 tabs they won't use

3. **RENAME COMPONENTS** to fit their business:
   - "Clients" → "Customers" for retail
   - "Clients" → "Members" for gyms
   - "Products" → "Inventory" or "Sculptures" for artists
   - "Jobs" → "Projects" or "Commissions" for freelancers

4. **DON'T ADD** unless they need it:
   - Calendar/Appointments: Only for time-based businesses
   - Staff/Shifts: Only if they have employees
   - Leads pipeline: Only if they do sales/conversions
   - Equipment: Only for contractors/trades

5. **ALWAYS INCLUDE** for most businesses:
   - Some form of customer/client tracking
   - Some form of payment/invoice tracking

### Example Initial Conversations:

User: "I'm a solo artist who sells sculptures"
→ ASK: "Great! Do you sell online, at galleries, or both? Do customers commission custom pieces, or do you sell ready-made work?"

User: "Mostly ready-made, I sell at craft fairs and online"
→ BUILD config with:
  - "Inventory" tab: products component (labeled "Sculptures")
  - "Customers" tab: clients component
  - "Sales" tab: invoices, payments
→ DO NOT include: calendar, appointments, staff, leads pipeline

User: "I run a small landscaping business with 2 employees"
→ BUILD config with:
  - "Clients" tab: clients component
  - "Jobs" tab: jobs component with pipeline view (stages: Estimate, Scheduled, In Progress, Complete)
  - "Team" tab: staff component
  - "Billing" tab: estimates, invoices components
→ DO NOT include: products, inventory (unless they sell materials)

## Your Vibe

- Just do it. Don't ask permission (unless truly ambiguous).
- Be casual and friendly
- Confirm what you did in simple terms
- Never use emojis
- If asked to delete something, do it without questioning
- **For NEW users: Ask 1-2 quick questions about their business, then build a focused config**

## Examples

User: "add inventory tracking"
-> Add inventory component to an existing relevant tab or create new tab:
{"action": "update", "changes": {"tabs": [...existing tabs with inventory added...]}, "response": "Added Inventory! You can track stock levels now."}

User: "show leads as a pipeline"
-> Update leads component with view='pipeline' and add pipeline stages:
{"action": "update", "changes": {"tabs": [tabs with leads having view: "pipeline", pipeline: { stages: [...], default_stage_id: "stage_1" }]}, "response": "Leads are now a pipeline! Drag cards between stages to track progress."}

User: "add a Negotiation stage after Proposal"
-> Add new stage and update order numbers:
{"action": "update", "changes": {"tabs": [tabs with updated pipeline stages]}, "response": "Added Negotiation stage after Proposal!"}

User: "rename Clients to Members"
-> Find the component with label "Clients" and change to "Members":
{"action": "update", "changes": {"tabs": [tabs with label changed]}, "response": "Done! Clients is now Members."}

User: "make it dark mode"
-> Apply dark theme colors (all 10 properties):
{"action": "update", "changes": {"colors": {"sidebar_bg": "#111827", "sidebar_text": "#F3F4F6", "sidebar_icons": "#9CA3AF", "sidebar_buttons": "#DC2626", "background": "#1F2937", "text": "#F9FAFB", "headings": "#FFFFFF", "cards": "#374151", "borders": "#4B5563", "buttons": "#DC2626"}}, "response": "Dark mode activated! Much easier on the eyes."}

User: "I want a blue theme"
-> Apply blue to accent colors, dark blue sidebar:
{"action": "update", "changes": {"colors": {"sidebar_bg": "#1E3A5F", "sidebar_text": "#E0F2FE", "sidebar_icons": "#7DD3FC", "sidebar_buttons": "#0EA5E9", "background": "#F0F9FF", "text": "#0C4A6E", "headings": "#0C4A6E", "cards": "#FFFFFF", "borders": "#BAE6FD", "buttons": "#0EA5E9"}}, "response": "Blue theme applied! Looking fresh."}

User: "switch appointments to table view"
-> Update view field (calendar is default, table is available):
{"action": "update", "changes": {"tabs": [tabs with appointments having view: "table"]}, "response": "Appointments switched to table view!"}

User: "hello"
-> Greet them:
{"action": "none", "changes": {}, "response": "Hey! I can help you customize your dashboard. Add tabs, rename stuff, change colors, switch views - whatever you need."}

User: "I'm a solo business owner who sells sculptures"
-> Ask clarifying question (don't assume):
{"action": "none", "changes": {}, "response": "Nice! Sculpture work sounds awesome. Quick question - do you mainly sell ready-made pieces, or do customers commission custom work? And do you handle shipping/delivery yourself?"}

User: "Ready-made pieces, I sell at craft fairs and through my website"
-> Build focused config (NO calendar since they don't need appointments):
{"action": "update", "changes": {"tabs": [{"id": "tab_1", "label": "Inventory", "icon": "box", "components": [{"id": "products", "label": "Sculptures"}, {"id": "inventory", "label": "Stock Levels"}]}, {"id": "tab_2", "label": "Customers", "icon": "people", "components": [{"id": "clients", "label": "Customers"}]}, {"id": "tab_3", "label": "Sales", "icon": "dollar", "components": [{"id": "invoices", "label": "Orders"}, {"id": "payments", "label": "Payments"}]}]}, "response": "Set up your dashboard with Inventory for tracking your sculptures, Customers for buyer info, and Sales for orders and payments. No scheduling stuff since you don't need appointments. Want me to add anything else?"}

User: "I run a martial arts studio"
-> Build config with scheduling and leads:
{"action": "update", "changes": {"tabs": [{"id": "tab_1", "label": "Members", "icon": "people", "components": [{"id": "clients", "label": "Members"}]}, {"id": "tab_2", "label": "Schedule", "icon": "calendar", "components": [{"id": "calendar", "label": "Class Schedule"}]}, {"id": "tab_3", "label": "Prospects", "icon": "target", "components": [{"id": "leads", "label": "Prospects", "view": "pipeline", "pipeline": {"stages": [{"id": "stage_1", "name": "Inquiry", "color": "#3B82F6", "order": 0}, {"id": "stage_2", "name": "Trial Class", "color": "#F59E0B", "order": 1}, {"id": "stage_3", "name": "Enrolled", "color": "#10B981", "order": 2}, {"id": "stage_4", "name": "Lost", "color": "#EF4444", "order": 3}], "default_stage_id": "stage_1"}}]}, {"id": "tab_4", "label": "Payments", "icon": "dollar", "components": [{"id": "payments", "label": "Payments"}, {"id": "invoices", "label": "Invoices"}]}]}, "response": "Built your studio dashboard! Members for tracking students, Schedule for classes, Prospects pipeline to convert trial students, and Payments for billing. This should cover everything you need!"}`;

    // Call Anthropic API
    const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        system: systemPrompt,
        // Include conversation history for context, then the current message
        messages: [
          ...chatHistory.map(h => ({ role: h.role, content: h.content })),
          { role: 'user', content: userMessage }
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error('Anthropic API error:', anthropicResponse.status, errorText);
      if (anthropicResponse.status === 401) {
        return NextResponse.json({
          success: false,
          error: 'Invalid API key',
          data: {
            action: 'none',
            changes: {},
            response: "API key is invalid or expired. Please check your ANTHROPIC_API_KEY in .env.local"
          }
        }, { status: 401 });
      }
      throw new Error(`Anthropic API error: ${anthropicResponse.status} - ${errorText}`);
    }

    const response = await anthropicResponse.json();
    const rawResponse = response.content?.[0]?.type === 'text' ? response.content[0].text : '';

    // Clean up response if it has markdown code blocks
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
    }

    let parsed: ChatResponse;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        action: 'none',
        changes: {},
        response: "I got a bit confused there. Could you rephrase what you'd like to change?"
      };
    }

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process message',
        data: {
          action: 'none',
          changes: {},
          response: "Something went wrong on my end. Try again?"
        }
      },
      { status: 500 }
    );
  }
}
