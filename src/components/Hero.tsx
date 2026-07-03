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
  { top: '22%', left: '14%', label: '10.8505° N, 76.2711° E' },
  { top: '38%', left: '78%', label: '9.9312° N, 76.2673° E' },
  { top: '61%', left: '22%', label: '11.6854° N, 75.9912° E' },
  { top: '55%', left: '65%', label: '10.0159° N, 77.0648° E' },
  { top: '75%', left: '42%', label: '9.2648° N, 76.7870° E' },
  { top: '28%', left: '52%', label: '11.3000° N, 76.1000° E' },
];

const Hero = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
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
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length);
    }, 4000);
    return () => clearInterval(messageInterval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo('.hero-topline',
        { opacity: 0, y: 20, letterSpacing: '0.4em' },
        { opacity: 1, y: 0, letterSpacing: '0.25em', duration: 1.4, delay: 0.3 }
      )
      .fromTo('.hero-headline',
        { opacity: 0, y: 60, filter: 'blur(8px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.4 },
        '-=0.9'
      )
      .fromTo('.hero-sub',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 1, ease: 'power2.out' },
        '-=0.8'
      )
      .fromTo('.hero-supporting',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 1 },
        '-=0.7'
      )
      .fromTo('.hero-cta',
        { opacity: 0, y: 30, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        '-=0.5'
      )
      .fromTo('.hero-secondary-cta',
        { opacity: 0 },
        { opacity: 1, duration: 0.6 },
        '-=0.3'
      )
      .fromTo('.hero-node',
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(2)' },
        '-=0.5'
      )
      .fromTo('.hero-scroll-indicator',
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.3'
      );

      // Subtle parallax on scroll
      if (heroRef.current) {
        gsap.to('.hero-bg-image', {
          yPercent: 25,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }

      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0.95,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: '50% top',
            scrub: true,
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
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://images.pexels.com/photos/2161467/pexels-photo-2161467.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Misty Kerala forest"
          className="hero-bg-image w-full h-full object-cover object-center scale-110"
          style={{ filter: 'grayscale(25%) brightness(0.55) saturate(0.8)' }}
        />
      </div>

      {/* Cinematic dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-forest-950/50 via-forest-950/30 to-forest-950/90 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-forest-950/60 via-transparent to-forest-950/40 z-[1]" />

      {/* Topographic SVG pattern */}
      <svg
        className="absolute inset-0 w-full h-full z-[2] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.06 }}
      >
        <defs>
          <pattern id="topo" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
            <ellipse cx="150" cy="150" rx="130" ry="100" fill="none" stroke="#c9a84a" strokeWidth="0.8"/>
            <ellipse cx="150" cy="150" rx="95" ry="72" fill="none" stroke="#c9a84a" strokeWidth="0.6"/>
            <ellipse cx="150" cy="150" rx="60" ry="45" fill="none" stroke="#c9a84a" strokeWidth="0.5"/>
            <ellipse cx="150" cy="150" rx="28" ry="20" fill="none" stroke="#c9a84a" strokeWidth="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topo)" />
      </svg>

      {/* Discovery Nodes */}
      {discoveryNodes.map((node, i) => (
        <div
          key={i}
          className="hero-node absolute z-[3] group cursor-default"
          style={{ top: node.top, left: node.left }}
          onMouseEnter={() => setHoveredNode(i)}
          onMouseLeave={() => setHoveredNode(null)}
        >
          <div
            className="w-2 h-2 rounded-full bg-gold-400"
            style={{
              boxShadow: '0 0 8px 3px rgba(201,168,74,0.5)',
              animation: `discoveryPulse ${2.5 + i * 0.4}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full border border-gold-400/30"
            style={{ animation: `discoveryRing ${3 + i * 0.5}s ease-out infinite`, animationDelay: `${i * 0.4}s` }}
          />
          {/* Coordinate tooltip */}
          {hoveredNode === i && (
            <div className="absolute left-4 top-0 -translate-y-1/2 whitespace-nowrap z-10">
              <span className="font-jetbrains text-gold-400/80 text-[10px] tracking-widest">
                {node.label}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Compass — top right */}
      <div className="absolute top-24 right-8 z-[3] opacity-20 pointer-events-none" style={{ animation: 'compassSway 8s ease-in-out infinite' }}>
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="22" stroke="#c9a84a" strokeWidth="0.8"/>
          <circle cx="24" cy="24" r="16" stroke="#c9a84a" strokeWidth="0.5"/>
          <line x1="24" y1="4" x2="24" y2="12" stroke="#c9a84a" strokeWidth="1.5"/>
          <line x1="24" y1="36" x2="24" y2="44" stroke="#c9a84a" strokeWidth="0.8"/>
          <line x1="4" y1="24" x2="12" y2="24" stroke="#c9a84a" strokeWidth="0.8"/>
          <line x1="36" y1="24" x2="44" y2="24" stroke="#c9a84a" strokeWidth="0.8"/>
          <polygon points="24,6 21,20 24,22 27,20" fill="#c9a84a" opacity="0.9"/>
          <polygon points="24,42 21,28 24,26 27,28" fill="#c9a84a" opacity="0.4"/>
          <circle cx="24" cy="24" r="2" fill="#c9a84a"/>
          <text x="24" y="3" textAnchor="middle" fill="#c9a84a" fontSize="4" fontFamily="JetBrains Mono">N</text>
          <text x="24" y="47" textAnchor="middle" fill="#c9a84a" fontSize="4" fontFamily="JetBrains Mono">S</text>
          <text x="2" y="25" textAnchor="middle" fill="#c9a84a" fontSize="4" fontFamily="JetBrains Mono">W</text>
          <text x="47" y="25" textAnchor="middle" fill="#c9a84a" fontSize="4" fontFamily="JetBrains Mono">E</text>
        </svg>
      </div>

      {/* Hidden coordinate easter egg — bottom left */}
      <div className="absolute bottom-16 left-6 z-[3] pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-1000">
        <span className="font-jetbrains text-[10px] text-gold-400/40 tracking-widest">
          10.8505° N, 76.2711° E — Nelliyampathy
        </span>
      </div>

      {/* Main content */}
      <div ref={contentRef} className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">

        {/* Top line */}
        <p className="hero-topline opacity-0 font-jetbrains text-xs text-gold-400/80 tracking-[0.25em] uppercase mb-8">
          Some places are still undiscovered.
        </p>

        {/* Main headline */}
        <h1 className="hero-headline opacity-0 font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-light leading-[1.05] text-cream mb-6">
          Discover Places.<br />
          <em className="italic text-gold-300">Create Destinations.</em>
        </h1>

        {/* Subheadline */}
        <p className="hero-sub opacity-0 text-mist-300 text-sm sm:text-base tracking-wide max-w-xl mx-auto mb-4 font-light">
          The community-powered discovery network for hidden India.
        </p>

        {/* Supporting text */}
        <p className="hero-supporting opacity-0 text-mist-500 text-xs sm:text-sm max-w-md mx-auto mb-12 leading-relaxed font-light">
          Modern travel made the world more accessible — yet somehow less discoverable.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-5">
          <button
            onClick={() => navigate('/hidden-gems')}
            className="hero-cta opacity-0 group relative px-10 py-4 border border-gold-400/40 text-cream text-sm tracking-[0.15em] uppercase font-light transition-all duration-500 hover:border-gold-400/80 hover:bg-gold-400/8 hover:tracking-[0.2em] overflow-hidden"
          >
            <span className="relative z-10">Explore Beyond The Algorithm</span>
            <span className="absolute inset-0 bg-gold-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          <button
            onClick={() => navigate('/vanguard')}
            className="hero-secondary-cta opacity-0 font-jetbrains text-[11px] text-mist-500 hover:text-gold-400 tracking-widest uppercase transition-colors duration-300"
          >
            Become a Gem Founder →
          </button>
        </div>

        {/* "Discovered by" Badge */}
        <div className="mt-16 md:mt-20 flex items-center justify-center gap-2 text-mist-500/40">
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-mist-500/30 to-transparent" />
          <span className="text-[10px] uppercase tracking-[0.25em]">
            discovered by curious explorers
          </span>
          <div className="w-8 h-px bg-gradient-to-r from-transparent via-mist-500/30 to-transparent" />
        </div>
      </div>

      {/* Floating Philosophical Message */}
      <div className="absolute bottom-32 md:bottom-40 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-mist-500/50 tracking-widest uppercase text-philosophy">
          {loadingMessages[currentMessage]}
        </p>
      </div>

      {/* Rotating philosophy line */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-[3] text-center pointer-events-none">
        <p
          className="font-display italic text-mist-500/60 text-sm transition-all duration-500"
          style={{ opacity: philosophyVisible ? 1 : 0, transform: philosophyVisible ? 'translateY(0)' : 'translateY(8px)' }}
        >
          "{PHILOSOPHY_LINES[philosophyIndex]}"
        </p>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollDown}
        className="hero-scroll-indicator opacity-0 absolute bottom-6 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-2 text-mist-500 hover:text-gold-400 transition-colors duration-300 group"
        aria-label="Scroll down"
      >
        <span className="font-jetbrains text-[10px] tracking-widest uppercase">Descend</span>
        <div className="w-px h-8 bg-mist-500/40 group-hover:bg-gold-400/60 transition-colors duration-300" style={{ animation: 'descend 2s ease-in-out infinite' }} />
      </button>

      <style>{`
        @keyframes discoveryPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
        @keyframes discoveryRing {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(4); opacity: 0; }
        }
        @keyframes compassSway {
          0%, 100% { transform: rotate(-4deg); }
          50% { transform: rotate(4deg); }
        }
        @keyframes descend {
          0%, 100% { transform: scaleY(1); opacity: 0.5; }
          50% { transform: scaleY(1.3); opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default Hero;
