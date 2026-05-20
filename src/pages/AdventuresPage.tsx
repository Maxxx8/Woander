import React, { useState } from 'react';
import { Compass, Map, Calendar, Users, Mountain, Waves, Palmtree, Camera, Heart, Star, Clock, DollarSign, MapPin } from 'lucide-react';
import QuoteSection from '../components/QuoteSection';
import Footer from '../components/Footer';
import AdventureCreator from '../components/AdventureCreator';
import MyAdventures from '../components/MyAdventures';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import SwipeableCardContainer from '../components/SwipeableCardContainer';
import { useRandomQuotes } from '../hooks/useRandomQuotes';
import { useSearch } from '../hooks/useSearch';

const adventureTypes = [
  {
    icon: Mountain,
    title: "Mountain Adventures",
    description: "Trek through the majestic Himalayas and conquer breathtaking peaks",
    image: "https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?auto=compress&cs=tinysrgb&w=800",
    difficulty: "Challenging",
    duration: "7-14 days",
    price: "From $1,200"
  },
  {
    icon: Waves,
    title: "Coastal Escapes",
    description: "Relax on pristine beaches and explore vibrant coastal cultures",
    image: "https://images.pexels.com/photos/1139541/pexels-photo-1139541.jpeg?auto=compress&cs=tinysrgb&w=800",
    difficulty: "Easy",
    duration: "5-7 days",
    price: "From $800"
  },
  {
    icon: Palmtree,
    title: "Desert Adventures",
    description: "Experience the magic of Rajasthan's golden sand dunes",
    image: "https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=800",
    difficulty: "Moderate",
    duration: "4-6 days",
    price: "From $900"
  },
  {
    icon: Camera,
    title: "Cultural Journeys",
    description: "Immerse yourself in India's rich heritage and traditions",
    image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800",
    difficulty: "Easy",
    duration: "6-10 days",
    price: "From $1,000"
  },
  {
    icon: Compass,
    title: "Wildlife Safaris",
    description: "Spot tigers, elephants, and exotic birds in natural habitats",
    image: "https://images.pexels.com/photos/2138126/pexels-photo-2138126.jpeg?auto=compress&cs=tinysrgb&w=800",
    difficulty: "Easy",
    duration: "3-5 days",
    price: "From $700"
  },
  {
    icon: Heart,
    title: "Wellness Retreats",
    description: "Rejuvenate your mind, body, and soul in tranquil settings",
    image: "https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=800",
    difficulty: "Easy",
    duration: "5-7 days",
    price: "From $950"
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
    price: "$2,400",
    image: "https://images.pexels.com/photos/618848/pexels-photo-618848.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: ["Everest Base Camp", "Sherpa Villages", "Buddhist Monasteries"]
  },
  {
    title: "Kerala Backwater Cruise",
    location: "Kerala",
    duration: "6 days",
    difficulty: "Easy",
    rating: 4.8,
    reviews: 524,
    price: "$1,100",
    image: "https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: ["Houseboat Stay", "Traditional Cuisine", "Ayurvedic Spa"]
  },
  {
    title: "Rajasthan Royal Heritage",
    location: "Rajasthan",
    duration: "8 days",
    difficulty: "Easy",
    rating: 4.7,
    reviews: 456,
    price: "$1,500",
    image: "https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: ["Palace Hotels", "Camel Safari", "Cultural Performances"]
  },
  {
    title: "Goa Beach & Adventure",
    location: "Goa",
    duration: "5 days",
    difficulty: "Moderate",
    rating: 4.6,
    reviews: 678,
    price: "$850",
    image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: ["Water Sports", "Beach Parties", "Portuguese Heritage"]
  },
  {
    title: "Ladakh High Altitude Adventure",
    location: "Ladakh",
    duration: "10 days",
    difficulty: "Challenging",
    rating: 4.9,
    reviews: 289,
    price: "$1,800",
    image: "https://images.pexels.com/photos/1562/italian-landscape-mountains-nature.jpg?auto=compress&cs=tinysrgb&w=800",
    highlights: ["Pangong Lake", "Nubra Valley", "Monastery Visits"]
  },
  {
    title: "Jim Corbett Wildlife Safari",
    location: "Uttarakhand",
    duration: "4 days",
    difficulty: "Easy",
    rating: 4.5,
    reviews: 412,
    price: "$750",
    image: "https://images.pexels.com/photos/2138126/pexels-photo-2138126.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: ["Tiger Spotting", "Elephant Safari", "Bird Watching"]
  }
];

const whyChooseUs = [
  {
    icon: Users,
    title: "Expert Guides",
    description: "Local experts with deep knowledge of each destination"
  },
  {
    icon: Map,
    title: "Custom Itineraries",
    description: "Personalized trips tailored to your interests and pace"
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Choose your dates and adjust plans as needed"
  },
  {
    icon: Heart,
    title: "Small Groups",
    description: "Intimate group sizes for better experiences"
  }
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
    <div className="min-h-screen pt-20 pb-20 md:pb-0">
      {!quotesLoading && randomQuotes[0] && <QuoteSection quote={randomQuotes[0]} />}

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-6">
              <Compass className="h-5 w-5 text-orange-600" />
              <span className="text-orange-600 font-semibold">Plan Your Journey</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Your <span className="text-orange-600">Adventure</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Design personalized itineraries with detailed cost estimates, accommodation options,
              and local experiences tailored to your travel style.
            </p>
            <button
              onClick={() => setShowAdventureCreator(true)}
              className="px-8 py-4 bg-orange-600 text-white text-lg font-semibold rounded-xl hover:bg-orange-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Start Planning Your Adventure
            </button>
          </div>

          <div className="mb-12">
            <SearchBar
              onSearch={handleSearch}
              showBudgetFilter={true}
              showCategoryFilter={false}
              showDifficultyFilter={false}
              placeholder="Search adventures by destination, title..."
            />
          </div>

          {hasSearched && (
            <div className="mb-12">
              <SearchResults results={results} loading={loading} error={error} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            {whyChooseUs.map((feature, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-600 rounded-full mb-4">
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              My Adventures
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              View, manage, and share your personalized travel plans
            </p>
          </div>

          <MyAdventures
            key={refreshAdventures}
            onLoginRequired={() => alert('Please log in to create and view adventures')}
          />
        </div>
      </section>

      {!quotesLoading && randomQuotes[1] && <QuoteSection quote={randomQuotes[1]} />}

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Adventure Types
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our curated collection of adventure experiences
            </p>
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
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-80">
                  <img
                    src={adventure.image}
                    alt={adventure.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute top-4 right-4 bg-orange-600 rounded-full p-3">
                    <adventure.icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{adventure.title}</h3>
                  <p className="text-gray-200 mb-4">{adventure.description}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      <Clock className="h-3 w-3" />
                      {adventure.duration}
                    </span>
                    <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                      <DollarSign className="h-3 w-3" />
                      {adventure.price}
                    </span>
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    adventure.difficulty === 'Easy' ? 'bg-green-500' :
                    adventure.difficulty === 'Moderate' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    {adventure.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </SwipeableCardContainer>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Featured Adventures
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Handpicked journeys for unforgettable experiences
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
            {featuredAdventures.map((adventure, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-3xl shadow-xl transition-all duration-500 cursor-pointer h-[500px]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${adventure.image})` }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent group-hover:from-black/90 group-hover:via-black/60 transition-all duration-500" />

                <div className="relative h-full flex flex-col justify-end p-8">
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-gray-800 shadow-lg">
                    {adventure.difficulty}
                  </div>

                  <div className="inline-flex items-center space-x-2 mb-4 self-start">
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-white font-semibold">{adventure.rating}</span>
                      <span className="text-sm text-white/70">({adventure.reviews})</span>
                    </div>
                  </div>

                  <h3 className="text-4xl font-bold text-white mb-3 transform transition-all duration-300">
                    {adventure.title}
                  </h3>

                  <div className="flex items-center space-x-2 mb-4">
                    <MapPin className="h-4 w-4 text-orange-400" />
                    <span className="text-sm text-white/90">{adventure.location}</span>
                    <Clock className="h-4 w-4 text-orange-400 ml-2" />
                    <span className="text-sm text-white/90">{adventure.duration}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {adventure.highlights.map((highlight, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div>
                      <span className="text-3xl font-bold text-white">{adventure.price}</span>
                      <span className="text-white/70 text-sm">/person</span>
                    </div>
                    <button className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 font-semibold">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </SwipeableCardContainer>
        </div>
      </section>

      {!quotesLoading && randomQuotes[2] && <QuoteSection quote={randomQuotes[2]} />}

      <section className="py-20 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Create your personalized itinerary in minutes with our intelligent trip planner
          </p>
          <button
            onClick={() => setShowAdventureCreator(true)}
            className="px-8 py-4 bg-white text-orange-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Plan Your Adventure Now
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
