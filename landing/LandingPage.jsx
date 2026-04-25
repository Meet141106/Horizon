import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './LandingPage.css';

gsap.registerPlugin(ScrollTrigger);

export default function LandingPage({ onEnter, onScroll }) {
  const wrapperRef = useRef();

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrapperRef.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => onScroll(self.progress)
      });
      
      // Reset scroll position and refresh triggers on mount
      window.scrollTo(0, 0);
      ScrollTrigger.refresh();
    }, wrapperRef);
    
    return () => {
      ctx.revert();
      // WIPE ALL TRIGGERS to prevent zombie memory leaks
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [onScroll]);

  return (
    <div className="landing-wrapper" ref={wrapperRef}>
      {/* 3D Canvas is now persistent in App.jsx */}

      {/* Scrolling Content Overlay */}
      <div className="landing-scroll-content">
        
        <div className="hero-section">
          <h1 className="hero-title">POLIS NEXUS</h1>
          <p className="hero-subtitle">
            The next evolution in spatial civic reporting and administrative accountability.
          </p>
          <div className="scroll-indicator">
            <span>Scroll to Deploy Drone</span>
            <div className="mouse-icon"><div className="wheel"></div></div>
          </div>
        </div>

        <div className="middle-section">
          <div className="glass info-card">
            <h3>High-Fidelity 3D Ecosystem</h3>
            <p>Navigate a procedural digital twin of your city with real-time geospatial awareness.</p>
          </div>
          <div className="glass info-card">
            <h3>Cyber-Noir Aesthetics</h3>
            <p>Glassmorphic interface layered over a photorealistic, neon-lit civic grid.</p>
          </div>
        </div>

        <div className="final-section">
          <h2>System Ready for Deployment</h2>
          <p>The drone has reached the sector. Establish uplink to map view.</p>
          <button className="glass-btn enter-btn" onClick={onEnter}>
            INITIALIZE SYSTEM
          </button>
        </div>

      </div>
    </div>
  );
}
