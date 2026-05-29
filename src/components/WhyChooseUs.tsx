import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Compass, Eye, Heart, Lightbulb, BookOpen } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const principles = [
  {
    icon: Compass,
    title: 'Discovery-Led',
    description: 'We guide you to places that feel like personal discoveries, not tourist checkpoints.'
  },
  {
    icon: BookOpen,
    title: 'Story-Driven',
    description: 'Every place has a history. We surface the narratives that make destinations meaningful.'
  },
  {
    icon: Heart,
    title: 'Community-Powered',
    description: 'Our gems are discovered, verified, and shared by real explorers, not algorithms.'
  },
  {
    icon: Eye,
    title: 'Observation',
    description: 'We celebrate slow travel, deep observation, and understanding context.'
  },
  {
    icon: Lightbulb,
    title: 'Curiosity',
    description: 'For people who ask "why," who seek the hidden, who question the obvious.'
  }
];

const WhyChooseUs = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.fromTo(cards,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-forest-950 relative overflow-hidden">
      {/* Atmospheric Lines */}
      <div className="absolute inset-0 flex justify-center opacity-10 pointer-events-none">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-gold-500/30 to-transparent" />
        <div className="w-px h-full bg-gradient-to-b from-transparent via-gold-500/20 to-transparent mx-20" />
        <div className="w-px h-full bg-gradient-to-b from-transparent via-gold-500/20 to-transparent -mx-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 border border-gold-500/15 px-4 py-2 mb-6">
            <span
              className="text-[10px] uppercase tracking-[0.25em] text-gold-400/70"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Philosophy
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-mist-100 mb-6"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Built for explorers,
            <br />
            <span className="italic text-mist-300/80">not tourists.</span>
          </h2>
          <p className="text-mist-500/60 max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            Woander exists for people who believe travel should be about discovering,
            <br className="hidden sm:block" />
            not just visiting. For contributors, not just consumers.
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-20">
          {principles.map((principle, index) => (
            <div
              key={index}
              className="group bg-forest-900/50 border border-mist-700/10 p-6 transition-all duration-300 hover:border-gold-500/15 hover:bg-forest-900/70"
            >
              <div className="w-10 h-10 flex items-center justify-center border border-gold-500/15 mb-4 group-hover:border-gold-500/30 transition-colors">
                <principle.icon className="w-4 h-4 text-gold-400/60 group-hover:text-gold-400 transition-colors" />
              </div>
              <h3
                className="text-base font-serif text-mist-200 mb-2"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {principle.title}
              </h3>
              <p className="text-xs text-mist-500/60 leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>

        {/* Philosophical Statement */}
        <div className="text-center py-12 border-t border-mist-700/10">
          <p
            className="text-mist-400/50 italic tracking-wide text-sm md:text-base"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            "We are building contributors, discoverers, explorers, and communities.
            <br className="hidden md:block" />
            <span className="text-mist-500/40">Not passive users.</span>"
          </p>
        </div>
      </div>
    </section>
  );

};

export default WhyChooseUs;
