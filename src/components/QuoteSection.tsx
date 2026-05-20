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
            duration: 1,
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
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            delay: 0.5,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 70%',
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
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [loading, quote]);
  if (loading) {
    return (
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gray-300 animate-pulse" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <div className="h-8 bg-white/20 rounded-lg w-3/4 mx-auto mb-6 animate-pulse"></div>
          <div className="h-6 bg-white/10 rounded-lg w-1/4 mx-auto animate-pulse"></div>
        </div>
      </section>
    );
  }

  if (!quote) return null;

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      <div ref={bgRef} className="absolute inset-0 bg-cover bg-center will-change-transform" style={{ backgroundImage: `url("${quote.backgroundImage}")` }}>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/60"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
        <blockquote ref={quoteRef} className="text-2xl md:text-4xl text-white font-light leading-relaxed mb-6 drop-shadow-2xl">
          "{quote.quote}"
        </blockquote>
        <cite ref={authorRef} className="text-xl text-orange-300 italic drop-shadow-lg">- {quote.author}</cite>
      </div>
    </section>
  );
};

export default QuoteSection;