import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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

          {/* Right - Image with Overlay */}
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


      </div>
    </section>
  );
};

export default About;
