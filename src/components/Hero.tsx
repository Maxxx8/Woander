import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import BackgroundMedia from './BackgroundMedia';

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const navigate = useNavigate();
  const [showArrow, setShowArrow] = useState(true);
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaCardRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setShowArrow(window.scrollY < 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(titleRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2 }
      )
      .fromTo(subtitleRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'back.out(1.2)' },
        '-=0.8'
      )
      .fromTo(taglineRef.current,
        { opacity: 0, y: 20, filter: 'blur(10px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1 },
        '-=0.6'
      )
      .fromTo(buttonsRef.current,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        '-=0.4'
      )
      .fromTo(ctaCardRef.current,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        '-=0.3'
      );

      if (heroRef.current) {
        gsap.to(heroRef.current, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleStartJourney = () => navigate('/adventures');
  const handleHiddenGems = () => navigate('/hidden-gems');

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <section ref={heroRef} className="relative h-screen flex items-center justify-center overflow-hidden bg-charcoal">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <BackgroundMedia
          url="https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=1920"
          type="image"
          thumbnailUrl="https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400"
          alt="Himalayan mountains"
          overlay={true}
          overlayOpacity={0.6}
          kenBurns={true}
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-charcoal/40 to-charcoal/20 z-[1]"></div>

      <div className="relative z-20 text-center max-w-5xl mx-auto px-4 py-8 flex flex-col items-center">
        <div className="mb-8 md:mb-12">
          <h1 ref={titleRef} className="text-5xl sm:text-6xl md:text-8xl font-display font-bold leading-tight text-white mb-4">
            Discover
          </h1>
          <div ref={subtitleRef} className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
            Extraordinary Worlds
          </div>
        </div>

        <p ref={taglineRef} className="text-base md:text-lg text-neutral-300 mb-12 max-w-2xl leading-relaxed font-light">
          Explore breathtaking destinations, hidden gems, and unforgettable experiences curated for the modern traveler seeking authentic adventures
        </p>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 w-full max-w-md">
          <button
            onClick={handleStartJourney}
            className="w-full sm:flex-1 group relative px-8 py-3 md:py-4 bg-teal-600 text-white rounded-xl font-semibold transition-all duration-300 hover:bg-teal-700 active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
          >
            <span>Explore Adventures</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={handleHiddenGems}
            className="w-full sm:flex-1 px-8 py-3 md:py-4 border-2 border-teal-400/50 text-white rounded-xl font-semibold transition-all duration-300 hover:border-teal-400 hover:bg-teal-400/10 active:scale-95"
          >
            Hidden Gems
          </button>
        </div>

        <div
          ref={ctaCardRef}
          className="glass rounded-2xl p-6 md:p-8 max-w-md w-full mb-8 backdrop-blur-xl"
        >
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Start Your Journey Today</h3>
            <p className="text-sm text-neutral-200">Create an account and unlock personalized travel recommendations</p>
            <button
              onClick={() => navigate('/adventures')}
              className="w-full px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-glow-sm active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {showArrow && (
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 text-white/60 hover:text-white transition-all duration-300 group"
          aria-label="Scroll to content"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-medium tracking-wider uppercase">Scroll</span>
            <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
          </div>
        </button>
      )}
    </section>
  );
};

export default Hero;