import React from 'react';
import { useHorizonStore } from '../../store/useHorizonStore';
import AgeAxis from './AgeAxis';
import ProjectionArc from './ProjectionArc';
import MilestoneMarker from './MilestoneMarker';
import MilestoneEditor from './MilestoneEditor';
import { Plus } from '@phosphor-icons/react';

export default function TimelineCanvas() {
  const { zoom, milestones, editingMilestoneId, addMilestone, setEditingMilestone, updateMilestone } = useHorizonStore();

  const getWidth = () => {
    switch(zoom) {
      case '5Y': return '3600px';
      case '10Y': return '2400px';
      default: return '100%';
    }
  };

  const handleAddNew = () => {
    const newId = Date.now().toString();
    addMilestone({
      id: newId,
      label: 'New Goal',
      age: 35,
      cost: 500000,
      category: 'travel'
    });
    setEditingMilestone(newId);
  };

  return (
    <div 
      className="w-full h-[360px] custom-scrollbar relative overflow-x-auto overflow-y-hidden"
      style={{ borderTop: '1px solid var(--teal)', boxShadow: '0 -1px 20px rgba(0,229,199,0.15)', background: 'var(--surface)' }}
    >
      <button 
        onClick={handleAddNew}
        className="absolute top-4 right-4 z-50 bg-white/5 border border-white/10 hover:border-teal hover:text-teal text-secondary transition-all rounded-full p-2"
        title="Add Milestone"
      >
        <Plus size={20} />
      </button>

      <div 
        className="timeline-inner relative h-full min-w-full transition-all duration-500 ease-in-out"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData('text/plain');
          if (id) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            let percent = x / rect.width;
            let age = Math.round(((percent - 0.05) / 0.9) * 60 + 20);
            age = Math.max(20, Math.min(80, age));
            updateMilestone(id, { age });
          }
        }}
        style={{ width: getWidth() }}
      >
        <ProjectionArc />
        <AgeAxis />
        
        <div className="absolute top-0 bottom-[40px] left-[5%] right-[5%]">
          {milestones.map(m => (
            <MilestoneMarker key={m.id} milestone={m} />
          ))}
        </div>
      </div>
      
      <MilestoneEditor 
        milestoneId={editingMilestoneId} 
        onClose={() => setEditingMilestone(null)} 
      />
    </div>
  );
}
