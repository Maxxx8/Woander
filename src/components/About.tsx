import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Users, Award, Eye, Compass, BookOpen } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const stats = [
  { icon: Award, label: "Years Exploring", value: "15+" },
  { icon: MapPin, label: "Hidden Places", value: "100+" },
  { icon: Users, label: "Explorers", value: "10,000+" },
  { icon: Eye, label: "Discoveries", value: "2,500+" }
];

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const principlesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: principlesRef.current,
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
    <section ref={sectionRef} id="about" className="py-20 md:py-28 bg-forest-900 relative overflow-hidden">
      {/* Subtle Grid Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect x="3.9" y="3.9" width="0.2" height="0.2" fill="rgba(201, 168, 74, 0.5)" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
          {/* Left - Text */}
          <div>
            <div className="inline-flex items-center gap-2 border border-gold-500/15 px-4 py-2 mb-8">
              <Compass className="w-3.5 h-3.5 text-gold-500/60" />
              <span
                className="text-[10px] uppercase tracking-[0.25em] text-gold-400/70"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                About Woander
              </span>
            </div>

            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-serif text-mist-100 mb-6 leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              For those who believe
              <br />
              <span className="italic text-mist-300/80">the best places</span>
              <br />
              are often not yet discovered.
            </h2>

            <p className="text-mist-500/60 leading-relaxed mb-6 text-sm md:text-base">
              We believe that travel is not just about visiting places—it's about awakening your senses,
              discovering new perspectives, and creating memories that last a lifetime.
            </p>
            <p className="text-mist-500/60 leading-relaxed mb-8 text-sm md:text-base">
              Woander exists for the pathfinders, the curious observers, the cultural wanderers.
              Those who seek the hidden, question the obvious, and believe that some places
              reveal themselves only to those who truly look.
            </p>

            <blockquote
              className="pl-5 border-l-2 border-gold-500/30 text-gold-300/70 italic"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              "Adventure is worthwhile in itself."
              <span className="block mt-1 text-xs text-mist-500/50 not-italic tracking-wider">— Amelia Earhart</span>
            </blockquote>
          </div>

          {/* Right - Image with Overlay */}
          <div className="relative">
            <div className="overflow-hidden">
              <img
                src="https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Misty mountain landscape"
                className="w-full h-[400px] md:h-[500px] object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-900 via-transparent to-transparent" />
            </div>

            {/* Stats Overlay */}
            <div
              ref={principlesRef}
              className="hidden lg:grid grid-cols-2 gap-4 absolute -bottom-6 -left-6 right-8"
            >
              {[
                { label: "Curated", value: "Locally" },
                { label: "Powered by", value: "Community" },
                { label: "For", value: "Explorers" },
                { label: "Since", value: "2009" }
              ].map((item, i) => (
                <div key={i} className="bg-forest-950/90 backdrop-blur-sm border border-gold-500/10 p-4">
                  <div
                    className="text-sm text-gold-400/80 mb-1"
                    style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  >
                    {item.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-mist-600/50">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 mt-20 lg:mt-32">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 border border-gold-500/15 mb-4">
                <stat.icon className="h-5 w-5 text-gold-400/60" />
              </div>
              <p
                className="text-2xl md:text-3xl font-serif text-mist-100 mb-1"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                {stat.value}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-mist-600/50">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Philosophical Footer */}
        <div className="mt-20 pt-8 border-t border-mist-700/10 text-center">
          <p
            className="text-sm text-mist-500/40 italic tracking-wide"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            "Not all those who wander are lost."
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
