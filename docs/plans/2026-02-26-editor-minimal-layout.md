# Editor Minimal Layout — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the editor's permanent sidebar (280px) and top toolbar (48px) with a collapsed vertical "TOOLS" tab + overlay panel + floating toolbar, giving the canvas nearly 100% of the viewport.

**Architecture:** The sidebar becomes an overlay that slides in from the left over the canvas (not pushing it). The top toolbar becomes a floating pill anchored to the top-right of the canvas area. Properties panel (right) is already collapsible. Page thumbnails (bottom) stay unchanged.

**Tech Stack:** React, TypeScript, Tailwind CSS, Lucide icons. No new dependencies.

**Design doc:** `docs/plans/2026-02-26-editor-minimal-layout-design.md`

---

## Task 1: Add `toolsOverlayOpen` state + vertical TOOLS tab to FreeFormEditor

**Files:**
- Modify: `dashboard/src/components/editor/FreeFormEditor.tsx:653-710`

**What to do:**

1. Add state: `const [toolsOverlayOpen, setToolsOverlayOpen] = useState(false);`
2. Remove the entire `{/* TOOLBAR */}` block (lines 664-707) — the `<div className="flex items-center justify-between px-3 py-2 border-b">` with undo/redo/viewport/zoom/preview/save.
3. In the `{/* MAIN LAYOUT */}` section, before `<FreeFormSidebar>`, add the vertical TOOLS tab:

```tsx
{/* Vertical TOOLS tab */}
<button
  onClick={() => setToolsOverlayOpen(prev => !prev)}
  className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center bg-white border border-l-0 border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
  style={{ width: 24, height: 80, writingMode: 'vertical-rl', textOrientation: 'mixed' }}
  title="Toggle tools panel"
>
  <span className="text-[10px] font-semibold font-['Fira_Code'] tracking-widest uppercase">TOOLS</span>
</button>
```

4. Change the main layout container from `<div className="flex-1 flex overflow-hidden">` to `<div className="flex-1 flex overflow-hidden relative">` (add `relative` for the absolute positioning of the tab and floating toolbar).

**Commit:** `refactor: add vertical TOOLS tab and remove top toolbar bar`

---

## Task 2: Convert FreeFormSidebar to overlay mode

**Files:**
- Modify: `dashboard/src/components/editor/FreeFormSidebar.tsx:1827-1874` (props interface)
- Modify: `dashboard/src/components/editor/FreeFormSidebar.tsx:2421-2524` (render output)
- Modify: `dashboard/src/components/editor/FreeFormEditor.tsx` (pass new props)

**What to do:**

1. Add new props to `FreeFormSidebarProps`:
```tsx
isOverlayOpen?: boolean;
onClose?: () => void;
onElementAdded?: () => void; // called after element/section add for auto-close
```

2. Replace the entire render `return (...)` block (lines 2421-2524). The new structure:

```tsx
if (!isOverlayOpen) return null;

return (
  <>
    {/* Backdrop — click to close */}
    <div
      className="fixed inset-0 z-40 bg-black/20"
      onClick={onClose}
    />
    {/* Overlay panel */}
    <aside
      className={`absolute left-0 top-0 bottom-0 z-50 w-[280px] flex flex-col border-r shadow-xl
        transition-transform duration-300 ease-out
        ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}
        ${className}
      `}
    >
      {/* Header with close button */}
      <div className={`flex items-center justify-between px-4 py-3 border-b flex-shrink-0 ${
        isDark ? 'border-zinc-800' : 'border-gray-200'
      }`}>
        <h2 className={`text-sm font-semibold font-['Fira_Code'] uppercase tracking-wider ${
          isDark ? 'text-white' : 'text-zinc-900'
        }`}>
          Tools
        </h2>
        <button onClick={onClose} className={`p-1.5 transition-colors ${
          isDark ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-gray-100 text-gray-500'
        }`}>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 flex-shrink-0">
        <SearchInput ... />
      </div>

      {/* Unified scrollable content — all panels stacked */}
      <div className="flex-1 overflow-y-auto">
        {renderPanelContent()}
      </div>
    </aside>
  </>
);
```

3. Remove the Icon Rail (lines 2423-2461) entirely — no more `w-[60px]` nav strip.

4. Remove the sliding panel wrapper (lines 2463-2521) — the `transition-all duration-300` width-animated div. The overlay replaces both.

5. Convert `renderPanelContent()` from a switch statement to a **single unified view** that renders ALL categories in one scrollable list:

```tsx
const renderPanelContent = (): ReactNode => {
  // If AI is active, show AI chat full-height
  if (activePanel === 'ai') return /* existing AI chat JSX */;

  // Unified tool list
  return (
    <div className="space-y-1">
      {/* Category: Sections */}
      <CategoryHeader label="Sections" ... />
      {/* Blank section + pre-built items */}

      {/* Category: Elements */}
      <CategoryHeader label="Elements" ... />
      {/* Shapes, buttons, etc. */}

      {/* Category: Widgets */}
      <CategoryHeader label="Widgets" ... />

      {/* Category: Media & Layout */}
      <CategoryHeader label="Media & Layout" ... />

      {/* Category: Forms */}
      <CategoryHeader label="Forms" ... />

      {/* Category: Brand & Design */}
      <button onClick={() => setActivePanel('brand')}>Brand & Design</button>

      {/* Category: AI Assistant */}
      <button onClick={() => setActivePanel('ai')}>AI Assistant</button>

      {/* Category: Project & Pages */}
      <button onClick={() => setActivePanel('projects')}>Project</button>
    </div>
  );
};
```

Note: Brand, AI, and Project open as their own full-panel views (replacing the unified list). Add a back button at the top of each. Elements/Text/Sections/Widgets/Media/Forms are shown inline in the unified list.

6. In `handleAddElement`, call `onElementAdded?.()` after the element is added (line 2002).

7. In `FreeFormEditor.tsx`, update the sidebar invocation:
```tsx
<FreeFormSidebar
  isOverlayOpen={toolsOverlayOpen}
  onClose={() => setToolsOverlayOpen(false)}
  onElementAdded={() => setToolsOverlayOpen(false)} // auto-close
  // ... all existing props
/>
```

**Commit:** `refactor: convert sidebar to overlay with unified tool list`

---

## Task 3: Add floating toolbar to canvas area

**Files:**
- Modify: `dashboard/src/components/editor/FreeFormEditor.tsx:710` (inside main layout div)

**What to do:**

Add the floating toolbar inside the `relative` main layout container, positioned top-right:

```tsx
{/* Floating Toolbar */}
<div className="absolute top-3 right-3 z-20 flex items-center gap-1 px-2 py-1.5 bg-white/90 backdrop-blur-sm border border-gray-200 shadow-sm">
  {/* Close editor */}
  <button onClick={onClose} className="p-1.5 hover:bg-gray-100 text-gray-500" title="Close editor">
    <X className="w-4 h-4" />
  </button>
  <div className="w-px h-5 bg-gray-200" />

  {/* Undo / Redo */}
  <button onClick={editor.undo} disabled={!editor.canUndo} className="p-1.5 hover:bg-gray-100 text-gray-500 disabled:opacity-30" title="Undo (Cmd+Z)">
    <Undo2 className="w-3.5 h-3.5" />
  </button>
  <button onClick={editor.redo} disabled={!editor.canRedo} className="p-1.5 hover:bg-gray-100 text-gray-500 disabled:opacity-30" title="Redo (Cmd+Shift+Z)">
    <Redo2 className="w-3.5 h-3.5" />
  </button>
  <div className="w-px h-5 bg-gray-200" />

  {/* Viewport switcher — icon only */}
  {VIEWPORT_BUTTONS.map(({ mode, icon: Icon, label }) => (
    <button
      key={mode}
      onClick={() => { setViewportMode(mode); setZoom(VIEWPORT_ZOOM[mode]); editor.generateBreakpointPositions(mode, BREAKPOINTS[mode]); }}
      className={`p-1.5 transition-colors ${
        viewportMode === mode ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'
      }`}
      title={label}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  ))}
  <div className="w-px h-5 bg-gray-200" />

  {/* Zoom */}
  <button onClick={zoomOut} className="p-1.5 hover:bg-gray-100 text-gray-500" title="Zoom out">
    <ZoomOut className="w-3.5 h-3.5" />
  </button>
  <span className="text-[10px] font-['Fira_Code'] min-w-[32px] text-center text-gray-500">
    {Math.round(zoom * 100)}%
  </span>
  <button onClick={zoomIn} className="p-1.5 hover:bg-gray-100 text-gray-500" title="Zoom in">
    <ZoomIn className="w-3.5 h-3.5" />
  </button>
  <div className="w-px h-5 bg-gray-200" />

  {/* Preview + Save */}
  <button onClick={() => { setIsPreview(true); onPreviewChange?.(true); }} className="p-1.5 hover:bg-gray-100 text-gray-500" title="Preview">
    <Eye className="w-3.5 h-3.5" />
  </button>
  <button
    onClick={handleSave}
    disabled={saveStatus === 'saved'}
    className={`p-1.5 transition-colors ${saveStatus === 'unsaved' ? 'hover:opacity-80' : saveStatus === 'saving' ? 'text-amber-500' : 'text-gray-400'}`}
    style={saveStatus === 'unsaved' ? { color: '#1A1A1A' } : undefined}
    title={saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Save (Cmd+S)'}
  >
    <Save className="w-3.5 h-3.5" />
  </button>
</div>
```

Also add `X` to the lucide imports (already imported `ChevronLeft, ChevronRight`).

**Commit:** `feat: add floating toolbar replacing top bar`

---

## Task 4: Wire auto-close + section-add close behavior

**Files:**
- Modify: `dashboard/src/components/editor/FreeFormSidebar.tsx` (handleAddElement, onAddSection calls)

**What to do:**

1. In `handleAddElement` (line 2002), after the `onAddElement(...)` call, add:
```tsx
onElementAdded?.();
```

2. Find all places where `onAddSection` is called in the ElementsPanel content (around lines 650-670 in the sidebar). After each `onAddSection?.(type)` call, also call `onElementAdded?.()`.

3. Thread the `onElementAdded` prop through to sub-components that call `onAddSection` or `onAddElement`:
- `ElementsPanel` — add `onElementAdded` prop
- `TextPanel` — add `onElementAdded` prop

**Commit:** `feat: auto-close overlay after adding element or section`

---

## Task 5: Update PageThumbnailBar visibility logic

**Files:**
- Modify: `dashboard/src/components/editor/FreeFormEditor.tsx` (PageThumbnailBar props)

**What to do:**

The `PageThumbnailBar` currently uses `isVisible={sidebarPanel === 'projects'}`. Since the sidebar no longer reports `activePanel` in the same way, change this to:

```tsx
isVisible={toolsOverlayOpen}
```

Or simpler: always show the page bar (it's compact). Change to `isVisible={true}`.

Also remove the `sidebarPanel` state and `setSidebarPanel` since they're no longer needed (the sidebar no longer notifies the editor of panel changes via `onActivePanelChange`).

**Commit:** `fix: update page thumbnail bar visibility for overlay mode`

---

## Task 6: Build + Deploy + Visual verification

**Steps:**

1. Run `npx next build` — verify no TypeScript errors
2. Run `vercel --prod` from repo root
3. Navigate to `/editor/home` via Playwright
4. Verify:
   - Canvas takes nearly full width (only 24px TOOLS tab on left)
   - Floating toolbar visible top-right with all controls
   - Click TOOLS → overlay slides in with all tool categories
   - Add element → overlay auto-closes
   - Click canvas backdrop → overlay closes
   - Select section → properties panel auto-opens on right
   - Viewport switching still works
   - Undo/redo still works
   - Preview mode still works
   - Save still works

**Commit:** none (verification only)

---

## Implementation Notes

### Key risk: Sidebar is 2500 lines
The sidebar file is massive. Task 2 is the heavy lift — converting the render output from icon-rail + sliding-panel to a single overlay. The internal panel content (`renderPanelContent`, `ElementsPanel`, `TextPanel`, `BrandBoardEditor`, etc.) stays mostly the same — it's the outer shell that changes.

### What NOT to change
- `FreeFormCanvas.tsx` — no changes
- `FreeFormPropertiesPanel.tsx` — already collapsible, no changes
- `PageThumbnailBar.tsx` — minimal change (visibility prop)
- All internal panel components (`ElementsPanel`, `TextPanel`, `UploadsPanel`, `ProjectsPanel`) — content stays the same, just rendered in new container
- Keyboard shortcuts (Cmd+Z/S) — already wired to `useEffect` in editor, not to toolbar buttons
