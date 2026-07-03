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
    description: "High-altitude stillness. Ancient monasteries suspended between sky and silence. A landscape that changes you.",
    image: "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    price: "₹25,000"
  },
  {
    title: "Kerala Backwaters",
    location: "Alleppey, Kerala",
    description: "A labyrinth of canals that time forgot. Paddy fields, coconut palms, and the slow rhythm of houseboat life.",
    image: "https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    price: "₹15,000"
  },
  {
    title: "Thar Desert",
    location: "Jaisalmer, Rajasthan",
    description: "Sunsets that turn the sky to fire. Camel paths across golden dunes. Stars so dense they seem impossible.",
    image: "https://images.pexels.com/photos/1739856/pexels-photo-1739856.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    price: "₹20,000"
  },
  {
    title: "Western Ghats",
    location: "Munnar, Kerala",
    description: "Misty hills that hold their secrets well. Tea estates, leopard trails, and air that carries the smell of cardamom.",
    image: "https://images.pexels.com/photos/4321802/pexels-photo-4321802.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    price: "₹12,000"
  },
  {
    title: "Andaman Islands",
    location: "Port Blair, Andaman",
    description: "Bioluminescent shores. Coral gardens untouched for decades. The sea as it was before we found it.",
    image: "https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    price: "₹30,000"
  },
  {
    title: "Himalayan Valleys",
    location: "Manali, Himachal Pradesh",
    description: "Snow-lit passes. Apple orchards in October. Villages that still welcome strangers with food before questions.",
    image: "https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    price: "₹18,000"
  }
];

const Destinations = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (cardsRef.current) {
        const cards = cardsRef.current.querySelectorAll('.destination-card');
        gsap.fromTo(cards,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.12,
            ease: 'power3.out',
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
    <section ref={sectionRef} id="destinations" className="py-20 bg-forest-950">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div ref={cardsRef}>
          <SwipeableCardContainer
            mobileCards={1}
            tabletCards={2}
            desktopCards={2}
            showDots={true}
            showArrows={true}
            className="px-0"
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
