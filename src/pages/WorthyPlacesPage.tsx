import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin, Plus, ArrowRight, Loader, Check, Compass, X,
} from 'lucide-react';
import Footer from '../components/Footer';
import AddGemModal from '../components/AddGemModal';
import GemDetailModal, { type GemDetail } from '../components/GemDetailModal';
import { supabase } from '../shared/supabase';
import { useAuth } from '../shared/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface WorthyPlace {
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
  place_attributes: string[] | null;
  evidence_labels: string[] | null;
}

interface MapNode {
  id: string;
  label: string;
  region: string;
  fieldNote: string;
  attributes: string[];
  x: number;
  y: number;
}

const ATTRIBUTE_LABELS: Record<string, string> = {
  historical: 'Historical',
  archaeological: 'Archaeological',
  cultural: 'Cultural',
  natural: 'Natural',
  living_heritage: 'Living Heritage',
  ancestral: 'Ancestral',
  community: 'Community',
  hidden: 'Hidden',
};

const EVIDENCE_LABELS: Record<string, string> = {
  archaeologically_documented: 'Archaeologically documented',
  officially_documented: 'Officially documented',
  scholarly_interpretation: 'Scholarly interpretation',
  community_memory: 'Community memory',
  explorer_observation: 'Explorer observation',
  unverified: 'Unverified',
};

const MAP_NODES: MapNode[] = [
  { id: 'n1', label: 'Kanthalloor', region: 'Kerala', fieldNote: 'Something happened here long before the road arrived.', attributes: ['historical', 'cultural', 'hidden'], x: 28, y: 22 },
  { id: 'n2', label: 'Vagamon', region: 'Kerala', fieldNote: 'Grasslands that forget they have an edge.', attributes: ['natural', 'hidden'], x: 52, y: 38 },
  { id: 'n3', label: 'Ponmudi', region: 'Kerala', fieldNote: 'Twenty-two hairpins, then silence.', attributes: ['natural'], x: 68, y: 62 },
  { id: 'n4', label: 'Munnar', region: 'Kerala', fieldNote: 'Tea that grows where the cloud sits.', attributes: ['cultural', 'living_heritage'], x: 44, y: 30 },
  { id: 'n5', label: 'Wayanad', region: 'Kerala', fieldNote: 'Caves older than the forest above them.', attributes: ['archaeological', 'ancestral'], x: 78, y: 28 },
];

const formatFieldNoteNumber = (index: number): string => {
  return String(index + 1).padStart(3, '0');
};

const WorthyPlacesPage = () => {
  const { user } = useAuth();
  const [places, setPlaces] = useState<WorthyPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGem, setSelectedGem] = useState<GemDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<MapNode | null>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  const fetchPlaces = useCallback(async () => {
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
        setPlaces((data || []) as WorthyPlace[]);
      }
    } catch (e: any) {
      setFetchError(e.message || 'Failed to load places');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.wp-fade',
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out',
          scrollTrigger: { trigger: '.wp-fade', start: 'top 82%', toggleActions: 'play none none reverse' },
        }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [places]);

  const handleAddClick = () => {
    if (!user) {
      alert('Please sign in to add to the record.');
      return;
    }
    setShowAddModal(true);
  };

  const handleAddSuccess = () => {
    fetchPlaces();
    setJustSubmitted(true);
    setTimeout(() => setJustSubmitted(false), 6000);
  };

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  };

  const handleNodeClick = (node: MapNode) => {
    setSelectedNode(node);
  };

  const featuredPlace = places[0] || null;
  const recentPlaces = places.slice(0, 8);

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
            style={{ filter: 'brightness(1.05) saturate(1.08) contrast(1.0) sepia(0.05)' }}
          />
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(38,61,53,0.3) 0%, transparent 30%, transparent 40%, rgba(38,61,53,0.6) 100%)' }}
          />
          {/* Subtle topographic contours */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.12 }}>
            <g fill="none" stroke="#E7D9C5" strokeWidth="0.5">
              <circle cx="20%" cy="30%" r="120" className="animate-slow-drift" />
              <circle cx="20%" cy="30%" r="80" />
              <circle cx="20%" cy="30%" r="40" />
              <circle cx="70%" cy="60%" r="160" className="animate-slow-drift" style={{ animationDelay: '4s' }} />
              <circle cx="70%" cy="60%" r="100" />
              <circle cx="70%" cy="60%" r="50" />
            </g>
            <g fill="#E7D9C5">
              {MAP_NODES.map((n) => (
                <circle key={n.id} cx={`${n.x}%`} cy={`${n.y}%`} r="2" className="animate-discovery-pulse" style={{ animationDelay: `${Math.random() * 3}s` }} />
              ))}
            </g>
          </svg>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 w-full text-center">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase mb-8" style={{ color: 'rgba(246,242,233,0.85)', textShadow: '0 1px 8px rgba(38,61,53,0.3)' }}>
            Worthy Places
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light leading-[1.05] mb-8 tracking-tight" style={{ color: '#F6F2E9', textShadow: '0 2px 20px rgba(38,61,53,0.4)' }}>
            Some places are<br /><em className="italic" style={{ color: '#E7D9C5' }}>worth knowing.</em>
          </h1>
          <p className="font-display italic text-lg sm:text-xl md:text-2xl font-light mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(231,217,197,0.8)', textShadow: '0 1px 12px rgba(38,61,53,0.35)' }}>
            Beyond the usual map are places shaped by<br className="hidden sm:block" />
            history, memory, culture, nature and people.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollDown}
              className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
              style={{ backgroundColor: '#F6F2E9', color: '#263D35', border: '1px solid #F6F2E9' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.border = '1px solid rgba(246,242,233,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F6F2E9'; e.currentTarget.style.color = '#263D35'; e.currentTarget.style.border = '1px solid #F6F2E9'; }}
            >
              Explore Worthy Places
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 px-6 py-4 text-sm tracking-[0.12em] uppercase font-light transition-all duration-300"
              style={{ color: 'rgba(246,242,233,0.7)', border: '1px solid rgba(246,242,233,0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.borderColor = 'rgba(246,242,233,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(246,242,233,0.7)'; e.currentTarget.style.borderColor = 'rgba(246,242,233,0.2)'; }}
            >
              Add to the Record
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

      {/* ── 2. THE MAP (main experience) ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: '#FBF8F1' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-12 wp-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(48,51,47,0.5)' }}>The Map</p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-4" style={{ color: '#263D35' }}>
              The map tells you where.<br />Woander tells you <em className="italic" style={{ color: '#B77B65' }}>why it matters.</em>
            </h2>
            <p className="text-sm font-light max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(48,51,47,0.5)' }}>
              Each node is a place someone thought was worth knowing. Select one to begin.
            </p>
          </div>

          {/* Interactive map + side panel */}
          <div className="flex flex-col lg:flex-row gap-6 wp-fade">
            {/* Map */}
            <div
              ref={mapRef}
              className="relative w-full flex-1"
              style={{
                aspectRatio: '16 / 11',
                border: '1px solid rgba(38,61,53,0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #1a2e24 0%, #0f1a14 50%, #1e3329 100%)',
                minHeight: '360px',
              }}
            >
              {/* Topographic contour lines — dark/earthy style */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 68.75" preserveAspectRatio="none" style={{ opacity: 0.2 }}>
                <g fill="none" stroke="#B69A63" strokeWidth="0.12">
                  <path d="M 0 15 Q 25 10 50 18 T 100 15" />
                  <path d="M 0 25 Q 30 20 55 28 T 100 25" />
                  <path d="M 0 35 Q 25 30 50 38 T 100 35" />
                  <path d="M 0 45 Q 30 40 60 48 T 100 45" />
                  <path d="M 0 55 Q 25 50 50 58 T 100 55" />
                  <path d="M 10 0 Q 15 20 12 40 T 18 68.75" />
                  <path d="M 30 0 Q 35 20 28 40 T 35 68.75" />
                  <path d="M 50 0 Q 45 20 52 40 T 48 68.75" />
                  <path d="M 70 0 Q 75 20 68 40 T 75 68.75" />
                  <path d="M 85 0 Q 80 20 88 40 T 82 68.75" />
                </g>
              </svg>

              {/* Label */}
              <div className="absolute top-4 left-5">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(201,168,74,0.3)' }}>Discovery Map</p>
                <p className="font-display text-lg italic font-light" style={{ color: 'rgba(201,168,74,0.15)' }}>Kerala</p>
              </div>

              {/* Nodes */}
              {MAP_NODES.map((node) => {
                const isActive = selectedNode?.id === node.id || hoveredNode?.id === node.id;
                return (
                  <div
                    key={node.id}
                    className="absolute cursor-pointer"
                    style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => handleNodeClick(node)}
                  >
                    {/* Glow ring */}
                    <div
                      className="absolute rounded-full animate-discovery-pulse"
                      style={{
                        width: isActive ? '36px' : '24px',
                        height: isActive ? '36px' : '24px',
                        left: isActive ? '-18px' : '-12px',
                        top: isActive ? '-18px' : '-12px',
                        background: 'radial-gradient(circle, rgba(201,168,74,0.35) 0%, transparent 70%)',
                        transition: 'all 0.4s ease',
                      }}
                    />
                    {/* Node dot */}
                    <div
                      className="relative rounded-full transition-all duration-400"
                      style={{
                        width: isActive ? '10px' : '7px',
                        height: isActive ? '10px' : '7px',
                        backgroundColor: isActive ? '#E7D9C5' : '#c9a84a',
                        boxShadow: isActive ? '0 0 16px rgba(231,217,197,0.6)' : '0 0 6px rgba(201,168,74,0.4)',
                      }}
                    />
                  </div>
                );
              })}

              {/* Hover tooltip */}
              {hoveredNode && hoveredNode.id !== selectedNode?.id && (
                <div
                  className="absolute pointer-events-none transition-all duration-300"
                  style={{
                    left: `${hoveredNode.x}%`,
                    top: `${hoveredNode.y}%`,
                    transform: `translate(-50%, calc(-100% - 16px))`,
                  }}
                >
                  <div
                    className="px-4 py-3"
                    style={{
                      backgroundColor: 'rgba(10,18,10,0.95)',
                      borderRadius: '6px',
                      maxWidth: '220px',
                    }}
                  >
                    <p className="font-mono text-[8px] tracking-[0.2em] uppercase mb-1.5" style={{ color: 'rgba(201,168,74,0.6)' }}>
                      Field Note {String(MAP_NODES.indexOf(hoveredNode) + 1).padStart(3, '0')}
                    </p>
                    <p className="font-display italic text-xs font-light leading-snug" style={{ color: 'rgba(246,242,233,0.8)' }}>
                      &ldquo;{hoveredNode.fieldNote}&rdquo;
                    </p>
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 rotate-45" style={{ backgroundColor: 'rgba(10,18,10,0.95)' }} />
                </div>
              )}

              {/* Compass */}
              <div className="absolute bottom-4 right-5" style={{ opacity: 0.15 }}>
                <Compass className="w-8 h-8 animate-compass-sway" style={{ color: '#B69A63' }} strokeWidth={1} />
              </div>

              {/* Hint */}
              {!selectedNode && (
                <div className="absolute bottom-4 left-5">
                  <p className="font-mono text-[8px] tracking-[0.15em] uppercase" style={{ color: 'rgba(201,168,74,0.25)' }}>
                    Select a node to explore
                  </p>
                </div>
              )}
            </div>

            {/* Field Note side panel */}
            <div
              className="w-full lg:w-80 flex-shrink-0 flex flex-col"
              style={{
                border: '1px solid rgba(38,61,53,0.1)',
                borderRadius: '12px',
                backgroundColor: '#F6F2E9',
                minHeight: '360px',
              }}
            >
              {selectedNode ? (
                <div className="p-6 lg:p-7 flex flex-col h-full">
                  <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-4" style={{ color: 'rgba(182,154,99,0.7)' }}>
                    Field Note {String(MAP_NODES.indexOf(selectedNode) + 1).padStart(3, '0')}
                  </p>
                  <p className="font-display italic text-lg font-light leading-snug mb-5" style={{ color: '#263D35' }}>
                    &ldquo;{selectedNode.fieldNote}&rdquo;
                  </p>
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-3 w-3" style={{ color: 'rgba(48,51,47,0.4)' }} strokeWidth={1.5} />
                    <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.5)' }}>
                      {selectedNode.label} &middot; {selectedNode.region}
                    </span>
                  </div>
                  {/* Attributes */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {selectedNode.attributes.map((attr) => (
                      <span
                        key={attr}
                        className="font-mono text-[7px] tracking-[0.15em] uppercase px-2 py-1"
                        style={{ border: '1px solid rgba(38,61,53,0.12)', color: 'rgba(48,51,47,0.5)', borderRadius: '3px' }}
                      >
                        {ATTRIBUTE_LABELS[attr] || attr}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs font-light leading-relaxed mb-6" style={{ color: 'rgba(48,51,47,0.45)' }}>
                    Why is this place worth knowing?
                  </p>
                  <button
                    onClick={() => {
                      const match = places.find((p) => p.location.toLowerCase().includes(selectedNode.label.toLowerCase()));
                      if (match) {
                        setSelectedGem(match as GemDetail);
                        setShowDetailModal(true);
                      }
                    }}
                    className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.15em] uppercase transition-all duration-300 mt-auto"
                    style={{ color: '#B69A63' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#263D35'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#B69A63'; }}
                  >
                    Explore
                    <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                  </button>
                </div>
              ) : (
                <div className="p-6 lg:p-7 flex flex-col items-center justify-center h-full text-center">
                  <div
                    className="flex items-center justify-center mb-4"
                    style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      border: '1px solid rgba(38,61,53,0.1)',
                    }}
                  >
                    <Compass className="w-5 h-5" style={{ color: 'rgba(38,61,53,0.2)' }} strokeWidth={1.2} />
                  </div>
                  <p className="font-display italic text-sm font-light" style={{ color: 'rgba(48,51,47,0.3)' }}>
                    Select a node to read its field note.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FIELD NOTES (editorial, not cards) ── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: '#F6F2E9' }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="mb-16 wp-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(48,51,47,0.5)' }}>Field Notes</p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight" style={{ color: '#263D35' }}>
              Why is this place <em className="italic" style={{ color: '#B77B65' }}>worth knowing?</em>
            </h2>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-5 w-5 animate-spin" style={{ color: '#B69A63' }} />
              <span className="ml-3 font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(48,51,47,0.4)' }}>Loading field notes...</span>
            </div>
          )}

          {fetchError && !loading && (
            <div className="text-center py-20">
              <p className="text-sm font-light mb-4" style={{ color: 'rgba(48,51,47,0.5)' }}>Unable to load field notes at this time.</p>
              <button
                onClick={fetchPlaces}
                className="font-mono text-[10px] tracking-[0.2em] uppercase px-5 py-2 transition-all duration-300"
                style={{ border: '1px solid rgba(38,61,53,0.2)', color: '#263D35' }}
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !fetchError && places.length === 0 && (
            <div className="text-center py-20">
              <p className="font-display text-xl font-light italic mb-3" style={{ color: 'rgba(48,51,47,0.5)' }}>
                The record is waiting for its first entry.
              </p>
              <p className="text-sm font-light mb-8" style={{ color: 'rgba(48,51,47,0.4)' }}>
                What does your map know that ours doesn&rsquo;t?
              </p>
              <button
                onClick={handleAddClick}
                className="inline-flex items-center gap-2 px-8 py-3 text-sm tracking-[0.15em] uppercase transition-all duration-300"
                style={{ backgroundColor: '#263D35', color: '#F6F2E9', border: '1px solid #263D35' }}
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Add to the Record
              </button>
            </div>
          )}

          {!loading && !fetchError && recentPlaces.length > 0 && (
            <div className="space-y-16 lg:space-y-24">
              {recentPlaces.map((place, index) => {
                const isEven = index % 2 === 0;
                const fnNum = formatFieldNoteNumber(index);
                const attributes = (place.place_attributes || []) as string[];
                const evidence = (place.evidence_labels || []) as string[];

                return (
                  <button
                    key={place.id}
                    onClick={() => { setSelectedGem(place as GemDetail); setShowDetailModal(true); }}
                    className="wp-fade w-full text-left group block"
                  >
                    <div className={`flex flex-col ${isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 lg:gap-12 items-center`}>
                      {/* Image */}
                      <div
                        className="relative overflow-hidden flex-shrink-0 w-full lg:w-1/2"
                        style={{ aspectRatio: '4/3', borderRadius: '10px', border: '1px solid rgba(38,61,53,0.06)' }}
                      >
                        <img
                          src={place.image_url || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1200'}
                          alt={place.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms]"
                          style={{ filter: 'brightness(1.08) saturate(1.08) sepia(0.05)' }}
                        />
                        <div className="absolute top-4 left-4">
                          <span
                            className="font-mono text-[8px] tracking-[0.2em] uppercase px-2 py-1"
                            style={{ backgroundColor: 'rgba(38,61,53,0.7)', color: 'rgba(201,168,74,0.8)', borderRadius: '3px' }}
                          >
                            FN {fnNum}
                          </span>
                        </div>
                      </div>

                      {/* Text */}
                      <div className="flex-1">
                        <p className="font-mono text-[9px] tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(182,154,99,0.6)' }}>
                          Field Note {fnNum}
                        </p>
                        <h3 className="font-display text-2xl lg:text-3xl font-light mb-3 leading-tight" style={{ color: '#263D35' }}>
                          {place.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-4">
                          <MapPin className="h-3 w-3" style={{ color: 'rgba(48,51,47,0.35)' }} strokeWidth={1.5} />
                          <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>{place.location}</span>
                        </div>

                        {/* Attributes */}
                        {attributes.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {attributes.map((attr) => (
                              <span
                                key={attr}
                                className="font-mono text-[7px] tracking-[0.15em] uppercase px-2 py-1"
                                style={{ border: '1px solid rgba(38,61,53,0.1)', color: 'rgba(48,51,47,0.5)', borderRadius: '3px' }}
                              >
                                {ATTRIBUTE_LABELS[attr] || attr}
                              </span>
                            ))}
                          </div>
                        )}

                        <p className="text-sm font-light leading-relaxed mb-5 line-clamp-3" style={{ color: 'rgba(48,51,47,0.55)' }}>
                          {place.description}
                        </p>

                        {/* Evidence (only if data exists) */}
                        {evidence.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {evidence.map((ev) => (
                              <span
                                key={ev}
                                className="font-mono text-[7px] tracking-[0.1em] uppercase px-2 py-0.5"
                                style={{ border: '1px solid rgba(182,154,99,0.2)', color: 'rgba(182,154,99,0.6)', borderRadius: '2px' }}
                              >
                                {EVIDENCE_LABELS[ev] || ev}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[9px] tracking-[0.15em] uppercase transition-colors duration-300" style={{ color: '#B69A63' }}>
                            Explore
                          </span>
                          <ArrowRight className="h-3 w-3 transition-all duration-300 group-hover:translate-x-1" style={{ color: '#B69A63' }} strokeWidth={1.5} />
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── 4. CONTRIBUTION ── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: '#263D35' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <div className="wp-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(201,168,74,0.4)' }}>Contribution</p>
            <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-6" style={{ color: '#F6F2E9' }}>
              Know something about this place<br />that the map doesn&rsquo;t <em className="italic" style={{ color: '#E7D9C5' }}>yet know?</em>
            </h2>

            {/* Contribution types */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {['Photo', 'Story', 'Historical reference', 'Local memory', 'Document', 'Correction', 'Related place'].map((type) => (
                <span
                  key={type}
                  className="font-mono text-[8px] tracking-[0.12em] uppercase px-3 py-1.5"
                  style={{ border: '1px solid rgba(201,168,74,0.12)', color: 'rgba(231,217,197,0.4)', borderRadius: '4px' }}
                >
                  {type}
                </span>
              ))}
            </div>

            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
              style={{ border: '1px solid rgba(246,242,233,0.25)', color: '#F6F2E9', backgroundColor: 'transparent' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F6F2E9'; e.currentTarget.style.color = '#263D35'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F6F2E9'; }}
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Add to the Record
            </button>
          </div>
        </div>
      </section>

      {/* ── 5. SUCCESS STATE ── */}
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
            <h2 className="font-display text-3xl md:text-4xl font-light mb-4" style={{ color: '#F6F2E9' }}>
              You added a piece<br />to the <em className="italic" style={{ color: '#E7D9C5' }}>record.</em>
            </h2>
            <p className="text-xs font-light mt-4" style={{ color: 'rgba(246,242,233,0.35)' }}>
              Your contribution will appear once reviewed.
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

      {/* ── 6. CLOSING ── */}
      <section className="py-32 lg:py-40" style={{ backgroundColor: '#FBF8F1' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="wp-fade">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-8" style={{ color: 'rgba(48,51,47,0.4)' }}>The Record</p>
            <h2 className="font-display text-4xl md:text-6xl font-light leading-tight mb-6" style={{ color: '#263D35' }}>
              There are still places<br />the map doesn&rsquo;t <em className="italic" style={{ color: '#B77B65' }}>understand.</em>
            </h2>
            <p className="font-display italic text-xl md:text-2xl font-light mb-12" style={{ color: 'rgba(48,51,47,0.4)' }}>
              What does your map know?
            </p>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
              style={{ backgroundColor: '#263D35', color: '#F6F2E9', border: '1px solid #263D35' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#263D35'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#263D35'; e.currentTarget.style.color = '#F6F2E9'; }}
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Add to the Record
            </button>

            {/* Mini discovery graph */}
            <div className="relative w-full mt-16" style={{ height: '120px' }}>
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

export default WorthyPlacesPage;
