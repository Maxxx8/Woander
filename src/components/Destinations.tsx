import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import DestinationCard from './DestinationCard';
import SwipeableCardContainer from './SwipeableCardContainer';

gsap.registerPlugin(ScrollTrigger);

const destinations = [
  {
    title: "Ladakh Himalayas",
    location: "Ladakh, India",
    description: "Experience the pristine beauty of high-altitude landscapes, ancient monasteries, and crystal-clear lakes in the roof of the world.",
    image: "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    price: "₹25,000"
  },
  {
    title: "Kerala Backwaters",
    location: "Alleppey, Kerala",
    description: "Cruise through serene backwaters, lush paddy fields, and traditional villages on a houseboat in God's Own Country.",
    image: "https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    price: "₹15,000"
  },
  {
    title: "Thar Desert",
    location: "Jaisalmer, Rajasthan",
    description: "Witness golden sunsets over endless sand dunes, experience camel safaris, and sleep under a blanket of stars.",
    image: "https://images.pexels.com/photos/1739856/pexels-photo-1739856.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    price: "₹20,000"
  },
  {
    title: "Western Ghats",
    location: "Munnar, Kerala",
    description: "Explore misty hills, sprawling tea plantations, and diverse wildlife in one of the world's biodiversity hotspots.",
    image: "https://images.pexels.com/photos/4321802/pexels-photo-4321802.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    price: "₹12,000"
  },
  {
    title: "Andaman Islands",
    location: "Port Blair, Andaman",
    description: "Dive into crystal-clear waters, pristine beaches, and vibrant coral reefs in India's tropical paradise.",
    image: "https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    price: "₹30,000"
  },
  {
    title: "Himalayan Valleys",
    location: "Manali, Himachal Pradesh",
    description: "Adventure through snow-capped peaks, alpine meadows, and charming hill stations in the mighty Himalayas.",
    image: "https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    price: "₹18,000"
  }
];

const Destinations = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

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

      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.destination-card');
        gsap.fromTo(cards,
          { opacity: 0, y: 60, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: cardsRef.current,
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
    <section ref={sectionRef} id="destinations" className="py-20 bg-gradient-to-b from-transparent via-white/30 to-transparent relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/40 via-transparent to-blue-50/40 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div ref={headerRef} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 drop-shadow-lg">
            Incredible Destinations
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto drop-shadow-md">
            From the towering Himalayas to pristine beaches, discover India's most breathtaking landscapes
          </p>
        </div>

        <div ref={cardsRef}>
          <SwipeableCardContainer
            mobileCards={1}
            tabletCards={2}
            desktopCards={2}
            showDots={true}
            showArrows={true}
            className="px-4 md:px-0"
          >
            {destinations.map((destination, index) => (
              <div key={index} className="destination-card h-full">
                <DestinationCard {...destination} />
              </div>
            ))}
          </SwipeableCardContainer>
        </div>
      </div>
    </section>
  );
};

export default Destinations;
