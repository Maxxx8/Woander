import React, { useState } from 'react';
import { MapPin, Calendar, Users, Star, Search, Filter, Compass, Mountain, Waves, Palmtree, TreePine, Sun, Snowflake } from 'lucide-react';
import QuoteSection from '../components/QuoteSection';
import Footer from '../components/Footer';
import DestinationCard from '../components/DestinationCard';
import { useRandomQuotes } from '../hooks/useRandomQuotes';

const destinations = [
  {
    title: "Ladakh Himalayas",
    location: "Ladakh, India",
    description: "Experience the pristine beauty of high-altitude landscapes, ancient monasteries, and crystal-clear lakes in the roof of the world.",
    image: "https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    price: "₹25,000",
    category: "mountain",
    season: "summer",
    duration: "7-10 days"
  },
  {
    title: "Kerala Backwaters",
    location: "Alleppey, Kerala",
    description: "Cruise through serene backwaters, lush paddy fields, and traditional villages on a houseboat in God's Own Country.",
    image: "https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    price: "₹15,000",
    category: "nature",
    season: "all",
    duration: "3-5 days"
  },
  {
    title: "Thar Desert",
    location: "Jaisalmer, Rajasthan",
    description: "Witness golden sunsets over endless sand dunes, experience camel safaris, and sleep under a blanket of stars.",
    image: "https://images.pexels.com/photos/1739856/pexels-photo-1739856.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    price: "₹20,000",
    category: "desert",
    season: "winter",
    duration: "4-6 days"
  },
  {
    title: "Western Ghats",
    location: "Munnar, Kerala",
    description: "Explore misty hills, sprawling tea plantations, and diverse wildlife in one of the world's biodiversity hotspots.",
    image: "https://images.pexels.com/photos/4321802/pexels-photo-4321802.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    price: "₹12,000",
    category: "nature",
    season: "all",
    duration: "3-5 days"
  },
  {
    title: "Andaman Islands",
    location: "Port Blair, Andaman",
    description: "Dive into crystal-clear waters, pristine beaches, and vibrant coral reefs in India's tropical paradise.",
    image: "https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.9,
    price: "₹30,000",
    category: "beach",
    season: "winter",
    duration: "5-7 days"
  },
  {
    title: "Himalayan Valleys",
    location: "Manali, Himachal Pradesh",
    description: "Expedition through snow-capped peaks, alpine meadows, and charming hill stations in the mighty Himalayas.",
    image: "https://images.pexels.com/photos/1670187/pexels-photo-1670187.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    price: "₹18,000",
    category: "mountain",
    season: "all",
    duration: "5-7 days"
  },
  {
    title: "Goa Beaches",
    location: "Goa, India",
    description: "Relax on golden beaches, enjoy vibrant nightlife, and explore Portuguese colonial architecture.",
    image: "https://images.pexels.com/photos/1450353/pexels-photo-1450353.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    price: "₹14,000",
    category: "beach",
    season: "winter",
    duration: "3-5 days"
  },
  {
    title: "Varanasi Ghats",
    location: "Varanasi, Uttar Pradesh",
    description: "Experience spiritual awakening on the sacred ghats of the Ganges, witness ancient rituals, and explore timeless temples.",
    image: "https://images.pexels.com/photos/3881104/pexels-photo-3881104.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    price: "₹10,000",
    category: "spiritual",
    season: "all",
    duration: "2-3 days"
  },
  {
    title: "Rann of Kutch",
    location: "Gujarat, India",
    description: "Marvel at the world's largest salt desert, experience vibrant cultural festivals, and witness stunning white landscapes.",
    image: "https://images.pexels.com/photos/3889742/pexels-photo-3889742.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    price: "₹16,000",
    category: "desert",
    season: "winter",
    duration: "3-4 days"
  },
  {
    title: "Darjeeling Hills",
    location: "Darjeeling, West Bengal",
    description: "Wake up to stunning Himalayan views, explore tea gardens, and ride the historic toy train through misty mountains.",
    image: "https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.8,
    price: "₹13,000",
    category: "mountain",
    season: "all",
    duration: "4-5 days"
  },
  {
    title: "Hampi Ruins",
    location: "Karnataka, India",
    description: "Step back in time exploring ancient temples, massive boulders, and the magnificent ruins of the Vijayanagara Empire.",
    image: "https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.6,
    price: "₹11,000",
    category: "heritage",
    season: "winter",
    duration: "2-3 days"
  },
  {
    title: "Rishikesh & Haridwar",
    location: "Uttarakhand, India",
    description: "Find peace in the yoga capital of the world, experience river rafting, and attend mesmerizing Ganga Aarti ceremonies.",
    image: "https://images.pexels.com/photos/3822621/pexels-photo-3822621.jpeg?auto=compress&cs=tinysrgb&w=800",
    rating: 4.7,
    price: "₹12,000",
    category: "spiritual",
    season: "all",
    duration: "3-4 days"
  }
];

const categories = [
  { id: 'all', label: 'All Destinations', icon: Compass },
  { id: 'mountain', label: 'Mountains', icon: Mountain },
  { id: 'beach', label: 'Beaches', icon: Waves },
  { id: 'desert', label: 'Deserts', icon: Palmtree },
  { id: 'nature', label: 'Nature', icon: TreePine },
  { id: 'spiritual', label: 'Spiritual', icon: Sun },
  { id: 'heritage', label: 'Heritage', icon: Star }
];

const seasons = [
  { id: 'all', label: 'All Seasons' },
  { id: 'summer', label: 'Summer' },
  { id: 'winter', label: 'Winter' }
];

const highlights = [
  {
    icon: MapPin,
    title: "100+ Destinations",
    description: "Curated locations across India"
  },
  {
    icon: Users,
    title: "Expert Guides",
    description: "Local experts with deep knowledge"
  },
  {
    icon: Calendar,
    title: "Year-Round Travel",
    description: "Perfect destinations for every season"
  },
  {
    icon: Star,
    title: "Highly Rated",
    description: "4.8+ average rating from travelers"
  }
];

const DestinationsPage = () => {
  const randomQuotes = useRandomQuotes(3);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDestinations = destinations.filter(dest => {
    const matchesCategory = selectedCategory === 'all' || dest.category === selectedCategory;
    const matchesSeason = selectedSeason === 'all' || dest.season === selectedSeason || dest.season === 'all';
    const matchesSearch = dest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dest.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSeason && matchesSearch;
  });

  return (
    <div className="min-h-screen pt-20">
      <QuoteSection quote={randomQuotes[0]} />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-6">
              <MapPin className="h-5 w-5 text-orange-600" />
              <span className="text-orange-600 font-semibold">Explore India</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Incredible <span className="text-orange-600">Destinations</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              From the towering Himalayas to pristine beaches, discover India's most breathtaking landscapes
              and create unforgettable memories.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-600 rounded-full mb-4">
                  <highlight.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{highlight.title}</h3>
                <p className="text-gray-600 text-sm">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex flex-col lg:flex-row gap-6 mb-8">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(e.target.value)}
                    className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-600 focus:border-transparent appearance-none bg-white"
                  >
                    {seasons.map(season => (
                      <option key={season.id} value={season.id}>{season.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                    selectedCategory === category.id
                      ? 'bg-orange-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-600 hover:text-orange-600'
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-600">
              Showing <span className="font-bold text-orange-600">{filteredDestinations.length}</span> destinations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredDestinations.map((destination, index) => (
              <div key={index} className="transform hover:-translate-y-2 transition-transform duration-300">
                <DestinationCard {...destination} />
                <div className="mt-3 px-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{destination.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{destination.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDestinations.length === 0 && (
            <div className="text-center py-20">
              <Compass className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No destinations found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedSeason('all');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <QuoteSection quote={randomQuotes[1]} />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Travel by Season
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect time to visit your dream destination
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative overflow-hidden rounded-2xl shadow-xl group">
              <img
                src="https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Summer destinations"
                className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-600 rounded-full p-3">
                    <Sun className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-bold">Summer Adventures</h3>
                </div>
                <p className="text-gray-200 mb-4">
                  Perfect for high-altitude treks, mountain expeditions, and escaping the heat in cool hill stations.
                </p>
                <button
                  onClick={() => setSelectedSeason('summer')}
                  className="px-6 py-3 bg-white text-orange-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Explore Summer Destinations
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl shadow-xl group">
              <img
                src="https://images.pexels.com/photos/1739856/pexels-photo-1739856.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Winter destinations"
                className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 rounded-full p-3">
                    <Snowflake className="h-6 w-6" />
                  </div>
                  <h3 className="text-3xl font-bold">Winter Escapes</h3>
                </div>
                <p className="text-gray-200 mb-4">
                  Ideal for beach getaways, desert safaris, and exploring cultural heritage in pleasant weather.
                </p>
                <button
                  onClick={() => setSelectedSeason('winter')}
                  className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Explore Winter Destinations
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <QuoteSection quote={randomQuotes[2]} />

      <section className="py-20 bg-gradient-to-br from-orange-600 to-orange-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Explore?
          </h2>
          <p className="text-xl mb-8 text-orange-100">
            Start planning your perfect Indian expedition today with personalized itineraries
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-orange-600 text-lg font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg">
              Plan Your Trip
            </button>
            <button className="px-8 py-4 bg-orange-800 text-white text-lg font-semibold rounded-xl hover:bg-orange-900 transform hover:scale-105 transition-all duration-200 shadow-lg">
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DestinationsPage;
