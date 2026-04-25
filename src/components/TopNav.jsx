import React from 'react';
import './TopNav.css';

export default function TopNav({ currentView, onNavigate }) {
  return (
    <nav id="top-nav" className="glass">
      {/* Brand */}
      <div className="nav-brand" onClick={() => onNavigate('landing')}>
        <div className="brand-logo">
           <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="15" fill="#03050a" stroke="#00d2ff" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="6" fill="none" stroke="#00d2ff" strokeWidth="1.5"/>
            <line x1="16" y1="1" x2="16" y2="10" stroke="#00d2ff" strokeWidth="1.5"/>
            <line x1="16" y1="22" x2="16" y2="31" stroke="#00d2ff" strokeWidth="1.5"/>
            <line x1="1" y1="16" x2="10" y2="16" stroke="#00d2ff" strokeWidth="1.5"/>
            <line x1="22" y1="16" x2="31" y2="16" stroke="#00d2ff" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="2.5" fill="#00d2ff"/>
          </svg>
        </div>
        <span className="brand-text">URBAN<span style={{color: '#00d2ff', marginLeft: '5px'}}>LENS</span></span>
      </div>

      {/* Links */}
      <div className="nav-links">
        <button
          className={`nav-link ${currentView === 'map' ? 'active' : ''}`}
          onClick={() => onNavigate('map')}
        >
          CITY MAP
        </button>
        <button
          className={`nav-link ${currentView === 'kanban' ? 'active' : ''}`}
          onClick={() => onNavigate('kanban')}
        >
          KANBAN BOARD
        </button>
      </div>

      {/* Metrics */}
      <div className="nav-right desktop-only">
        <div className="metric">
          <span className="metric-label">REPORTS</span>
          <span className="metric-value">10</span>
        </div>
        <div className="metric">
          <span className="metric-label">RATE</span>
          <span className="metric-value">20%</span>
        </div>
      </div>
    </nav>
  );
}
