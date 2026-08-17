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

  useEffect(() => {
    if (loading || !quote) return;

    const ctx = gsap.context(() => {
      if (quoteRef.current) {
        gsap.fromTo(quoteRef.current,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 1.0,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (authorRef.current) {
        gsap.fromTo(authorRef.current,
          { opacity: 0, y: 8 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            delay: 0.4,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, quote]);

  if (loading) {
    return (
      <section className="relative py-32 overflow-hidden" style={{ backgroundColor: '#F6F2E9' }}>
        <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <div className="h-6 rounded w-2/3 mx-auto mb-4 animate-pulse" style={{ backgroundColor: 'rgba(38,61,53,0.08)' }} />
          <div className="h-4 rounded w-1/4 mx-auto animate-pulse" style={{ backgroundColor: 'rgba(38,61,53,0.06)' }} />
        </div>
      </section>
    );
  }

  if (!quote) return null;

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden" style={{ backgroundColor: '#F6F2E9' }}>
      {/* Thin separator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-px" style={{ backgroundColor: 'rgba(38,61,53,0.12)' }} />

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto text-center px-6">
        <blockquote ref={quoteRef} className="font-display text-2xl md:text-4xl font-light italic leading-relaxed mb-8" style={{ color: '#263D35' }}>
          "{quote.quote}"
        </blockquote>
        <cite ref={authorRef} className="font-mono text-[11px] tracking-[0.2em] uppercase not-italic" style={{ color: '#B69A63' }}>
          — {quote.author}
        </cite>
      </div>

      {/* Bottom separator */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-px" style={{ backgroundColor: 'rgba(38,61,53,0.12)' }} />
    </section>
  );
};

export default QuoteSection;
