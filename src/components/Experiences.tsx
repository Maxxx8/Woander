import React, { useState } from 'react';
import { MapPin, Clock, Users, Camera, Mountain, Waves, TreePine, Sun, Heart, Compass } from 'lucide-react';

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
}

const experiences: Experience[] = [
  {
    id: 'mountain',
    title: 'Himalayan Trek',
    category: 'Mountain Exploration',
    location: 'Manali to Leh',
    duration: '7-10 Days',
    groupSize: '4-12 Explorers',
    image: 'https://images.pexels.com/photos/2437299/pexels-photo-2437299.jpeg?auto=compress&cs=tinysrgb&w=1920',
    description: 'Embark on a breathtaking journey through the majestic Himalayas. Experience crisp mountain air, snow-capped peaks, and ancient monasteries.',
    highlights: [
      'Hidden mountain trails',
      'Ancient Buddhist monasteries',
      'Night under star-filled skies',
      'Local Himalayan culture',
    ],
    icon: <Mountain className="h-6 w-6" />,
  },
  {
    id: 'coastal',
    title: 'Coastal Expedition',
    category: 'Ocean Discovery',
    location: 'Andaman Islands',
    duration: '5-7 Days',
    groupSize: '2-8 Explorers',
    image: 'https://images.pexels.com/photos/994605/pexels-photo-994605.jpeg?auto=compress&cs=tinysrgb&w=1920',
    description: 'Dive into crystal-clear waters, walk on pristine white sand, and discover vibrant coral reefs.',
    highlights: [
      'Snorkeling in coral gardens',
      'Beach camping under palms',
      'Sunset journeys by boat',
      'Fresh seafood by the shore'
    ],
    icon: <Waves className="h-6 w-6" />,
  },
  {
    id: 'forest',
    title: 'Wildlife Journey',
    category: 'Forest Expedition',
    location: 'Western Ghats',
    duration: '4-6 Days',
    groupSize: '4-10 Explorers',
    image: 'https://images.pexels.com/photos/1287445/pexels-photo-1287445.jpeg?auto=compress&cs=tinysrgb&w=1920',
    description: 'Walk through ancient forests, spot exotic wildlife, and discover hidden waterfalls.',
    highlights: [
      'Tiger safari experiences',
      'Hidden waterfall treks',
      'Bird watching at dawn',
      'Forest village stays'
    ],
    icon: <TreePine className="h-6 w-6" />,
  },
  {
    id: 'desert',
    title: 'Desert Passage',
    category: 'Arid Exploration',
    location: 'Rajasthan',
    duration: '4-5 Days',
    groupSize: '2-6 Explorers',
    image: 'https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=1920',
    description: 'Experience the magic of golden sand dunes, night skies, and forgotten fortresses.',
    highlights: [
      'Camel safari at sunset',
      'Desert camping under stars',
      'Forgotten fort exploration',
      'Traditional desert culture'
    ],
    icon: <Sun className="h-6 w-6" />,
  },
];

const Experiences = () => {
  const [activeExperience, setActiveExperience] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <section id="experiences" className="py-24 bg-forest-950 relative overflow-hidden">
      {/* Atmospheric Lines */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(201, 168, 74, 0.3)" strokeWidth="0.05" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(201, 168, 74, 0.2)" strokeWidth="0.05" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(201, 168, 74, 0.3)" strokeWidth="0.05" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-gold-500/15 px-4 py-2 mb-6">
            <Compass className="w-3.5 h-3.5 text-gold-500/60" />
            <span
              className="text-[10px] uppercase tracking-[0.25em] text-gold-400/70"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Immersive Experiences
            </span>
          </div>
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-serif text-mist-100 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Step into extraordinary
            <br />
            <span className="italic text-mist-300/80">journeys of discovery.</span>
          </h2>
          <p className="text-mist-500/60 max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            Each experience is crafted to transport you beyond the ordinary.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {experiences.map((experience) => (
            <div
              key={experience.id}
              className="group relative overflow-hidden cursor-pointer transition-all duration-500"
              style={{ height: activeExperience === experience.id ? '700px' : '480px' }}
              onMouseEnter={() => setHoveredCard(experience.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => setActiveExperience(activeExperience === experience.id ? null : experience.id)}
            >
              {/* Background */}
              <div
                className="absolute inset-0 bg-cover bg-center grayscale-[30%] transition-all duration-700"
                style={{
                  backgroundImage: `url(${experience.image})`,
                  transform: hoveredCard === experience.id ? 'scale(1.05)' : 'scale(1)',
                  filter: hoveredCard === experience.id ? 'grayscale(10%)' : 'grayscale(30%)',
                }}
              />
              <div className={`absolute inset-0 bg-gradient-to-t transition-all duration-500 ${
                hoveredCard === experience.id
                  ? 'from-forest-950 via-forest-950/60 to-forest-900/40'
                  : 'from-forest-950/90 via-forest-900/50 to-transparent'
              }`} />

              {/* Icon */}
              <div className="absolute top-6 left-6 w-12 h-12 flex items-center justify-center bg-forest-950/80 backdrop-blur-sm border border-gold-500/15 text-gold-400/70">
                {experience.icon}
              </div>

              {/* Category */}
              <div className="absolute top-6 right-6 px-3 py-1.5 bg-forest-950/60 backdrop-blur-sm border border-gold-500/10">
                <span className="text-[10px] uppercase tracking-wider text-gold-300/60">{experience.category}</span>
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3
                  className="text-2xl sm:text-3xl font-serif text-mist-100 mb-3"
                  style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {experience.title}
                </h3>

                <div className="flex items-center gap-4 text-xs text-mist-500/60 mb-4">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{experience.location}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" />{experience.duration}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-3 h-3" />{experience.groupSize}</span>
                </div>

                <div className={`transition-all duration-500 ${
                  activeExperience === experience.id ? 'opacity-100 max-h-96 mb-4' : 'opacity-0 max-h-0 overflow-hidden'
                }`}>
                  <p className="text-mist-300/70 text-sm mb-4">{experience.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gold-400/50 text-xs uppercase tracking-wider">
                      <Camera className="w-3.5 h-3.5" />
                      <span>Highlights</span>
                    </div>
                    {experience.highlights.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-mist-400/80 text-sm">
                        <span className="text-gold-400/50 mt-0.5">-</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className={`w-full py-3 transition-all duration-300 ${
                    activeExperience === experience.id
                      ? 'bg-gold-500/20 border border-gold-500/30 text-gold-300 hover:bg-gold-500/30'
                      : 'bg-forest-800/50 border border-mist-700/20 text-mist-400 hover:border-gold-500/20'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-xs uppercase tracking-wider">
                    {activeExperience === experience.id ? 'Begin Journey' : 'Expand'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center py-12 border-t border-mist-700/10">
          <h3
            className="text-xl md:text-2xl font-serif text-mist-100 mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Ready for your next journey of discovery?
          </h3>
          <p className="text-mist-500/60 mb-8 max-w-lg mx-auto text-sm">
            Let us create a personalized experience that matches your curiosity. Every journey is unique.
          </p>
          <button
            onClick={() => window.location.href = '/experiences'}
            className="px-8 py-3 bg-forest-800/80 border border-gold-500/15 text-mist-200 text-sm uppercase tracking-wider hover:bg-forest-700 hover:border-gold-400/25 transition-all duration-500"
          >
            Explore Experiences
          </button>
        </div>
      </div>
    </section>
  );
};

export default Experiences;
