# DESIGN.md — Project Horizon
> Visual Design System · Inspired by Zera Software Studio aesthetic

---

## 1. Design Philosophy

**Aesthetic Direction:** *Dark cinematic fintech editorial*

Inspired by Zera Studio's approach — deep dark surfaces, dramatic typography, generous whitespace, purposeful motion. Not a typical dashboard. This feels like a luxury product: the kind of interface where every pixel earns its place.

**One design rule above all:** The timeline is the product. Every other element serves it.

---

## 2. Colour System

### Base Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-void` | `#040810` | Page background — near black |
| `--bg-surface` | `#0a0f1e` | Cards, panels — dark navy |
| `--bg-elevated` | `#111827` | Elevated surfaces, tooltips |
| `--bg-glass` | `rgba(255,255,255,0.04)` | Glassmorphism panels |
| `--border-subtle` | `rgba(255,255,255,0.08)` | Card borders |
| `--border-active` | `rgba(255,255,255,0.16)` | Hover / focus borders |

### Accent Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-teal` | `#00e5c7` | Primary CTA, active milestone, projection arc |
| `--accent-amber` | `#f59e0b` | Shortfall indicator, warning state |
| `--accent-green` | `#22c55e` | Funded milestone, success state |
| `--accent-coral` | `#ff6b6b` | Critical shortfall, danger |
| `--accent-purple` | `#a78bfa` | Business category, secondary accent |

### Text Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#f8fafc` | Headlines, key numbers |
| `--text-secondary` | `#94a3b8` | Labels, descriptions |
| `--text-muted` | `#475569` | Disabled, placeholder |
| `--text-mono` | `#00e5c7` | ₹ values, ages, percentages |

---

## 3. Typography

### Font Stack

```css
/* Hero & display — editorial weight */
font-family: 'DM Serif Display', Georgia, serif;

/* UI labels, body — clean geometric */
font-family: 'Syne', sans-serif;

/* Numbers, ages, currency — monospace for alignment */
font-family: 'IBM Plex Mono', 'Courier New', monospace;
```

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Syne:wght@400;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale

| Role | Font | Size | Weight | Colour |
|------|------|------|--------|--------|
| Hero title | DM Serif Display | 72–96px | 400 | `--text-primary` |
| Hero subtitle | Syne | 18px | 400 | `--text-secondary` |
| Section label | Syne | 11px | 700, uppercase, 0.12em tracking | `--accent-teal` |
| Timeline age | IBM Plex Mono | 12px | 500 | `--text-muted` |
| Milestone label | Syne | 13px | 600 | `--text-primary` |
| ₹ values | IBM Plex Mono | 14–20px | 500 | `--text-mono` |
| Insight text | Syne | 15px | 400 | `--text-secondary` |
| Button | Syne | 14px | 700, uppercase | — |

---

## 4. Layout

### Page Structure

```
┌─────────────────────────────────────────────────────┐
│  NAVBAR (sticky, blur backdrop)                     │
├─────────────────────────────────────────────────────┤
│  HERO SECTION                                       │
│  • Three.js particle bg (optional)                  │
│  • Title: "See your life. Plan your wealth."        │
│  • Age + savings input → CTA                        │
├─────────────────────────────────────────────────────┤
│  TIMELINE CANVAS (main viewport, 100vw, 280px tall) │
│  • Horizontal scroll, age axis 20→80                │
│  • Milestone markers (draggable nodes)              │
│  • Recharts arc overlay                             │
├─────────────────────────────────────────────────────┤
│  SPLIT ROW (two columns below timeline)             │
│  LEFT: What-if Panel (40%)  RIGHT: Insights (60%)  │
├─────────────────────────────────────────────────────┤
│  MILESTONE GRID (category cards, editable)         │
└─────────────────────────────────────────────────────┘
```

### Grid

- Max content width: `1280px`, centred
- Column gap: `24px`
- Section vertical padding: `80px`
- Timeline: full bleed `100vw`

---

## 5. Component Specifications

### Navbar
- Height: `60px`
- Background: `rgba(4,8,16,0.8)` + `backdrop-filter: blur(20px)`
- Border bottom: `1px solid var(--border-subtle)`
- Logo: "HORIZON" in Syne 800, `--text-primary`
- Sticky on scroll, slight shadow appears after 80px scroll

### Timeline Canvas
- Background: `--bg-surface`
- Height: `280px`
- Horizontal overflow scroll with hidden scrollbar
- Top edge: thin `1px` teal glow line `box-shadow: 0 -1px 0 var(--accent-teal)`
- Age markers: IBM Plex Mono 12px, every 5 years labeled, every 1 year tick mark
- Smooth scroll via CSS `scroll-behavior: smooth`

### Milestone Markers
- Shape: vertical line (2px, category colour) + floating card above
- Card: `border-radius: 12px`, glass background, category icon (Phosphor, 16px)
- Drag: GSAP Draggable plugin OR native pointer events
- States:
  - Default: subtle glow in category colour
  - Dragging: scale(1.05), stronger glow, `cursor: grabbing`
  - Shortfall: amber pulsing ring animation
  - Funded: static green dot indicator

### Projection Arc (Recharts)
- Chart type: `ComposedChart` with `Line` + `ReferenceLine`
- Line colour: `--accent-teal`, strokeWidth: 2.5
- Shortfall zone: amber fill between arc and milestone cost line
- Surplus zone: teal fill (10% opacity)
- Animated draw-on: `isAnimationActive={true}`, duration 800ms
- Dot at each milestone: coloured by shortfall/funded status

### What-if Panel
- Glass card: `background: var(--bg-glass)`, border `var(--border-subtle)`
- Range inputs: custom styled, teal thumb, dark track
- Live update: debounced 0ms (instant) — recalculate on every `onChange`
- Label above each slider: IBM Plex Mono, shows current value in `--accent-teal`

### Insight Cards
- 3–5 cards, horizontal scroll on mobile
- Each: glass bg, left border `3px solid var(--accent-teal/amber/green)` by sentiment
- Icon: Phosphor (trend-up, warning-circle, check-circle)
- Text: Syne 15px, `--text-secondary`

### Shortfall Badge
- Amber: `background: rgba(245,158,11,0.12)`, border `rgba(245,158,11,0.3)`, text `#f59e0b`
- Green: `background: rgba(34,197,94,0.12)`, border `rgba(34,197,94,0.3)`, text `#22c55e`
- Shape: pill, `border-radius: 999px`, padding `4px 10px`

---

## 6. Motion & Animation

### Principles
- **Purposeful:** every animation communicates state, not decoration
- **Fast:** entrances 300–500ms, never longer
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — Expo out for enters; `ease-in-out` for loops

### Animation Inventory

| Element | Trigger | Animation | Duration |
|---------|---------|-----------|----------|
| Hero title | Page load | GSAP stagger reveal from Y+40, opacity 0→1 | 800ms |
| Timeline | Hero CTA click | Slide up from below viewport | 500ms |
| Milestone card | Drag complete | Spring settle to final position | 300ms |
| Projection arc | Data change | Recharts redraw (isAnimationActive) | 800ms |
| Shortfall badge | State change | Scale 0.8→1 + fade in | 200ms |
| What-if panel | Slider move | Instant arc redraw (no animation, just state update) | 0ms |
| Insight cards | Mount | GSAP stagger, 80ms between cards | 80ms stagger |
| Zoom switch | Button click | Timeline width transition | 400ms |

### GSAP Usage
```js
// Hero entrance
gsap.from('.hero-title', { y: 40, opacity: 0, duration: 0.8, ease: 'expo.out' })
gsap.from('.hero-sub', { y: 20, opacity: 0, duration: 0.6, delay: 0.2, ease: 'expo.out' })

// Insight card stagger
gsap.from('.insight-card', { y: 20, opacity: 0, stagger: 0.08, duration: 0.5, ease: 'expo.out' })

// Milestone marker entrance (on drop)
gsap.fromTo(marker, { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.7)' })
```

### Three.js Hero Background (optional, H6 polish)
- Scene: floating abstract geometry (icosahedron or torus knot)
- Low poly, wireframe or solid with low opacity `(0.15)`
- Colour: `--accent-teal` tinted
- Rotation: slow auto-rotate, mouse parallax offset (subtle)
- Responsive: canvas resizes to window

---

## 7. Interaction Patterns

### Drag to Place Milestone
1. User grabs milestone from sidebar palette
2. GSAP Draggable constrains to timeline track Y, free X
3. On release: snap to nearest year (age calculation from X position)
4. Card editor opens with computed age pre-filled

### Zoom Switch
1. Three buttons: `5Y | 10Y | ALL`
2. Active state: teal underline + background `rgba(0,229,199,0.08)`
3. On click: GSAP timeline width tweens, all marker X positions recalculate and animate

### Hover on Milestone
- Tooltip floats above: shows name, age, cost, funded status
- Backdrop blur + glass style
- Appears instantly on hover, 150ms fade out on leave

---

## 8. Responsive Notes

- **Desktop (1280px+):** Full layout as described
- **Tablet (768–1279px):** What-if panel and insights stack vertically
- **Mobile:** Not primary demo target — ensure basic scroll works

---

## 9. Design Reference — Zera Studio Aesthetic Cues

Elements borrowed from Zera Studio's visual language:
- Large, bold serif hero type on dark void background
- Thin geometric line accents (timeline axis = signature line element)
- Glassmorphism panels with barely-visible borders
- Generous breathing room between sections
- Smooth, cinematic scroll behaviour
- Monochrome base palette with one vivid accent colour (teal)
- Section labels as small uppercase tracked text in accent colour

---

*DESIGN version 1.0 · Generated for HORIZON'26 Hackathon*
