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

// Reduced to 3 subtle gold points — restrained decoration
const discoveryNodes = [
  { top: '30%', left: '16%', label: '10.8505° N, 76.2711° E' },
  { top: '68%', left: '72%', label: '11.6854° N, 75.9912° E' },
  { top: '52%', left: '85%', label: '9.2648° N, 76.7870° E' },
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
        { scale: 1.12, opacity: 0 },
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

      // Subtle parallax on the background image
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
      className="relative h-screen min-h-screen flex items-center justify-center overflow-hidden bg-forest-950"
    >
      {/* Cinematic background image */}
      <div ref={imgRef} className="absolute inset-0 z-[0] overflow-hidden">
        <img
          src="https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=2400"
          alt=""
          className="hero-bg-image w-full h-full object-cover"
          style={{ filter: 'brightness(0.62) saturate(0.9) contrast(1.05)' }}
        />
      </div>

      {/* Layered gradient overlays — cinematic depth, image still visible */}
      {/* Top: darker for header readability */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(7,22,17,0.65) 0%, rgba(7,22,17,0.25) 35%, rgba(7,22,17,0.25) 55%, rgba(7,22,17,0.55) 100%)',
        }}
      />
      {/* Center radial for text readability */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at center, rgba(7,22,17,0.45) 0%, rgba(7,22,17,0.1) 65%, transparent 100%)',
        }}
      />

      {/* One extremely faint orbital ring — brand detail, not decoration overload */}
      <div className="absolute inset-0 z-[2] pointer-events-none flex items-center justify-center">
        <svg
          width="600"
          height="600"
          viewBox="0 0 600 600"
          fill="none"
          className="opacity-[0.04]"
          style={{ animation: 'slowSpin 120s linear infinite' }}
        >
          <circle cx="300" cy="300" r="280" stroke="#D8C28C" strokeWidth="0.5" fill="none" />
          <circle cx="300" cy="300" r="220" stroke="#D8C28C" strokeWidth="0.4" fill="none" />
          <circle cx="300" cy="300" r="160" stroke="#D8C28C" strokeWidth="0.3" fill="none" />
        </svg>
      </div>

      {/* Subtle grain texture */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 45%, rgba(7,22,17,0.4) 100%)',
        }}
      />

      {/* 3 subtle gold discovery points */}
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
              backgroundColor: '#D8C28C',
              boxShadow: '0 0 6px 2px rgba(216,194,140,0.4)',
              animation: `discoveryPulse ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
          {hoveredNode === i && (
            <div className="absolute left-4 top-0 -translate-y-1/2 whitespace-nowrap z-10">
              <span className="font-jetbrains text-[10px] tracking-widest" style={{ color: 'rgba(216,194,140,0.8)' }}>
                {node.label}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Main content — positioned slightly above center (~45% viewport) */}
      <div
        ref={contentRef}
        className="relative z-10 text-center max-w-4xl mx-auto px-6"
        style={{ transform: 'translateY(-4vh)' }}
      >

        {/* Eyebrow label */}
        <p
          className="hero-topline opacity-0 font-jetbrains text-[11px] tracking-[0.25em] uppercase mb-8"
          style={{ color: '#D8C28C' }}
        >
          Some places are still undiscovered
        </p>

        {/* Main headline — strong cream with text shadow for readability */}
        <h1
          className="hero-headline opacity-0 font-display text-7xl sm:text-8xl md:text-9xl font-light leading-[1.0] mb-6 tracking-tight"
          style={{
            color: '#F4F0E6',
            textShadow: '0 2px 20px rgba(7,22,17,0.5), 0 0 60px rgba(7,22,17,0.3)',
          }}
        >
          Woander.
        </h1>

        {/* Sub headline */}
        <p
          className="hero-sub opacity-0 font-display italic text-3xl sm:text-4xl md:text-5xl font-light mb-8"
          style={{ color: '#D8C28C' }}
        >
          Travel deeper.
        </p>

        {/* Supporting text */}
        <p
          className="hero-supporting opacity-0 text-sm sm:text-base max-w-md mx-auto mb-12 leading-relaxed font-light"
          style={{ color: 'rgba(244,240,230,0.85)' }}
        >
          Discover places, people and stories that don't appear on the usual map.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
          <button
            onClick={() => navigate('/hidden-gems')}
            className="hero-cta opacity-0 relative px-12 py-4 text-sm tracking-[0.2em] uppercase font-light transition-all duration-300 hover:bg-cream hover:text-forest-950"
            style={{
              border: '1px solid #F4F0E6',
              backgroundColor: 'transparent',
              color: '#F4F0E6',
            }}
          >
            Explore India
          </button>

          <button
            onClick={() => navigate('/vanguard')}
            className="hero-secondary-cta opacity-0 group font-display text-base tracking-wide transition-colors duration-300"
            style={{ color: 'rgba(244,240,230,0.8)' }}
          >
            <span className="border-b pb-0.5 transition-all duration-300 group-hover:border-gold-300" style={{ borderColor: 'rgba(244,240,230,0.25)' }}>
              Meet the Vanguard
            </span>
          </button>
        </div>

        {/* "Discovered by" Badge */}
        <div className="mt-16 flex items-center justify-center gap-3" style={{ color: 'rgba(244,240,230,0.3)' }}>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-cream/20 to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.25em]">
            discovered by curious explorers
          </span>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-cream/20 to-transparent" />
        </div>
      </div>

      {/* Rotating philosophy line */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[3] text-center pointer-events-none hidden md:block">
        <p
          className="font-display italic text-sm transition-all duration-500"
          style={{
            color: 'rgba(244,240,230,0.4)',
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
        style={{ color: 'rgba(244,240,230,0.5)' }}
        aria-label="Scroll down"
      >
        <span className="font-jetbrains text-[10px] tracking-[0.2em] uppercase">Scroll to explore</span>
        <div
          className="w-px h-10 transition-colors duration-300 group-hover:bg-gold-300/60"
          style={{
            background: 'linear-gradient(to bottom, rgba(244,240,230,0.4), transparent)',
            animation: 'descend 2s ease-in-out infinite',
          }}
        />
      </button>

      <style>{`
        @keyframes discoveryPulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.3); }
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes descend {
          0%, 100% { transform: scaleY(1); opacity: 0.4; }
          50% { transform: scaleY(1.3); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
