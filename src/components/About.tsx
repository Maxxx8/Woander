import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import { Users, Award, MapPin, Heart, Target, Lightbulb, Globe, Recycle, Users2, Eye, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Users, label: "Happy Travelers", value: "10,000+" },
  { icon: Award, label: "Years Experience", value: "15+" },
  { icon: MapPin, label: "Destinations", value: "100+" },
  { icon: Heart, label: "5-Star Reviews", value: "2,500+" }
];

const principles = [
  {
    icon: TrendingUp,
    title: "Covariance",
    description: "Ensuring that the efforts and outcomes of the collective's projects are interrelated and contribute to a common goal."
  },
  {
    icon: Recycle,
    title: "Continuous Improvement",
    description: "No processes are perfect, iteration and implementing improvements at higher frequencies."
  },
  {
    icon: Target,
    title: "Alignment",
    description: "All members and projects must adhere to a set of shared values and objectives to maintain coherence and maximize impact."
  },
  {
    icon: Globe,
    title: "Sustainability",
    description: "Prioritizing projects that have long-term benefits for the environment, society, and economy."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Encouraging creativity and technological advancements to solve complex problems."
  },
  {
    icon: Users2,
    title: "Community Engagement",
    description: "Actively involving local communities in project development and implementation."
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "Maintaining open communication and accountability in all activities."
  }
];

const About = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const principlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (principlesRef.current) {
        const cards = principlesRef.current.children;
        gsap.fromTo(cards,
          { opacity: 0, y: 40, rotateY: -15 },
          {
            opacity: 1,
            y: 0,
            rotateY: 0,
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
    <section ref={sectionRef} id="about" className="py-20 bg-white/50 backdrop-blur-md relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 via-transparent to-coral-50/30 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <div className="mb-6">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 drop-shadow-lg opacity-0 animate-fade-in">
                About Woander
              </h2>
            </div>
            <p className="text-lg text-gray-800 mb-6 leading-relaxed drop-shadow-sm">
              We believe that travel is not just about visiting places—it's about awakening your senses,
              discovering new perspectives, and creating memories that last a lifetime. For over 15 years,
              we've been crafting extraordinary journeys across India's diverse landscapes.
            </p>
            <p className="text-lg text-gray-800 mb-8 leading-relaxed drop-shadow-sm">
              From the snow-capped peaks of the Himalayas to the sun-kissed beaches of Goa,
              from the royal palaces of Rajasthan to the serene backwaters of Kerala—we help you
              experience the incredible diversity that makes India truly magical.
            </p>
            <blockquote className="text-xl text-coral-600 italic font-medium border-l-4 border-coral-500 pl-6">
              "Adventure is worthwhile in itself." - Amelia Earhart
            </blockquote>
          </div>

          <div className="relative">
            <img
              src="https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Indian landscape"
              className="rounded-2xl shadow-2xl"
            />
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
              <p className="text-2xl font-bold text-coral-500">15+</p>
              <p className="text-gray-600">Years of Excellence</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-coral-100 rounded-full mb-4 transition-transform duration-300 hover:scale-110">
                <stat.icon className="h-8 w-8 text-coral-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Vision & Mission
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-coral-50/80 to-sunset-100/80 backdrop-blur-lg rounded-2xl p-8 border border-coral-200 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-coral-500 rounded-full p-3">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">Vision</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To create a world where Coherent and Coordinated efforts lead to Sustainable Development,
                Social Equity, and Technological Innovation.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50/80 to-teal-100/80 backdrop-blur-lg rounded-2xl p-8 border border-teal-200 transition-all duration-300 hover:shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-teal-500 rounded-full p-3">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900">Mission</h4>
              </div>
              <p className="text-gray-700 leading-relaxed">
                To Empower Travelers and Local Communities through Innovative, Hyper-local Technology solutions
                and Quality Services that enhance Travel Experiences and support sustainable Sector development.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Core Principles & Values
            </h3>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our principles guide every decision we make and every experience we create
            </p>
          </div>

          <div ref={principlesRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {principles.map((principle, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-lg border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:border-coral-300 hover:-translate-y-2 hover:scale-[1.02] cursor-pointer group"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div className="flex items-start gap-4">
                  <div className="bg-coral-100 rounded-lg p-3 flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <principle.icon className="h-6 w-6 text-coral-500" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {principle.title}
                    </h4>
                    <p className="text-gray-600 leading-relaxed">
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