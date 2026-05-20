import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import Hero from '../components/Hero';
import QuoteSection from '../components/QuoteSection';
import Destinations from '../components/Destinations';
import WhyChooseUs from '../components/WhyChooseUs';
import About from '../components/About';
import Footer from '../components/Footer';
import InstallPrompt from '../components/InstallPrompt';
import OfflineIndicator from '../components/OfflineIndicator';
import AdventureCreator from '../components/AdventureCreator';
import MyAdventures from '../components/MyAdventures';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import ScrollProgress from '../components/ScrollProgress';
import { useRandomQuotes } from '../hooks/useRandomQuotes';
import { useSearch } from '../hooks/useSearch';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
  const [showAdventureCreator, setShowAdventureCreator] = useState(false);
  const [refreshAdventures, setRefreshAdventures] = useState(0);
  const { quotes: randomQuotes, isLoading: quotesLoading } = useRandomQuotes(3);
  const { results, loading, error, searchContent } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);

  const searchSectionRef = useRef<HTMLDivElement>(null);
  const searchHeaderRef = useRef<HTMLDivElement>(null);
  const adventuresSectionRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (filters: any) => {
    setHasSearched(true);
    await searchContent(filters);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (searchHeaderRef.current) {
        gsap.fromTo(searchHeaderRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: searchHeaderRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (adventuresSectionRef.current) {
        gsap.fromTo(adventuresSectionRef.current.querySelector('h2'),
          { opacity: 0, scale: 0.9, y: 30 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: adventuresSectionRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="pb-20 md:pb-0">
      <ScrollProgress />
      <Hero />

      <section ref={searchSectionRef} className="py-16 md:py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/50 opacity-60"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div ref={searchHeaderRef} className="text-center mb-10">
            <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-100 to-pink-100 text-orange-600 rounded-full text-sm font-semibold mb-4">
              Start Exploring
            </span>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover Your Next Adventure
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Search through hidden gems, curated experiences, and personalized adventures
            </p>
          </div>

          <div className="mb-8 transform transition-all duration-500 hover:scale-[1.02]">
            <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border border-white/20 p-8">
              <SearchBar
              onSearch={handleSearch}
              showBudgetFilter={true}
              showCategoryFilter={true}
              showDifficultyFilter={true}
              placeholder="Search destinations, experiences, hidden gems..."
              />
            </div>
          </div>

          {hasSearched && (
            <div className="mb-12">
              <SearchResults results={results} loading={loading} error={error} />
            </div>
          )}
        </div>
      </section>

      <WhyChooseUs />

      {quotesLoading ? (
        <QuoteSection loading={true} />
      ) : (
        randomQuotes[0] && <QuoteSection quote={randomQuotes[0]} />
      )}

      <Destinations />

      {quotesLoading ? (
        <QuoteSection loading={true} />
      ) : (
        randomQuotes[1] && <QuoteSection quote={randomQuotes[1]} />
      )}

      <section ref={adventuresSectionRef} className="py-16 md:py-20 px-4 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div id="adventures" className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Create Your Adventure
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Plan your dream trip with detailed itineraries and cost estimates
            </p>
            <button
              onClick={() => setShowAdventureCreator(true)}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-lg font-semibold rounded-xl transform hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-blue-500/50 relative overflow-hidden"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Create New Adventure
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">My Adventures</h3>
            <MyAdventures
              key={refreshAdventures}
              onLoginRequired={() => alert('Please log in to create and view adventures')}
            />
          </div>
        </div>
      </section>

      <About />

      {quotesLoading ? (
        <QuoteSection loading={true} />
      ) : (
        randomQuotes[2] && <QuoteSection quote={randomQuotes[2]} />
      )}

      <Footer />

      <InstallPrompt />
      <OfflineIndicator />

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

export default HomePage;
