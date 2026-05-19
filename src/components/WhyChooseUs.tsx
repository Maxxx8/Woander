import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, Brain, DollarSign, Heart, MapPin, Shield, Sparkles, TrendingUp } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: MapPin,
    title: 'Curated by Locals',
    description: 'Connect with authentic experiences handpicked by people who know these places best',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Brain,
    title: 'Smart Planning',
    description: 'AI-powered itinerary suggestions that adapt to your interests and travel style',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: DollarSign,
    title: 'Cost Transparency',
    description: 'See real costs upfront with detailed breakdowns for accommodation, food, and activities',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Heart,
    title: 'Community Driven',
    description: 'Discover hidden gems and insider tips from real travelers who have been there',
    color: 'from-red-500 to-orange-500'
  },
  {
    icon: Shield,
    title: 'Safe & Secure',
    description: 'Verified listings and secure bookings with 24/7 support for peace of mind',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    icon: Sparkles,
    title: 'Unique Experiences',
    description: 'Go beyond tourist traps with personalized adventures tailored to your preferences',
    color: 'from-yellow-500 to-amber-500'
  },
  {
    icon: Users,
    title: 'Small Groups',
    description: 'Intimate group sizes ensure better connections and more meaningful experiences',
    color: 'from-teal-500 to-green-500'
  },
  {
    icon: TrendingUp,
    title: 'Flexible Booking',
    description: 'Change your plans with ease - we understand that travel can be unpredictable',
    color: 'from-pink-500 to-rose-500'
  }
];

const WhyChooseUs = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const [travelerCount, setTravelerCount] = useState(0);
  const [destinationCount, setDestinationCount] = useState(0);
  const [ratingValue, setRatingValue] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.fromTo(cards,
          { opacity: 0, y: 50, scale: 0.9, rotateX: 15 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 75%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (statsRef.current) {
        ScrollTrigger.create({
          trigger: statsRef.current,
          start: 'top 80%',
          onEnter: () => {
            gsap.to({ val: 0 }, {
              val: 10000,
              duration: 2,
              ease: 'power2.out',
              onUpdate: function() {
                setTravelerCount(Math.floor(this.targets()[0].val));
              },
            });
            gsap.to({ val: 0 }, {
              val: 100,
              duration: 2,
              ease: 'power2.out',
              onUpdate: function() {
                setDestinationCount(Math.floor(this.targets()[0].val));
              },
            });
            gsap.to({ val: 0 }, {
              val: 4.9,
              duration: 2,
              ease: 'power2.out',
              onUpdate: function() {
                setRatingValue(this.targets()[0].val);
              },
            });
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-b from-white via-gray-50 to-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(96,165,250,0.1),transparent_50%)] pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold mb-4">
            Why Choose Woander
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Travel Smarter, Not Harder
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We combine local expertise, smart technology, and community insights to create
            unforgettable travel experiences that go beyond the guidebook
          </p>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] border border-gray-100 cursor-pointer"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>

              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>

              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
            </div>
          ))}
        </div>

        <div ref={statsRef} className="text-center">
          <div className="inline-flex items-center gap-8 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl px-8 py-6 border border-blue-100 shadow-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{travelerCount > 0 ? `${travelerCount.toLocaleString()}+` : '10,000+'}</p>
              <p className="text-sm text-gray-600">Happy Travelers</p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{destinationCount > 0 ? `${destinationCount}+` : '100+'}</p>
              <p className="text-sm text-gray-600">Destinations</p>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="text-center">
              <p className="text-3xl font-bold text-pink-600">{ratingValue > 0 ? `${ratingValue.toFixed(1)}/5` : '4.9/5'}</p>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
