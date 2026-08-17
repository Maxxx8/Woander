import React, { useState } from 'react';
import { Compass, Map, Calendar, Users, Mountain, Waves, Palmtree, Camera, Heart, Star, Clock, MapPin, Plus, ArrowRight, ChevronRight } from 'lucide-react';
import QuoteSection from '../components/QuoteSection';
import Footer from '../components/Footer';
import AdventureCreator from '../components/AdventureCreator';
import MyAdventures from '../components/MyAdventures';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import SwipeableCardContainer from '../components/SwipeableCardContainer';
import { useRandomQuotes } from '../hooks/useRandomQuotes';
import { useSearch } from '../hooks/useSearch';
import { TopoBackground } from '../components/FieldElements';

const adventureTypes = [
  {
    icon: Mountain,
    title: "Mountain Adventures",
    description: "Trek through the majestic Himalayas and conquer breathtaking peaks",
    image: "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1200",
    difficulty: "Challenging",
    duration: "7-14 days",
    price: "From ₹1,20,000"
  },
  {
    icon: Waves,
    title: "Coastal Escapes",
    description: "Relax on pristine beaches and explore vibrant coastal cultures",
    image: "https://images.pexels.com/photos/1139541/pexels-photo-1139541.jpeg?auto=compress&cs=tinysrgb&w=1200",
    difficulty: "Easy",
    duration: "5-7 days",
    price: "From ₹80,000"
  },
  {
    icon: Palmtree,
    title: "Desert Adventures",
    description: "Experience the magic of Rajasthan's golden sand dunes",
    image: "https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=1200",
    difficulty: "Moderate",
    duration: "4-6 days",
    price: "From ₹90,000"
  },
  {
    icon: Camera,
    title: "Cultural Journeys",
    description: "Immerse yourself in India's rich heritage and traditions",
    image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1200",
    difficulty: "Easy",
    duration: "6-10 days",
    price: "From ₹1,00,000"
  },
  {
    icon: Compass,
    title: "Wildlife Safaris",
    description: "Spot tigers, elephants, and exotic birds in natural habitats",
    image: "https://images.pexels.com/photos/2138126/pexels-photo-2138126.jpeg?auto=compress&cs=tinysrgb&w=1200",
    difficulty: "Easy",
    duration: "3-5 days",
    price: "From ₹70,000"
  },
  {
    icon: Heart,
    title: "Wellness Retreats",
    description: "Rejuvenate your mind, body, and soul in tranquil settings",
    image: "https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=1200",
    difficulty: "Easy",
    duration: "5-7 days",
    price: "From ₹95,000"
  }
];

const featuredAdventures = [
  {
    title: "Himalayan Trek to Everest Base Camp",
    location: "Nepal Himalayas",
    duration: "14 days",
    difficulty: "Challenging",
    rating: 4.9,
    reviews: 342,
    price: "₹2,40,000",
    image: "https://images.pexels.com/photos/618848/pexels-photo-618848.jpeg?auto=compress&cs=tinysrgb&w=1600",
    highlights: ["Everest Base Camp", "Sherpa Villages", "Buddhist Monasteries"]
  },
  {
    title: "Kerala Backwater Cruise",
    location: "Kerala",
    duration: "6 days",
    difficulty: "Easy",
    rating: 4.8,
    reviews: 524,
    price: "₹1,10,000",
    image: "https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=1600",
    highlights: ["Houseboat Stay", "Traditional Cuisine", "Ayurvedic Spa"]
  },
  {
    title: "Rajasthan Royal Heritage",
    location: "Rajasthan",
    duration: "8 days",
    difficulty: "Easy",
    rating: 4.7,
    reviews: 456,
    price: "₹1,50,000",
    image: "https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=1600",
    highlights: ["Palace Hotels", "Camel Safari", "Cultural Performances"]
  },
  {
    title: "Ladakh High Altitude Adventure",
    location: "Ladakh",
    duration: "10 days",
    difficulty: "Challenging",
    rating: 4.9,
    reviews: 289,
    price: "₹1,80,000",
    image: "https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg?auto=compress&cs=tinysrgb&w=1600",
    highlights: ["Pangong Lake", "Nubra Valley", "Monastery Visits"]
  },
];

const whyChooseUs = [
  { icon: Users, title: "Expert Guides", description: "Local experts with deep knowledge of each destination" },
  { icon: Map, title: "Custom Itineraries", description: "Personalized trips tailored to your interests and pace" },
  { icon: Calendar, title: "Flexible Scheduling", description: "Choose your dates and adjust plans as needed" },
  { icon: Heart, title: "Small Groups", description: "Intimate group sizes for better experiences" }
];

const AdventuresPage = () => {
  const { quotes: randomQuotes, isLoading: quotesLoading } = useRandomQuotes(3);
  const [showAdventureCreator, setShowAdventureCreator] = useState(false);
  const [refreshAdventures, setRefreshAdventures] = useState(0);
  const { results, loading, error, searchContent } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (filters: any) => {
    setHasSearched(true);
    await searchContent(filters);
  };

  return (
    <div className="min-h-screen bg-forest-950 paper-grain pt-16 pb-20 md:pb-0">

      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="w-full h-full object-cover field-image"
            style={{ filter: 'grayscale(25%) brightness(0.4) saturate(0.7)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-forest-950/40 to-forest-950/90" />
        </div>
        <TopoBackground opacity={0.04} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <p className="font-jetbrains text-[10px] text-gold-400/70 tracking-widest uppercase mb-8">Adventures</p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-cream leading-[1.05] mb-6 max-w-4xl">
            Journeys worth<br />
            <em className="italic text-gold-300">the distance.</em>
          </h1>
          <p className="text-mist-400 text-base font-light max-w-xl mb-12">
            Design personalized itineraries with detailed cost estimates, accommodation options,
            and local experiences tailored to your travel style.
          </p>

          <button
            onClick={() => setShowAdventureCreator(true)}
            className="group inline-flex items-center gap-3 px-10 py-4 border border-gold-400/40 text-cream text-sm tracking-[0.15em] uppercase font-light transition-all duration-500 hover:border-gold-400/80 hover:bg-gold-400/8"
          >
            <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-300" />
            Plan Your Adventure
          </button>
        </div>
      </section>

      {/* ── Search ── */}
      <section className="py-16 border-t border-forest-800">
        <div className="max-w-4xl mx-auto px-6">
          <SearchBar
            onSearch={handleSearch}
            showBudgetFilter={true}
            showCategoryFilter={false}
            showDifficultyFilter={false}
            placeholder="Search adventures by destination, title..."
          />
          {hasSearched && (
            <div className="mt-8">
              <SearchResults results={results} loading={loading} error={error} />
            </div>
          )}
        </div>
      </section>

      {!quotesLoading && randomQuotes[0] && (
        <div className="bg-forest-950">
          <QuoteSection quote={randomQuotes[0]} />
        </div>
      )}

      {/* ── My Adventures ── */}
      <section className="py-20 border-t border-forest-800 bg-forest-900">
        <TopoBackground opacity={0.03} />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Your Plans</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-cream">
              My <em className="italic text-gold-300">Adventures</em>
            </h2>
          </div>
          <MyAdventures
            key={refreshAdventures}
            onLoginRequired={() => alert('Please log in to create and view adventures')}
          />
        </div>
      </section>

      {/* ── Why Choose Us ── */}
      <section className="py-20 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Why Woander</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-cream">
              Built for <em className="italic text-gold-300">deeper travel.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-forest-800">
            {whyChooseUs.map((feature, index) => (
              <div
                key={index}
                className="border-b border-r border-forest-800 p-8 group hover:bg-forest-900/30 transition-colors duration-400"
              >
                <feature.icon className="h-5 w-5 text-gold-400/40 mb-5 group-hover:text-gold-400/70 transition-colors duration-300" strokeWidth={1.5} />
                <h3 className="font-display text-lg font-light text-cream mb-2 group-hover:text-gold-200 transition-colors duration-300">{feature.title}</h3>
                <p className="text-mist-700 text-xs font-light leading-relaxed group-hover:text-mist-500 transition-colors duration-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Adventure Types ── */}
      <section className="py-20 bg-forest-900 border-t border-forest-800">
        <TopoBackground opacity={0.03} />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Curated Collections</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-cream">
              Choose your <em className="italic text-gold-300">expedition.</em>
            </h2>
          </div>

          <SwipeableCardContainer
            mobileCards={1}
            tabletCards={2}
            desktopCards={3}
            showDots={true}
            showArrows={true}
            className="mb-20 px-4 md:px-0"
          >
            {adventureTypes.map((adventure, index) => (
              <div
                key={index}
                className="group relative overflow-hidden min-h-[400px] cursor-pointer"
              >
                <div className="absolute inset-0">
                  <img
                    src={adventure.image}
                    alt={adventure.title}
                    className="w-full h-full object-cover field-image group-hover:scale-105 transition-transform duration-700"
                    style={{ filter: 'grayscale(30%) brightness(0.5) saturate(0.7)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-950/40 to-forest-950/20" />
                </div>

                <div className="relative h-full flex flex-col justify-end p-8">
                  <adventure.icon className="h-5 w-5 text-gold-400/50 mb-4" strokeWidth={1.5} />
                  <h3 className="font-display text-2xl font-light text-cream mb-2 group-hover:text-gold-200 transition-colors duration-300">{adventure.title}</h3>
                  <p className="text-mist-500 text-xs font-light leading-relaxed mb-4">{adventure.description}</p>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className="font-jetbrains text-[9px] text-gold-400/60 tracking-widest uppercase flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {adventure.duration}
                    </span>
                    <span className="font-jetbrains text-[9px] text-mist-600 tracking-widest uppercase">{adventure.difficulty}</span>
                  </div>
                  <p className="font-display text-lg font-light text-gold-300/70 mt-4">{adventure.price}</p>
                </div>
              </div>
            ))}
          </SwipeableCardContainer>
        </div>
      </section>

      {!quotesLoading && randomQuotes[1] && (
        <div className="bg-forest-950">
          <QuoteSection quote={randomQuotes[1]} />
        </div>
      )}

      {/* ── Featured Adventures ── */}
      <section className="py-20 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Handpicked</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-cream">
              Featured <em className="italic text-gold-300">journeys.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredAdventures.map((adventure, index) => (
              <div
                key={index}
                className="group relative overflow-hidden cursor-pointer min-h-[500px]"
              >
                <div className="absolute inset-0">
                  <img
                    src={adventure.image}
                    alt={adventure.title}
                    className="w-full h-full object-cover field-image group-hover:scale-105 transition-transform duration-700"
                    style={{ filter: 'grayscale(25%) brightness(0.5) saturate(0.75)' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-950/50 to-forest-950/20" />
                </div>

                <div className="relative h-full flex flex-col justify-end p-8 lg:p-10">
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="font-jetbrains text-[9px] text-gold-400/60 border border-gold-400/20 px-2 py-0.5 tracking-widest uppercase">
                      {adventure.difficulty}
                    </span>
                  </div>

                  <div className="absolute top-6 right-6 flex items-center gap-1">
                    <Star className="h-3 w-3 text-gold-400/60 fill-current" />
                    <span className="font-jetbrains text-[10px] text-gold-400/60">{adventure.rating}</span>
                    <span className="font-jetbrains text-[9px] text-mist-700">({adventure.reviews})</span>
                  </div>

                  <h3 className="font-display text-3xl lg:text-4xl font-light text-cream mb-3 group-hover:text-gold-200 transition-colors duration-300">
                    {adventure.title}
                  </h3>

                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-jetbrains text-[9px] text-mist-600 tracking-widest uppercase flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-gold-400/40" /> {adventure.location}
                    </span>
                    <span className="font-jetbrains text-[9px] text-mist-600 tracking-widest uppercase flex items-center gap-1">
                      <Clock className="h-3 w-3 text-gold-400/40" /> {adventure.duration}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {adventure.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="font-jetbrains text-[8px] text-mist-600 border border-forest-700 px-2 py-0.5 tracking-widest uppercase"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-forest-700/50">
                    <div>
                      <span className="font-display text-2xl font-light text-gold-300">{adventure.price}</span>
                      <span className="text-mist-700 text-xs font-light ml-2">/person</span>
                    </div>
                    <span className="font-jetbrains text-[10px] text-gold-400/50 tracking-widest uppercase group-hover:text-gold-400/80 transition-colors duration-300 flex items-center gap-1">
                      View Details <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!quotesLoading && randomQuotes[2] && (
        <div className="bg-forest-950">
          <QuoteSection quote={randomQuotes[2]} />
        </div>
      )}

      {/* ── Final CTA ── */}
      <section className="py-24 border-t border-forest-800 bg-forest-900">
        <TopoBackground opacity={0.03} />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <p className="font-jetbrains text-[10px] text-gold-400/50 tracking-widest uppercase mb-6">Begin</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-cream mb-4 leading-tight">
            Where will you <em className="italic text-gold-300">wander next?</em>
          </h2>
          <p className="text-mist-600 text-sm font-light mb-10 max-w-md mx-auto">
            Create your personalized itinerary in minutes with our intelligent trip planner.
          </p>
          <button
            onClick={() => setShowAdventureCreator(true)}
            className="group inline-flex items-center gap-3 px-10 py-4 border border-gold-400/40 text-cream text-sm tracking-[0.15em] uppercase font-light transition-all duration-500 hover:border-gold-400/80 hover:bg-gold-400/8"
          >
            <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-300" />
            Plan Your Adventure
          </button>
        </div>
      </section>

      <Footer />

      {showAdventureCreator && (
        <AdventureCreator
          onClose={() => setShowAdventureCreator(false)}
          onSuccess={() => {
            setRefreshAdventures(prev => prev + 1);
          }}
        />
      )}
    </div>
  );
};

export default AdventuresPage;
