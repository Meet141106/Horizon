import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { useHorizonStore } from '../store/useHorizonStore';

export default function Hero() {
  const container = useRef();
  const canvasRef = useRef(null);
  const { currentAge, monthlySavings, setParam } = useHorizonStore();

  useGSAP(() => {
    gsap.from('.hero-title', { y: 50, opacity: 0, duration: 1, ease: 'expo.out' });
    gsap.from('.hero-sub', { y: 20, opacity: 0, duration: 0.6, delay: 0.2, ease: 'expo.out' });
    gsap.from('.hero-inputs', { y: 20, opacity: 0, duration: 0.6, delay: 0.4, ease: 'expo.out' });
  }, { scope: container });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const particles = Array.from({ length: 60 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.5 + 0.1
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 199, ${p.alpha})`;
        ctx.fill();
      });
      
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section ref={container} className="relative w-full min-h-screen flex flex-col items-center justify-center bg-[var(--void)] overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />
      <div className="absolute z-0 w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(0,229,199,0.06) 0%, transparent 70%)' }} />
      
      <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-4xl mx-auto mt-[-60px]">
        <div className="section-label">PROJECT HORIZON · HORIZON'26</div>
        <h1 className="hero-title text-[#f8fafc] text-center mb-6 whitespace-pre-line" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(52px, 8vw, 92px)', lineHeight: 1.05 }}>
          {"See your life.\nPlan your wealth."}
        </h1>
        <p className="hero-sub text-center max-w-xl mb-12" style={{ fontFamily: 'var(--font-sans)', fontSize: '18px', color: 'var(--text-secondary)' }}>
          Place your life goals on a timeline. Watch your savings race to meet them.
        </p>
        
        <div className="hero-inputs flex flex-col sm:flex-row items-center gap-[12px]">
          <input 
            type="number" 
            placeholder="Your age" 
            value={currentAge || ''}
            onChange={(e) => setParam('currentAge', Number(e.target.value))}
            style={{ background: 'var(--surface)', border: '0.5px solid var(--border-hover)', borderRadius: '10px', padding: '12px 20px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
            className="w-[120px] outline-none focus:border-[var(--teal)] transition-colors text-center"
          />
          <input 
            type="number" 
            placeholder="₹ Monthly savings" 
            value={monthlySavings || ''}
            onChange={(e) => setParam('monthlySavings', Number(e.target.value))}
            style={{ background: 'var(--surface)', border: '0.5px solid var(--border-hover)', borderRadius: '10px', padding: '12px 20px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}
            className="w-[220px] outline-none focus:border-[var(--teal)] transition-colors"
          />
          <button 
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            style={{ background: 'var(--teal)', color: '#040810', fontFamily: 'var(--font-sans)', fontWeight: 700, borderRadius: '10px', padding: '12px 32px' }}
            className="hover:opacity-90 transition-opacity whitespace-nowrap border-none cursor-pointer"
          >
            BUILD MY TIMELINE →
          </button>
        </div>
      </div>
    </section>
  );
}
