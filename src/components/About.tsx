import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.about-text-block',
        { opacity: 0, y: 30 },
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
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
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
    <section ref={sectionRef} id="about" className="relative py-32 overflow-hidden" style={{ backgroundColor: '#FBF8F1' }}>
      <div className="relative max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">

        <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-12" style={{ color: 'rgba(48,51,47,0.5)' }}>The Origin</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="about-text-block">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] mb-10" style={{ color: '#263D35' }}>
              Woander was built<br />
              <em className="italic" style={{ color: '#B77B65' }}>for the quiet seekers.</em>
            </h2>
            <p className="text-base leading-relaxed mb-6 font-light" style={{ color: 'rgba(48,51,47,0.75)' }}>
              The places that matter most in India are kept alive by the people who live near them — fishermen who know which reef is untouched, tea farmers who walk trails with no name.
            </p>
            <p className="text-sm leading-relaxed mb-10 font-light" style={{ color: 'rgba(48,51,47,0.6)' }}>
              Woander honors that knowledge. Gives it structure, visibility, and value — without destroying what makes it rare.
            </p>
            <blockquote className="font-display text-lg italic pl-6" style={{ color: '#B77B65', borderLeft: '2px solid rgba(183,123,101,0.25)' }}>
              "Adventure is worthwhile in itself." — Amelia Earhart
            </blockquote>
          </div>

          <div className="about-image-block relative">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Indian landscape"
                className="w-full object-cover"
                style={{
                  height: '440px',
                  borderRadius: '10px',
                  border: '1px solid rgba(38,61,53,0.06)',
                  boxShadow: '0 4px 20px rgba(38,61,53,0.06)',
                  filter: 'brightness(1.15) saturate(1.1) sepia(0.05)',
                }}
              />
              <p className="font-mono text-[10px] tracking-[0.15em] uppercase mt-4" style={{ color: 'rgba(48,51,47,0.35)' }}>
                10.8505° N, 76.2711° E — Nelliyampathy, field season 2024
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
