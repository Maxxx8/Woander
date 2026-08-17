import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FieldCaption } from './FieldElements';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

      gsap.fromTo('.about-image-block',
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.about-image-block',
            start: 'top 75%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative py-32 overflow-hidden" style={{ backgroundColor: '#FAF8F2' }}>
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        <p className="font-mono text-[10px] tracking-widest uppercase mb-10" style={{ color: '#71877A' }}>The Origin</p>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          <div className="about-text-block lg:col-span-6 lg:col-start-1">
            <h2 className="font-display text-5xl md:text-6xl font-light leading-[1.05] mb-10" style={{ color: '#243A34' }}>
              Woander was built<br />
              <em className="italic" style={{ color: '#B97862' }}>for the quiet seekers.</em>
            </h2>
            <p className="text-base leading-relaxed mb-6 font-light" style={{ color: '#27302D' }}>
              The places that matter most in India are kept alive by the people who live near them — fishermen who know which reef is untouched, tea farmers who walk trails with no name.
            </p>
            <p className="text-sm leading-relaxed mb-10 font-light" style={{ color: 'rgba(36,58,52,0.7)' }}>
              Woander honors that knowledge. Gives it structure, visibility, and value — without destroying what makes it rare.
            </p>
            <blockquote className="font-display text-xl italic pl-6" style={{ color: '#B97862', borderLeft: '2px solid rgba(185,120,98,0.3)' }}>
              "Adventure is worthwhile in itself." — Amelia Earhart
            </blockquote>
          </div>

          <div className="about-image-block relative lg:col-span-5 lg:col-start-8 lg:-mt-12">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Indian landscape"
                className="w-full object-cover rounded-sm"
                style={{ height: '480px', filter: 'brightness(1.05) saturate(1.05) sepia(0.08)' }}
              />
              <FieldCaption coordinate="10.8505° N, 76.2711° E" caption="Nelliyampathy — field season 2024" />

              <div className="absolute -bottom-12 -left-12 w-40 h-40 hidden lg:block">
                <img
                  src="https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Field journal detail"
                  className="w-full h-full object-cover rounded-sm"
                  style={{ border: '3px solid #FAF8F2', filter: 'brightness(1.05) saturate(1.05) sepia(0.08)' }}
                />
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
