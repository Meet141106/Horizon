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
  milestones: [
    { id: '1', label: 'First Car', age: 30, cost: 800000, category: 'vehicle' },
    { id: '2', label: 'Buy House', age: 34, cost: 6000000, category: 'housing' }
  ],

  // Computed
  projectionData: [],
  zoom: 'ALL', // '5Y' | '10Y' | 'ALL'
  editingMilestoneId: null,

  // Actions
  setEditingMilestone: (id) => set({ editingMilestoneId: id }),
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

// Initial recalculation
useHorizonStore.getState().recalculate()
