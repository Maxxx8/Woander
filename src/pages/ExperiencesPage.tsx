import React, { useState, useEffect } from 'react';
import { Home, Plus, Star, MapPin, ArrowRight } from 'lucide-react';
import Experiences from '../components/Experiences';
import Footer from '../components/Footer';
import QuoteSection from '../components/QuoteSection';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import AddPropertyModal from '../components/AddPropertyModal';
import { useRandomQuotes } from '../hooks/useRandomQuotes';
import { useSearch } from '../hooks/useSearch';
import { useAuth } from '../shared/AuthContext';
import { supabase } from '../shared/supabase';
import { TopoBackground } from '../components/FieldElements';

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
    <div className="min-h-screen bg-forest-950 paper-grain pt-16 pb-20 md:pb-0">

      {/* ── Hero ── */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="w-full h-full object-cover field-image"
            style={{ filter: 'grayscale(25%) brightness(0.4) saturate(0.7)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-forest-950/40 to-forest-950/90" />
        </div>
        <TopoBackground opacity={0.04} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <p className="font-jetbrains text-[10px] text-gold-400/70 tracking-widest uppercase mb-8">Experiences</p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-cream leading-[1.05] mb-6 max-w-4xl">
            Stay where the<br />
            <em className="italic text-gold-300">story is.</em>
          </h1>
          <p className="text-mist-400 text-base font-light max-w-xl mb-12">
            Discover handpicked properties from local hosts — from cozy homestays to hidden villas,
            each chosen for its sense of place.
          </p>

          {user && (
            <button
              onClick={() => setShowAddProperty(true)}
              className="group inline-flex items-center gap-3 px-8 py-3 border border-gold-400/30 text-gold-300 text-sm tracking-[0.15em] uppercase font-light transition-all duration-500 hover:border-gold-400/70 hover:bg-gold-400/8"
            >
              <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-300" />
              List Your Property
            </button>
          )}
        </div>
      </section>

      {/* ── Search ── */}
      <section className="py-16 border-t border-forest-800">
        <div className="max-w-4xl mx-auto px-6">
          <SearchBar
            onSearch={handleSearch}
            showBudgetFilter={false}
            showCategoryFilter={true}
            showDifficultyFilter={true}
            placeholder="Search experiences by location, category..."
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

      {/* ── Property Stays ── */}
      <section className="py-20 border-t border-forest-800 bg-forest-900">
        <TopoBackground opacity={0.03} />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Property Stays</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-cream">
              Unique <em className="italic text-gold-300">places to stay.</em>
            </h2>
          </div>

          {loadingProperties ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
            </div>
          ) : properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-forest-800">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="border-b border-r border-forest-800 group overflow-hidden cursor-pointer hover:bg-forest-800/30 transition-colors duration-400"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={property.featured_image || 'https://images.pexels.com/photos/1732414/pexels-photo-1732414.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={property.title}
                      className="w-full h-full object-cover field-image group-hover:scale-105 transition-transform duration-700"
                      style={{ filter: 'grayscale(30%) brightness(0.55)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 to-transparent" />
                    <span className="absolute top-3 left-3 font-jetbrains text-[8px] text-gold-400/60 border border-gold-400/20 px-2 py-0.5 tracking-widest uppercase bg-forest-950/60">
                      {property.property_type}
                    </span>
                    <span className="absolute top-3 right-3 font-display text-sm font-light text-gold-300 bg-forest-950/60 px-2 py-0.5">
                      ₹{property.price_per_night}/night
                    </span>
                  </div>

                  <div className="p-6">
                    <h3 className="font-display text-lg font-light text-cream mb-2 group-hover:text-gold-200 transition-colors duration-300">{property.title}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3 text-gold-400/40" />
                      <span className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase">{property.location_city}, {property.location_state}</span>
                    </div>
                    <p className="text-mist-700 text-xs font-light line-clamp-2 mb-4">{property.description}</p>

                    <div className="flex items-center gap-4 text-xs mb-4">
                      <span className="font-jetbrains text-[9px] text-mist-700">{property.max_guests} guests</span>
                      <span className="font-jetbrains text-[9px] text-mist-700">{property.bedrooms} beds</span>
                      <span className="font-jetbrains text-[9px] text-mist-700">{property.bathrooms} baths</span>
                    </div>

                    {property.rating_count > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(property.rating_average) ? 'text-gold-400/60 fill-current' : 'text-forest-700'}`}
                            />
                          ))}
                        </div>
                        <span className="font-jetbrains text-[9px] text-mist-700">
                          {property.rating_average.toFixed(1)} ({property.rating_count})
                        </span>
                      </div>
                    )}

                    {property.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {property.amenities.slice(0, 3).map((amenity, idx) => (
                          <span
                            key={idx}
                            className="font-jetbrains text-[8px] text-mist-600 border border-forest-700 px-2 py-0.5 tracking-widest uppercase"
                          >
                            {amenity}
                          </span>
                        ))}
                        {property.amenities.length > 3 && (
                          <span className="font-jetbrains text-[8px] text-mist-700 px-2 py-0.5 tracking-widest uppercase">
                            +{property.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <span className="font-jetbrains text-[10px] text-gold-400/50 tracking-widest uppercase group-hover:text-gold-400/80 transition-colors duration-300 flex items-center gap-1">
                      View Details <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-forest-800 p-16 text-center">
              <Home className="w-10 h-10 text-gold-400/20 mx-auto mb-4" strokeWidth={1.5} />
              <p className="font-display text-lg italic font-light text-cream mb-2">No properties available yet</p>
              <p className="text-mist-700 text-sm font-light mb-6">Be the first to list your property.</p>
              {user && (
                <button
                  onClick={() => setShowAddProperty(true)}
                  className="font-jetbrains text-[10px] tracking-widest text-gold-300/70 border border-gold-400/20 px-6 py-2 hover:border-gold-400/50 transition-colors duration-300"
                >
                  LIST YOUR PROPERTY
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Experiences component ── */}
      <Experiences />

      {!quotesLoading && randomQuotes[1] && (
        <div className="bg-forest-950">
          <QuoteSection quote={randomQuotes[1]} />
        </div>
      )}

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
