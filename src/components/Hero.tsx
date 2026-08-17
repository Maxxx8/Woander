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

      tl.fromTo('.hero-image-wrap',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.4, ease: 'power2.out' }
      )
      .fromTo('.hero-topline',
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.9, delay: 0.4 }
      )
      .fromTo('.hero-headline',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1.1 },
        '-=0.6'
      )
      .fromTo('.hero-sub',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      )
      .fromTo('.hero-supporting',
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )
      .fromTo('.hero-cta',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
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
          yPercent: 8,
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
      className="relative min-h-screen flex flex-col items-center justify-center"
      style={{ backgroundColor: '#F6F2E9', paddingTop: '7rem' }}
    >
      {/* Contained hero photograph — sits on the cream canvas */}
      <div
        className="hero-image-wrap relative w-full max-w-[1300px] mx-auto px-6 sm:px-10 lg:px-16"
        style={{ opacity: 0 }}
      >
        <div
          ref={imgRef}
          className="relative overflow-hidden w-full"
          style={{
            height: 'min(78vh, 720px)',
            borderRadius: '12px',
            border: '1px solid rgba(38,61,53,0.08)',
            boxShadow: '0 4px 24px rgba(38,61,53,0.08)',
          }}
        >
          <img
            src="https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=2400"
            alt=""
            className="hero-bg-image w-full h-full object-cover"
            style={{ filter: 'brightness(1.18) saturate(1.15) contrast(1.0) sepia(0.05)' }}
          />

          {/* Subtle localized gradient behind text — not a full dark overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(38,61,53,0.15) 0%, transparent 25%, transparent 60%, rgba(38,61,53,0.35) 100%)',
            }}
          />
        </div>

        {/* Content layered over the photograph — centered, with generous spacing */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-6"
          style={{ paddingTop: '2rem' }}
        >
          {/* Eyebrow */}
          <p
            className="hero-topline opacity-0 font-mono text-[11px] tracking-[0.28em] uppercase mb-8"
            style={{ color: 'rgba(246,242,233,0.85)', textShadow: '0 1px 8px rgba(38,61,53,0.3)' }}
          >
            Some places are still undiscovered
          </p>

          {/* Main headline — the dominant focal point */}
          <h1
            className="hero-headline opacity-0 font-display text-6xl sm:text-7xl md:text-8xl font-medium leading-[1.0] mb-6 tracking-tight"
            style={{ color: '#F6F2E9', textShadow: '0 2px 20px rgba(38,61,53,0.4)' }}
          >
            Woander.
          </h1>

          {/* Sub headline — italic terracotta */}
          <p
            className="hero-sub opacity-0 font-display italic text-2xl sm:text-3xl md:text-4xl font-light mb-8"
            style={{ color: '#E7D9C5', textShadow: '0 1px 12px rgba(38,61,53,0.35)' }}
          >
            Travel deeper.
          </p>

          {/* Supporting text */}
          <p
            className="hero-supporting opacity-0 text-sm sm:text-base max-w-md mb-12 leading-relaxed font-light"
            style={{ color: 'rgba(246,242,233,0.9)', textShadow: '0 1px 8px rgba(38,61,53,0.3)' }}
          >
            Discover places, people and stories that don't appear on the usual map.
          </p>

          {/* CTAs — clear primary/secondary hierarchy */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            <button
              onClick={() => navigate('/hidden-gems')}
              className="hero-cta opacity-0 px-10 py-3.5 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
              style={{
                backgroundColor: '#263D35',
                color: '#F6F2E9',
                border: '1px solid #263D35',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.border = '1px solid rgba(246,242,233,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#263D35'; e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.border = '1px solid #263D35'; }}
            >
              Explore India
            </button>

            <button
              onClick={() => navigate('/vanguard')}
              className="hero-secondary-cta opacity-0 group font-display text-base tracking-wide transition-colors duration-300"
              style={{ color: 'rgba(246,242,233,0.85)' }}
            >
              <span className="border-b pb-0.5 transition-all duration-300 group-hover:border-[#E7D9C5]" style={{ borderColor: 'rgba(246,242,233,0.3)' }}>
                Meet the Vanguard →
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Rotating philosophy line — very quiet, below the image */}
      <div className="mt-10 text-center pointer-events-none hidden md:block">
        <p
          className="font-display italic text-sm transition-all duration-500"
          style={{
            color: 'rgba(48,51,47,0.35)',
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
        className="hero-scroll-indicator opacity-0 mt-8 mb-6 flex flex-col items-center gap-3"
        style={{ color: 'rgba(48,51,47,0.35)' }}
        aria-label="Scroll down"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Scroll to explore</span>
        <div
          className="w-px h-8"
          style={{
            background: 'linear-gradient(to bottom, rgba(48,51,47,0.3), transparent)',
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
