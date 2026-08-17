import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, ArrowRight, Loader } from 'lucide-react';
import Footer from '../components/Footer';
import AddGemModal from '../components/AddGemModal';
import GemDetailModal, { type GemDetail } from '../components/GemDetailModal';
import { supabase } from '../shared/supabase';
import { useAuth } from '../shared/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HiddenGem {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  difficulty_level: string;
  image_url: string;
  total_votes: number;
  total_visits: number;
  verification_status: string;
  created_at: string;
  best_time_to_visit: string | null;
  tips: string | null;
  latitude: number | null;
  longitude: number | null;
}

const CATEGORIES = [
  'all', 'cafe', 'viewpoint', 'waterfall', 'trail', 'beach', 'other'
];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  cafe: 'Food',
  viewpoint: 'Nature',
  waterfall: 'Waterfalls',
  trail: 'Adventure',
  beach: 'Coast',
  other: 'Quiet Places',
};

const HiddenGemsPage = () => {
  const { user } = useAuth();
  const [gems, setGems] = useState<HiddenGem[]>([]);
  const [filteredGems, setFilteredGems] = useState<HiddenGem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGem, setSelectedGem] = useState<GemDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGems();
  }, []);

  useEffect(() => {
    if (activeCategory === 'all') {
      setFilteredGems(gems);
    } else {
      setFilteredGems(gems.filter(g => g.category === activeCategory));
    }
  }, [activeCategory, gems]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hg-fade',
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.hg-fade', start: 'top 78%', toggleActions: 'play none none reverse' },
        }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [filteredGems]);

  const fetchGems = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('hidden_gems')
        .select('*')
        .in('verification_status', ['verified', 'featured'])
        .order('total_votes', { ascending: false });

      if (error) {
        setFetchError(error.message);
      } else {
        setGems(data || []);
        setFilteredGems(data || []);
      }
    } catch (e: any) {
      setFetchError(e.message || 'Failed to load gems');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    if (!user) {
      alert('Please sign in to submit a hidden gem');
      return;
    }
    setShowAddModal(true);
  };

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  };

  const featuredGems = filteredGems.slice(0, 3);
  const remainingGems = filteredGems.slice(3);

  return (
    <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: '#F6F2E9' }}>

      {/* ── Hero ── */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{ minHeight: '82vh', paddingTop: '6rem' }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=2400"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(1.15) saturate(1.12) contrast(1.0) sepia(0.05)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(38,61,53,0.2) 0%, transparent 30%, transparent 50%, rgba(38,61,53,0.45) 100%)' }}
          />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 w-full text-center">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase mb-8" style={{ color: 'rgba(246,242,233,0.85)', textShadow: '0 1px 8px rgba(38,61,53,0.3)' }}>
            Beyond the Guidebook
          </p>
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-medium leading-[1.0] mb-6 tracking-tight" style={{ color: '#F6F2E9', textShadow: '0 2px 20px rgba(38,61,53,0.4)' }}>
            Hidden Gems.
          </h1>
          <p className="font-display italic text-2xl sm:text-3xl md:text-4xl font-light mb-12" style={{ color: '#E7D9C5', textShadow: '0 1px 12px rgba(38,61,53,0.35)' }}>
            Places worth getting a little lost for.
          </p>

          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
            style={{
              backgroundColor: '#263D35',
              color: '#F6F2E9',
              border: '1px solid #263D35',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.border = '1px solid rgba(246,242,233,0.5)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#263D35'; e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.border = '1px solid #263D35'; }}
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Submit a Hidden Gem
          </button>
        </div>

        {/* Scroll indicator */}
        <button
          onClick={scrollDown}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
          style={{ color: 'rgba(246,242,233,0.4)' }}
          aria-label="Scroll down"
        >
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Scroll to explore</span>
          <div
            className="w-px h-8"
            style={{
              background: 'linear-gradient(to bottom, rgba(246,242,233,0.35), transparent)',
              animation: 'descend 2.5s ease-in-out infinite',
            }}
          />
        </button>
      </section>

      {/* ── Introduction ── */}
      <section className="py-24" style={{ backgroundColor: '#FBF8F1' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-display text-2xl md:text-3xl font-light leading-relaxed mb-4" style={{ color: '#263D35' }}>
            Discover places beyond the usual map.
          </p>
          <p className="text-sm font-light leading-relaxed max-w-xl mx-auto" style={{ color: 'rgba(48,51,47,0.6)' }}>
            Real places, shared by curious travelers. Quiet corners, hidden waterfalls, trails with no signage — found by the people who actually walked them.
          </p>
        </div>
      </section>

      {/* ── Featured Gems ── */}
      <section className="py-20" style={{ backgroundColor: '#F6F2E9' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-16">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(48,51,47,0.5)' }}>Featured</p>
            <h2 className="font-display text-4xl md:text-5xl font-light leading-tight" style={{ color: '#263D35' }}>
              Recently <em className="italic" style={{ color: '#B77B65' }}>mapped.</em>
            </h2>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-5 w-5 animate-spin" style={{ color: '#B69A63' }} />
              <span className="ml-3 font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(48,51,47,0.4)' }}>Loading discoveries...</span>
            </div>
          )}

          {fetchError && !loading && (
            <div className="text-center py-20">
              <p className="text-sm font-light mb-4" style={{ color: 'rgba(48,51,47,0.5)' }}>Unable to load discoveries at this time.</p>
              <button
                onClick={fetchGems}
                className="font-mono text-[10px] tracking-[0.2em] uppercase px-5 py-2 transition-all duration-300"
                style={{ border: '1px solid rgba(38,61,53,0.2)', color: '#263D35' }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !fetchError && gems.length === 0 && (
            <div className="text-center py-20">
              <p className="font-display text-xl font-light italic mb-6" style={{ color: 'rgba(48,51,47,0.5)' }}>
                No verified discoveries yet.
              </p>
              <p className="text-sm font-light mb-8" style={{ color: 'rgba(48,51,47,0.4)' }}>
                Be the first to share one.
              </p>
              <button
                onClick={handleAddClick}
                className="inline-flex items-center gap-2 px-8 py-3 text-sm tracking-[0.15em] uppercase transition-all duration-300"
                style={{ backgroundColor: '#263D35', color: '#F6F2E9', border: '1px solid #263D35' }}
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Submit a Hidden Gem
              </button>
            </div>
          )}

          {!loading && !fetchError && featuredGems.length > 0 && (
            <>
              {/* Featured: 1 large + 2 small */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                {/* Large featured card */}
                {featuredGems[0] && (
                  <button
                    onClick={() => { setSelectedGem(featuredGems[0] as GemDetail); setShowDetailModal(true); }}
                    className="hg-fade lg:col-span-2 relative overflow-hidden group cursor-pointer text-left block w-full"
                    style={{ borderRadius: '10px', border: '1px solid rgba(38,61,53,0.06)', boxShadow: '0 4px 20px rgba(38,61,53,0.06)', minHeight: '420px' }}
                  >
                    <img
                      src={featuredGems[0].image_url || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1600'}
                      alt={featuredGems[0].title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      style={{ filter: 'brightness(1.12) saturate(1.1) sepia(0.05)' }}
                    />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(38,61,53,0.78), rgba(38,61,53,0.1), transparent)' }} />
                    <div className="absolute inset-0 p-8 lg:p-10 flex flex-col justify-end">
                      <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(231,217,197,0.7)' }}>
                        {CATEGORY_LABELS[featuredGems[0].category] || featuredGems[0].category}
                      </p>
                      <h3 className="font-display text-3xl lg:text-4xl font-light mb-3" style={{ color: '#F6F2E9' }}>{featuredGems[0].title}</h3>
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-3 w-3" style={{ color: 'rgba(231,217,197,0.6)' }} strokeWidth={1.5} />
                        <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(246,242,233,0.6)' }}>{featuredGems[0].location}</span>
                      </div>
                      <p className="text-sm font-light max-w-md leading-relaxed line-clamp-2" style={{ color: 'rgba(246,242,233,0.75)' }}>{featuredGems[0].description}</p>
                    </div>
                  </button>
                )}

                {/* Two smaller stacked cards */}
                <div className="flex flex-col gap-8">
                  {featuredGems.slice(1, 3).map((gem) => (
                    <button
                      key={gem.id}
                      onClick={() => { setSelectedGem(gem as GemDetail); setShowDetailModal(true); }}
                      className="hg-fade relative overflow-hidden group cursor-pointer text-left block w-full"
                      style={{ borderRadius: '10px', border: '1px solid rgba(38,61,53,0.06)', boxShadow: '0 4px 16px rgba(38,61,53,0.05)', minHeight: '196px', flex: '1 1 0' }}
                    >
                      <img
                        src={gem.image_url || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={gem.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        style={{ filter: 'brightness(1.12) saturate(1.1) sepia(0.05)' }}
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(38,61,53,0.78), rgba(38,61,53,0.1), transparent)' }} />
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(231,217,197,0.7)' }}>
                          {CATEGORY_LABELS[gem.category] || gem.category}
                        </p>
                        <h3 className="font-display text-xl font-light mb-1" style={{ color: '#F6F2E9' }}>{gem.title}</h3>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3" style={{ color: 'rgba(231,217,197,0.5)' }} strokeWidth={1.5} />
                          <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(246,242,233,0.5)' }}>{gem.location}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category navigation */}
              <div className="flex flex-wrap gap-3 mb-12">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-4 py-2 text-[11px] tracking-[0.12em] uppercase font-normal transition-all duration-300"
                    style={{
                      border: activeCategory === cat ? '1px solid #263D35' : '1px solid rgba(38,61,53,0.12)',
                      backgroundColor: activeCategory === cat ? '#263D35' : 'transparent',
                      color: activeCategory === cat ? '#F6F2E9' : 'rgba(48,51,47,0.55)',
                      borderRadius: '999px',
                    }}
                  >
                    {CATEGORY_LABELS[cat] || cat}
                  </button>
                ))}
              </div>

              {/* All remaining gems — clean grid */}
              {remainingGems.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {remainingGems.map((gem) => (
                    <button
                      key={gem.id}
                      onClick={() => { setSelectedGem(gem as GemDetail); setShowDetailModal(true); }}
                      className="hg-fade relative overflow-hidden group cursor-pointer text-left block w-full"
                      style={{ borderRadius: '10px', border: '1px solid rgba(38,61,53,0.06)', boxShadow: '0 4px 16px rgba(38,61,53,0.05)', minHeight: '320px' }}
                    >
                      <img
                        src={gem.image_url || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={gem.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        style={{ filter: 'brightness(1.12) saturate(1.1) sepia(0.05)' }}
                      />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(38,61,53,0.75), rgba(38,61,53,0.05), transparent)' }} />
                      <div className="absolute inset-0 p-6 flex flex-col justify-end">
                        <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(231,217,197,0.65)' }}>
                          {CATEGORY_LABELS[gem.category] || gem.category}
                        </p>
                        <h3 className="font-display text-xl font-light mb-1" style={{ color: '#F6F2E9' }}>{gem.title}</h3>
                        <div className="flex items-center gap-1.5 mb-3">
                          <MapPin className="h-3 w-3" style={{ color: 'rgba(231,217,197,0.5)' }} strokeWidth={1.5} />
                          <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(246,242,233,0.5)' }}>{gem.location}</span>
                        </div>
                        <p className="text-xs font-light leading-relaxed line-clamp-2" style={{ color: 'rgba(246,242,233,0.7)' }}>{gem.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Community / Contribution CTA ── */}
      <section className="py-32" style={{ backgroundColor: '#263D35' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-6" style={{ color: '#F6F2E9' }}>
            Know somewhere the <em className="italic" style={{ color: '#E7D9C5' }}>map forgot?</em>
          </h2>
          <p className="text-sm font-light mb-12 max-w-md mx-auto" style={{ color: 'rgba(246,242,233,0.55)' }}>
            Share it with the community. Every hidden gem has a founder.
          </p>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-500"
            style={{
              border: '1px solid rgba(246,242,233,0.25)',
              color: '#F6F2E9',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F6F2E9'; e.currentTarget.style.color = '#263D35'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F6F2E9'; }}
          >
            Share a Hidden Gem
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </section>

      <Footer />

      <AddGemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchGems}
      />

      <GemDetailModal
        gem={selectedGem}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      <style>{`
        @keyframes descend {
          0%, 100% { transform: scaleY(1); opacity: 0.3; }
          50% { transform: scaleY(1.4); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default HiddenGemsPage;
