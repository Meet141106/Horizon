import React from 'react';

export default function Navbar() {
  return (
    <nav 
      className="flex items-center justify-between px-8"
      style={{
        height: '60px',
        background: 'rgba(4,8,16,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      <div 
        style={{
          fontFamily: 'var(--font-sans)',
          fontWeight: 800,
          fontSize: '18px',
          color: 'var(--text-primary)',
          letterSpacing: '0.08em'
        }}
      >
        HORIZON'26
      </div>
    </nav>
  );
}
