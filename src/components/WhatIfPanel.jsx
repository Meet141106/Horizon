import React from 'react';
import { useHorizonStore } from '../store/useHorizonStore';

export default function WhatIfPanel() {
  const { 
    currentAge, 
    netWorth,
    monthlySavings, 
    annualInterestRate, 
    inflationEnabled,
    setParam 
  } = useHorizonStore();

  return (
    <div className="bg-glass border border-white/10 rounded-xl p-6 h-full">
      <h3 className="font-sans font-bold text-[11px] uppercase tracking-[0.12em] text-teal mb-6">What-If Scenarios</h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="font-sans text-[11px] text-secondary">Current Age</label>
              <span className="font-mono text-[12px] text-teal">{currentAge}</span>
            </div>
            <input 
              type="range" 
              min="20" 
              max="60" 
              step="1"
              value={currentAge}
              onChange={(e) => setParam('currentAge', Number(e.target.value))}
              className="w-full accent-teal"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="font-sans text-[11px] text-secondary">Current Savings</label>
              <span className="font-mono text-[12px] text-teal">₹{(netWorth/100000).toFixed(1)}L</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="5000000" 
              step="50000"
              value={netWorth}
              onChange={(e) => setParam('netWorth', Number(e.target.value))}
              className="w-full accent-teal"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="font-sans text-[13px] text-secondary">Monthly Savings</label>
            <span className="font-mono text-[14px] text-teal">₹{monthlySavings.toLocaleString('en-IN')}</span>
          </div>
          <input 
            type="range" 
            min="5000" 
            max="200000" 
            step="5000"
            value={monthlySavings}
            onChange={(e) => setParam('monthlySavings', Number(e.target.value))}
            className="w-full accent-teal"
          />
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <label className="font-sans text-[13px] text-secondary">Annual Interest Rate</label>
            <span className="font-mono text-[14px] text-teal">{(annualInterestRate * 100).toFixed(1)}%</span>
          </div>
          <input 
            type="range" 
            min="0.04" 
            max="0.20" 
            step="0.01"
            value={annualInterestRate}
            onChange={(e) => setParam('annualInterestRate', Number(e.target.value))}
            className="w-full accent-teal"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <label className="font-sans text-[13px] text-secondary">Account for Inflation (6% p.a.)</label>
          <input 
            type="checkbox" 
            checked={inflationEnabled}
            onChange={(e) => setParam('inflationEnabled', e.target.checked)}
            className="accent-teal w-4 h-4 rounded border-gray-300"
          />
        </div>
      </div>
    </div>
  );
}
