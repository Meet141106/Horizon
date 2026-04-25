import React from 'react';
import { useHorizonStore } from '../store/useHorizonStore';

export default function ZoomControls() {
  const { zoom, setZoom } = useHorizonStore();
  const options = ['5Y', '10Y', 'ALL'];

  return (
    <div className="flex bg-glass border border-white/10 rounded-lg p-1 w-fit mx-auto mb-6">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => setZoom(opt)}
          className={`px-4 py-1.5 rounded-md text-[13px] font-sans font-bold transition-all ${
            zoom === opt 
              ? 'bg-teal/10 text-teal' 
              : 'text-secondary hover:text-primary'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
