import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    number: '01',
    title: 'Local Knowledge',
    description: 'Every place in Woander is submitted by someone who has actually been there — a villager, a guide, a wanderer who found something worth sharing.',
    quote: '"You cannot discover a place from a screen."',
  },
  {
    number: '02',
    title: 'Hidden Access',
    description: "The algorithm rewards the popular. We track what it misses — waterfall paths with no signage, villages that don't have Instagram pages.",
    quote: '"The best places have no reviews."',
  },
  {
    number: '03',
    title: 'Community Trust',
    description: 'Reputation is earned through discovery, not paid placement. The people who contribute the most have their names on the map.',
    quote: '"Trust is built one honest report at a time."',
  },
  {
    number: '04',
    title: 'Founder Rewards',
    description: "When you find a hidden gem and document it, you become its Founder. As it grows, so does your stake. Discovery should have value.",
    quote: '"Find it first. Own it forever."',
  },
];

const WhyChooseUs = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.pillar-item',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-forest-900 border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header */}
        <div className="mb-20">
          <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-5">The Foundation</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-cream leading-tight max-w-xl">
            Built on four<br />
            <em className="italic text-gold-300">uncomfortable truths.</em>
          </h2>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border border-forest-700">
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className={`pillar-item opacity-0 p-8 border-b md:border-b-0 border-forest-700 ${
                i < pillars.length - 1 ? 'lg:border-r border-forest-700' : ''
              } group hover:bg-forest-800/50 transition-colors duration-500`}
            >
              <span className="font-jetbrains text-xs text-gold-400/40 tracking-widest block mb-6">
                {pillar.number}
              </span>
              <h3 className="font-display text-xl font-light text-cream mb-4 group-hover:text-gold-300 transition-colors duration-300">
                {pillar.title}
              </h3>
              <p className="text-mist-600 text-sm leading-relaxed mb-6 font-light">
                {pillar.description}
              </p>
              <p className="font-display italic text-mist-700 text-sm group-hover:text-mist-500 transition-colors duration-300">
                {pillar.quote}
              </p>
            </div>
          ))}
        </div>

        {/* Stats strip */}
        <div className="mt-16 pt-12 border-t border-forest-800 grid grid-cols-3 gap-8 max-w-2xl">
          {[
            { value: '10,000+', label: 'Explorers' },
            { value: '100+', label: 'Hidden Places' },
            { value: '4.9', label: 'Trust Score' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-display text-3xl font-light text-cream mb-1">{value}</p>
              <p className="font-jetbrains text-[10px] text-mist-700 tracking-widest uppercase">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
