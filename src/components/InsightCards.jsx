import React, { useMemo, useRef } from 'react';
import { useHorizonStore } from '../store/useHorizonStore';
import { generateInsights } from '../utils/generateInsights';
import { WarningCircle, CheckCircle, Info } from '@phosphor-icons/react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

export default function InsightCards() {
  const { projectionData, milestones, currentAge } = useHorizonStore();
  const container = useRef();

  const insights = useMemo(() => {
    if (!projectionData.length) return [];
    return generateInsights(projectionData, milestones, currentAge);
  }, [projectionData, milestones, currentAge]);

  useGSAP(() => {
    if (insights.length > 0) {
      gsap.from('.insight-card', {
        y: 20, 
        opacity: 0, 
        stagger: 0.08, 
        duration: 0.5, 
        ease: 'expo.out',
        clearProps: 'all'
      });
    }
  }, { scope: container, dependencies: [insights] });

  const getIcon = (type) => {
    switch(type) {
      case 'warning': return <WarningCircle size={20} color="var(--amber)" />;
      case 'success': return <CheckCircle size={20} color="var(--green)" />;
      default: return <Info size={20} color="var(--teal)" />;
    }
  };

  const getBorderColor = (type) => {
    switch(type) {
      case 'warning': return 'var(--amber)';
      case 'success': return 'var(--green)';
      default: return 'var(--teal)';
    }
  };

  const formatText = (text) => {
    if (!text) return null;
    return text.split(/(₹[\d,]+(?:\.\d+)?[A-Za-z]*)/g).map((part, i) => {
      if (part.startsWith('₹')) {
        return <span key={i} style={{ fontFamily: 'var(--font-mono)', color: 'var(--teal)', fontSize: '18px', fontWeight: 500 }}>{part}</span>;
      }
      return part;
    });
  };

  return (
    <div ref={container} className="flex flex-col space-y-4">
      {insights.map((insight, idx) => (
        <div 
          key={idx} 
          className="insight-card flex items-start space-x-3"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '0.5px solid var(--border)',
            borderLeft: `3px solid ${getBorderColor(insight.type)}`,
            borderRadius: '0 12px 12px 0',
            padding: '14px 16px'
          }}
        >
          <div className="mt-0.5 shrink-0">
            {getIcon(insight.type)}
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.5 }}>
              {formatText(insight.text)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
