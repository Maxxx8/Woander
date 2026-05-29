import React, { useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DestinationCard from './DestinationCard';
import SwipeableCardContainer from './SwipeableCardContainer';

gsap.registerPlugin(ScrollTrigger);

const destinations = [
  {
    title: "Ladakh Himalayas",
    location: "Ladakh, India",
    description: "Experience the pristine beauty of high-altitude landscapes, ancient monasteries, and crystal-clear lakes.",
    image: "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    price: "₹25,000"
  },
  {
    title: "Kerala Backwaters",
    location: "Alleppey, Kerala",
    description: "Cruise through serene backwaters, lush paddy fields, and traditional villages.",
    image: "https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    price: "₹15,000"
  },
  {
    title: "Thar Desert",
    location: "Jaisalmer, Rajasthan",
    description: "Witness golden sunsets over endless sand dunes and sleep under the stars.",
    image: "https://images.pexels.com/photos/1739856/pexels-photo-1739856.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    price: "₹20,000"
  },
  {
    title: "Western Ghats",
    location: "Munnar, Kerala",
    description: "Explore misty hills, sprawling tea plantations, and diverse wildlife.",
    image: "https://images.pexels.com/photos/4321802/pexels-photo-4321802.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    price: "₹12,000"
  },
  {
    title: "Andaman Islands",
    location: "Port Blair, Andaman",
    description: "Dive into crystal-clear waters, pristine beaches, and vibrant coral reefs.",
    image: "https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    price: "₹30,000"
  },
  {
    title: "Himalayan Valleys",
    location: "Manali, Himachal",
    description: "Adventure through snow-capped peaks, alpine meadows, and charming hill stations.",
    image: "https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    price: "₹18,000"
  }
];

const Destinations = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (headerRef.current) {
        gsap.fromTo(headerRef.current,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-24 bg-forest-900 relative overflow-hidden">
      {/* Subtle Topographic Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-5 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="topo" x="0" y="0" width="15" height="15" patternUnits="userSpaceOnUse">
            <path d="M0 7.5 Q3.75 3.75 7.5 7.5 T15 7.5" fill="none" stroke="rgba(201, 168, 74, 0.3)" strokeWidth="0.1" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#topo)" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className="text-center mb-20">
          <div className="inline-flex items-center gap-2 border border-gold-500/15 px-4 py-2 mb-6">
            <MapPin className="w-3.5 h-3.5 text-gold-500/60" />
            <span
              className="text-[10px] uppercase tracking-[0.25em] text-gold-400/70"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Destinations
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-mist-100 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Places that feel like
            <br />
            <span className="italic text-mist-300/80">discoveries.</span>
          </h2>
          <p className="text-mist-500/60 max-w-lg mx-auto leading-relaxed text-sm md:text-base mt-6">
            From the towering Himalayas to the Western Ghats, uncover India through the eyes of explorers.
          </p>
        </div>

        <SwipeableCardContainer
          mobileCards={1}
          tabletCards={2}
          desktopCards={2}
          showDots={true}
          showArrows={true}
          className="px-4 md:px-0"
        >
          {destinations.map((destination, index) => (
            <DestinationCard key={index} {...destination} />
          ))}
        </SwipeableCardContainer>
      </div>
    </section>
  );
};

export default Destinations;
