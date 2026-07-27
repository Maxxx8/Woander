import React, { useState, useRef, useEffect } from 'react';
import { Compass } from 'lucide-react';
import AddGemModal from '../components/AddGemModal';
import Hero from '../components/Hero';
import QuoteSection from '../components/QuoteSection';
import WhyChooseUs from '../components/WhyChooseUs';
import About from '../components/About';
import Footer from '../components/Footer';
import InstallPrompt from '../components/InstallPrompt';
import OfflineIndicator from '../components/OfflineIndicator';
import { TerrainDivider, TopoBackground, FieldCaption } from '../components/FieldElements';

import SearchResults from '../components/SearchResults';
import ScrollProgress from '../components/ScrollProgress';
import { useRandomQuotes } from '../hooks/useRandomQuotes';
import { useSearch } from '../hooks/useSearch';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SearchBar from '../components/SearchBar';

gsap.registerPlugin(ScrollTrigger);

const ARCHIVE_SIGNALS = [
  { type: 'coord', text: '10.8505° N, 76.2711° E — Nelliyampathy' },
  { type: 'quote', text: '"Every civilization began as a hidden place."' },
  { type: 'fact', text: "61% of India's biodiversity corridors have no tourism infrastructure." },
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
    <section className="relative py-28 bg-forest-950">
      <TopoBackground opacity={0.04} />
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-14">
          <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Archive</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-cream">
            Signals From <em className="italic text-gold-300">The Archive.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-forest-800">
          {/* Rotating signal */}
          <div className="p-12 border-b lg:border-b-0 lg:border-r border-forest-800 flex flex-col justify-between min-h-[220px]">
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
          <div className="p-12 grid grid-cols-1 gap-5">
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
  caption?: string;
  variant?: 'full' | 'panoramic';
}

const storySections: StorySection[] = [
  {
    // Heavy volumetric fog rolling through dense forest — something half-hidden
    image: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'Some places reveal themselves slowly.',
    subtext: "A mist-covered ridge. A path with no name. You only find it if you're looking.",
    align: 'center',
    overlay: 'from-forest-950/70 via-forest-950/40 to-forest-950/75',
    coordinate: '11.6854° N, 75.9912° E',
    caption: 'Wayanad Ridge — predawn mist',
    variant: 'full',
  },
  {
    // Long-exposure crowd motion — streaks of light, indistinct figures, energy without place
    image: 'https://images.pexels.com/photos/1108089/pexels-photo-1108089.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'Tourism became visibility. Not discovery.',
    subtext: 'The algorithm optimized for crowds. The crowds optimized for the algorithm. Something was lost.',
    align: 'left',
    overlay: 'from-forest-950/90 via-forest-950/60 to-transparent',
    coordinate: undefined,
    variant: 'panoramic',
  },
  {
    // Scattered gold bokeh in deep darkness — points of light held in shadow, like fireflies
    image: 'https://images.pexels.com/photos/220067/pexels-photo-220067.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'The real places stayed hidden.',
    subtext: 'Waterfall paths. Village feasts. The elder who knows where the fireflies gather at dusk.',
    align: 'center',
    overlay: 'from-forest-950/65 via-forest-950/30 to-forest-950/70',
    coordinate: '9.2648° N, 76.7870° E',
    caption: 'A trail with no signage',
    variant: 'full',
  },
  {
    // A hand reaching from a dark silhouette — knowledge withdrawing, trust retreating
    image: 'https://images.pexels.com/photos/167964/pexels-photo-167964.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'Trust disappeared first.',
    subtext: 'The guide who actually knows. The family who opens their home. The knowledge that cannot be Googled.',
    align: 'left',
    overlay: 'from-forest-950/85 via-forest-950/50 to-transparent',
    coordinate: undefined,
    variant: 'panoramic',
  },
  {
    // Star trails swirling overhead — the act of mapping the sky, a living record drawn over time
    image: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'So we built Woander.',
    subtext: 'Not a platform. Not a marketplace. A living map — drawn by the people who actually know these places.',
    align: 'center',
    overlay: 'from-forest-950/75 via-forest-950/45 to-forest-950/80',
    coordinate: '10.0159° N, 77.0648° E',
    caption: 'Charting the unknown',
    variant: 'full',
  },
  {
    // Warm amber and gold light — the feeling of arrival, first light on a summit earned
    image: 'https://images.pexels.com/photos/1029611/pexels-photo-1029611.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'The people who discover value should benefit from it.',
    subtext: 'Every Hidden Gem Has A Founder.',
    align: 'center',
    overlay: 'from-forest-950/80 via-forest-950/55 to-forest-950/85',
    coordinate: undefined,
    variant: 'full',
  },
];

const StoryBlock: React.FC<{ section: StorySection; index: number; onBecomeFounder?: () => void }> = ({ section, index, onBecomeFounder }) => {
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
  const isPanoramic = section.variant === 'panoramic';

  return (
    <div
      ref={blockRef}
      className={`relative overflow-hidden flex items-center ${isPanoramic ? 'justify-start' : 'justify-center'}`}
      style={{ minHeight: isPanoramic ? '70vh' : isLast ? '80vh' : '100vh' }}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={section.image}
          alt=""
          className="story-bg w-full h-full object-cover field-image"
          style={{ scale: '1.1' }}
        />
      </div>

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b ${section.overlay}`} />

      {/* Topographic texture */}
      <TopoBackground opacity={0.04} className="z-[1]" />

      {/* Field caption — documentary styling */}
      {section.caption && (
        <div className="absolute top-8 right-8 z-[2] hidden md:block">
          <div className="glass-card px-4 py-2">
            <p className="font-jetbrains text-[9px] text-gold-400/60 tracking-widest uppercase">Field Note</p>
            <p className="font-display italic text-mist-300 text-xs mt-0.5">{section.caption}</p>
          </div>
        </div>
      )}

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
            <button
              onClick={onBecomeFounder}
              className="px-8 py-3 border border-gold-400/40 text-gold-300 text-sm tracking-widest uppercase hover:border-gold-400/80 hover:bg-gold-400/8 transition-all duration-500"
            >
              Become a Gem Founder
            </button>
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
  const { quotes: randomQuotes, isLoading: quotesLoading } = useRandomQuotes(3);
  const { results, loading, error, searchContent } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);
  const [showAddGem, setShowAddGem] = useState(false);

  const handleSearch = async (filters: any) => {
    setHasSearched(true);
    await searchContent(filters);
  };

  return (
    <div className="bg-forest-950 paper-grain">
      <ScrollProgress />
      <Hero />

      {/* Six storytelling scroll sections */}
      {storySections.map((section, i) => (
        <StoryBlock key={i} section={section} index={i} onBecomeFounder={() => setShowAddGem(true)} />
      ))}

      {/* Terrain divider into Hidden Gems */}
      <TerrainDivider />

      {/* Hidden Gems community section — varied composition */}
      <div className="relative bg-forest-950 pt-28 pb-20">
        <TopoBackground opacity={0.04} />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
            <div>
              <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Community Discoveries</p>
              <h2 className="font-display text-4xl md:text-5xl font-light text-cream leading-tight">
                Hidden Gems,<br />
                <em className="italic text-gold-300">recently mapped.</em>
              </h2>
            </div>
            <a href="/hidden-gems" className="font-jetbrains text-[10px] text-mist-600 hover:text-gold-400 tracking-widest uppercase transition-colors duration-300">
              View All →
            </a>
          </div>

          {/* Featured panoramic gem — large */}
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative overflow-hidden group cursor-pointer min-h-[340px]">
              <img
                src="https://images.pexels.com/photos/2406730/pexels-photo-2406730.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="Nelliyampathy Mist Trail"
                className="absolute inset-0 w-full h-full object-cover field-image group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/30 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <p className="font-jetbrains text-[9px] text-gold-400/60 tracking-widest mb-3">10.8505° N · VERIFIED</p>
                <h3 className="font-display text-3xl font-light text-cream mb-2">Nelliyampathy Mist Trail</h3>
                <p className="text-mist-400 text-sm font-light max-w-md">A ridge trail that only appears between October and February, when the mist pulls back just enough to walk it.</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="font-jetbrains text-[9px] text-mist-600">FOUNDER · ARJUN V.</span>
                  <span className="font-jetbrains text-[9px] text-mist-700">12 notes · 43 visits</span>
                </div>
              </div>
            </div>

            {/* Medium stacked gem */}
            <div className="relative overflow-hidden group cursor-pointer min-h-[340px]">
              <img
                src="https://images.pexels.com/photos/2406730/pexels-photo-2406730.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Kadalar Cave Springs"
                className="absolute inset-0 w-full h-full object-cover field-image group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/30 to-transparent" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <p className="font-jetbrains text-[9px] text-gold-400/60 tracking-widest mb-3">9.9312° N · VERIFIED</p>
                <h3 className="font-display text-2xl font-light text-cream mb-2">Kadalar Cave Springs</h3>
                <p className="text-mist-500 text-xs font-light">Idukki, Kerala</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="font-jetbrains text-[9px] text-mist-600">FOUNDER · MEERA S.</span>
                  <span className="font-jetbrains text-[9px] text-mist-700">7 notes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Smaller gems — offset grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Vellarimala Summit Path', location: 'Wayanad, Kerala', founder: 'Rahul K.', notes: 19, visits: 61, verified: false, coord: '11.6854° N', img: 'https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=800' },
              { name: 'Pookode Lake Inlet', location: 'Wayanad, Kerala', founder: 'Divya R.', notes: 5, visits: 22, verified: true, coord: '11.5100° N', img: 'https://images.pexels.com/photos/2104152/pexels-photo-2104152.jpeg?auto=compress&cs=tinysrgb&w=800' },
              { name: 'Athirappilly Upper Falls', location: 'Thrissur, Kerala', founder: 'Santhosh M.', notes: 9, visits: 37, verified: true, coord: '10.2833° N', img: 'https://images.pexels.com/photos/1591382/pexels-photo-1591382.jpeg?auto=compress&cs=tinysrgb&w=800' },
            ].map((gem, i) => (
              <div key={i} className="relative overflow-hidden group cursor-pointer min-h-[260px]" style={{ marginTop: i === 1 ? '24px' : '0' }}>
                <img
                  src={gem.img}
                  alt={gem.name}
                  className="absolute inset-0 w-full h-full object-cover field-image group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 via-forest-950/20 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <p className="font-jetbrains text-[9px] text-gold-400/50 tracking-widest mb-2">
                    {gem.coord} · {gem.verified ? 'VERIFIED' : 'PENDING'}
                  </p>
                  <h3 className="font-display text-xl font-light text-cream mb-1">{gem.name}</h3>
                  <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase mb-3">{gem.location}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-jetbrains text-[9px] text-mist-600">{gem.founder}</span>
                    <span className="font-jetbrains text-[9px] text-mist-700">{gem.notes} notes · {gem.visits} visits</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
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

      {/* Explorer Profiles — asymmetrical */}
      <section className="relative py-28 bg-forest-900 border-t border-forest-800">
        <TopoBackground opacity={0.03} />
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Who Explores Here</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-cream leading-tight max-w-xl">
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

      {/* Terrain divider into search */}
      <TerrainDivider flip />

      {/* Search section — discovery-focused microcopy */}
      <section className="relative py-28 bg-forest-900 border-t border-forest-800">
        <TopoBackground opacity={0.04} />
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-5">Seek</p>
            <h2 className="font-display text-4xl md:text-5xl font-light text-cream mb-4 leading-tight">
              Find Your <em className="italic text-gold-300">Hidden Place</em>
            </h2>
            <p className="text-mist-500 text-sm font-light max-w-md mx-auto leading-relaxed">
              The map is not the territory. Search beyond what the algorithm shows you — by coordinate, by season, by the people who actually walked it.
            </p>
          </div>
          <SearchBar
            onSearch={handleSearch}
            showBudgetFilter={true}
            showCategoryFilter={true}
            showDifficultyFilter={true}
            placeholder="Search by place, coordinate, or feeling..."
          />
          {hasSearched && (
            <div className="mt-8">
              <SearchResults results={results} loading={loading} error={error} />
            </div>
          )}
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

      <AddGemModal
        isOpen={showAddGem}
        onClose={() => setShowAddGem(false)}
      />

    </div>
  );
};

export default HomePage;
