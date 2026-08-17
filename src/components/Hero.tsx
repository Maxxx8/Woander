import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PHILOSOPHY_LINES = [
  "The map is never the territory.",
  "Curiosity precedes discovery.",
  "Some places reveal themselves only to those who seek.",
  "Travel slower. Discover deeper.",
];

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const [philosophyIndex, setPhilosophyIndex] = useState(0);
  const [philosophyVisible, setPhilosophyVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhilosophyVisible(false);
      setTimeout(() => {
        setPhilosophyIndex(i => (i + 1) % PHILOSOPHY_LINES.length);
        setPhilosophyVisible(true);
      }, 600);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-bg-image',
        { scale: 1.08, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.0, ease: 'power2.out' }
      )
      .fromTo('.hero-topline',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1.0, delay: 0.6 }
      )
      .fromTo('.hero-headline',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2 },
        '-=0.7'
      )
      .fromTo('.hero-sub',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.7'
      )
      .fromTo('.hero-supporting',
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      )
      .fromTo('.hero-cta',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )
      .fromTo('.hero-secondary-cta',
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        '-=0.3'
      )
      .fromTo('.hero-scroll-indicator',
        { opacity: 0 },
        { opacity: 1, duration: 0.8 },
        '-=0.3'
      );

      if (imgRef.current) {
        gsap.to('.hero-bg-image', {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative h-screen min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#F5F1E8' }}
    >
      {/* Bright, warm cinematic background image */}
      <div ref={imgRef} className="absolute inset-0 z-0 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=2400"
          alt=""
          className="hero-bg-image w-full h-full object-cover"
          style={{ filter: 'brightness(1.15) saturate(1.15) contrast(1.0) sepia(0.06)' }}
        />
      </div>

      {/* Single subtle warm overlay for text readability — no competing layers */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(245,241,232,0.45) 0%, rgba(245,241,232,0.12) 35%, rgba(245,241,232,0.15) 55%, rgba(245,241,232,0.5) 100%)',
        }}
      />

      {/* Main content — generous breathing room, slightly above center */}
      <div
        className="relative z-10 text-center max-w-3xl mx-auto px-6"
        style={{ transform: 'translateY(-3vh)' }}
      >
        {/* Eyebrow */}
        <p
          className="hero-topline opacity-0 font-mono text-[11px] tracking-[0.28em] uppercase mb-10"
          style={{ color: '#71877A' }}
        >
          Some places are still undiscovered
        </p>

        {/* Main headline — the dominant focal point */}
        <h1
          className="hero-headline opacity-0 font-display text-7xl sm:text-8xl md:text-9xl font-medium leading-[1.0] mb-8 tracking-tight"
          style={{ color: '#243A34' }}
        >
          Woander.
        </h1>

        {/* Sub headline — italic terracotta */}
        <p
          className="hero-sub opacity-0 font-display italic text-3xl sm:text-4xl md:text-5xl font-light mb-10"
          style={{ color: '#B97862' }}
        >
          Travel deeper.
        </p>

        {/* Supporting text */}
        <p
          className="hero-supporting opacity-0 text-sm sm:text-base max-w-md mx-auto mb-14 leading-relaxed font-light"
          style={{ color: '#27302D' }}
        >
          Discover places, people and stories that don't appear on the usual map.
        </p>

        {/* CTAs — clear primary/secondary hierarchy */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
          <button
            onClick={() => navigate('/hidden-gems')}
            className="hero-cta opacity-0 px-12 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
            style={{
              border: '1px solid #243A34',
              backgroundColor: '#F5F1E8',
              color: '#243A34',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#243A34'; e.currentTarget.style.color = '#F5F1E8'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F5F1E8'; e.currentTarget.style.color = '#243A34'; }}
          >
            Explore India
          </button>

          <button
            onClick={() => navigate('/vanguard')}
            className="hero-secondary-cta opacity-0 group font-display text-base tracking-wide transition-colors duration-300"
            style={{ color: '#27302D' }}
          >
            <span className="border-b pb-0.5 transition-all duration-300 group-hover:border-terracotta" style={{ borderColor: 'rgba(36,58,52,0.2)' }}>
              Meet the Vanguard
            </span>
          </button>
        </div>
      </div>

      {/* Rotating philosophy line — very quiet */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[3] text-center pointer-events-none hidden md:block">
        <p
          className="font-display italic text-sm transition-all duration-500"
          style={{
            color: 'rgba(36,58,52,0.35)',
            opacity: philosophyVisible ? 1 : 0,
            transform: philosophyVisible ? 'translateY(0)' : 'translateY(6px)',
          }}
        >
          "{PHILOSOPHY_LINES[philosophyIndex]}"
        </p>
      </div>

      {/* Scroll indicator — minimal */}
      <button
        onClick={scrollDown}
        className="hero-scroll-indicator opacity-0 absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-3"
        style={{ color: 'rgba(36,58,52,0.4)' }}
        aria-label="Scroll down"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Scroll to explore</span>
        <div
          className="w-px h-8"
          style={{
            background: 'linear-gradient(to bottom, rgba(36,58,52,0.35), transparent)',
            animation: 'descend 2.5s ease-in-out infinite',
          }}
        />
      </button>

      <style>{`
        @keyframes descend {
          0%, 100% { transform: scaleY(1); opacity: 0.3; }
          50% { transform: scaleY(1.4); opacity: 0.5; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
