import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TopoBackground, FieldCaption } from './FieldElements';

gsap.registerPlugin(ScrollTrigger);

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    <section ref={sectionRef} id="about" className="relative py-32 bg-cream overflow-hidden">
      <TopoBackground opacity={0.04} />
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">

        {/* Section label */}
        <p className="font-jetbrains text-[10px] text-forest-700/70 tracking-widest uppercase mb-10">The Origin</p>

        {/* Asymmetrical layout — text offset left, image overlapping right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20">
          <div className="about-text-block lg:col-span-6 lg:col-start-1">
            <h2 className="font-display text-5xl md:text-6xl font-light text-forest-950 leading-[1.05] mb-10">
              Woander was built<br />
              <em className="italic text-forest-600">for the quiet seekers.</em>
            </h2>
            <p className="text-forest-800 text-base leading-relaxed mb-6 font-light">
              The places that matter most in India are kept alive by the people who live near them — fishermen who know which reef is untouched, tea farmers who walk trails with no name.
            </p>
            <p className="text-forest-700 text-sm leading-relaxed mb-10 font-light">
              Woander honors that knowledge. Gives it structure, visibility, and value — without destroying what makes it rare.
            </p>
            <blockquote className="font-display text-xl italic text-forest-600 border-l border-forest-400/40 pl-6">
              "Adventure is worthwhile in itself." — Amelia Earhart
            </blockquote>
          </div>

          {/* Image — offset right, overlapping */}
          <div className="about-image-block relative lg:col-span-5 lg:col-start-8 lg:-mt-12">
            <div className="relative">
              <img
                src="https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Indian landscape"
                className="w-full object-cover field-image"
                style={{ height: '480px' }}
              />
              <FieldCaption coordinate="10.8505° N, 76.2711° E" caption="Nelliyampathy — field season 2024" />

              {/* Offset secondary image — overlapping */}
              <div className="absolute -bottom-12 -left-12 w-40 h-40 hidden lg:block">
                <img
                  src="https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=400"
                  alt="Field journal detail"
                  className="w-full h-full object-cover field-image border-2 border-forest-900"
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
