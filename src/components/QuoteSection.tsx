import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Quote {
  quote: string;
  author: string;
  backgroundImage?: string;
}

interface QuoteSectionProps {
  quote?: Quote;
  loading?: boolean;
}

const QuoteSection: React.FC<QuoteSectionProps> = ({ quote, loading = false }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLElement>(null);
  const authorRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !quote) return;

    const ctx = gsap.context(() => {
      if (bgRef.current) {
        gsap.fromTo(bgRef.current,
          { scale: 1.1 },
          {
            scale: 1,
            duration: 1.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (quoteRef.current) {
        gsap.fromTo(quoteRef.current,
          { opacity: 0, y: 30, filter: 'blur(5px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (authorRef.current) {
        gsap.fromTo(authorRef.current,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.3,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (sectionRef.current) {
        gsap.to(bgRef.current, {
          yPercent: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, quote]);

  if (loading) {
    return (
      <section className="relative py-28 md:py-36 overflow-hidden bg-forest-950">
        <div className="absolute inset-0 bg-forest-900/50" />
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="h-8 bg-mist-700/10 rounded w-3/4 mx-auto mb-6 animate-pulse" />
          <div className="h-4 bg-mist-700/20 rounded w-1/4 mx-auto animate-pulse" />
        </div>
      </section>
    );
  }

  if (!quote) return null;

  return (
    <section ref={sectionRef} className="relative py-28 md:py-36 overflow-hidden">
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center will-change-transform"
        style={{ backgroundImage: quote.backgroundImage ? `url("${quote.backgroundImage}")` : 'none' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-900/70 to-forest-950/80" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <blockquote
          ref={quoteRef}
          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-mist-100/90 font-light leading-relaxed tracking-wide mb-8"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          "{quote.quote}"
        </blockquote>
        <cite
          ref={authorRef}
          className="text-xs sm:text-sm text-gold-400/50 tracking-[0.2em] uppercase"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
        >
          — {quote.author}
        </cite>
      </div>
    </section>
  );
};

export default QuoteSection;
