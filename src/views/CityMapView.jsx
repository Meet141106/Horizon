import React, { useRef, useState, useEffect } from 'react';
import { usePolisState, addIssue, COLOR_MAP } from '../state.js';
import './CityMap.css';

const VIEWBOX_WIDTH = 1000;
const VIEWBOX_HEIGHT = 800;

const CITY_ZONES = [
  { id: 'industrial', name: 'Industrial Belt', points: '50,50 450,50 450,350 50,350', color: '#1a1f2c', stroke: '#00d2ff' },
  { id: 'residential', name: 'Residential Ring', points: '500,50 950,50 950,450 500,450', color: '#16212e', stroke: '#4caf50' },
  { id: 'market', name: 'Neon Market', points: '50,400 450,400 450,750 50,750', color: '#251a2c', stroke: '#ffde00' },
  { id: 'park', name: 'Park Sector', points: '500,500 700,500 700,750 500,750', color: '#1a2c1f', stroke: '#00ff66' },
  { id: 'civic', name: 'Civic Core', points: '750,500 950,500 950,750 750,750', color: '#2c1a1a', stroke: '#ff2a2a' },
];

export default function CityMapView() {
  const state = usePolisState();
  const [issues, setIssues] = useState(state.issues);
  const [showForm, setShowForm] = useState(false);
  const [targetCoords, setTargetCoords] = useState(null);
  
  // Pan & Zoom State
  const [viewState, setViewState] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  
  const mapRef = useRef(null);
  const titleRef = useRef();
  const categoryRef = useRef();

  useEffect(() => {
    import('../state.js').then(({ subscribe }) => {
      const unsub = subscribe((s) => setIssues(s.issues));
      return () => unsub();
    });
  }, []);

  // Handle Pan (Drag)
  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMouse.x;
    const dy = e.clientY - lastMouse.y;
    setViewState(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    setLastMouse({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Handle Zoom (Wheel)
  const handleWheel = (e) => {
    // Zoom toward cursor implementation
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(viewState.scale * delta, 0.4), 4);
    
    // Calculate mouse position relative to SVG layer before zoom
    const rect = mapRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Adjust x and y to zoom towards mouse point
    const dx = (mouseX - viewState.x) * (1 - delta);
    const dy = (mouseY - viewState.y) * (1 - delta);

    setViewState(prev => ({
      x: prev.x + dx,
      y: prev.y + dy,
      scale: newScale
    }));
  };

  // Coordinate Unprojection (Screen to SVG Viewbox)
  const getMapCoords = (clientX, clientY) => {
    const rect = mapRef.current.getBoundingClientRect();
    // Normalize to 0-1 within the screen element
    const normX = (clientX - rect.left - viewState.x) / (rect.width * viewState.scale);
    const normY = (clientY - rect.top - viewState.y) / (rect.height * viewState.scale);
    
    // Map to viewbox
    return {
      x: normX * VIEWBOX_WIDTH,
      y: normY * VIEWBOX_HEIGHT
    };
  };

  const handleMapClick = (e) => {
    // If we just finished a drag, don't trigger a click
    const dx = Math.abs(e.clientX - lastMouse.x);
    const dy = Math.abs(e.clientY - lastMouse.y);
    if (dx > 5 || dy > 5) return;

    const coords = getMapCoords(e.clientX, e.clientY);
    setTargetCoords(coords);
    setShowForm(true);
  };

  const submitIssue = () => {
    const title = titleRef.current.value;
    const category = categoryRef.current.value;
    if (!title || !targetCoords) return;

    addIssue({
      title,
      category,
      x: targetCoords.x,
      z: targetCoords.y, // Using y as z for the state
    });

    setShowForm(false);
    setTargetCoords(null);
  };

  return (
    <div 
      className="city-map-container fade-in"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      ref={mapRef}
      style={{ cursor: isDragging ? 'grabbing' : 'crosshair' }}
    >
      <div 
        className="svg-layer"
        style={{
          transform: `translate(${viewState.x}px, ${viewState.y}px) scale(${viewState.scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
        onClick={handleMapClick}
      >
        <svg 
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          width={VIEWBOX_WIDTH}
          height={VIEWBOX_HEIGHT}
          className="city-svg"
        >
          {/* Grid Background */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,210,255,0.1)" strokeWidth="1"/>
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="#03050a" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Zones */}
          {CITY_ZONES.map(zone => (
            <g key={zone.id}>
              <polygon 
                points={zone.points} 
                fill={zone.color} 
                stroke={zone.stroke} 
                strokeWidth="2"
                style={{ opacity: 0.4 }}
                className="zone-polygon"
              />
              <text 
                x={parseInt(zone.points.split(' ')[0].split(',')[0]) + 10} 
                y={parseInt(zone.points.split(' ')[0].split(',')[1]) + 25} 
                fill={zone.stroke}
                className="zone-label"
              >
                {zone.name}
              </text>
            </g>
          ))}

          {/* Pins */}
          {issues.map(issue => (
            <g 
              key={issue.id} 
              transform={`translate(${issue.x}, ${issue.z})`}
              className="pin-group"
            >
              <circle r="12" fill={COLOR_MAP[issue.category]} className="pin-circle" filter="url(#glow)" />
              <circle r="22" fill={COLOR_MAP[issue.category]} style={{ opacity: 0.15 }} className="pin-pulse" />
              <text y="-25" textAnchor="middle" className="pin-text">{issue.title}</text>
            </g>
          ))}
        </svg>
      </div>

      {/* Add Issue Form Overlay */}
      {showForm && (
        <div id="add-issue-form" className="glass slide-in" onClick={e => e.stopPropagation()}>
          <h2 style={{ fontSize: '1rem', color: 'var(--cyan)', marginBottom: '10px' }}>LOG SECTOR REPORT</h2>
          <p style={{ fontSize: '0.7rem', color: '#8892b0', marginBottom: '15px' }}>
            SECTOR COORDS: [{Math.round(targetCoords.x)}, {Math.round(targetCoords.y)}]
          </p>
          <input ref={titleRef} type="text" placeholder="Describe the issue..." autoFocus />
          <select ref={categoryRef}>
            <option value="infrastructure">Infrastructure</option>
            <option value="sanitation">Sanitation</option>
            <option value="safety">Safety</option>
            <option value="greenery">Greenery</option>
          </select>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="glass-btn" onClick={submitIssue} style={{ background: 'var(--cyan)', color: '#000', flex: 1 }}>
              PIN TO MAP
            </button>
            <button className="glass-btn" onClick={() => setShowForm(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)' }}>
              CANCEL
            </button>
          </div>
        </div>
      )}

      <div className="map-legend glass">
        <div className="legend-item"><span className="dot" style={{ background: '#00d2ff' }}></span> Industrial</div>
        <div className="legend-item"><span className="dot" style={{ background: '#4caf50' }}></span> Residential</div>
        <div className="legend-item"><span className="dot" style={{ background: '#ffde00' }}></span> Market</div>
        <div className="legend-item"><span className="dot" style={{ background: '#ff2a2a' }}></span> Civic</div>
      </div>

      <div className="map-controls-hint glass">
        SCROLL TO ZOOM • DRAG TO PAN • CLICK TO PIN
      </div>
    </div>
  );
}
