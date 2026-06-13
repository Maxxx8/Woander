import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { Quote } from '../data/quotes';

interface QuoteSectionProps {
  quote?: Quote;
  loading?: boolean;
}

const QuoteSection: React.FC<QuoteSectionProps> = ({ quote, loading = false }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const authorRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading || !quote) return;

    const ctx = gsap.context(() => {
      if (quoteRef.current) {
        gsap.fromTo(quoteRef.current,
          { opacity: 0, y: 30, filter: 'blur(6px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1.2,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (authorRef.current) {
        gsap.fromTo(authorRef.current,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      gsap.to(bgRef.current, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, quote]);

  if (loading) {
    return (
      <section className="relative py-32 overflow-hidden bg-forest-950">
        <div className="absolute inset-0 bg-forest-800/30 animate-pulse" />
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <div className="h-6 bg-mist-700/20 rounded w-2/3 mx-auto mb-4 animate-pulse" />
          <div className="h-4 bg-mist-700/10 rounded w-1/4 mx-auto animate-pulse" />
        </div>
      </section>
    );
  }

  if (!quote) return null;

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center scale-110 will-change-transform"
        style={{ backgroundImage: `url("${quote.backgroundImage}")` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/80 via-forest-950/65 to-forest-950/85" />
      </div>

      {/* Subtle topo overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-[1]" style={{ opacity: 0.04 }}>
        <defs>
          <pattern id="topo-quote" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <ellipse cx="100" cy="100" rx="80" ry="60" fill="none" stroke="#c9a84a" strokeWidth="0.6"/>
            <ellipse cx="100" cy="100" rx="50" ry="38" fill="none" stroke="#c9a84a" strokeWidth="0.5"/>
            <ellipse cx="100" cy="100" rx="22" ry="16" fill="none" stroke="#c9a84a" strokeWidth="0.4"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#topo-quote)" />
      </svg>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <blockquote ref={quoteRef} className="font-display text-2xl md:text-4xl font-light italic text-cream leading-relaxed mb-6">
          "{quote.quote}"
        </blockquote>
        <cite ref={authorRef} className="font-jetbrains text-[11px] text-gold-400/70 tracking-widest uppercase not-italic">
          — {quote.author}
        </cite>
      </div>
    </section>
  );
};

export default QuoteSection;
