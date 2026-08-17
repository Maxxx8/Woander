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
    <section className="relative py-28" style={{ backgroundColor: '#71877A' }}>
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="mb-14">
          <p className="font-mono text-[10px] tracking-widest uppercase mb-4" style={{ color: 'rgba(245,241,232,0.6)' }}>Archive</p>
          <h2 className="font-display text-4xl md:text-5xl font-light" style={{ color: '#F5F1E8' }}>
            Signals From <em className="italic" style={{ color: '#D8C7A5' }}>The Archive.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0" style={{ border: '1px solid rgba(245,241,232,0.15)' }}>
          {/* Rotating signal */}
          <div className="p-12 flex flex-col justify-between min-h-[220px]" style={{ borderBottom: '1px solid rgba(245,241,232,0.15)', borderRight: '0' }}>
            <div>
              <span className="font-mono text-[9px] tracking-widest uppercase block mb-6" style={{ color: 'rgba(216,199,165,0.5)' }}>
                {ARCHIVE_SIGNALS[activeIndex].type === 'coord' ? 'Coordinates' : ARCHIVE_SIGNALS[activeIndex].type === 'quote' ? 'Transmission' : 'Field Note'}
              </span>
              <p
                key={activeIndex}
                className={`font-display font-light leading-relaxed transition-all duration-700 ${
                  ARCHIVE_SIGNALS[activeIndex].type === 'coord'
                    ? 'font-mono text-base'
                    : ARCHIVE_SIGNALS[activeIndex].type === 'quote'
                    ? 'text-2xl italic'
                    : 'text-base'
                }`}
                style={{
                  color: ARCHIVE_SIGNALS[activeIndex].type === 'coord'
                    ? 'rgba(216,199,165,0.8)'
                    : ARCHIVE_SIGNALS[activeIndex].type === 'quote'
                    ? '#F5F1E8'
                    : 'rgba(245,241,232,0.7)',
                  animation: 'fadeInUp 0.6s ease-out',
                }}
              >
                {ARCHIVE_SIGNALS[activeIndex].text}
              </p>
            </div>
            <div className="flex gap-1 mt-8">
              {ARCHIVE_SIGNALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className="h-px transition-all duration-300"
                  style={{
                    width: i === activeIndex ? '24px' : '8px',
                    backgroundColor: i === activeIndex ? '#D8C7A5' : 'rgba(245,241,232,0.2)',
                  }}
                  aria-label={`Signal ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Static archive fragments */}
          <div className="p-12 grid grid-cols-1 gap-5" style={{ borderLeft: '1px solid rgba(245,241,232,0.15)' }}>
            {ARCHIVE_SIGNALS.filter(s => s.type === 'fact').slice(0, 3).map((signal, i) => (
              <div key={i} className="group flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 transition-colors duration-300" style={{ color: 'rgba(216,199,165,0.3)' }}>◦</span>
                <p className="text-xs leading-relaxed font-light transition-colors duration-300" style={{ color: 'rgba(245,241,232,0.6)' }}>
                  {signal.text}
                </p>
              </div>
            ))}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(245,241,232,0.1)' }}>
              <p className="font-mono text-[9px] tracking-widest" style={{ color: 'rgba(245,241,232,0.35)' }}>
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
  coordinate?: string;
  caption?: string;
  variant?: 'full' | 'panoramic';
}

const storySections: StorySection[] = [
  {
    image: 'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'Some places reveal themselves slowly.',
    subtext: "A mist-covered ridge. A path with no name. You only find it if you're looking.",
    align: 'center',
    coordinate: '11.6854° N, 75.9912° E',
    caption: 'Wayanad Ridge — predawn mist',
    variant: 'full',
  },
  {
    image: 'https://images.pexels.com/photos/1313814/pexels-photo-1313814.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'Tourism became visibility. Not discovery.',
    subtext: 'The algorithm optimized for crowds. The crowds optimized for the algorithm. Something was lost.',
    align: 'left',
    coordinate: undefined,
    variant: 'panoramic',
  },
  {
    image: 'https://images.pexels.com/photos/220067/pexels-photo-220067.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'The real places stayed hidden.',
    subtext: 'Waterfall paths. Village feasts. The elder who knows where the fireflies gather at dusk.',
    align: 'center',
    coordinate: '9.2648° N, 76.7870° E',
    caption: 'A trail with no signage',
    variant: 'full',
  },
  {
    image: 'https://images.pexels.com/photos/167964/pexels-photo-167964.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'Trust disappeared first.',
    subtext: 'The guide who actually knows. The family who opens their home. The knowledge that cannot be Googled.',
    align: 'left',
    coordinate: undefined,
    variant: 'panoramic',
  },
  {
    image: 'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'So we built Woander.',
    subtext: 'Not a platform. Not a marketplace. A living map — drawn by the people who actually know these places.',
    align: 'center',
    coordinate: '10.0159° N, 77.0648° E',
    caption: 'Charting the unknown',
    variant: 'full',
  },
  {
    image: 'https://images.pexels.com/photos/1029611/pexels-photo-1029611.jpeg?auto=compress&cs=tinysrgb&w=1920',
    headline: 'The people who discover value should benefit from it.',
    subtext: 'Every Hidden Gem Has A Founder.',
    align: 'center',
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
      {/* Background — brightened with warm grading */}
      <div className="absolute inset-0">
        <img
          src={section.image}
          alt=""
          className="story-bg w-full h-full object-cover"
          style={{ scale: '1.1', filter: 'brightness(1.0) saturate(1.05) contrast(1.02) sepia(0.1)' }}
        />
      </div>

      {/* Warm ivory gradient overlay — lighter, editorial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isPanoramic
            ? 'linear-gradient(to right, rgba(245,241,232,0.85) 0%, rgba(245,241,232,0.4) 50%, rgba(245,241,232,0.15) 100%)'
            : 'linear-gradient(to bottom, rgba(245,241,232,0.35) 0%, rgba(245,241,232,0.15) 35%, rgba(245,241,232,0.2) 55%, rgba(245,241,232,0.55) 100%)',
        }}
      />

      {/* Field caption */}
      {section.caption && (
        <div className="absolute top-8 right-8 z-[2] hidden md:block">
          <div className="px-4 py-2" style={{ backgroundColor: 'rgba(245,241,232,0.85)', backdropFilter: 'blur(4px)' }}>
            <p className="font-mono text-[9px] tracking-widest uppercase" style={{ color: '#71877A' }}>Field Note</p>
            <p className="font-display italic text-xs mt-0.5" style={{ color: '#27302D' }}>{section.caption}</p>
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
        <p className="font-mono text-[10px] tracking-widest uppercase mb-6" style={{ color: '#B99A5B' }}>
          {String(index + 1).padStart(2, '0')} / {String(storySections.length).padStart(2, '0')}
        </p>

        {/* Headline */}
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] mb-6" style={{ color: '#243A34' }}>
          {isLast ? (
            <>
              <span className="block">The people who discover value</span>
              <em className="italic" style={{ color: '#B97862' }}>should benefit from it.</em>
            </>
          ) : (
            section.headline
          )}
        </h2>

        {/* Subtext */}
        {section.subtext && (
          <p
            className={`font-light leading-relaxed max-w-lg ${section.align === 'center' ? 'mx-auto' : ''} ${isLast ? 'font-display italic text-2xl md:text-3xl' : 'text-sm sm:text-base'}`}
            style={{ color: isLast ? '#B97862' : '#27302D' }}
          >
            {section.subtext}
          </p>
        )}

        {/* Hidden coordinate */}
        {section.coordinate && (
          <p className="font-mono text-[10px] tracking-widest mt-8 opacity-50" style={{ color: '#71877A' }}>
            {section.coordinate}
          </p>
        )}

        {/* CTA on last section */}
        {isLast && (
          <div className="mt-10 flex flex-col sm:flex-row items-center gap-4 justify-center">
            <button
              onClick={onBecomeFounder}
              className="px-8 py-3 text-sm tracking-widest uppercase transition-all duration-500"
              style={{
                border: '1px solid #243A34',
                color: '#243A34',
                backgroundColor: 'transparent',
              }}
            >
              Become a Gem Founder
            </button>
            <a
              href="/hidden-gems"
              className="text-sm tracking-wide transition-colors duration-300"
              style={{ color: '#71877A' }}
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
    <div className="paper-grain" style={{ backgroundColor: '#FAF8F2' }}>
      <ScrollProgress />
      <Hero />

      {/* Six storytelling scroll sections */}
      {storySections.map((section, i) => (
        <StoryBlock key={i} section={section} index={i} onBecomeFounder={() => setShowAddGem(true)} />
      ))}

      {/* Terrain divider into Hidden Gems */}
      <TerrainDivider />

      {/* Hidden Gems community section — warm cream */}
      <div className="relative pt-28 pb-20" style={{ backgroundColor: '#FAF8F2' }}>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 gap-6">
            <div>
              <p className="font-mono text-[10px] tracking-widest uppercase mb-4" style={{ color: '#71877A' }}>Community Discoveries</p>
              <h2 className="font-display text-4xl md:text-5xl font-light leading-tight" style={{ color: '#243A34' }}>
                Hidden Gems,<br />
                <em className="italic" style={{ color: '#B97862' }}>recently mapped.</em>
              </h2>
            </div>
            <a href="/hidden-gems" className="font-mono text-[10px] tracking-widest uppercase transition-colors duration-300" style={{ color: '#71877A' }}>
              View All →
            </a>
          </div>

          {/* Featured panoramic gem — large */}
          <div className="mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <a href="/hidden-gems" className="lg:col-span-2 relative overflow-hidden group cursor-pointer min-h-[340px] block rounded-sm">
              <img
                src="https://images.pexels.com/photos/5429543/pexels-photo-5429543.jpeg?auto=compress&cs=tinysrgb&w=1600"
                alt="Nelliyampathy Mist Trail"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                style={{ filter: 'brightness(1.05) saturate(1.05) sepia(0.08)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(36,58,52,0.85), rgba(36,58,52,0.2), transparent)' }} />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <p className="font-mono text-[9px] tracking-widest mb-3" style={{ color: 'rgba(216,199,165,0.8)' }}>10.8505° N · VERIFIED</p>
                <h3 className="font-display text-3xl font-light mb-2" style={{ color: '#F5F1E8' }}>Nelliyampathy Mist Trail</h3>
                <p className="text-sm font-light max-w-md" style={{ color: 'rgba(245,241,232,0.8)' }}>A ridge trail that only appears between October and February, when the mist pulls back just enough to walk it.</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="font-mono text-[9px]" style={{ color: 'rgba(216,199,165,0.6)' }}>FOUNDER · ARJUN V.</span>
                  <span className="font-mono text-[9px]" style={{ color: 'rgba(245,241,232,0.4)' }}>12 notes · 43 visits</span>
                </div>
              </div>
            </a>

            {/* Medium stacked gem */}
            <a href="/hidden-gems" className="relative overflow-hidden group cursor-pointer min-h-[340px] block rounded-sm">
              <img
                src="https://images.pexels.com/photos/12233685/pexels-photo-12233685.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Kadalar Cave Springs"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                style={{ filter: 'brightness(1.05) saturate(1.05) sepia(0.08)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(36,58,52,0.85), rgba(36,58,52,0.2), transparent)' }} />
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <p className="font-mono text-[9px] tracking-widest mb-3" style={{ color: 'rgba(216,199,165,0.8)' }}>9.9312° N · VERIFIED</p>
                <h3 className="font-display text-2xl font-light mb-2" style={{ color: '#F5F1E8' }}>Kadalar Cave Springs</h3>
                <p className="text-xs font-light" style={{ color: 'rgba(245,241,232,0.6)' }}>Idukki, Kerala</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="font-mono text-[9px]" style={{ color: 'rgba(216,199,165,0.6)' }}>FOUNDER · MEERA S.</span>
                  <span className="font-mono text-[9px]" style={{ color: 'rgba(245,241,232,0.4)' }}>7 notes</span>
                </div>
              </div>
            </a>
          </div>

          {/* Smaller gems — offset grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Vellarimala Summit Path', location: 'Wayanad, Kerala', founder: 'Rahul K.', notes: 19, visits: 61, verified: false, coord: '11.6854° N', img: 'https://images.pexels.com/photos/34954441/pexels-photo-34954441.jpeg?auto=compress&cs=tinysrgb&w=800' },
              { name: 'Pookode Lake Inlet', location: 'Wayanad, Kerala', founder: 'Divya R.', notes: 5, visits: 22, verified: true, coord: '11.5100° N', img: 'https://images.pexels.com/photos/32942923/pexels-photo-32942923.jpeg?auto=compress&cs=tinysrgb&w=800' },
              { name: 'Athirappilly Upper Falls', location: 'Thrissur, Kerala', founder: 'Santhosh M.', notes: 9, visits: 37, verified: true, coord: '10.2833° N', img: 'https://images.pexels.com/photos/14020875/pexels-photo-14020875.jpeg?auto=compress&cs=tinysrgb&w=800' },
            ].map((gem, i) => (
              <a href="/hidden-gems" key={i} className="relative overflow-hidden group cursor-pointer min-h-[260px] block rounded-sm" style={{ marginTop: i === 1 ? '24px' : '0' }}>
                <img
                  src={gem.img}
                  alt={gem.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  style={{ filter: 'brightness(1.05) saturate(1.05) sepia(0.08)' }}
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(36,58,52,0.85), rgba(36,58,52,0.1), transparent)' }} />
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: 'rgba(216,199,165,0.6)' }}>
                    {gem.coord} · {gem.verified ? 'VERIFIED' : 'PENDING'}
                  </p>
                  <h3 className="font-display text-xl font-light mb-1" style={{ color: '#F5F1E8' }}>{gem.name}</h3>
                  <p className="font-mono text-[9px] tracking-widest uppercase mb-3" style={{ color: 'rgba(245,241,232,0.4)' }}>{gem.location}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px]" style={{ color: 'rgba(216,199,165,0.5)' }}>{gem.founder}</span>
                    <span className="font-mono text-[9px]" style={{ color: 'rgba(245,241,232,0.35)' }}>{gem.notes} notes · {gem.visits} visits</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Quote */}
      {!quotesLoading && randomQuotes[0] && (
        <div style={{ backgroundColor: '#F5F1E8' }}>
          <QuoteSection quote={randomQuotes[0]} />
        </div>
      )}

      {/* About */}
      <div style={{ backgroundColor: '#FAF8F2' }}>
        <About />
      </div>

      {/* WhyChooseUs */}
      <div style={{ backgroundColor: '#F5F1E8' }}>
        <WhyChooseUs />
      </div>

      {/* Explorer Profiles */}
      <section className="relative py-28" style={{ backgroundColor: '#A9B7A0' }}>
        <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-14">
            <p className="font-mono text-[10px] tracking-widest uppercase mb-4" style={{ color: 'rgba(36,58,52,0.6)' }}>Who Explores Here</p>
            <h2 className="font-display text-4xl md:text-5xl font-light leading-tight max-w-xl" style={{ color: '#243A34' }}>
              The <em className="italic" style={{ color: '#B97862' }}>explorer hierarchy.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0" style={{ borderTop: '1px solid rgba(36,58,52,0.15)', borderLeft: '1px solid rgba(36,58,52,0.15)' }}>
            {[
              { rank: 'Pathfinder', desc: 'First to visit and document an undiscovered place.', stat: '1–3 gems found', icon: '◎' },
              { rank: 'Vanguard', desc: 'Recurring contributor with verified field notes and local connections.', stat: '4–10 gems found', icon: '◈' },
              { rank: 'Gem Founder', desc: 'Discovered a gem that earned community verification and explorer visits.', stat: 'Verified gem owner', icon: '◆' },
              { rank: 'Cartographer', desc: 'Mapped an entire region — trails, guides, seasonal notes, local lore.', stat: 'Region complete', icon: '⊕' },
            ].map((profile, i) => (
              <div key={i} className="p-8 group transition-colors duration-400" style={{ borderBottom: '1px solid rgba(36,58,52,0.15)', borderRight: '1px solid rgba(36,58,52,0.15)' }}>
                <span className="text-xl block mb-4 transition-colors duration-300" style={{ color: 'rgba(185,154,91,0.4)' }}>{profile.icon}</span>
                <h3 className="font-display text-xl font-light mb-2" style={{ color: '#243A34' }}>{profile.rank}</h3>
                <p className="text-xs leading-relaxed font-light mb-4" style={{ color: 'rgba(36,58,52,0.6)' }}>{profile.desc}</p>
                <span className="font-mono text-[9px] tracking-widest uppercase" style={{ color: '#B99A5B' }}>{profile.stat}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Archive section */}
      <ArchiveSection />

      {/* Terrain divider into search */}
      <TerrainDivider flip />

      {/* Search section */}
      <section className="relative py-28" style={{ backgroundColor: '#FAF8F2' }}>
        <div className="relative max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-[10px] tracking-widest uppercase mb-5" style={{ color: '#71877A' }}>Seek</p>
            <h2 className="font-display text-4xl md:text-5xl font-light mb-4 leading-tight" style={{ color: '#243A34' }}>
              Find Your <em className="italic" style={{ color: '#B97862' }}>Hidden Place</em>
            </h2>
            <p className="text-sm font-light max-w-md mx-auto leading-relaxed" style={{ color: '#27302D' }}>
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

      {/* Final CTA — deep forest with warm ivory text */}
      <section className="relative py-32" style={{ backgroundColor: '#243A34' }}>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Compass className="mx-auto mb-8" size={28} strokeWidth={1.5} style={{ color: 'rgba(216,199,165,0.4)' }} />
          <h2 className="font-display text-4xl md:text-5xl font-light leading-tight mb-4" style={{ color: '#F5F1E8' }}>
            Where will you <em className="italic" style={{ color: '#D8C7A5' }}>wander next?</em>
          </h2>
          <p className="text-sm font-light mb-10 max-w-md mx-auto" style={{ color: 'rgba(245,241,232,0.6)' }}>
            Create your personalized itinerary in minutes with our intelligent trip planner.
          </p>
          <button
            onClick={() => setShowAddGem(true)}
            className="group inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-500"
            style={{
              border: '1px solid rgba(245,241,232,0.3)',
              color: '#F5F1E8',
              backgroundColor: 'transparent',
            }}
          >
            Become a Gem Founder
          </button>
        </div>
      </section>

      {!quotesLoading && randomQuotes[1] && (
        <div style={{ backgroundColor: '#F5F1E8' }}>
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
