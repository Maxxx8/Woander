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

const loadingMessages = [
  "Curiosity precedes discovery.",
  "Some places are hidden for a reason.",
  "Every destination was once undiscovered.",
  "Explore beyond the algorithm.",
  "Not all maps reveal the territory.",]
const discoveryNodes = [
  { top: '22%', left: '14%', label: '10.8505° N, 76.2711° E' },
  { top: '38%', left: '78%', label: '9.9312° N, 76.2673° E' },
  { top: '61%', left: '22%', label: '11.6854° N, 75.9912° E' },
  { top: '55%', left: '65%', label: '10.0159° N, 77.0648° E' },
  { top: '75%', left: '42%', label: '9.2648° N, 76.7870° E' },
  { top: '28%', left: '52%', label: '11.3000° N, 76.1000° E' },
];

const GOLD = '#c9a84a';
const GOLD_RGB = '201, 168, 74';

/**
 * Animated sacred-geometry canvas background.
 * Draws a slowly rotating golden (Fibonacci) spiral overlaid with
 * a Flower of Life ring pattern, all in hairline gold strokes on a
 * deep forest-black canvas. Falls back to a single static frame on
 * very small screens and pauses when scrolled out of view.
 */
const SacredGeometryCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let running = true;
    let lastDraw = 0;
    const THROTTLE_MS = 1000 / 30; // ~30 fps target
    const isSmall = window.innerWidth < 640;

    let rotation = 0;
    let pulse = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Pause when hero is off-screen
    const io = new IntersectionObserver(
      (entries) => {
        running = entries[0]?.isIntersecting ?? false;
        if (running && !isSmall) loop(0);
      },
      { threshold: 0 }
    );
    io.observe(canvas);

    // ---- Drawing helpers ----

    const drawGoldenSpiral = (
      cx: number,
      cy: number,
      scale: number,
      rot: number,
      alpha: number
    ) => {
      // Logarithmic spiral: r = a * phi^(2θ/π) approximates the Fibonacci spiral
      const phi = (1 + Math.sqrt(5)) / 2;
      const a = 6 * scale; // base radius
      const points = 240;
      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const t = (i / points) * Math.PI * 6; // ~3 turns
        const r = a * Math.pow(phi, (2 * t) / Math.PI) * 0.18;
        const x = cx + r * Math.cos(t + rot);
        const y = cy + r * Math.sin(t + rot);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(${GOLD_RGB}, ${alpha})`;
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Fibonacci construction squares (faint)
      const fib = [1, 1, 2, 3, 5, 8, 13, 21];
      let dir = 0;
      let px = cx;
      let py = cy;
      let cur = 8 * scale;
      for (let i = 0; i < fib.length; i++) {
        const s = fib[i] * 8 * scale;
        ctx.beginPath();
        ctx.rect(px - s / 2, py - s / 2, s, s);
        ctx.strokeStyle = `rgba(${GOLD_RGB}, ${alpha * 0.12})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
        // step to next square origin along spiral direction
        const ang = (dir * Math.PI) / 2 + rot;
        px += Math.cos(ang) * (s / 2 + cur / 2);
        py += Math.sin(ang) * (s / 2 + cur / 2);
        cur = s;
        dir = (dir + 1) % 4;
      }
    };

    const drawFlowerOfLife = (
      cx: number,
      cy: number,
      radius: number,
      rot: number,
      alpha: number
    ) => {
      const r = radius;
      ctx.strokeStyle = `rgba(${GOLD_RGB}, ${alpha})`;
      ctx.lineWidth = 0.7;

      // Center circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // First ring — 6 circles
      const ring1 = 6;
      for (let i = 0; i < ring1; i++) {
        const ang = (i / ring1) * Math.PI * 2 + rot;
        const x = cx + r * Math.cos(ang);
        const y = cy + r * Math.sin(ang);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Second ring — 12 circles (outer Flower of Life completion)
      const ring2 = 12;
      for (let i = 0; i < ring2; i++) {
        const ang = (i / ring2) * Math.PI * 2 + rot + Math.PI / 12;
        const x = cx + r * Math.sqrt(3) * Math.cos(ang);
        const y = cy + r * Math.sqrt(3) * Math.sin(ang);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Outer bounding circle
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.62, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${GOLD_RGB}, ${alpha * 0.5})`;
      ctx.stroke();
    };

    const drawConcentricRings = (
      cx: number,
      cy: number,
      maxR: number,
      alpha: number
    ) => {
      const rings = 8;
      for (let i = 1; i <= rings; i++) {
        const r = (i / rings) * maxR;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${GOLD_RGB}, ${alpha * (1 - i / (rings + 2))})`;
        ctx.lineWidth = 0.4;
        ctx.stroke();
      }
    };

    const render = (now: number) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const minDim = Math.min(w, h);

      // Base pulse for subtle breathing effect
      const pulseAlpha = 0.12 + 0.04 * Math.sin(pulse);

      // Concentric guide rings (faintest, behind everything)
      drawConcentricRings(cx, cy, minDim * 0.55, 0.05);

      // Flower of Life — large, behind the spiral
      drawFlowerOfLife(cx, cy, minDim * 0.09, rotation * 0.3, 0.08);

      // Second smaller Flower of Life, counter-rotating
      drawFlowerOfLife(cx, cy, minDim * 0.05, -rotation * 0.5, 0.1);

      // Golden spiral on top
      drawGoldenSpiral(cx, cy, minDim * 0.012, rotation, pulseAlpha);

      // Mirror spiral (rotated 180°) for symmetry
      drawGoldenSpiral(cx, cy, minDim * 0.012, rotation + Math.PI, pulseAlpha * 0.6);

      // Radial accent lines from center (very faint)
      const spokes = 12;
      for (let i = 0; i < spokes; i++) {
        const ang = (i / spokes) * Math.PI * 2 + rotation * 0.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + minDim * 0.5 * Math.cos(ang),
          cy + minDim * 0.5 * Math.sin(ang)
        );
        ctx.strokeStyle = `rgba(${GOLD_RGB}, 0.025)`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    };

    // Static frame for small screens
    if (isSmall) {
      render(0);
      return () => {
        window.removeEventListener('resize', resize);
        io.disconnect();
      };
    }

    const loop = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (now - lastDraw < THROTTLE_MS) return;
      lastDraw = now;
      rotation += 0.0015;
      pulse += 0.02;
      render(now);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full z-[1] pointer-events-none"
      aria-hidden="true"
    />
  );
};

const Hero = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
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

      // Subtle parallax on the geometry canvas
      if (heroRef.current) {
        gsap.to('.hero-bg-canvas', {
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
      {/* Sacred geometry canvas background */}
      <div className="absolute inset-0 w-full h-full">
        <SacredGeometryCanvas />
      </div>

      {/* Radial vignette — keeps center text readable, darkens edges */}
      <div
        ref={overlayRef}
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(13,17,16,0.15) 0%, rgba(13,17,16,0.55) 55%, rgba(13,17,16,0.92) 100%)',
        }}
      />

      {/* Topographic SVG pattern — subtle texture layer */}
      <svg
        className="absolute inset-0 w-full h-full z-[2] pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.08 }}
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
          Woander.
        </h1>
        <p className="hero-headline opacity-0 font-display italic text-3xl sm:text-4xl md:text-5xl font-light text-gold-300/80 mb-8">
          Travel deeper.
        </p>

        {/* Supporting text */}
        <p className="hero-supporting opacity-0 text-mist-400 text-sm sm:text-base max-w-md mx-auto mb-12 leading-relaxed font-light">
          Discover places, people and stories that don't appear on the usual map.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <button
              onClick={() => navigate('/hidden-gems')}
              className="hero-cta opacity-0 group relative px-10 py-4 border border-gold-400/40 text-cream text-sm tracking-[0.15em] uppercase font-light transition-all duration-500 hover:border-gold-400/80 hover:bg-gold-400/8 overflow-hidden"
            >
              <span className="relative z-10">Explore India</span>
              <span className="absolute inset-0 bg-gold-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>

            <button
              onClick={() => navigate('/vanguard')}
              className="hero-secondary-cta opacity-0 font-jetbrains text-[11px] text-mist-500 hover:text-gold-400 tracking-widest uppercase transition-colors duration-300"
            >
              Meet the Vanguard →
            </button>
          </div>
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
