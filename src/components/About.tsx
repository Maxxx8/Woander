import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import { TrendingUp, Recycle, Target, Globe, Lightbulb, Users as Users2, Eye } from 'lucide-react';

const principles = [
  {
    icon: TrendingUp,
    title: 'Covariance',
    description: 'The outcomes of every project are interlinked. What one community discovers benefits the collective.',
  },
  {
    icon: Recycle,
    title: 'Continuous Improvement',
    description: 'No map is final. We iterate constantly — higher frequency, smaller feedback loops.',
  },
  {
    icon: Target,
    title: 'Alignment',
    description: 'Every contributor shares the same north star: honest, sustainable, community-led discovery.',
  },
  {
    icon: Globe,
    title: 'Sustainability',
    description: 'We only surface places that can absorb the attention without being destroyed by it.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Hyper-local technology solves hyper-local problems. The solutions look different here.',
  },
  {
    icon: Users2,
    title: 'Community Engagement',
    description: 'The people who live in these places shape how they are discovered. Always.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description: 'You know how your contribution is used, rewarded, and shared. No black boxes.',
  },
];

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const principlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (principlesRef.current) {
        const cards = principlesRef.current.children;
        gsap.fromTo(cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: principlesRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      gsap.fromTo('.about-text-block',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-text-block',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="py-24 bg-forest-950">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Header + body */}
        <div className="about-text-block grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-24">
          <div>
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-6">The Origin</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-cream leading-tight mb-8">
              Woander was built<br />
              <em className="italic text-gold-300">for the quiet seekers.</em>
            </h2>
            <p className="text-mist-500 text-sm leading-relaxed mb-5 font-light">
              The places that matter most in India are kept alive by the people who live near them — fishermen who know which reef is untouched, tea farmers who walk trails with no name.
            </p>
            <p className="text-mist-600 text-sm leading-relaxed mb-8 font-light">
              Woander honors that knowledge. Gives it structure, visibility, and value — without destroying what makes it rare.
            </p>
            <blockquote className="font-display text-lg italic text-gold-400/70 border-l border-gold-400/30 pl-6">
              "Adventure is worthwhile in itself." — Amelia Earhart
            </blockquote>
          </div>

          <div className="relative">
            <img
              src="https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Indian landscape"
              className="w-full object-cover"
              style={{ filter: 'grayscale(20%) brightness(0.7) saturate(0.85)', height: '440px' }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-forest-950/80 to-transparent">
              <p className="font-jetbrains text-[10px] text-gold-400/50 tracking-widest">10.8505° N, 76.2711° E</p>
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="mb-24">
          <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-8">Direction</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-forest-700">
            <div className="p-10 border-b md:border-b-0 md:border-r border-forest-700 hover:bg-forest-900/40 transition-colors duration-500">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-8 bg-gold-400/40" />
                <h4 className="font-display text-2xl font-light text-cream">Vision</h4>
              </div>
              <p className="text-mist-500 leading-relaxed text-sm font-light">
                A world where coherent and coordinated efforts lead to sustainable development, social equity, and technological innovation — starting from the places the world forgot to look.
              </p>
            </div>
            <div className="p-10 hover:bg-forest-900/40 transition-colors duration-500">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-8 bg-gold-400/40" />
                <h4 className="font-display text-2xl font-light text-cream">Mission</h4>
              </div>
              <p className="text-mist-500 leading-relaxed text-sm font-light">
                To empower travelers and local communities through innovative, hyper-local technology solutions and quality services that enhance travel experiences and support sustainable sector development.
              </p>
            </div>
          </div>
        </div>

        {/* Principles */}
        <div>
          <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-8">Core Principles</p>

          <div ref={principlesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-forest-800">
            {principles.map((principle, index) => (
              <div
                key={index}
                className="border-b border-r border-forest-800 p-7 group hover:bg-forest-900/40 transition-colors duration-400"
              >
                <div className="flex items-start gap-4">
                  <principle.icon className="h-4 w-4 text-gold-400/40 flex-shrink-0 mt-1 group-hover:text-gold-400/80 transition-colors duration-300" />
                  <div>
                    <h4 className="font-display text-base font-light text-cream mb-2 group-hover:text-gold-200 transition-colors duration-300">
                      {principle.title}
                    </h4>
                    <p className="text-mist-700 text-sm leading-relaxed font-light group-hover:text-mist-500 transition-colors duration-300">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
