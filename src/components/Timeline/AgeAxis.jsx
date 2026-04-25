import React from 'react';

export default function AgeAxis() {
  const ages = Array.from({ length: 61 }, (_, i) => i + 20); // 20 to 80

  return (
    <div className="absolute bottom-0 left-[5%] right-[5%] h-[40px] border-t pointer-events-none" style={{ borderColor: 'var(--border)' }}>
      {ages.map(age => {
        const isMajor = age % 5 === 0;
        const leftPercent = ((age - 20) / 60) * 100;
        
        return (
          <div 
            key={age} 
            className="absolute bottom-0 flex flex-col items-center justify-end"
            style={{ left: `${leftPercent}%`, transform: 'translateX(-50%)' }}
          >
            <span 
              className="absolute bottom-4" 
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: isMajor ? '12px' : '11px', 
                color: isMajor ? 'var(--text-secondary)' : 'var(--text-muted)',
                fontWeight: isMajor ? 500 : 400
              }}
            >
              {age}
            </span>
            <div className={`w-px ${isMajor ? 'h-3' : 'h-1.5'}`} style={{ background: 'var(--border-hover)' }} />
          </div>
        );
      })}
    </div>
  );
}
