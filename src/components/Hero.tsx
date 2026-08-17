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

const discoveryNodes = [
  { top: '28%', left: '14%', label: '10.8505° N, 76.2711° E' },
  { top: '65%', left: '78%', label: '11.6854° N, 75.9912° E' },
  { top: '50%', left: '88%', label: '9.2648° N, 76.7870° E' },
];

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);
  const [philosophyIndex, setPhilosophyIndex] = useState(0);
  const [philosophyVisible, setPhilosophyVisible] = useState(true);
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);

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
        { scale: 1.1, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2.0, ease: 'power2.out' }
      )
      .fromTo('.hero-topline',
        { opacity: 0, y: 20, letterSpacing: '0.4em' },
        { opacity: 1, y: 0, letterSpacing: '0.25em', duration: 1.2, delay: 0.5 }
      )
      .fromTo('.hero-headline',
        { opacity: 0, y: 50, filter: 'blur(6px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4 },
        '-=0.8'
      )
      .fromTo('.hero-sub',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 1.0, ease: 'power2.out' },
        '-=0.8'
      )
      .fromTo('.hero-supporting',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.9 },
        '-=0.7'
      )
      .fromTo('.hero-cta',
        { opacity: 0, y: 25, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7 },
        '-=0.5'
      )
      .fromTo('.hero-secondary-cta',
        { opacity: 0 },
        { opacity: 1, duration: 0.5 },
        '-=0.3'
      )
      .fromTo('.hero-node',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.2, ease: 'back.out(2)' },
        '-=0.5'
      )
      .fromTo('.hero-scroll-indicator',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.3'
      );

      if (imgRef.current) {
        gsap.to('.hero-bg-image', {
          yPercent: 15,
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
      <div ref={imgRef} className="absolute inset-0 z-[0] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=2400"
          alt=""
          className="hero-bg-image w-full h-full object-cover"
          style={{ filter: 'brightness(1.0) saturate(1.1) contrast(1.02) sepia(0.12)' }}
        />
      </div>

      {/* Warm ivory gradient overlay — lighter than dark, preserves image */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(245,241,232,0.5) 0%, rgba(245,241,232,0.15) 30%, rgba(245,241,232,0.2) 55%, rgba(245,241,232,0.6) 100%)',
        }}
      />
      {/* Soft warm radial glow behind text */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 40% at center, rgba(245,241,232,0.4) 0%, rgba(245,241,232,0.05) 70%, transparent 100%)',
        }}
      />

      {/* Extremely faint orbital ring — brand detail */}
      <div className="absolute inset-0 z-[2] pointer-events-none flex items-center justify-center">
        <svg
          width="500"
          height="500"
          viewBox="0 0 500 500"
          fill="none"
          className="opacity-[0.05]"
          style={{ animation: 'slowSpin 120s linear infinite' }}
        >
          <circle cx="250" cy="250" r="240" stroke="#B99A5B" strokeWidth="0.4" fill="none" />
          <circle cx="250" cy="250" r="180" stroke="#B99A5B" strokeWidth="0.3" fill="none" />
        </svg>
      </div>

      {/* Subtle grain */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      {/* 3 subtle gold points */}
      {discoveryNodes.map((node, i) => (
        <div
          key={i}
          className="hero-node absolute z-[3] group cursor-default"
          style={{ top: node.top, left: node.left }}
          onMouseEnter={() => setHoveredNode(i)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: '#B99A5B',
              boxShadow: '0 0 6px 2px rgba(185,154,91,0.3)',
              animation: `discoveryPulse ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
          {hoveredNode === i && (
            <div className="absolute left-4 top-0 -translate-y-1/2 whitespace-nowrap z-10">
              <span className="font-mono text-[10px] tracking-widest" style={{ color: 'rgba(185,154,91,0.8)' }}>
                {node.label}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Main content — positioned slightly above center */}
      <div
        ref={contentRef}
        className="relative z-10 text-center max-w-4xl mx-auto px-6"
        style={{ transform: 'translateY(-4vh)' }}
      >
        {/* Eyebrow */}
        <p
          className="hero-topline opacity-0 font-mono text-[11px] tracking-[0.25em] uppercase mb-8"
          style={{ color: '#71877A' }}
        >
          Some places are still undiscovered
        </p>

        {/* Main headline — deep forest, strong serif */}
        <h1
          className="hero-headline opacity-0 font-display text-7xl sm:text-8xl md:text-9xl font-medium leading-[1.0] mb-6 tracking-tight"
          style={{
            color: '#243A34',
            textShadow: '0 2px 30px rgba(245,241,232,0.6)',
          }}
        >
          Woander.
        </h1>

        {/* Sub headline — italic terracotta */}
        <p
          className="hero-sub opacity-0 font-display italic text-3xl sm:text-4xl md:text-5xl font-light mb-8"
          style={{ color: '#B97862' }}
        >
          Travel deeper.
        </p>

        {/* Supporting text — warm charcoal */}
        <p
          className="hero-supporting opacity-0 text-sm sm:text-base max-w-md mx-auto mb-12 leading-relaxed font-light"
          style={{ color: '#27302D' }}
        >
          Discover places, people and stories that don't appear on the usual map.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <button
            onClick={() => navigate('/hidden-gems')}
            className="hero-cta opacity-0 relative px-12 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300 hover:bg-forest-900 hover:text-parchment"
            style={{
              border: '1px solid #243A34',
              backgroundColor: '#F5F1E8',
              color: '#243A34',
            }}
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

        {/* Discovered by badge */}
        <div className="mt-16 flex items-center justify-center gap-3" style={{ color: 'rgba(36,58,52,0.35)' }}>
          <div className="w-8 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(36,58,52,0.2), transparent)' }} />
          <span className="text-[10px] uppercase tracking-[0.25em]">
            discovered by curious explorers
          </span>
          <div className="w-8 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(36,58,52,0.2), transparent)' }} />
        </div>
      </div>

      {/* Rotating philosophy line */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[3] text-center pointer-events-none hidden md:block">
        <p
          className="font-display italic text-sm transition-all duration-500"
          style={{
            color: 'rgba(36,58,52,0.4)',
            opacity: philosophyVisible ? 1 : 0,
            transform: philosophyVisible ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          "{PHILOSOPHY_LINES[philosophyIndex]}"
        </p>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollDown}
        className="hero-scroll-indicator opacity-0 absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-2 transition-colors duration-300 group"
        style={{ color: 'rgba(36,58,52,0.5)' }}
        aria-label="Scroll down"
      >
        <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Scroll to explore</span>
        <div
          className="w-px h-10"
          style={{
            background: 'linear-gradient(to bottom, rgba(36,58,52,0.4), transparent)',
            animation: 'descend 2s ease-in-out infinite',
          }}
        />
      </button>

      <style>{`
        @keyframes discoveryPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.3); }
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes descend {
          0%, 100% { transform: scaleY(1); opacity: 0.3; }
          50% { transform: scaleY(1.3); opacity: 0.6; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
