# PRD.md — Project Horizon
> PS-09 · HORIZON'26 Frontend Hackathon · Nexus Tech Committee

---

## 1. Project Overview

**Product Name:** Project Horizon  
**Tagline:** *See your life. Plan your wealth.*  
**Type:** Client-side Single Page Application (no backend)  
**Event:** HORIZON'26 — 6-hour frontend hackathon  
**Team Stack:** React + Vite, GSAP, Three.js, Tailwind CSS, Vercel

Project Horizon is an interactive life milestone financial planner. Users place life goals on a scrollable age-indexed timeline (ages 20–80), input monthly savings, and instantly see a compound interest projection arc that accounts for capital drawdowns at each milestone. A smart feedback system tells them exactly how far ahead or behind they are — and by how much.

---

## 2. Problem Statement

Most people have life goals (house, car, business, travel) but no intuitive way to see if their savings will actually get them there. Spreadsheets are inaccessible. Financial advisors are expensive. Generic calculators don't account for sequential spending and compounding loss.

**Project Horizon makes the invisible visible** — turning abstract savings into a living, breathing timeline.

---

## 3. Target Users

| User | Description |
|------|-------------|
| **Primary** | 22–35 year olds in India planning first major financial milestones |
| **Secondary** | Hackathon judges evaluating frontend excellence and product thinking |
| **Demo persona** | Aditya, 28, software engineer, wants to buy a house by 32 and start a studio by 35 |

---

## 4. Goals

### Product Goals
- Visualise compound savings vs. life milestones on a single timeline
- Show real-time shortfall/surplus at each milestone age
- Allow instant what-if recalculation when savings or costs change
- Surface actionable insights ("increase savings by ₹6,200/month to close gap")

### Hackathon Goals
- Demonstrate reactive state management with real financial logic
- Impress with interaction design: drag-to-place, animated arc, live feedback
- Ship a fully deployable, judge-demoable product in 6 hours

---

## 5. Core Features

### F1 — Interactive Timeline (Age Axis 20–80)
- Horizontally scrollable age axis
- Drag-and-drop milestone placement on the axis
- Three zoom levels: 5-year, 10-year, full-life view
- Animated axis rescaling on zoom switch
- Smooth momentum scroll

### F2 — Milestone Cards
- Click-to-open card editor: name, age, cost (₹), category
- Five categories: Housing, Vehicle, Business, Education, Travel/Other
- Category-specific colour + Phosphor icon per marker
- Inline edit, drag to reposition, click X to delete

### F3 — Compound Savings Projection Arc
- Forward simulation (year-by-year loop, not a flat formula)
- Correctly accounts for capital drawdown: milestone cost reduces future compounding base
- Inflation toggle: adjusts savings growth rate by configurable annual %
- Rendered as a smooth Recharts ComposedChart line overlaid on the timeline

### F4 — Shortfall Indicators
- Per-milestone contextual flag: Amber (shortfall) or Green (covered)
- Exact ₹ shortfall displayed on hover/tap
- "Years early/late" secondary indicator

### F5 — What-if Scenario Panel
- Monthly savings slider (₹5,000 – ₹1,00,000)
- Net worth baseline input
- Annual interest rate input (default 8%)
- Inflation toggle (default 6% p.a.)
- Every change triggers immediate full projection recalculation

### F6 — Smart Feedback System
- 3–5 contextual insight strings computed from projection data
- Examples:
  - *"You're ₹12L short at age 34. Save ₹6,200 more/month to close the gap."*
  - *"Your House milestone is fully funded. You're 2 years ahead of plan."*
  - *"After your Business launch, compounding drops — consider a 6-month savings boost."*

### F7 — Hero / Onboarding
- Age and current savings input on first load
- Animated entrance with GSAP stagger
- Optional: Three.js floating particle / abstract 3D object in hero background

---

## 6. User Stories

| ID | As a... | I want to... | So that... |
|----|---------|-------------|-----------|
| US-01 | User | Drag a milestone to age 32 on the timeline | I can visually place my house goal |
| US-02 | User | See a green/amber indicator on each milestone | I know instantly if I'm on track |
| US-03 | User | Change my monthly savings in real-time | I can explore scenarios without reloading |
| US-04 | User | Read a specific insight about my shortfall | I know exactly what to do next |
| US-05 | User | Zoom the timeline to 5-year view | I can focus on near-term milestones |
| US-06 | User | Toggle inflation on/off | I understand how purchasing power changes my plan |
| US-07 | Judge | See the projection arc update live | I can evaluate the reactive state architecture |

---

## 7. Out of Scope (for 6-hour MVP)

- Backend / database / auth
- Multi-user / sharing features
- PDF export (bonus only if time permits)
- Real market data API
- Mobile-first layout (desktop-first for demo)

---

## 8. Success Metrics (Hackathon)

| Metric | Target |
|--------|--------|
| Projection engine correctness | Drawdown simulation verified against manual calc |
| Live recalculation latency | < 16ms (one frame) on what-if change |
| Milestone drag interaction | Smooth at 60fps, no jank |
| Smart feedback accuracy | At least 3 distinct insight strings rendered |
| Deployment | Live Vercel URL submitted before 2:00 PM |

---

## 9. Assumptions

- All currency in Indian Rupees (₹)
- Interest compounded annually (monthly version is bonus)
- User age range: 20–80
- localStorage for state persistence between page refreshes
- No real financial advice — for planning/demo purposes only

---

*PRD version 1.0 · Generated for HORIZON'26 Hackathon*
