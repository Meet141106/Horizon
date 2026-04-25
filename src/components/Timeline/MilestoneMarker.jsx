import React from 'react';
import { useHorizonStore } from '../../store/useHorizonStore';

export default function MilestoneMarker({ milestone }) {
  const { projectionData, setEditingMilestone } = useHorizonStore();

  const leftPercent = ((milestone.age - 20) / 60) * 100;
  const point = projectionData.find(p => p.age === milestone.age);
  const isShortfall = point && point.shortfall > 0;
  
  return (
    <div 
      className="absolute top-[40px] bottom-[0px] flex flex-col items-center justify-end cursor-pointer group z-20"
      style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)' }}
      onClick={() => setEditingMilestone(milestone.id)}
      draggable="true"
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', milestone.id);
      }}
    >
      {/* Tooltip */}
      <div className="absolute bottom-full mb-[60px] opacity-0 group-hover:opacity-100 transition-opacity bg-elevated border border-white/10 rounded-lg p-2 text-center pointer-events-none w-max z-50 shadow-xl backdrop-blur-md">
        {isShortfall ? (
          <div className="text-amber text-[11px] font-bold">Short by ₹{point.shortfall.toLocaleString('en-IN')}</div>
        ) : (
          <div className="text-success text-[11px] font-bold">
            Covered! {point?.balance >= milestone.cost ? `(₹${(point.balance - milestone.cost).toLocaleString('en-IN')} left)` : ''}
          </div>
        )}
      </div>

      <div 
        className="mb-2 whitespace-nowrap text-primary shadow-lg transition-transform group-hover:scale-105"
        style={{ 
          background: 'var(--surface)', 
          border: '0.5px solid var(--border-hover)', 
          borderRadius: '8px', 
          padding: '6px 10px', 
          fontFamily: 'var(--font-sans)', 
          fontSize: '12px' 
        }}
      >
        {milestone.label}
      </div>
      
      <div className="w-px flex-grow opacity-30 bg-white" />
      
      <div 
        className={`mt-2 mb-[-6px] ${isShortfall ? 'shortfall-pulse' : 'funded-glow'}`}
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: isShortfall ? 'var(--amber)' : 'var(--teal)',
          border: isShortfall ? '2px solid rgba(245,158,11,0.3)' : '2px solid rgba(0,229,199,0.3)'
        }}
      />
    </div>
  );
}
