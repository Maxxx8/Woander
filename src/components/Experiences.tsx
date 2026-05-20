import React, { useState } from 'react';
import { Mountain, Waves, TreePine, Sun, Star, MapPin, Clock, Users, Camera } from 'lucide-react';

interface Experience {
  id: string;
  title: string;
  category: string;
  location: string;
  duration: string;
  groupSize: string;
  image: string;
  description: string;
  highlights: string[];
  icon: React.ReactNode;
  gradient: string;
  ambientSound?: string;
}

const experiences: Experience[] = [
  {
    id: 'mountain',
    title: 'Himalayan Trek',
    category: 'Mountain Adventure',
    location: 'Manali to Leh',
    duration: '7-10 Days',
    groupSize: '4-12 People',
    image: 'https://images.pexels.com/photos/2437299/pexels-photo-2437299.jpeg?auto=compress&cs=tinysrgb&w=1920',
    description: 'Embark on a breathtaking journey through the majestic Himalayas. Experience crisp mountain air, snow-capped peaks, and ancient monasteries nestled in the clouds.',
    highlights: [
      'Trek through pristine mountain trails',
      'Visit ancient Buddhist monasteries',
      'Camp under star-filled skies',
      'Experience local Himalayan culture',
      'Witness sunrise over snow peaks'
    ],
    icon: <Mountain className="h-8 w-8" />,
    gradient: 'from-blue-600 to-cyan-500'
  },
  {
    id: 'beach',
    title: 'Coastal Paradise',
    category: 'Beach & Islands',
    location: 'Andaman Islands',
    duration: '5-7 Days',
    groupSize: '2-8 People',
    image: 'https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=1920',
    description: 'Dive into crystal-clear turquoise waters, walk on pristine white sand beaches, and discover vibrant coral reefs teeming with marine life.',
    highlights: [
      'Snorkeling in coral gardens',
      'Beach camping under palms',
      'Sunset cruise experiences',
      'Water sports adventures',
      'Fresh seafood dinners by the shore'
    ],
    icon: <Waves className="h-8 w-8" />,
    gradient: 'from-teal-500 to-blue-400'
  },
  {
    id: 'forest',
    title: 'Wildlife Expedition',
    category: 'Forest Safari',
    location: 'Jim Corbett National Park',
    duration: '3-5 Days',
    groupSize: '4-10 People',
    image: 'https://images.pexels.com/photos/1661471/pexels-photo-1661471.jpeg?auto=compress&cs=tinysrgb&w=1920',
    description: 'Venture deep into lush forests in search of majestic tigers, elephants, and exotic birds. Experience the raw beauty of India\'s wilderness.',
    highlights: [
      'Early morning jungle safaris',
      'Tiger and elephant spotting',
      'Bird watching expeditions',
      'Nature photography sessions',
      'Campfire stories under stars'
    ],
    icon: <TreePine className="h-8 w-8" />,
    gradient: 'from-green-600 to-emerald-500'
  },
  {
    id: 'desert',
    title: 'Desert Odyssey',
    category: 'Desert Experience',
    location: 'Jaisalmer, Rajasthan',
    duration: '4-6 Days',
    groupSize: '4-15 People',
    image: 'https://images.pexels.com/photos/3010168/pexels-photo-3010168.jpeg?auto=compress&cs=tinysrgb&w=1920',
    description: 'Journey across golden sand dunes on camelback, witness spectacular sunsets, and spend nights in luxury desert camps under infinite stars.',
    highlights: [
      'Camel safari through dunes',
      'Traditional Rajasthani performances',
      'Luxury camping experience',
      'Sunset and sunrise views',
      'Visit ancient desert forts'
    ],
    icon: <Sun className="h-8 w-8" />,
    gradient: 'from-orange-500 to-amber-600'
  }
];

const Experiences = () => {
  const [activeExperience, setActiveExperience] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section id="experiences" className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-orange-100 rounded-full mb-6">
            <Star className="h-8 w-8 text-orange-600" />
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Immersive Experiences
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Step into extraordinary adventures that awaken your senses. Each experience is crafted to transport you to another world.
          </p>
        </div>

        {/* Experience Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {experiences.map((experience) => (
            <div
              key={experience.id}
              className="group relative overflow-hidden rounded-3xl shadow-xl transition-all duration-500 cursor-pointer"
              style={{ height: activeExperience === experience.id ? '700px' : '500px' }}
              onMouseEnter={() => setHoveredCard(experience.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setActiveExperience(activeExperience === experience.id ? null : experience.id)}
            >
              {/* Background Image with Parallax Effect */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
                style={{
                  backgroundImage: `url(${experience.image})`,
                  transform: hoveredCard === experience.id ? 'scale(1.1)' : 'scale(1)'
                }}
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${hoveredCard === experience.id ? 'from-black/90 via-black/60' : 'from-black/70 via-black/40'} to-transparent transition-all duration-500`} />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-8">
                {/* Icon Badge */}
                <div className={`absolute top-8 left-8 p-4 rounded-2xl bg-gradient-to-br ${experience.gradient} text-white shadow-lg transform transition-all duration-500 ${hoveredCard === experience.id ? 'scale-110 rotate-6' : 'scale-100'}`}>
                  {experience.icon}
                </div>

                {/* Category Tag */}
                <div className="inline-flex items-center space-x-2 mb-4 self-start">
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${experience.gradient} shadow-lg`}>
                    {experience.category}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-4xl font-bold text-white mb-3 transform transition-all duration-300">
                  {experience.title}
                </h3>

                {/* Info Grid */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-white/90">{experience.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-white/90">{experience.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-white/90">{experience.groupSize}</span>
                  </div>
                </div>

                {/* Description - Shows on expand */}
                <div className={`transform transition-all duration-500 origin-bottom ${activeExperience === experience.id ? 'opacity-100 max-h-96 mb-4' : 'opacity-0 max-h-0 overflow-hidden'}`}>
                  <p className="text-white/90 text-lg leading-relaxed mb-4">
                    {experience.description}
                  </p>

                  {/* Highlights */}
                  <div className="space-y-2">
                    <h4 className="text-white font-semibold text-lg mb-3 flex items-center space-x-2">
                      <Camera className="h-5 w-5 text-orange-400" />
                      <span>Experience Highlights</span>
                    </h4>
                    {experience.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-start space-x-3 text-white/80">
                        <span className="text-orange-400 mt-1">•</span>
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button
                  className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                    activeExperience === experience.id
                      ? `bg-gradient-to-r ${experience.gradient} text-white shadow-2xl transform hover:scale-105`
                      : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {activeExperience === experience.id ? 'Book This Experience' : 'Explore More'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl shadow-2xl">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready for Your Next Experience?
          </h3>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Let us create a personalized experience that matches your dreams. Every journey is unique, just like you.
          </p>
          <button className="px-10 py-4 bg-white text-orange-600 text-lg font-bold rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-xl">
            Plan My Experience
          </button>
        </div>
      </div>
    </section>
  );
};

export default Experiences;
