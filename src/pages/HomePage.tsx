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

const ARCHIVE_SIGNALS = [
  { type: 'coord', text: '10.8505° N, 76.2711° E — Nelliyampathy' },
  { type: 'quote', text: '"Every civilization began as a hidden place."' },
  { type: 'fact', text: '61% of India\'s biodiversity corridors have no tourism infrastructure.' },
  { type: 'quote', text: '"The unknown still exists."' },
  { type: 'coord', text: '9.9312° N, 76.2673° E — Idukki Arc' },
  { type: 'fact', text: 'Over 400 waterfall trails in Kerala remain unmapped.' },
  { type: 'quote', text: '"The map is never the territory."' },
  { type: 'coord', text: '11.6854° N, 75.9912° E — Wayanad Ridge' },
  { type: 'fact', text: 'The average hidden gem is visited by fewer than 20 people per year.' },
  { type: 'quote', text: '"Find the others who still wander."' },
];

const ArchiveSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(i => (i + 1) % ARCHIVE_SIGNALS.length);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-forest-950 border-t border-forest-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-12">
          <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Archive</p>
          <h2 className="font-display text-3xl font-light text-cream">
            Signals From <em className="italic text-gold-300">The Archive.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-forest-800">
          {/* Rotating signal */}
          <div className="p-10 border-b lg:border-b-0 lg:border-r border-forest-800 flex flex-col justify-between min-h-[200px]">
            <div>
              <span className="font-jetbrains text-[9px] text-gold-400/40 tracking-widest uppercase block mb-6">
                {ARCHIVE_SIGNALS[activeIndex].type === 'coord' ? 'Coordinates' : ARCHIVE_SIGNALS[activeIndex].type === 'quote' ? 'Transmission' : 'Field Note'}
              </span>
              <p
                key={activeIndex}
                className={`font-display font-light leading-relaxed transition-all duration-700 ${
                  ARCHIVE_SIGNALS[activeIndex].type === 'coord'
                    ? 'font-jetbrains text-base text-gold-400/70'
                    : ARCHIVE_SIGNALS[activeIndex].type === 'quote'
                    ? 'text-2xl italic text-cream'
                    : 'text-base text-mist-400'
                }`}
                style={{ animation: 'fadeInUp 0.6s ease-out' }}
              >
                {ARCHIVE_SIGNALS[activeIndex].text}
              </p>
            </div>
            {/* Progress dots */}
            <div className="flex gap-1 mt-8">
              {ARCHIVE_SIGNALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-px transition-all duration-300 ${i === activeIndex ? 'w-6 bg-gold-400' : 'w-2 bg-forest-700'}`}
                  aria-label={`Signal ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Static archive fragments */}
          <div className="p-10 grid grid-cols-1 gap-4">
            {ARCHIVE_SIGNALS.filter(s => s.type === 'fact').slice(0, 3).map((signal, i) => (
              <div key={i} className="group flex items-start gap-3">
                <span className="text-gold-400/20 group-hover:text-gold-400/60 transition-colors duration-300 mt-0.5 flex-shrink-0">◦</span>
                <p className="text-mist-700 text-xs leading-relaxed font-light group-hover:text-mist-500 transition-colors duration-300">
                  {signal.text}
                </p>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-forest-800">
              <p className="font-jetbrains text-[9px] text-mist-800 tracking-widest">
                Last updated: Field season 2024 — 847 gems catalogued
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </section>
  );
};

interface StorySection {
  image: string;
  headline: string;
  subtext?: string;
  align: 'center' | 'left';
  overlay: string;
  coordinate?: string;
}

const storySections: StorySection[] = [
  {
    image: 'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'Some places reveal themselves slowly.',
    subtext: "A mist-covered ridge. A path with no name. You only find it if you're looking.",
    align: 'center',
    overlay: 'from-forest-950/80 via-forest-950/50 to-forest-950/80',
    coordinate: '11.6854° N, 75.9912° E',
  },
  {
    image: 'https://images.pexels.com/photos/1797121/pexels-photo-1797121.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'Tourism became visibility. Not discovery.',
    subtext: 'The algorithm optimized for crowds. The crowds optimized for the algorithm. Something was lost.',
    align: 'left',
    overlay: 'from-forest-950/90 via-forest-950/60 to-transparent',
    coordinate: undefined,
  },
  {
    image: 'https://images.pexels.com/photos/5273584/pexels-photo-5273584.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'The real places stayed hidden.',
    subtext: 'Waterfall paths. Village feasts. The elder who knows where the fireflies gather at dusk.',
    align: 'center',
    overlay: 'from-forest-950/70 via-forest-950/40 to-forest-950/75',
    coordinate: '9.2648° N, 76.7870° E',
  },
  {
    image: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'Trust disappeared first.',
    subtext: 'The guide who actually knows. The family who opens their home. The knowledge that cannot be Googled.',
    align: 'left',
    overlay: 'from-forest-950/85 via-forest-950/55 to-transparent',
    coordinate: undefined,
  },
  {
    image: 'https://images.pexels.com/photos/2104152/pexels-photo-2104152.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'So we built Woander.',
    subtext: 'Not a platform. Not a marketplace. A living map — drawn by the people who actually know these places.',
    align: 'center',
    overlay: 'from-forest-950/75 via-forest-950/50 to-forest-950/80',
    coordinate: '10.0159° N, 77.0648° E',
  },
  {
    image: 'https://images.pexels.com/photos/1591382/pexels-photo-1591382.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'The people who discover value should benefit from it.',
    subtext: 'Every Hidden Gem Has A Founder.',
    align: 'center',
    overlay: 'from-forest-950/90 via-forest-950/70 to-forest-950/90',
    coordinate: undefined,
  },
];

const StoryBlock: React.FC<{ section: StorySection; index: number }> = ({ section, index }) => {
  const blockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = blockRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelector('.story-text'),
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 65%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        el.querySelector('.story-bg'),
        { scale: 1.1 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  const isLast = index === storySections.length - 1;

  return (
    <div
      ref={blockRef}
      className="relative overflow-hidden flex items-center justify-center"
      style={{ minHeight: isLast ? '80vh' : '100vh' }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={section.image}
          alt=""
          className="story-bg w-full h-full object-cover"
          style={{ filter: 'grayscale(30%) brightness(0.5) saturate(0.7)', scale: '1.1' }}
        />
      </div>

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${section.overlay}`} />

      {/* Content */}
      <div
        className={`story-text relative z-10 px-6 sm:px-12 max-w-4xl ${
          section.align === 'left' ? 'self-center ml-0 md:ml-16 lg:ml-32 text-left' : 'text-center mx-auto'
        }`}
        style={{ opacity: 0 }}
      >
        {/* Chapter marker */}
        <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-6">
          {String(index + 1).padStart(2, '0')} / {String(storySections.length).padStart(2, '0')}
        </p>

        {/* Headline */}
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light text-cream leading-[1.1] mb-6">
          {isLast ? (
            <>
              <span className="block text-mist-300">The people who discover value</span>
              <em className="italic text-gold-300">should benefit from it.</em>
            </>
          ) : (
            section.headline
          )}
        </h2>

        {/* Subtext */}
        {section.subtext && (
          <p className={`text-mist-400 font-light leading-relaxed max-w-lg ${section.align === 'center' ? 'mx-auto' : ''} ${isLast ? 'font-display italic text-2xl md:text-3xl text-gold-300/80' : 'text-sm sm:text-base'}`}>
            {section.subtext}
          </p>
        )}

        {/* Hidden coordinate */}
        {section.coordinate && (
          <p className="font-jetbrains text-[10px] text-gold-400/30 tracking-widest mt-8 opacity-60">
            {section.coordinate}
          </p>
        )}

        {/* CTA on last section */}
        {isLast && (
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <a
              href="/vanguard"
              className="px-8 py-3 border border-gold-400/40 text-gold-300 text-sm tracking-widest uppercase hover:border-gold-400/80 hover:bg-gold-400/8 transition-all duration-500"
            >
              Become a Gem Founder
            </a>
            <a
              href="/hidden-gems"
              className="text-mist-500 hover:text-mist-300 text-sm tracking-wide transition-colors duration-300"
            >
              Explore Hidden Gems →
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

const HomePage = () => {
  const [showAdventureCreator, setShowAdventureCreator] = useState(false);
  const [refreshAdventures, setRefreshAdventures] = useState(0);
  const { quotes: randomQuotes, isLoading: quotesLoading } = useRandomQuotes(3);
  const { results, loading, error, searchContent } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (filters: any) => {
    setHasSearched(true);
    await searchContent(filters);
  };

  return (
    <div className="bg-forest-950">
      <ScrollProgress />
      <Hero />

      {/* Six storytelling scroll sections */}
      {storySections.map((section, i) => (
        <StoryBlock key={i} section={section} index={i} />
      ))}

      {/* Hidden Gems community section */}
      <div className="bg-forest-950 pt-24 pb-0">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Community Discoveries</p>
              <h2 className="font-display text-4xl font-light text-cream">
                Hidden Gems, <em className="italic text-gold-300">recently mapped.</em>
              </h2>
            </div>
            <a href="/hidden-gems" className="hidden md:block font-jetbrains text-[10px] text-mist-600 hover:text-gold-400 tracking-widest uppercase transition-colors duration-300">
              View All →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-forest-800">
            {[
              { name: 'Nelliyampathy Mist Trail', location: 'Palakkad, Kerala', founder: 'Arjun V.', notes: 12, visits: 43, verified: true, coord: '10.8505° N' },
              { name: 'Kadalar Cave Springs', location: 'Idukki, Kerala', founder: 'Meera S.', notes: 7, visits: 18, verified: true, coord: '9.9312° N' },
              { name: 'Vellarimala Summit Path', location: 'Wayanad, Kerala', founder: 'Rahul K.', notes: 19, visits: 61, verified: false, coord: '11.6854° N' },
              { name: 'Pookode Lake Inlet', location: 'Wayanad, Kerala', founder: 'Divya R.', notes: 5, visits: 22, verified: true, coord: '11.5100° N' },
              { name: 'Athirappilly Upper Falls', location: 'Thrissur, Kerala', founder: 'Santhosh M.', notes: 9, visits: 37, verified: true, coord: '10.2833° N' },
              { name: 'Peermade Cardamom Route', location: 'Idukki, Kerala', founder: 'Anita J.', notes: 14, visits: 29, verified: false, coord: '9.5670° N' },
            ].map((gem, i) => (
              <div key={i} className="border-b border-r border-forest-800 p-6 group hover:bg-forest-900/40 transition-colors duration-400 cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <p className="font-jetbrains text-[9px] text-gold-400/40 tracking-widest">{gem.coord}</p>
                  <span className={`font-jetbrains text-[9px] tracking-widest px-2 py-0.5 border ${gem.verified ? 'border-gold-400/30 text-gold-400/60' : 'border-forest-700 text-mist-700'}`}>
                    {gem.verified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                <h3 className="font-display text-lg font-light text-cream mb-1 group-hover:text-gold-200 transition-colors duration-300">{gem.name}</h3>
                <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase mb-4">{gem.location}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded-full bg-forest-700 border border-forest-600 flex items-center justify-center">
                      <span className="text-[7px] text-mist-500">{gem.founder[0]}</span>
                    </div>
                    <span className="font-jetbrains text-[9px] text-mist-600">{gem.founder}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-jetbrains text-[9px] text-mist-700">{gem.notes} notes</span>
                    <span className="font-jetbrains text-[9px] text-mist-700">{gem.visits} visits</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Destinations in dark wrapper */}
      <div className="bg-forest-950">
        <Destinations />
      </div>

      {/* Quote */}
      {!quotesLoading && randomQuotes[0] && (
        <div className="bg-forest-950">
          <QuoteSection quote={randomQuotes[0]} />
        </div>
      )}

      {/* About */}
      <div className="bg-forest-950">
        <About />
      </div>

      {/* WhyChooseUs */}
      <div className="bg-forest-950">
        <WhyChooseUs />
      </div>

      {/* Explorer Profiles */}
      <section className="py-20 bg-forest-900 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Who Explores Here</p>
            <h2 className="font-display text-3xl font-light text-cream">
              The <em className="italic text-gold-300">explorer hierarchy.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-t border-l border-forest-800">
            {[
              { rank: 'Pathfinder', desc: 'First to visit and document an undiscovered place.', stat: '1–3 gems found', icon: '◎' },
              { rank: 'Vanguard', desc: 'Recurring contributor with verified field notes and local connections.', stat: '4–10 gems found', icon: '◈' },
              { rank: 'Gem Founder', desc: 'Discovered a gem that earned community verification and explorer visits.', stat: 'Verified gem owner', icon: '◆' },
              { rank: 'Cartographer', desc: 'Mapped an entire region — trails, guides, seasonal notes, local lore.', stat: 'Region complete', icon: '⊕' },
            ].map((profile, i) => (
              <div key={i} className="border-b border-r border-forest-800 p-8 group hover:bg-forest-800/30 transition-colors duration-400">
                <span className="text-xl text-gold-400/30 group-hover:text-gold-400/70 transition-colors duration-300 block mb-4">{profile.icon}</span>
                <h3 className="font-display text-xl font-light text-cream mb-2 group-hover:text-gold-200 transition-colors duration-300">{profile.rank}</h3>
                <p className="text-mist-600 text-xs leading-relaxed font-light mb-4">{profile.desc}</p>
                <span className="font-jetbrains text-[9px] text-gold-400/50 tracking-widest uppercase">{profile.stat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archive section */}
      <ArchiveSection />

      {/* Search section */}
      <section className="py-20 bg-forest-900 border-t border-forest-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Seek</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-cream mb-3">
              Find Your Hidden Place
            </h2>
            <p className="text-mist-600 text-sm font-light">
              Search beyond what the algorithm shows you.
            </p>
          </div>
          <div className="bg-forest-800/50 border border-forest-700 rounded-none p-8">
            <SearchBar
              onSearch={handleSearch}
              showBudgetFilter={true}
              showCategoryFilter={true}
              showDifficultyFilter={true}
              placeholder="Search destinations, experiences, hidden gems..."
            />
          </div>
          {hasSearched && (
            <div className="mt-8">
              <SearchResults results={results} loading={loading} error={error} />
            </div>
          )}
        </div>
      </section>

      {/* Adventures section */}
      <section className="py-20 px-6 bg-forest-950 border-t border-forest-800">
        <div id="adventures" className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Plan</p>
            <h2 className="font-display text-3xl md:text-4xl font-light text-cream mb-3">
              Create Your Adventure
            </h2>
            <p className="text-mist-600 text-sm font-light mb-8">
              Detailed itineraries for off-the-beaten-path journeys
            </p>
            <button
              onClick={() => setShowAdventureCreator(true)}
              className="group inline-flex items-center gap-3 px-8 py-3 border border-gold-400/30 text-gold-300 text-sm tracking-widest uppercase hover:border-gold-400/70 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              Create New Adventure
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="mt-10">
            <p className="font-jetbrains text-[10px] text-mist-700 tracking-widest uppercase mb-6">My Adventures</p>
            <MyAdventures
              key={refreshAdventures}
              onLoginRequired={() => alert('Please log in to create and view adventures')}
            />
          </div>
        </div>
      </section>

      {!quotesLoading && randomQuotes[1] && (
        <div className="bg-forest-950">
          <QuoteSection quote={randomQuotes[1]} />
        </div>
      )}

      <Footer />
      <InstallPrompt />
      <OfflineIndicator />

      {showAdventureCreator && (
        <AdventureCreator
          onClose={() => setShowAdventureCreator(false)}
          onSuccess={() => setRefreshAdventures(prev => prev + 1)}
        />
      )}
    </div>
  );
};

export default HomePage;
