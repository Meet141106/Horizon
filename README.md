# Project Horizon

> *See your life. Plan your wealth.*

Project Horizon is an interactive life milestone financial planner built for the HORIZON'26 Hackathon. It allows users to place life goals on a scrollable age-indexed timeline, input their monthly savings, and instantly see a compound interest projection arc that accounts for capital drawdowns.

![App Preview](horizon_app_timeline.webp)

## Features
- **Interactive Timeline**: Horizontally scrollable age axis (20–80) with 5Y/10Y/ALL zoom controls.
- **Draggable Milestones**: Add, edit, and position life goals (housing, vehicle, business, education, travel).
- **Compound Savings Projection**: A Recharts-powered simulation that accurately calculates sequential capital drawdowns.
- **Smart Feedback Engine**: Contextual insights based on shortfall/surplus calculations.
- **What-If Scenarios**: Real-time recalculation when tweaking savings, interest, and inflation.
- **Cinematic Aesthetic**: Dark mode fintech editorial design using Tailwind CSS and GSAP animations.

## Tech Stack
- **Framework**: React + Vite
- **Styling**: Tailwind CSS v3
- **State Management**: Zustand
- **Animations**: GSAP (`@gsap/react`)
- **Charts**: Recharts
- **Icons**: Phosphor Icons

## Local Development
1. Clone the repository.
2. Install dependencies:
```bash
npm install
```
3. Start the dev server:
```bash
npm run dev
```

## Deployment
This project is optimized for Vercel. To deploy:
```bash
npm install -g vercel
vercel --prod
```
