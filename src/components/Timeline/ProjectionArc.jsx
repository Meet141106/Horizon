import React from 'react';
import { useHorizonStore } from '../../store/useHorizonStore';
import { ResponsiveContainer, ComposedChart, Line, Area, YAxis } from 'recharts';

export default function ProjectionArc() {
  const { projectionData } = useHorizonStore();

  if (!projectionData.length) return null;

  return (
    <div className="absolute top-0 bottom-[40px] left-[5%] right-[5%] pointer-events-none">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <ComposedChart data={projectionData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <YAxis domain={['auto', 'auto']} hide />
          <Area 
            type="monotone" 
            dataKey="balance" 
            stroke="none" 
            fill="var(--accent-teal)" 
            fillOpacity={0.05} 
            isAnimationActive={false}
          />
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="var(--accent-teal)" 
            strokeWidth={2.5} 
            dot={false}
            isAnimationActive={true}
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
