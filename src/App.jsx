import React, { useState } from 'react';
import TopNav from './components/TopNav.jsx';
import LandingPage from './landing/LandingPage.jsx';
import CityMapView from './views/CityMapView.jsx';
import KanbanView from './views/KanbanView.jsx';

/*
  Views:
    'landing'  → Drone scrollytelling hero
    'map'      → 3D City Map (Three.js)
    'kanban'   → Issue Board (Kanban)
*/

export default function App() {
  const [view, setView] = useState('landing');

  return (
    <>
      <TopNav currentView={view} onNavigate={setView} />

      {view === 'landing' && <LandingPage onEnter={() => setView('map')} />}
      {view === 'map'     && <CityMapView />}
      {view === 'kanban'  && <KanbanView />}
    </>
  );
}
