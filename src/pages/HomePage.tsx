import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, MapPin, Compass } from 'lucide-react';
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

  const adventuresSectionRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (filters: any) => {
    setHasSearched(true);
    await searchContent(filters);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (adventuresSectionRef.current) {
        gsap.fromTo(
          adventuresSectionRef.current.querySelector('h2'),
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
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
    <div className="bg-forest-950">
      <ScrollProgress />
      <Hero />

      {/* First Quote - Cinematic Break */}
      {!quotesLoading && randomQuotes[0] && <QuoteSection quote={randomQuotes[0]} />}

      {/* Destinations Section */}
      <Destinations />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* Second Quote */}
      {!quotesLoading && randomQuotes[1] && <QuoteSection quote={randomQuotes[1]} />}

      {/* Hidden Gems Discovery Section */}
      <section className="py-24 bg-forest-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="absolute inset-0 w-full h-full opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="5" cy="5" r="0.2" fill="rgba(201, 168, 74, 0.3)" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10" ref={adventuresSectionRef}>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 border border-gold-500/20 px-4 py-2 mb-6">
              <Compass className="w-4 h-4 text-gold-500/60" />
              <span
                className="text-xs uppercase tracking-[0.2em] text-gold-400/80"
                style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                Community Discovery
              </span>
            </div>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-serif text-mist-100 mb-4"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Some places reveal themselves
              <br />
              <span className="italic text-mist-300/80">only to the curious.</span>
            </h2>
            <p className="text-mist-500/60 max-w-xl mx-auto leading-relaxed text-sm md:text-base">
              Hidden gems discovered by our community of explorers.
              Every gem has a founder. Every place, a story.
            </p>
          </div>

          <SearchResults results={results} loading={loading} error={error} />
          {hasSearched && (
            <div className="mt-12">
              <MyAdventures
                key={refreshAdventures}
                onLoginRequired={() => {
                  setShowAdventureCreator(true);
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <About />

      {/* Final Quote */}
      {!quotesLoading && randomQuotes[2] && <QuoteSection quote={randomQuotes[2]} />}

      {/* Call to Adventure Section */}
      <section className="py-24 bg-forest-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-forest-900/50 via-transparent to-forest-950" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div
            className="text-3xl md:text-5xl font-serif text-mist-100 mb-6 leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Ready to become part of
            <br />
            <span className="italic text-gold-400/80">the discovery?</span>
          </div>
          <p className="text-mist-500/60 mb-12 leading-relaxed max-w-xl mx-auto text-sm md:text-base">
            Join a community of modern explorers who believe
            the best places are often the ones not yet found.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                window.location.href = '/hidden-gems';
              }}
              className="group px-8 py-4 bg-forest-800/80 backdrop-blur-sm border border-gold-500/20 text-mist-200 text-sm uppercase tracking-wider hover:bg-forest-700 hover:border-gold-400/30 transition-all duration-500"
            >
              <span className="flex items-center justify-center gap-3">
                <MapPin className="w-4 h-4 text-gold-400/70" />
                Explore Hidden Gems
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
            <button
              onClick={() => setShowAdventureCreator(true)}
              className="px-8 py-4 bg-earth-700/60 backdrop-blur-sm border border-earth-500/20 text-mist-300 text-sm uppercase tracking-wider hover:bg-earth-600/80 hover:border-earth-400/30 transition-all duration-500"
            >
              <span className="text-gold-400/80">Become a Contributor</span>
            </button>
          </div>
        </div>
      </section>

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
