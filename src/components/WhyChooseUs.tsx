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
    <section ref={sectionRef} className="relative py-28 overflow-hidden" style={{ backgroundColor: '#F5F1E8' }}>
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        <div className="mb-20 max-w-2xl">
          <p className="font-mono text-[10px] tracking-widest uppercase mb-5" style={{ color: '#71877A' }}>The Foundation</p>
          <h2 className="font-display text-5xl md:text-6xl font-light leading-[1.05]" style={{ color: '#243A34' }}>
            Built on four<br />
            <em className="italic" style={{ color: '#B97862' }}>uncomfortable truths.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px" style={{ backgroundColor: 'rgba(36,58,52,0.1)' }}>
          {pillars.map((pillar, i) => (
            <div
              key={i}
              className="pillar-item opacity-0 p-10 group transition-colors duration-500"
              style={{ backgroundColor: '#F5F1E8' }}
            >
              <span className="font-mono text-xs tracking-widest block mb-8" style={{ color: 'rgba(185,154,91,0.5)' }}>
                {pillar.number}
              </span>
              <h3 className="font-display text-2xl font-light mb-5" style={{ color: '#243A34' }}>
                {pillar.title}
              </h3>
              <p className="text-sm leading-relaxed mb-6 font-light" style={{ color: 'rgba(36,58,52,0.65)' }}>
                {pillar.description}
              </p>
              <p className="font-display italic text-sm pt-5" style={{ color: '#B97862', borderTop: '1px solid rgba(36,58,52,0.1)' }}>
                {pillar.quote}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 pt-14 grid grid-cols-2 md:grid-cols-4 gap-10 max-w-4xl" style={{ borderTop: '1px solid rgba(36,58,52,0.12)' }}>
          {[
            { value: '847', label: 'Hidden Gems Mapped' },
            { value: '3,240+', label: 'Field Notes Written' },
            { value: '1,200+', label: 'Active Explorers' },
            { value: '64', label: 'Guides Verified' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="font-display text-4xl md:text-5xl font-light mb-2" style={{ color: '#243A34' }}>{value}</p>
              <p className="font-mono text-[10px] tracking-widest uppercase" style={{ color: '#71877A' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
