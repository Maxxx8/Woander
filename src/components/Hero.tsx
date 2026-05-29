import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, MapPin, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const discoveryNodes = [
  { x: '15%', y: '25%', delay: 0.5 },
  { x: '78%', y: '18%', delay: 0.8 },
  { x: '35%', y: '65%', delay: 1.2 },
  { x: '85%', y: '72%', delay: 0.3 },
  { x: '52%', y: '35%', delay: 1.5 },
  { x: '22%', y: '78%', delay: 0.7 },
];

const coordinates = [
  { lat: '10.5276° N', lng: '76.2144° E', label: 'Nelliyampathy' },
  { lat: '9.9312° N', lng: '76.2673° E', label: 'Iddukki' },
  { lat: '11.2543° N', lng: '75.7804° E', label: 'Wayanad' },
];

const loadingMessages = [
  "Curiosity precedes discovery.",
  "Some places are hidden for a reason.",
  "Every destination was once undiscovered.",
  "Explore beyond the algorithm.",
  "Not all maps reveal the territory.",
];

const Hero = () => {
  const navigate = useNavigate();
  const [showArrow, setShowArrow] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(0);
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowArrow(window.scrollY < 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
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

      tl.fromTo(headlineRef.current,
        { opacity: 0, y: 60, scale: 0.95, filter: 'blur(8px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.8, delay: 0.3 }
      )
      .fromTo(taglineRef.current,
        { opacity: 0, y: 40, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2 },
        '-=1.2'
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1 },
        '-=0.8'
      )
      .fromTo(buttonsRef.current?.children || [],
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15 },
        '-=0.5'
      );

      if (heroRef.current) {
        gsap.to(heroRef.current, {
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

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-forest-950">
      {/* Cinematic Kerala Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=1920"
          alt="Misty Kerala landscape"
          className="w-full h-full object-cover object-center opacity-60"
        />
        {/* Atmospheric overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-900/70 to-forest-800/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-950/80 via-transparent to-forest-950/60" />
        <div ref={overlayRef} className="absolute inset-0 fog-overlay" />
      </div>

      {/* Discovery Nodes - Constellation-like */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {discoveryNodes.map((node, index) => (
          <React.Fragment key={index}>
            <div
              className="absolute discovery-node"
              style={{
                left: node.x,
                top: node.y,
                animationDelay: `${node.delay}s`,
              }}
            >
              <div className="w-2 h-2 bg-gold-300 rounded-full opacity-60" />
              <div className="absolute inset-0 w-2 h-2 bg-gold-400 rounded-full animate-ping opacity-30" style={{ animationDelay: `${node.delay}s` }} />
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Topographic Lines SVG Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="topoLines" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M0 10 Q5 5 10 10 T20 10" fill="none" stroke="rgba(201, 168, 74, 0.3)" strokeWidth="0.1" />
            <path d="M0 15 Q5 10 10 15 T20 15" fill="none" stroke="rgba(201, 168, 74, 0.2)" strokeWidth="0.08" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#topoLines)" className="animate-topo" />
        {/* Sacred Geometry - Fibonacci Spiral Hint */}
        <g className="animate-constellation" style={{ transformOrigin: '50% 50%' }}>
          <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(201, 168, 74, 0.08)" strokeWidth="0.05" />
          <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(201, 168, 74, 0.06)" strokeWidth="0.05" />
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(201, 168, 74, 0.04)" strokeWidth="0.05" />
        </g>
      </svg>

      {/* Hidden Coordinates - Easter Eggs */}
      <div className="absolute bottom-20 left-8 coordinate-text text-gold-300/40 font-mono space-y-3 hidden lg:block">
        {coordinates.map((coord, i) => (
          <div key={i} className="animate-coordinate" style={{ animationDelay: `${i * 0.3}s` }}>
            <div className="text-[10px] tracking-widest">{coord.lat}</div>
            <div className="text-[10px] tracking-widest">{coord.lng}</div>
          </div>
        ))}
      </div>

      {/* Compass Element */}
      <div className="absolute top-24 right-8 lg:right-16 hidden lg:block compass-sway">
        <div className="relative w-16 h-16 opacity-30">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(201, 168, 74, 0.3)" strokeWidth="1" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(201, 168, 74, 0.2)" strokeWidth="0.5" />
            <path d="M50 5 L45 50 L50 45 L55 50 Z" fill="rgba(201, 168, 74, 0.4)" />
            <path d="M50 95 L45 50 L50 55 L55 50 Z" fill="rgba(201, 168, 74, 0.2)" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Compass className="w-5 h-5 text-gold-400/50" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-20 text-center max-w-5xl mx-auto px-6 md:px-12">
        {/* Headline */}
        <h1
          ref={headlineRef}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-light text-mist-50 leading-tight tracking-wide mb-4"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          Discover Places.
          <br />
          <span className="text-elegant font-normal italic text-mist-200/90">
            Create Destinations.
          </span>
        </h1>

        {/* Tagline */}
        <div ref={taglineRef} className="mb-8 md:mb-12">
          <p className="text-lg md:text-xl lg:text-2xl text-mist-300/80 font-light tracking-wide" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
            The community-powered discovery network for hidden India.
          </p>
        </div>

        {/* Subtitle - Philosophical */}
        <p
          ref={subtitleRef}
          className="text-sm md:text-base text-mist-400/60 max-w-3xl mx-auto leading-relaxed mb-12 md:mb-16 font-light tracking-wider"
        >
          Modern travel made the world more accessible — but somehow less discoverable.
          <br className="hidden md:block" />
          <span className="text-mist-300/70">
            Woander exists for people who believe the best places are often the ones not yet found.
          </span>
        </p>

        {/* CTAs */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate('/hidden-gems')}
            className="group relative px-8 py-4 bg-forest-700/80 backdrop-blur-sm border border-gold-500/20 text-mist-100 text-sm md:text-base font-medium tracking-wider rounded-sm hover:bg-forest-600/90 hover:border-gold-400/40 transition-all duration-500"
          >
            <span className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gold-400/80 group-hover:text-gold-300 transition-colors" />
              Explore Hidden Gems
            </span>
          </button>
          <button
            onClick={() => navigate('/hidden-gems')}
            className="group relative px-8 py-4 bg-earth-700/60 backdrop-blur-sm border border-earth-500/20 text-mist-100 text-sm md:text-base font-medium tracking-wider rounded-sm hover:bg-earth-600/80 hover:border-earth-400/40 transition-all duration-500"
          >
            <span className="flex items-center gap-3">
              <span className="text-gold-400/80 group-hover:text-gold-300 transition-colors">
                Become a Gem Founder
              </span>
            </span>
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

      {/* Scroll Indicator */}
      {showArrow && (
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-mist-500/60 hover:text-gold-400/80 transition-all duration-300 group"
          aria-label="Scroll to content"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.2em] group-hover:text-gold-400/60 transition-colors">
              Descend
            </span>
            <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
          </div>
        </button>
      )}
    </section>
  );
};

export default Hero;
