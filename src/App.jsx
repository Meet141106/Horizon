import React from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import WhatIfPanel from './components/WhatIfPanel'
import InsightCards from './components/InsightCards'
import TimelineCanvas from './components/Timeline/TimelineCanvas'
import ZoomControls from './components/ZoomControls'

function App() {
  return (
    <div className="min-h-screen bg-void text-primary font-sans antialiased pb-20">
      <Navbar />
      <Hero />
      
      <ZoomControls />
      <TimelineCanvas />

      <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-6 mt-12">
        <div className="md:col-span-5">
          <WhatIfPanel />
        </div>
        <div className="md:col-span-7">
          <InsightCards />
        </div>
      </div>
    </div>
  )
}

export default App
