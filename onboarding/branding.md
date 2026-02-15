# Red Pine Design System

## Core Philosophy
Neo-brutalist design with sharp edges, high contrast, and purposeful simplicity. The design feels confident and direct - no decorative fluff, just clean functional elements that get out of the way.

---

## Colors
```
Primary Red:     #ce0707 (used for: "Red Pine" text, accents, checkmarks, hover states)
Background:      #ffffff (pure white, fixed/parallax)
Text Primary:    #000000 (headlines, body text)
Text Muted:      #6b7280 (gray-500, secondary text, descriptions)
Borders:         #000000 (2px solid black on all interactive elements)
```

---

## Typography
```
Font Family:     'Fira Code', monospace (everything)
Headings:        Bold/Black weight, uppercase for section titles
Body:            Regular weight, 16-18px
```

Import:
```html
<style>
    @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap');
    * { font-family: 'Fira Code', monospace; }
</style>
```

---

## Buttons

### Primary Button
```css
.btn-primary {
    background: #fff;
    color: #ce0707;
    border: 2px solid #000;
    transition: all 0.15s ease;
}
.btn-primary:hover,
.btn-primary:active {
    background: #ce0707;
    color: #fff;
}
```

### Secondary Button
```css
.btn-secondary {
    background: #fff;
    color: #000;
    border: 2px solid #000;
    transition: all 0.15s ease;
}
.btn-secondary:hover {
    background: #000;
    color: #fff;
}
```

---

## Form Elements
- Sharp corners (no border-radius)
- 2px solid black borders
- Light gray background (#f9fafb / gray-50) for input areas
- No shadows or layered effects

---

## Cards
- White background
- 2px solid black border
- No border-radius
- No box-shadow
- Subtle translateY(-2px) on hover only
- Gradient backgrounds for visual areas (Tailwind: from-{color}-100 to-{color}-200)

```css
.card {
    background: #fff;
    border: 2px solid #000;
    transition: all 0.15s ease;
}
.card:hover {
    transform: translateY(-2px);
}
```

---

## Animations

### Scroll Animation (Scale)
```css
.scroll-scale {
    opacity: 0;
    transform: scale(0.9);
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
}
.scroll-scale.visible {
    opacity: 1;
    transform: scale(1);
}
```

### Scroll Animation (Fade)
```css
.scroll-fade {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.scroll-fade.visible {
    opacity: 1;
    transform: translateY(0);
}
```

### Typewriter Cursor
```css
.typewriter-cursor {
    display: inline-block;
    width: 3px;
    height: 1em;
    background: #000;
    margin-left: 2px;
    animation: blink-cursor 0.7s step-end infinite;
}
@keyframes blink-cursor {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
}
```

### Heartbeat Pulse (Loading)
```css
.heartbeat {
    animation: heartbeat 1.2s ease-in-out infinite;
}
@keyframes heartbeat {
    0% { transform: scale(1); }
    14% { transform: scale(1.1); }
    28% { transform: scale(1); }
    42% { transform: scale(1.1); }
    70% { transform: scale(1); }
}
```

---

## Layout Principles
- Max content width: 1152px (Tailwind: max-w-6xl)
- Section padding: py-20 px-6
- Two-column grids for content sections (image + text)
- 3-column grid for card collections (lg:grid-cols-3)
- Everything centered on the page

---

## Brand Text Rule
**"Red Pine" must always be colored #ce0707 with semi-bold weight:**
```html
<span style="color: #ce0707; font-weight: 600;">Red Pine</span>
```

---

## Full-Screen Overlays
```css
.overlay {
    position: fixed;
    inset: 0;
    background: #fff;
    z-index: 50;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
```

---

## What to Avoid
- Rounded corners (no border-radius anywhere)
- Drop shadows
- Gradients on buttons or UI elements
- Decorative elements that don't serve a purpose
- Soft/muted primary colors
- Thin borders (always 2px)
- Over-the-top animations

---

## Quick Prompt for AI

Use this when asking to build in this style:

```
Build a neo-brutalist web interface with these exact specifications:

STYLE:
- Sharp square corners on everything (no border-radius)
- 2px solid black borders on all interactive elements
- White background (#ffffff), black text (#000000)
- Accent color: #ce0707 (red) - used sparingly for brand name and hover states
- Font: Fira Code monospace for everything
- No shadows, no gradients on UI elements

BUTTONS:
- Primary: white bg, red text, black border → hover: red bg, white text
- Secondary: white bg, black text, black border → hover: black bg, white text

ANIMATIONS:
- Scroll-triggered scale animations (0.9 → 1.0 with fade)
- Typewriter effect for headlines
- Heartbeat pulse for loading states
- Subtle lift on card hover (translateY -2px only, no shadow)

LAYOUT:
- Centered content, max-width ~1150px
- Generous whitespace (py-20 sections)
- Two-column layouts for content sections
- Grid layouts for card collections

TONE:
- Confident, direct, no decorative fluff
- High contrast, bold typography
- Functional brutalism - every element serves a purpose
```

---

## File References
- Logo: `/static/images/logo.png`
- Section images: `/static/images/image_1.png`, `/static/images/image_2.png`
