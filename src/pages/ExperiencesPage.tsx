import React, { useState, useEffect } from 'react';
import { Home, Plus } from 'lucide-react';
import Experiences from '../components/Experiences';
import Footer from '../components/Footer';
import QuoteSection from '../components/QuoteSection';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import AddPropertyModal from '../components/AddPropertyModal';
import SwipeableCardContainer from '../components/SwipeableCardContainer';
import { useRandomQuotes } from '../hooks/useRandomQuotes';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../shared/AuthContext';
import { supabase } from '../shared/supabase';

interface Property {
  id: string;
  title: string;
  description: string;
  property_type: string;
  location_city: string;
  location_state: string;
  price_per_night: number;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  featured_image: string;
  rating_average: number;
  rating_count: number;
}

const ExperiencesPage = () => {
  const { quotes: randomQuotes, isLoading: quotesLoading } = useRandomQuotes(2);
  const { results, loading, error, searchContent } = useSearch();
  const { user } = useAuth();
  const [hasSearched, setHasSearched] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoadingProperties(true);
    try {
      const { data, error } = await supabase
        .from('property_listings')
        .select('*')
        .eq('status', 'approved')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('rating_average', { ascending: false })
        .limit(12);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleSearch = async (filters: any) => {
    setHasSearched(true);
    await searchContent(filters);
  };

  return (
    <div className="min-h-screen pt-20 pb-20 md:pb-0">
      {!quotesLoading && randomQuotes[0] && <QuoteSection quote={randomQuotes[0]} />}

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <SearchBar
              onSearch={handleSearch}
              showBudgetFilter={false}
              showCategoryFilter={true}
              showDifficultyFilter={true}
              placeholder="Search experiences by location, category..."
            />
          </div>

          {hasSearched && (
            <div className="mb-12">
              <SearchResults results={results} loading={loading} error={error} />
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Unique <span className="text-blue-600">Property Stays</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
                Discover handpicked properties from local hosts - from cozy homestays to luxury villas
              </p>
              {user && (
                <button
                  onClick={() => setShowAddProperty(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all hover:scale-105 shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                  List Your Property
                </button>
              )}
            </div>
          

          {loadingProperties ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading properties...</p>
            </div>
          ) : properties.length > 0 ? (
            <SwipeableCardContainer
              mobileCards={1}
              tabletCards={2}
              desktopCards={3}
              showDots={true}
              showArrows={true}
              className="px-4 md:px-0"
            >
              {properties.map((property, index) => (
                <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all hover:-translate-y-2">
                    <div className="relative h-64">
                      <img
                        src={property.featured_image || 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-900">
                        ₹{property.price_per_night}/night
                      </div>
                      <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                        {property.property_type}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        {property.location_city}, {property.location_state}
                      </p>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {property.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>{property.max_guests} guests</span>
                          <span>{property.bedrooms} beds</span>
                          <span>{property.bathrooms} baths</span>
                        </div>
                      </div>

                      {property.rating_count > 0 && (
                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${
                                  i < Math.floor(property.rating_average)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {property.rating_average.toFixed(1)} ({property.rating_count})
                          </span>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {property.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{property.amenities.length - 3} more
                          </span>
                        )}
                      </div>

                      <button className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                        View Details
                      </button>
                    </div>
                </div>
              ))}
            </SwipeableCardContainer>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No properties available yet</p>
              <p className="text-gray-500 text-sm">Be the first to list your property!</p>
            </div>
          )}
        </div>
      </section>

      <Experiences />

      {!quotesLoading && randomQuotes[1] && <QuoteSection quote={randomQuotes[1]} />}

      <Footer />

      {showAddProperty && (
        <AddPropertyModal
          onClose={() => setShowAddProperty(false)}
          onSuccess={() => {
            fetchProperties();
            alert('Property submitted for review! We\'ll notify you once it\'s approved.');
          }}
        />
      )}
    </div>
  );
};

export default ExperiencesPage;
