import React, { useState, useEffect } from 'react';
import { useHorizonStore } from '../../store/useHorizonStore';
import { CATEGORIES } from '../../constants/categories';
import { X, Trash } from '@phosphor-icons/react';

export default function MilestoneEditor({ milestoneId, onClose }) {
  const { milestones, updateMilestone, removeMilestone } = useHorizonStore();
  
  const [formData, setFormData] = useState({
    label: '',
    age: 30,
    cost: 0,
    category: 'housing'
  });

  useEffect(() => {
    const m = milestones.find(m => m.id === milestoneId);
    if (m) {
      setFormData({
        label: m.label,
        age: m.age,
        cost: m.cost,
        category: m.category
      });
    }
  }, [milestoneId, milestones]);

  if (!milestoneId) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMilestone(milestoneId, formData);
    onClose();
  };

  const handleDelete = () => {
    removeMilestone(milestoneId);
    onClose();
  };

  const inputStyle = {
    background: 'var(--elevated)',
    border: '0.5px solid var(--border)',
    borderRadius: '8px',
    padding: '10px 14px',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    width: '100%',
    outline: 'none'
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(4,8,16,0.8)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="w-full max-w-md shadow-2xl overflow-hidden relative"
        style={{ background: 'var(--surface)', border: '0.5px solid var(--border-hover)', borderRadius: '16px', padding: '28px' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-sans font-bold text-primary text-[16px]">Edit Milestone</h3>
          <button onClick={onClose} className="text-secondary hover:text-primary transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-sans text-[11px] text-secondary mb-1.5 uppercase tracking-wider font-bold">Goal Name</label>
            <input 
              type="text" 
              value={formData.label}
              onChange={e => setFormData({...formData, label: e.target.value})}
              style={inputStyle}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-sans text-[11px] text-secondary mb-1.5 uppercase tracking-wider font-bold">Age</label>
              <input 
                type="number" 
                min="20" max="80"
                value={formData.age}
                onChange={e => setFormData({...formData, age: Number(e.target.value)})}
                style={inputStyle}
                required
              />
            </div>
            <div>
              <label className="block font-sans text-[11px] text-secondary mb-1.5 uppercase tracking-wider font-bold">Cost (₹)</label>
              <input 
                type="number" 
                step="50000"
                value={formData.cost}
                onChange={e => setFormData({...formData, cost: Number(e.target.value)})}
                style={inputStyle}
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-sans text-[11px] text-secondary mb-1.5 uppercase tracking-wider font-bold">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => setFormData({...formData, category: key})}
                  className="transition-all"
                  style={{
                    background: formData.category === key ? 'rgba(0,229,199,0.1)' : 'transparent',
                    border: formData.category === key ? '0.5px solid var(--teal)' : '0.5px solid var(--border)',
                    color: formData.category === key ? 'var(--teal)' : 'var(--text-secondary)',
                    borderRadius: '8px',
                    padding: '8px',
                    fontFamily: 'var(--font-sans)',
                    fontSize: '12px'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 mt-6">
            <button 
              type="button" 
              onClick={handleDelete}
              className="flex items-center space-x-1 transition-colors hover:text-white"
              style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontFamily: 'var(--font-sans)' }}
            >
              <Trash size={16} />
              <span>Delete</span>
            </button>
            
            <div className="space-x-3 flex">
              <button 
                type="button" 
                onClick={onClose}
                className="transition-colors hover:text-white"
                style={{ background: 'transparent', border: '0.5px solid var(--border)', color: 'var(--text-secondary)', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontFamily: 'var(--font-sans)' }}
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="hover:opacity-90 transition-opacity"
                style={{ background: 'var(--teal)', color: '#040810', fontWeight: 700, borderRadius: '8px', padding: '10px 24px', border: 'none', fontSize: '13px', fontFamily: 'var(--font-sans)' }}
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
