# TECHSTACK.md — Project Horizon
> Technical Architecture · HORIZON'26 Hackathon · All tools free

---

## 1. Stack Overview

| Layer | Tool | Version | Cost |
|-------|------|---------|------|
| Framework | React | 18.x | Free |
| Build tool | Vite | 5.x | Free |
| Styling | Tailwind CSS | 3.x | Free |
| Animation | GSAP (core + Draggable) | 3.x | Free |
| 3D (optional) | Three.js | r128+ | Free |
| Charts | Recharts | 2.x | Free |
| State | Zustand | 4.x | Free |
| Icons | Phosphor React | 2.x | Free |
| Hosting | Vercel | Hobby | Free |
| Fonts | Google Fonts | — | Free |

**Total cost: ₹0**

---

## 2. Project Structure

```
horizon/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Hero.jsx
│   │   ├── Timeline/
│   │   │   ├── TimelineCanvas.jsx     ← Main timeline container
│   │   │   ├── AgeAxis.jsx            ← Renders age ticks 20–80
│   │   │   ├── MilestoneMarker.jsx    ← Draggable node + card
│   │   │   └── ProjectionArc.jsx      ← Recharts line chart
│   │   ├── WhatIfPanel.jsx            ← Savings sliders
│   │   ├── InsightCards.jsx           ← Smart feedback strip
│   │   ├── MilestoneEditor.jsx        ← Modal card editor
│   │   └── ZoomControls.jsx           ← 5Y / 10Y / ALL buttons
│   ├── store/
│   │   └── useHorizonStore.js         ← Zustand global store
│   ├── engine/
│   │   └── simulateProjection.js      ← Core financial logic
│   ├── utils/
│   │   ├── formatCurrency.js          ← ₹ formatting helpers
│   │   └── generateInsights.js        ← Insight string generator
│   ├── constants/
│   │   └── categories.js              ← Category colours + icons
│   ├── styles/
│   │   └── globals.css                ← Tailwind + CSS vars
│   ├── App.jsx
│   └── main.jsx
├── docs/
│   ├── PRD.md
│   ├── DESIGN.md
│   └── TECHSTACK.md
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 3. Setup Commands

```bash
# 1. Create project
npm create vite@latest horizon -- --template react
cd horizon

# 2. Install all dependencies
npm install zustand recharts gsap @phosphor-icons/react

# 3. Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 4. Optional Three.js
npm install three

# 5. Start dev server
npm run dev
```

---

## 4. Zustand Store

```js
// src/store/useHorizonStore.js
import { create } from 'zustand'
import { simulateProjection } from '../engine/simulateProjection'

export const useHorizonStore = create((set, get) => ({
  // User inputs
  currentAge: 28,
  netWorth: 0,
  monthlySavings: 25000,
  annualInterestRate: 0.08,
  inflationRate: 0.06,
  inflationEnabled: false,

  // Milestones
  milestones: [],

  // Computed
  projectionData: [],
  zoom: 'ALL', // '5Y' | '10Y' | 'ALL'

  // Actions
  setParam: (key, value) => {
    set({ [key]: value })
    get().recalculate()
  },

  addMilestone: (milestone) => {
    set(s => ({ milestones: [...s.milestones, milestone] }))
    get().recalculate()
  },

  updateMilestone: (id, updates) => {
    set(s => ({
      milestones: s.milestones.map(m => m.id === id ? { ...m, ...updates } : m)
    }))
    get().recalculate()
  },

  removeMilestone: (id) => {
    set(s => ({ milestones: s.milestones.filter(m => m.id !== id) }))
    get().recalculate()
  },

  recalculate: () => {
    const s = get()
    const data = simulateProjection({
      currentAge: s.currentAge,
      netWorth: s.netWorth,
      monthlySavings: s.monthlySavings,
      annualInterestRate: s.annualInterestRate,
      inflationRate: s.inflationEnabled ? s.inflationRate : 0,
      milestones: s.milestones,
    })
    set({ projectionData: data })
  },

  setZoom: (zoom) => set({ zoom }),
}))
```

---

## 5. Projection Engine

```js
// src/engine/simulateProjection.js

/**
 * Forward-simulate savings from currentAge to 80.
 * Correctly handles sequential capital drawdowns —
 * each milestone reduces the compounding base for all future years.
 *
 * @returns Array of { age, balance, milestoneAt, shortfall }
 */
export function simulateProjection({
  currentAge,
  netWorth,
  monthlySavings,
  annualInterestRate,
  inflationRate = 0,
  milestones = [],
}) {
  const results = []
  let balance = netWorth
  const yearsActive = currentAge - 20 // for inflation calc

  for (let age = 20; age <= 80; age++) {
    // Inflation-adjusted savings (only from currentAge onward)
    const yearsFromNow = Math.max(0, age - currentAge)
    const adjustedMonthly = monthlySavings * Math.pow(1 + inflationRate, yearsFromNow)
    const annualSavings = age >= currentAge ? adjustedMonthly * 12 : 0

    // Compound interest on existing balance
    balance = balance * (1 + annualInterestRate) + annualSavings

    // Process milestones at this age
    const milestonesAtAge = milestones.filter(m => m.age === age)
    let shortfall = null

    for (const milestone of milestonesAtAge) {
      if (balance < milestone.cost) {
        shortfall = milestone.cost - balance
      }
      balance -= milestone.cost // drawdown regardless (goes negative = shortfall)
    }

    results.push({
      age,
      balance: Math.round(balance),
      milestones: milestonesAtAge,
      shortfall,
    })
  }

  return results
}
```

---

## 6. Insight Generator

```js
// src/utils/generateInsights.js

export function generateInsights(projectionData, milestones, monthlySavings) {
  const insights = []

  for (const milestone of milestones) {
    const point = projectionData.find(p => p.age === milestone.age)
    if (!point) continue

    if (point.shortfall && point.shortfall > 0) {
      // Calculate how much more savings needed
      const extraMonthlyNeeded = Math.ceil(point.shortfall / ((milestone.age - 28) * 12))
      insights.push({
        type: 'warning',
        text: `You're ₹${formatLakhs(point.shortfall)} short at age ${milestone.age} for "${milestone.label}". Save ₹${extraMonthlyNeeded.toLocaleString('en-IN')} more/month.`,
      })
    } else {
      // Find how early they hit it
      const earlyPoint = projectionData.find(p => p.age < milestone.age && p.balance >= milestone.cost)
      insights.push({
        type: 'success',
        text: `"${milestone.label}" is fully funded${earlyPoint ? ` — you'll hit it ${milestone.age - earlyPoint.age} years early` : ''}.`,
      })
    }
  }

  // Global insight
  const finalBalance = projectionData[projectionData.length - 1]?.balance
  if (finalBalance > 0) {
    insights.push({
      type: 'info',
      text: `At this rate, you'll retire at 60 with ₹${formatLakhs(finalBalance)} in savings.`,
    })
  }

  return insights.slice(0, 5)
}

function formatLakhs(amount) {
  if (amount >= 10000000) return `${(amount / 10000000).toFixed(1)}Cr`
  if (amount >= 100000) return `${(amount / 100000).toFixed(1)}L`
  return amount.toLocaleString('en-IN')
}
```

---

## 7. Tailwind Config

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: '#040810',
        surface: '#0a0f1e',
        elevated: '#111827',
        teal: {
          DEFAULT: '#00e5c7',
          muted: 'rgba(0,229,199,0.12)',
        },
        amber: {
          DEFAULT: '#f59e0b',
          muted: 'rgba(245,158,11,0.12)',
        },
        success: '#22c55e',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Syne', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s ease-out infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(245,158,11,0.4)' },
          '70%': { boxShadow: '0 0 0 10px rgba(245,158,11,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(245,158,11,0)' },
        },
      },
    },
  },
}
```

---

## 8. GSAP Key Usage Patterns

```jsx
// Hero entrance — runs once on mount
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

useGSAP(() => {
  gsap.from('.hero-title', { y: 50, opacity: 0, duration: 0.9, ease: 'expo.out' })
  gsap.from('.hero-sub',   { y: 30, opacity: 0, duration: 0.7, delay: 0.15, ease: 'expo.out' })
  gsap.from('.hero-cta',   { y: 20, opacity: 0, duration: 0.5, delay: 0.3, ease: 'expo.out' })
}, [])

// Milestone marker entrance (call after adding)
gsap.fromTo(ref.current,
  { scale: 0.7, opacity: 0 },
  { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(2)' }
)

// Insight card stagger
gsap.from('.insight-card', {
  y: 24, opacity: 0,
  stagger: 0.08,
  duration: 0.5,
  ease: 'expo.out'
})

// Zoom timeline transition
gsap.to('.timeline-inner', {
  width: newWidth,
  duration: 0.4,
  ease: 'power2.inOut',
  onUpdate: recalculateMarkerPositions
})
```

---

## 9. Category Constants

```js
// src/constants/categories.js
export const CATEGORIES = {
  housing: {
    label: 'Housing',
    colour: '#60a5fa',      // blue
    bgMuted: 'rgba(96,165,250,0.12)',
    icon: 'House',           // Phosphor icon name
  },
  vehicle: {
    label: 'Vehicle',
    colour: '#4ade80',      // green
    bgMuted: 'rgba(74,222,128,0.12)',
    icon: 'Car',
  },
  business: {
    label: 'Business',
    colour: '#a78bfa',      // purple
    bgMuted: 'rgba(167,139,250,0.12)',
    icon: 'Briefcase',
  },
  education: {
    label: 'Education',
    colour: '#f59e0b',      // amber
    bgMuted: 'rgba(245,158,11,0.12)',
    icon: 'GraduationCap',
  },
  travel: {
    label: 'Travel / Other',
    colour: '#fb7185',      // coral
    bgMuted: 'rgba(251,113,133,0.12)',
    icon: 'Airplane',
  },
}
```

---

## 10. Vercel Deployment

```bash
# Option A — Vercel CLI (fastest)
npm install -g vercel
vercel --prod

# Option B — GitHub integration
# 1. Push to GitHub repo
# 2. Go to vercel.com → New Project → Import repo
# 3. Framework preset: Vite → Deploy
# Build command: npm run build
# Output dir: dist
```

**Expected deploy time:** < 90 seconds

---

## 11. Build Order (6-hour sprint)

| Hour | Focus | Deliverable |
|------|-------|-------------|
| H1 (9–10am) | Setup | Vite + Tailwind + Zustand store + fonts + CSS vars wired |
| H2 (10–11am) | Timeline | Age axis 20–80, horizontal scroll, zoom buttons, empty milestone slots |
| H3 (11–12pm) | Projection | `simulateProjection` logic + Recharts arc overlay + milestone markers |
| H4 (12–1pm) | What-if + Shortfall | Sliders → live recalc, amber/green badges, milestone card editor |
| H5 (1–1:30pm) | Insights + Polish | `generateInsights`, GSAP entrances, insight cards, hero section |
| H6 (1:30–2pm) | Deploy | Vercel deploy, final demo run, README, GitHub push |

---

*TECHSTACK version 1.0 · Generated for HORIZON'26 Hackathon*
