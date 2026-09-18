import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Plus, ArrowRight, Loader, X, Check, Compass,
  Footprints, Eye, ShieldCheck, Map as MapIcon, Sparkles,
} from 'lucide-react';
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
  submitted_by: string | null;
}

interface MapNode {
  id: string;
  label: string;
  region: string;
  fieldNote: string;
  x: number;
  y: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  cafe: 'Food',
  viewpoint: 'Nature',
  waterfall: 'Waterfalls',
  trail: 'Adventure',
  beach: 'Coast',
  other: 'Quiet Places',
};

const KERALA_NODES: MapNode[] = [
  { id: 'n1', label: 'Kanthalloor', region: 'Kerala', fieldNote: 'The road ends here. The old trail doesn\u2019t.', x: 28, y: 22 },
  { id: 'n2', label: 'Vagamon', region: 'Kerala', fieldNote: 'Grasslands that forget they have an edge.', x: 52, y: 38 },
  { id: 'n3', label: 'Ponmudi', region: 'Kerala', fieldNote: 'Twenty-two hairpins, then silence.', x: 68, y: 62 },
  { id: 'n4', label: 'Munnar', region: 'Kerala', fieldNote: 'Tea that grows where the cloud sits.', x: 44, y: 30 },
  { id: 'n5', label: 'Kattappana', region: 'Kerala', fieldNote: 'A waterfall you can hear before you can see.', x: 36, y: 48 },
  { id: 'n6', label: 'Kuttanad', region: 'Kerala', fieldNote: 'Rice that grows below sea level.', x: 24, y: 72 },
  { id: 'n7', label: 'Wayanad', region: 'Kerala', fieldNote: 'Caves older than the forest above them.', x: 78, y: 28 },
];

const LINEAGE_STEPS = [
  { label: 'Found', icon: Eye, desc: 'Someone noticed it first.' },
  { label: 'Shared', icon: Plus, desc: 'A field note left for others.' },
  { label: 'Verified', icon: ShieldCheck, desc: 'A second explorer confirmed it.' },
  { label: 'Mapped', icon: MapIcon, desc: 'It joins the discovery graph.' },
  { label: 'Experienced', icon: Footprints, desc: 'Someone walked it for themselves.' },
  { label: 'Connected', icon: Compass, desc: 'A guide, a local, a story.' },
];

const FOUNDER_STATS = [
  { value: '12', label: 'Gems discovered' },
  { value: '4', label: 'Verified by others' },
  { value: '237', label: 'People who walked them' },
];

const formatFieldNoteNumber = (index: number): string => {
  return String(index + 1).padStart(3, '0');
};

const HiddenGemsPage = () => {
  const { user } = useAuth();
  const [gems, setGems] = useState<HiddenGem[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGem, setSelectedGem] = useState<GemDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const fetchGems = useCallback(async () => {
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
        setGems((data || []) as HiddenGem[]);
      }
    } catch (e: any) {
      setFetchError(e.message || 'Failed to load gems');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGems();
  }, [fetchGems]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.hg-fade',
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.hg-fade', start: 'top 82%', toggleActions: 'play none none reverse' },
        }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [gems]);

  const handleAddClick = () => {
    if (!user) {
      alert('Please sign in to leave a field note.');
      return;
    }
    setShowAddModal(true);
  };

  const handleAddSuccess = () => {
    fetchGems();
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 6000);
  };

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  };

  const featuredGem = gems[0] || null;
  const recentGems = gems.slice(0, 12);

  return (
    <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: '#F6F2E9' }}>

      {/* ── 1. HERO ── */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{ minHeight: '88vh', paddingTop: '6rem' }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/14844302/pexels-photo-14844302.jpeg?auto=compress&cs=tinysrgb&w=2400"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(1.1) saturate(1.12) contrast(1.0) sepia(0.05)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(38,61,53,0.25) 0%, transparent 30%, transparent 45%, rgba(38,61,53,0.55) 100%)' }}
          />
          {/* Animated map contours */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.18 }}>
            <g fill="none" stroke="#E7D9C5" strokeWidth="0.5">
              <circle cx="20%" cy="30%" r="120" className="animate-slow-drift" />
              <circle cx="20%" cy="30%" r="80" />
              <circle cx="20%" cy="30%" r="40" />
              <circle cx="70%" cy="60%" r="160" className="animate-slow-drift" style={{ animationDelay: '4s' }} />
              <circle cx="70%" cy="60%" r="100" />
              <circle cx="70%" cy="60%" r="50" />
              <circle cx="50%" cy="45%" r="60" className="animate-slow-drift" style={{ animationDelay: '8s' }} />
            </g>
            <g fill="#E7D9C5">
              {KERALA_NODES.map((n) => (
                <circle key={n.id} cx={`${n.x}%`} cy={`${n.y}%`} r="2" className="animate-discovery-pulse" style={{ animationDelay: `${Math.random() * 3}s` }} />
              ))}
            </g>
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 w-full text-center">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase mb-8" style={{ color: 'rgba(246,242,233,0.85)', textShadow: '0 1px 8px rgba(38,61,53,0.3)' }}>
            Beyond the Known Map
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light leading-[1.05] mb-8 tracking-tight" style={{ color: '#F6F2E9', textShadow: '0 2px 20px rgba(38,61,53,0.4)' }}>
            There are places<br />your map <em className="italic" style={{ color: '#E7D9C5' }}>doesn&rsquo;t know.</em>
          </h1>
          <p className="font-display italic text-lg sm:text-xl md:text-2xl font-light mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(231,217,197,0.85)', textShadow: '0 1px 12px rgba(38,61,53,0.35)' }}>
            Quiet waterfalls. Forgotten trails. Village kitchens.<br className="hidden sm:block" />
            Stories carried by people, not algorithms.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollDown}
              className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
              style={{ backgroundColor: '#F6F2E9', color: '#263D35', border: '1px solid #F6F2E9' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.border = '1px solid rgba(246,242,233,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F6F2E9'; e.currentTarget.style.color = '#263D35'; e.currentTarget.style.border = '1px solid #F6F2E9'; }}
            >
              Explore the Unknown
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-6 py-4 text-sm tracking-[0.12em] uppercase font-light transition-all duration-300"
              style={{ color: 'rgba(246,242,233,0.7)', border: '1px solid rgba(246,242,233,0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.borderColor = 'rgba(246,242,233,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(246,242,233,0.7)'; e.currentTarget.style.borderColor = 'rgba(246,242,233,0.2)'; }}
            >
              Know somewhere the map forgot?
            </button>
          </div>
        </div>

        <button
          onClick={scrollDown}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3"
          style={{ color: 'rgba(246,242,233,0.4)' }}
          aria-label="Scroll to explore"
        >
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase">Scroll to explore</span>
          <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, rgba(246,242,233,0.35), transparent)', animation: 'descend 2.5s ease-in-out infinite' }} />
        </button>
      </section>

      {/* ── 2. THE MAP ── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: '#FBF8F1' }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-16 hg-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(48,51,47,0.5)' }}>The Map</p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-4" style={{ color: '#263D35' }}>
              The map isn&rsquo;t wrong.<br />It&rsquo;s <em className="italic" style={{ color: '#B77B65' }}>incomplete.</em>
            </h2>
            <p className="text-sm font-light max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(48,51,47,0.5)' }}>
              Each glowing node is a field note left by someone who went looking. Hover to read it.
            </p>
          </div>

          {/* Interactive map */}
          <div
            className="relative w-full hg-fade"
            style={{
              aspectRatio: '16 / 10',
              border: '1px solid rgba(38,61,53,0.1)',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f0ebe0 0%, #e8e2d4 50%, #f2ede2 100%)',
            }}
          >
            {/* Topographic contour lines */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 62.5" preserveAspectRatio="none" style={{ opacity: 0.25 }}>
              <g fill="none" stroke="#B69A63" strokeWidth="0.15">
                <path d="M 0 15 Q 25 10 50 18 T 100 15" />
                <path d="M 0 25 Q 30 20 55 28 T 100 25" />
                <path d="M 0 35 Q 25 30 50 38 T 100 35" />
                <path d="M 0 45 Q 30 40 60 48 T 100 45" />
                <path d="M 0 55 Q 25 50 50 58 T 100 55" />
                <path d="M 10 0 Q 15 20 12 40 T 18 62.5" />
                <path d="M 30 0 Q 35 20 28 40 T 35 62.5" />
                <path d="M 50 0 Q 45 20 52 40 T 48 62.5" />
                <path d="M 70 0 Q 75 20 68 40 T 75 62.5" />
                <path d="M 85 0 Q 80 20 88 40 T 82 62.5" />
              </g>
            </svg>

            {/* Kerala label */}
            <div className="absolute top-4 left-5">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(38,61,53,0.3)' }}>Kerala</p>
              <p className="font-display text-lg italic font-light" style={{ color: 'rgba(38,61,53,0.2)' }}>Discovery Map</p>
            </div>

            {/* Nodes */}
            {KERALA_NODES.map((node) => (
              <div
                key={node.id}
                className="absolute group"
                style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Glow ring */}
                <div
                  className="absolute rounded-full animate-discovery-pulse"
                  style={{
                    width: '24px', height: '24px', left: '-12px', top: '-12px',
                    background: 'radial-gradient(circle, rgba(201,168,74,0.3) 0%, transparent 70%)',
                  }}
                />
                {/* Node dot */}
                <div
                  className="relative rounded-full transition-all duration-300 cursor-pointer"
                  style={{
                    width: '8px', height: '8px',
                    backgroundColor: hoveredNode?.id === node.id ? '#B69A63' : '#c9a84a',
                    boxShadow: hoveredNode?.id === node.id ? '0 0 12px rgba(201,168,74,0.6)' : '0 0 6px rgba(201,168,74,0.4)',
                    transform: hoveredNode?.id === node.id ? 'scale(1.5)' : 'scale(1)',
                  }}
                />
              </div>
            ))}

            {/* Hover field note */}
            {hoveredNode && (
              <div
                className="absolute pointer-events-none transition-all duration-300"
                style={{
                  left: `${hoveredNode.x}%`,
                  top: `${hoveredNode.y}%`,
                  transform: `translate(-50%, calc(-100% - 20px))`,
                }}
              >
                <div
                  className="px-5 py-4"
                  style={{
                    backgroundColor: 'rgba(38,61,53,0.95)',
                    borderRadius: '8px',
                    maxWidth: '260px',
                    boxShadow: '0 8px 24px rgba(38,61,53,0.2)',
                  }}
                >
                  <p className="font-mono text-[8px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(201,168,74,0.7)' }}>
                    Field Note {String(KERALA_NODES.indexOf(hoveredNode) + 1).padStart(3, '0')}
                  </p>
                  <p className="font-display italic text-sm font-light leading-snug mb-3" style={{ color: '#F6F2E9' }}>
                    &ldquo;{hoveredNode.fieldNote}&rdquo;
                  </p>
                  <p className="font-mono text-[8px] tracking-[0.15em] uppercase" style={{ color: 'rgba(231,217,197,0.6)' }}>
                    {hoveredNode.label} &middot; {hoveredNode.region}
                  </p>
                </div>
                {/* Arrow */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45"
                  style={{ backgroundColor: 'rgba(38,61,53,0.95)' }}
                />
              </div>
            )}

            {/* Compass */}
            <div className="absolute bottom-4 right-5" style={{ opacity: 0.2 }}>
              <Compass className="w-8 h-8 animate-compass-sway" style={{ color: '#263D35' }} strokeWidth={1} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FEATURED DISCOVERY ── */}
      {featuredGem && (
        <section className="py-24 lg:py-32" style={{ backgroundColor: '#F6F2E9' }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="mb-12 hg-fade">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(48,51,47,0.5)' }}>Featured Discovery</p>
            </div>
            <button
              onClick={() => { setSelectedGem(featuredGem as GemDetail); setShowDetailModal(true); }}
              className="hg-fade relative w-full overflow-hidden group cursor-pointer text-left block"
              style={{ borderRadius: '12px', border: '1px solid rgba(38,61,53,0.08)', boxShadow: '0 8px 32px rgba(38,61,53,0.08)', minHeight: '480px' }}
            >
              <img
                src={featuredGem.image_url || 'https://images.pexels.com/photos/35463580/pexels-photo-35463580.jpeg?auto=compress&cs=tinysrgb&w=1600'}
                alt={featuredGem.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms]"
                style={{ filter: 'brightness(1.1) saturate(1.1) sepia(0.05)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(38,61,53,0.82) 0%, rgba(38,61,53,0.5) 50%, transparent 100%)' }} />
              <div className="absolute inset-0 p-8 lg:p-14 flex flex-col justify-center max-w-xl">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(201,168,74,0.7)' }}>
                  Field Note 001
                </p>
                <h3 className="font-display text-3xl lg:text-5xl font-light mb-4 leading-tight" style={{ color: '#F6F2E9' }}>
                  {featuredGem.title}
                </h3>
                <div className="flex items-center gap-2 mb-5">
                  <MapPin className="h-3.5 w-3.5" style={{ color: 'rgba(231,217,197,0.6)' }} strokeWidth={1.5} />
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(246,242,233,0.6)' }}>{featuredGem.location}</span>
                </div>
                <p className="text-sm lg:text-base font-light leading-relaxed mb-6 line-clamp-3" style={{ color: 'rgba(246,242,233,0.75)' }}>
                  {featuredGem.description}
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[8px] tracking-[0.2em] uppercase" style={{ color: 'rgba(231,217,197,0.5)' }}>Discovered by</span>
                  <span className="font-display italic text-sm" style={{ color: 'rgba(231,217,197,0.8)' }}>
                    {featuredGem.submitted_by ? 'A fellow explorer' : 'Community'}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* ── 4. DISCOVERY LINEAGE ── */}
      <section className="py-24 lg:py-28" style={{ backgroundColor: '#FBF8F1' }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-16 hg-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(48,51,47,0.5)' }}>Discovery Lineage</p>
            <h2 className="font-display text-3xl md:text-4xl font-light leading-tight" style={{ color: '#263D35' }}>
              How a moment becomes <em className="italic" style={{ color: '#B77B65' }}>a map.</em>
            </h2>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch gap-2 lg:gap-0">
            {LINEAGE_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.label}>
                  <div
                    className="hg-fade flex flex-col items-center text-center px-4 py-6 flex-1"
                    style={{ minWidth: '140px' }}
                  >
                    <div
                      className="flex items-center justify-center mb-4 transition-transform duration-300"
                      style={{
                        width: '48px', height: '48px', borderRadius: '50%',
                        border: '1px solid rgba(38,61,53,0.15)',
                        backgroundColor: i === 0 ? 'rgba(201,168,74,0.08)' : 'transparent',
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: i === 0 ? '#B69A63' : 'rgba(38,61,53,0.4)' }} strokeWidth={1.2} />
                    </div>
                    <p className="font-mono text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: '#263D35' }}>
                      {step.label}
                    </p>
                    <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(48,51,47,0.45)' }}>
                      {step.desc}
                    </p>
                  </div>
                  {i < LINEAGE_STEPS.length - 1 && (
                    <div className="hidden lg:flex items-center justify-center" style={{ minWidth: '24px' }}>
                      <div className="w-6 h-px" style={{ backgroundColor: 'rgba(38,61,53,0.1)' }} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. RECENT DISCOVERIES ── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: '#F6F2E9' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-16 hg-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(48,51,47,0.5)' }}>Recent Discoveries</p>
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
              <p className="font-display text-xl font-light italic mb-3" style={{ color: 'rgba(48,51,47,0.5)' }}>
                No verified discoveries yet.
              </p>
              <p className="text-sm font-light mb-8" style={{ color: 'rgba(48,51,47,0.4)' }}>
                The map is waiting for its first field note.
              </p>
              <button
                onClick={handleAddClick}
                className="inline-flex items-center gap-2 px-8 py-3 text-sm tracking-[0.15em] uppercase transition-all duration-300"
                style={{ backgroundColor: '#263D35', color: '#F6F2E9', border: '1px solid #263D35' }}
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Leave a Field Note
              </button>
            </div>
          )}

          {!loading && !fetchError && recentGems.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recentGems.map((gem, index) => (
                <button
                  key={gem.id}
                  onClick={() => { setSelectedGem(gem as GemDetail); setShowDetailModal(true); }}
                  className="hg-fade relative overflow-hidden group cursor-pointer text-left block w-full"
                  style={{ borderRadius: '10px', border: '1px solid rgba(38,61,53,0.06)', boxShadow: '0 4px 16px rgba(38,61,53,0.05)', minHeight: '340px' }}
                >
                  <img
                    src={gem.image_url || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={gem.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    style={{ filter: 'brightness(1.1) saturate(1.1) sepia(0.05)' }}
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(38,61,53,0.82), rgba(38,61,53,0.1), transparent)' }} />
                  <div className="absolute top-4 left-4">
                    <span
                      className="font-mono text-[8px] tracking-[0.2em] uppercase px-2 py-1"
                      style={{ backgroundColor: 'rgba(38,61,53,0.6)', color: 'rgba(201,168,74,0.8)', borderRadius: '3px' }}
                    >
                      FN {formatFieldNoteNumber(index)}
                    </span>
                  </div>
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <p className="font-mono text-[8px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(231,217,197,0.6)' }}>
                      {CATEGORY_LABELS[gem.category] || gem.category}
                    </p>
                    <h3 className="font-display text-xl font-light mb-1.5 leading-tight" style={{ color: '#F6F2E9' }}>{gem.title}</h3>
                    <div className="flex items-center gap-1.5 mb-3">
                      <MapPin className="h-3 w-3" style={{ color: 'rgba(231,217,197,0.5)' }} strokeWidth={1.5} />
                      <span className="font-mono text-[8px] tracking-[0.15em] uppercase" style={{ color: 'rgba(246,242,233,0.5)' }}>{gem.location}</span>
                    </div>
                    <p className="text-xs font-light leading-relaxed line-clamp-2 mb-3" style={{ color: 'rgba(246,242,233,0.7)' }}>{gem.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[8px] tracking-[0.1em] uppercase" style={{ color: 'rgba(231,217,197,0.4)' }}>
                        {gem.submitted_by ? 'Discovered by a fellow explorer' : 'Community'}
                      </span>
                      <span
                        className="font-mono text-[7px] tracking-[0.15em] uppercase px-1.5 py-0.5"
                        style={{
                          border: '1px solid',
                          borderColor: gem.verification_status === 'featured' ? 'rgba(201,168,74,0.3)' : 'rgba(231,217,197,0.2)',
                          color: gem.verification_status === 'featured' ? 'rgba(201,168,74,0.7)' : 'rgba(231,217,197,0.5)',
                          borderRadius: '2px',
                        }}
                      >
                        {gem.verification_status}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 6. HUMAN LAYER ── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: '#1a2e24' }}>
        <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-16 hg-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(201,168,74,0.5)' }}>The Human Layer</p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-4" style={{ color: '#F6F2E9' }}>
              Someone had to <em className="italic" style={{ color: '#E7D9C5' }}>notice it.</em>
            </h2>
            <p className="text-sm font-light max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(246,242,233,0.5)' }}>
              Every hidden gem has a founder. Not a rank &mdash; a person who walked there first and came back to tell the story.
            </p>
          </div>

          {/* Founder profile */}
          <div
            className="hg-fade flex flex-col sm:flex-row items-center gap-8 p-8 lg:p-10"
            style={{ border: '1px solid rgba(201,168,74,0.12)', borderRadius: '12px', backgroundColor: 'rgba(6,13,6,0.3)' }}
          >
            {/* Avatar */}
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: '96px', height: '96px', borderRadius: '50%',
                border: '1px solid rgba(201,168,74,0.2)',
                background: 'linear-gradient(135deg, rgba(201,168,74,0.08), rgba(38,61,53,0.4))',
              }}
            >
              <Footprints className="w-8 h-8" style={{ color: 'rgba(201,168,74,0.5)' }} strokeWidth={1.2} />
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(201,168,74,0.5)' }}>Gem Founder</p>
              <h3 className="font-display text-2xl font-light mb-1" style={{ color: '#F6F2E9' }}>Ananya R.</h3>
              <p className="font-display italic text-sm font-light mb-6" style={{ color: 'rgba(231,217,197,0.5)' }}>
                &ldquo;I just walked the path my grandmother talked about.&rdquo;
              </p>

              <div className="flex flex-wrap gap-8 justify-center sm:justify-start">
                {FOUNDER_STATS.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-2xl font-light mb-1" style={{ color: '#E7D9C5' }}>{stat.value}</p>
                    <p className="font-mono text-[8px] tracking-[0.15em] uppercase" style={{ color: 'rgba(246,242,233,0.4)' }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. DISCOVERY CREATES OPPORTUNITY ── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: '#FBF8F1' }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-16 hg-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(48,51,47,0.5)' }}>Discovery &amp; Opportunity</p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-4" style={{ color: '#263D35' }}>
              Discovery creates <em className="italic" style={{ color: '#B77B65' }}>opportunity.</em>
            </h2>
            <p className="text-sm font-light max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(48,51,47,0.5)' }}>
              A found place can become a livelihood &mdash; if we preserve the character of what made it worth finding in the first place.
            </p>
          </div>

          {/* Flow */}
          <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-0">
            {[
              { label: 'Explorer', desc: 'Goes looking' },
              { label: 'Local Knowledge', desc: 'Lives there' },
              { label: 'Guide', desc: 'Knows the way' },
              { label: 'Experience', desc: 'Walks it together' },
              { label: 'Community', desc: 'Keeps it alive' },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                <div
                  className="hg-fade flex-1 flex flex-col items-center text-center px-3 py-6"
                  style={{ minWidth: '120px' }}
                >
                  <div
                    className="flex items-center justify-center mb-3"
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      border: '1px solid rgba(38,61,53,0.12)',
                      backgroundColor: i === 0 ? 'rgba(201,168,74,0.06)' : 'transparent',
                    }}
                  >
                    <span className="font-mono text-[10px]" style={{ color: i === 0 ? '#B69A63' : 'rgba(38,61,53,0.35)' }}>{i + 1}</span>
                  </div>
                  <p className="font-display text-base font-light mb-1" style={{ color: '#263D35' }}>{item.label}</p>
                  <p className="text-xs font-light" style={{ color: 'rgba(48,51,47,0.4)' }}>{item.desc}</p>
                </div>
                {i < 4 && (
                  <div className="hidden lg:flex items-center justify-center" style={{ minWidth: '20px' }}>
                    <ArrowRight className="w-3 h-3" style={{ color: 'rgba(38,61,53,0.15)' }} strokeWidth={1.5} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. PROTECT THE UNKNOWN ── */}
      <section className="py-32 lg:py-40" style={{ backgroundColor: '#263D35' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <div className="hg-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-8" style={{ color: 'rgba(201,168,74,0.4)' }}>Protect the Unknown</p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-8" style={{ color: '#F6F2E9' }}>
              Not everything needs to <em className="italic" style={{ color: '#E7D9C5' }}>become famous.</em>
            </h2>
            <div className="py-6 mb-8" style={{ borderTop: '1px solid rgba(201,168,74,0.1)', borderBottom: '1px solid rgba(201,168,74,0.1)' }}>
              <p className="font-mono text-sm tracking-[0.3em] uppercase" style={{ color: 'rgba(201,168,74,0.6)' }}>
                Discovery &ne; Exposure
              </p>
            </div>
            <p className="text-sm font-light leading-relaxed max-w-md mx-auto" style={{ color: 'rgba(246,242,233,0.45)' }}>
              We share places so they can be cared for, not so they can be consumed. The map is a responsibility.
            </p>
          </div>
        </div>
      </section>

      {/* ── 9. CONTRIBUTION ── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: '#F6F2E9' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <div className="hg-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(48,51,47,0.5)' }}>Contribution</p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-6" style={{ color: '#263D35' }}>
              Somewhere, someone <em className="italic" style={{ color: '#B77B65' }}>knows something.</em>
            </h2>
            <p className="font-display italic text-lg md:text-xl font-light mb-12" style={{ color: 'rgba(48,51,47,0.45)' }}>
              What does your map not know?
            </p>

            {/* Contribution flow preview */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
              {[
                { q: 'Where did you find it?', icon: MapPin },
                { q: 'What did you find?', icon: Eye },
                { q: 'Why should someone know?', icon: Sparkles },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <React.Fragment key={i}>
                    <div
                      className="flex items-center gap-2 px-5 py-3"
                      style={{ border: '1px solid rgba(38,61,53,0.1)', borderRadius: '8px', backgroundColor: '#FBF8F1' }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: '#B69A63' }} strokeWidth={1.5} />
                      <span className="font-mono text-[9px] tracking-[0.12em] uppercase" style={{ color: 'rgba(48,51,47,0.6)' }}>{item.q}</span>
                    </div>
                    {i < 2 && (
                      <ArrowRight className="w-3 h-3 hidden sm:block" style={{ color: 'rgba(38,61,53,0.2)' }} strokeWidth={1.5} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
              style={{ backgroundColor: '#263D35', color: '#F6F2E9', border: '1px solid #263D35' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#263D35'; e.currentTarget.style.border = '1px solid #263D35'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#263D35'; e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.border = '1px solid #263D35'; }}
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Leave a Field Note
            </button>
          </div>
        </div>
      </section>

      {/* ── 10. SUCCESS STATE ── */}
      {justSubmitted && (
        <section
          className="fixed inset-0 z-40 flex items-center justify-center px-6"
          style={{ backgroundColor: 'rgba(38,61,53,0.92)', backdropFilter: 'blur(8px)' }}
        >
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-6">
              <div
                className="flex items-center justify-center animate-discovery-pulse"
                style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  border: '1px solid rgba(201,168,74,0.3)',
                  background: 'radial-gradient(circle, rgba(201,168,74,0.15) 0%, transparent 70%)',
                }}
              >
                <Check className="w-7 h-7" style={{ color: '#c9a84a' }} strokeWidth={1.5} />
              </div>
            </div>
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(201,168,74,0.6)' }}>
              Field Note #084
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-light mb-4" style={{ color: '#F6F2E9' }}>
              You just added a piece<br />to the <em className="italic" style={{ color: '#E7D9C5' }}>map.</em>
            </h2>
            <p className="font-display italic text-sm font-light mb-2" style={{ color: 'rgba(246,242,233,0.5)' }}>
              Founded by you.
            </p>
            <p className="text-xs font-light" style={{ color: 'rgba(246,242,233,0.35)' }}>
              Your discovery will appear once verified by a fellow explorer.
            </p>
            <button
              onClick={() => setJustSubmitted(false)}
              className="mt-8 font-mono text-[10px] tracking-[0.2em] uppercase px-6 py-2 transition-all duration-300"
              style={{ border: '1px solid rgba(246,242,233,0.2)', color: 'rgba(246,242,233,0.6)' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(246,242,233,0.4)'; e.currentTarget.style.color = '#F6F2E9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(246,242,233,0.2)'; e.currentTarget.style.color = 'rgba(246,242,233,0.6)'; }}
            >
              Continue exploring
            </button>
          </div>
        </section>
      )}

      {/* ── 11. FINAL ── */}
      <section className="py-32 lg:py-40" style={{ backgroundColor: '#FBF8F1' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="hg-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-8" style={{ color: 'rgba(48,51,47,0.4)' }}>The Map</p>
            <h2 className="font-display text-4xl md:text-6xl font-light leading-tight mb-6" style={{ color: '#263D35' }}>
              The map is <em className="italic" style={{ color: '#B77B65' }}>never finished.</em>
            </h2>
            <p className="font-display italic text-xl md:text-2xl font-light mb-16" style={{ color: 'rgba(48,51,47,0.4)' }}>
              Go looking.
            </p>

            {/* Mini discovery graph */}
            <div className="relative w-full" style={{ height: '120px' }}>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet">
                <g fill="none" stroke="rgba(38,61,53,0.08)" strokeWidth="0.5">
                  <line x1="40" y1="60" x2="120" y2="30" />
                  <line x1="40" y1="60" x2="120" y2="90" />
                  <line x1="120" y1="30" x2="200" y2="50" />
                  <line x1="120" y1="90" x2="200" y2="50" />
                  <line x1="200" y1="50" x2="260" y2="40" />
                  <line x1="200" y1="50" x2="260" y2="80" />
                </g>
                <g fill="#c9a84a">
                  <circle cx="40" cy="60" r="3" className="animate-discovery-pulse" />
                  <circle cx="120" cy="30" r="3" className="animate-discovery-pulse" style={{ animationDelay: '0.5s' }} />
                  <circle cx="120" cy="90" r="3" className="animate-discovery-pulse" style={{ animationDelay: '1s' }} />
                  <circle cx="200" cy="50" r="3" className="animate-discovery-pulse" style={{ animationDelay: '1.5s' }} />
                  <circle cx="260" cy="40" r="3" className="animate-discovery-pulse" style={{ animationDelay: '2s' }} />
                  <circle cx="260" cy="80" r="3" className="animate-discovery-pulse" style={{ animationDelay: '2.5s' }} />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <AddGemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
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
