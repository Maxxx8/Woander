import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
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
  const buttonsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setShowArrow(false);
      } else {
        setShowArrow(true);
      }
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
      .fromTo(buttonsRef.current?.children,
        { opacity: 0, y: 30, scale: 0.8 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.15 },
        '-=0.5'
      );

      if (heroRef.current) {
        gsap.to(heroRef.current, {
          yPercent: 30,
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

  const handleStartJourney = () => {
    navigate('/adventures');
  };

  const handleHiddenGems = () => {
    navigate('/hidden-gems');
  };

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section ref={heroRef} id="home" className="relative h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <BackgroundMedia
          url="https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=1920"
          type="image"
          thumbnailUrl="https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=400"
          alt="Himalayan mountains"
          overlay={true}
          overlayOpacity={0.7}
          kenBurns={true}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#000510]/60 via-[#001025]/40 to-transparent z-[1]"></div>

      <div className="relative z-20 text-center text-white max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 ref={titleRef} className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.2] font-libra">
            The Spirit Of
          </h1>
          <div ref={subtitleRef} className="text-4xl sm:text-5xl md:text-7xl font-bold leading-[1.2] font-libra bg-gradient-to-r from-[#06D6A0] via-[#118AB2] to-[#EF476F] bg-clip-text text-transparent">
            Our Time
          </div>
        </div>
        <p ref={taglineRef} className="text-lg md:text-xl lg:text-2xl mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-2 relative">
          <span className="inline-block relative">
            <span className="relative z-10 bg-gradient-to-r from-[#06D6A0] via-[#118AB2] to-[#073B4C] bg-clip-text text-transparent animate-pulse-glow font-medium tracking-wide">
              Find The Frequency Of Transformation
            </span>
            <span className="absolute inset-0 blur-xl bg-gradient-to-r from-[#06D6A0]/40 via-[#118AB2]/40 to-[#073B4C]/40 animate-tech-pulse"></span>
          </span>
        </p>

        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center w-full max-w-lg mx-auto px-4 relative z-50">
          <button
            onClick={handleStartJourney}
            className="w-full sm:w-auto bg-gradient-to-r from-[#06D6A0] to-[#118AB2] hover:from-[#118AB2] hover:to-[#073B4C] text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-[#06D6A0]/30 hover:shadow-2xl hover:shadow-[#118AB2]/50 relative z-50"
          >
            Start Your Journey
          </button>
          <button
            onClick={handleHiddenGems}
            className="w-full sm:w-auto border-2 border-[#06D6A0] hover:bg-[#06D6A0] hover:text-[#073B4C] text-white px-6 md:px-8 py-3 md:py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 hover:shadow-lg shadow-[#06D6A0]/20 hover:shadow-2xl hover:shadow-[#06D6A0]/50 transform hover:scale-105 active:scale-95 relative z-50"
          >
            Hidden Gems
          </button>
        </div>
      </div>

      {showArrow && (
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 text-white/70 hover:text-white transition-all duration-300 animate-bounce"
          aria-label="Scroll to content"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">Explore</span>
            <ChevronDown className="w-6 h-6" />
          </div>
        </button>
      )}
    </section>
  );
};

export default Hero;