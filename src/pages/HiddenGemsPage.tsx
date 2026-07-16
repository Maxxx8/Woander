import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plus, Eye, ChevronRight } from 'lucide-react';
import Footer from '../components/Footer';
import AddGemModal from '../components/AddGemModal';
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
  latitude: number | null;
  longitude: number | null;
  category: string;
  difficulty_level: string;
  image_url: string | null;
  additional_images: string[] | null;
  best_time_to_visit: string | null;
  tips: string | null;
  total_votes: number;
  total_visits: number;
  verification_status: string;
  created_at: string;
}



const FIELD_NOTES = [
  {
    id: '041',
    text: 'Reached before sunrise. No signs. Only the sound of water.',
    author: 'Pathfinder 012',
    location: 'Nelliyampathy',
    coord: '10.8505° N',
  },
  {
    id: '087',
    text: "The trail ends at a boulder. Behind it: a clearing no map shows. I didn't tell anyone.",
    author: 'Vanguard 004',
    location: 'Wayanad Ridge',
    coord: '11.6854° N',
  },
  {
    id: '103',
    text: 'Three hours from the nearest road. The village elder knew the way. He asked if we were lost. We said yes.',
    author: 'Pathfinder 031',
    location: 'Idukki Arc',
    coord: '9.9312° N',
  },
  {
    id: '129',
    text: 'Monsoon season. No one comes here then. That is precisely why we went.',
    author: 'Cartographer 002',
    location: 'Thrissur',
    coord: '10.5276° N',
  },
];

const MISSIONS = [
  {
    region: 'Western Ghats',
    objective: 'Find undocumented viewpoints above 1,200m elevation',
    reward: 'Founder Status',
    signals: 4,
    active: true,
    coord: '10.8505° N — 11.6854° N',
  },
  {
    region: 'Kochi',
    objective: 'Document forgotten colonial and vernacular architecture',
    reward: 'Cartographer Badge',
    signals: 2,
    active: true,
    coord: '9.9312° N, 76.2673° E',
  },
  {
    region: 'Lakshadweep Corridor',
    objective: 'Map unmapped reef entry points for ethical diving',
    reward: 'Vanguard Recognition',
    signals: 1,
    active: false,
    coord: '10.5593° N, 72.6358° E',
  },
];

const ARCHIVE_SIGNALS = [
  'Every civilization began as a hidden place.',
  'The unknown still exists.',
  'The map is never the territory.',
  'Not everything forgotten was lost.',
  'Discovery is not an act. It is a practice.',
];

const LIFECYCLE_STEPS = [
  { label: 'Signal', desc: 'A place is reported by an explorer' },
  { label: 'Explorer Reports', desc: 'Multiple field notes accumulate' },
  { label: 'Verification', desc: 'Community validates the discovery' },
  { label: 'Hidden Gem', desc: 'Officially mapped and attributed' },
  { label: 'Destination', desc: 'Becomes part of the living atlas' },
];

const HiddenGemsPage = () => {
  const { user } = useAuth();
  const [gems, setGems] = useState<HiddenGem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeNote, setActiveNote] = useState(0);
  const [archiveIndex, setArchiveIndex] = useState(0);
  const [archiveVisible, setArchiveVisible] = useState(true);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGems();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNote(i => (i + 1) % FIELD_NOTES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setArchiveVisible(false);
      setTimeout(() => {
        setArchiveIndex(i => (i + 1) % ARCHIVE_SIGNALS.length);
        setArchiveVisible(true);
      }, 500);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.obs-fade',
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out',
          scrollTrigger: { trigger: '.obs-fade', start: 'top 75%', toggleActions: 'play none none reverse' },
        }
      );
    }, pageRef);
    return () => ctx.revert();
  }, []);

  const fetchGems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('hidden_gems')
        .select('*')
        .eq('verification_status', 'verified')
        .order('total_votes', { ascending: false });
      if (fetchError) throw fetchError;
      setGems(data || []);
    } catch (err) {
      console.error('Error fetching hidden gems:', err);
      setError('Failed to load hidden gems. Please try again later.');
      setGems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-forest-950 pt-16 pb-20 md:pb-0">

      {/* ── Hero ── */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1366909/pexels-photo-1366909.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(30%) brightness(0.4) saturate(0.7)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/60 via-forest-950/40 to-forest-950/90" />
        </div>
        {/* Topo overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.05 }}>
          <defs>
            <pattern id="topo-h" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
              <ellipse cx="150" cy="150" rx="130" ry="100" fill="none" stroke="#c9a84a" strokeWidth="0.7"/>
              <ellipse cx="150" cy="150" rx="90" ry="68" fill="none" stroke="#c9a84a" strokeWidth="0.5"/>
              <ellipse cx="150" cy="150" rx="50" ry="38" fill="none" stroke="#c9a84a" strokeWidth="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-h)" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <p className="font-jetbrains text-[10px] text-gold-400/70 tracking-widest uppercase mb-8">Discovery Observatory</p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-cream leading-[1.05] mb-6 max-w-4xl">
            Every Destination Was Once<br />
            <em className="italic text-gold-300">A Hidden Gem.</em>
          </h1>
          <p className="text-mist-400 text-base font-light max-w-xl mb-12">
            Discover, validate, and help shape the next generation of destinations.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-0 border border-forest-800 w-fit">
            {[
              { value: '1,200', label: 'Explorers' },
              { value: '156', label: 'Signals Under Review' },
              { value: '18', label: 'Active Missions' },
            ].map(({ value, label }, i) => (
              <div key={i} className={`px-8 py-5 ${i < 2 ? 'border-r border-forest-800' : ''}`}>
                <p className="font-display text-2xl font-light text-cream">{value}</p>
                <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Discoveries ── */}
      <section className="py-20 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Featured Signals</p>
            <h2 className="font-display text-3xl font-light text-cream">
              Discoveries <em className="italic text-gold-300">emerging now.</em>
            </h2>
          </div>
          {loading ? (
            <div className="border-t border-l border-forest-800">
              <div className="p-12 text-center">
                <p className="font-jetbrains text-[10px] text-gold-400/50 tracking-widest uppercase animate-pulse">Loading discoveries...</p>
              </div>
            </div>
          ) : error ? (
            <div className="border-t border-l border-forest-800">
              <div className="p-12 text-center">
                <p className="font-jetbrains text-[10px] text-red-400/70 tracking-widest uppercase">{error}</p>
              </div>
            </div>
          ) : gems.length === 0 ? (
            <div className="border-t border-l border-forest-800">
              <div className="p-12 text-center">
                <p className="font-jetbrains text-[10px] text-mist-700 tracking-widest uppercase">No approved hidden gems found</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-forest-800">
              {gems.map((gem) => {
                const verificationPct = Math.min(gem.total_votes * 5, 100);
                const coord = gem.latitude != null && gem.longitude != null
                  ? `${gem.latitude}°, ${gem.longitude}°`
                  : '';
                return (
                  <div key={gem.id} className="border-b border-r border-forest-800 group overflow-hidden">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={gem.image_url || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={gem.title}
                        className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                        style={{ filter: 'grayscale(35%) brightness(0.55)' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className="font-jetbrains text-[9px] text-gold-400/70 border border-gold-400/20 px-2 py-0.5 bg-forest-950/60">
                          {gem.category.toUpperCase()}
                        </span>
                      </div>
                      {coord && <p className="absolute bottom-3 left-3 font-jetbrains text-[9px] text-gold-400/50 tracking-widest">{coord}</p>}
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-lg font-light text-cream mb-1 group-hover:text-gold-200 transition-colors duration-300">{gem.title}</h3>
                      <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase mb-4">{gem.location}</p>
                      <div className="flex items-center justify-between mb-5">
                        <div className="space-y-1">
                          <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest">{gem.total_visits} EXPLORER REPORTS</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-forest-700 w-20">
                              <div className="h-px bg-gold-400/60" style={{ width: `${verificationPct}%` }} />
                            </div>
                            <span className="font-jetbrains text-[9px] text-gold-400/60">{verificationPct}% VERIFIED</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-jetbrains text-[9px] text-mist-700">
                          FOUNDER: <span className="text-gold-400/60">Community Explorer</span>
                        </p>
                        <button className="font-jetbrains text-[9px] text-mist-500 hover:text-gold-400 tracking-widest uppercase transition-colors duration-300">
                          Investigate Signal →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Discovery Lifecycle ── */}
      <section className="py-20 bg-forest-900 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">The Process</p>
            <h2 className="font-display text-3xl font-light text-cream">
              Discovery <em className="italic text-gold-300">Creates Reality.</em>
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-stretch gap-0 border border-forest-700">
            {LIFECYCLE_STEPS.map((step, i) => (
              <div key={i} className={`flex-1 p-6 ${i < LIFECYCLE_STEPS.length - 1 ? 'border-b md:border-b-0 md:border-r border-forest-700' : ''} group hover:bg-forest-800/40 transition-colors duration-400`}>
                <span className="font-jetbrains text-[9px] text-gold-400/30 tracking-widest block mb-4">0{i + 1}</span>
                <h3 className="font-display text-base font-light text-cream mb-2 group-hover:text-gold-200 transition-colors duration-300">{step.label}</h3>
                <p className="text-mist-700 text-xs font-light leading-relaxed group-hover:text-mist-500 transition-colors duration-300">{step.desc}</p>
                {i < LIFECYCLE_STEPS.length - 1 && (
                  <ChevronRight className="hidden md:block h-3 w-3 text-gold-400/20 mt-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Explorer Field Notes ── */}
      <section className="py-20 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Field Notes</p>
              <h2 className="font-display text-3xl font-light text-cream mb-2">
                From the <em className="italic text-gold-300">ground.</em>
              </h2>
              <p className="text-mist-600 text-sm font-light mb-8">Unedited transmissions from active explorers.</p>

              {/* Rotating note */}
              <div className="border border-forest-700 p-8 min-h-[200px] flex flex-col justify-between hover:border-forest-600 transition-colors duration-500">
                <div>
                  <span className="font-jetbrains text-[9px] text-gold-400/50 tracking-widest block mb-6">
                    FIELD NOTE #{FIELD_NOTES[activeNote].id}
                  </span>
                  <p
                    key={activeNote}
                    className="font-display text-xl italic font-light text-cream leading-relaxed mb-6"
                    style={{ animation: 'noteReveal 0.6s ease-out' }}
                  >
                    "{FIELD_NOTES[activeNote].text}"
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-jetbrains text-[9px] text-mist-700">— {FIELD_NOTES[activeNote].author}</p>
                    <p className="font-jetbrains text-[9px] text-gold-400/40">{FIELD_NOTES[activeNote].coord} · {FIELD_NOTES[activeNote].location}</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-6">
                  {FIELD_NOTES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveNote(i)}
                      className={`h-px transition-all duration-300 ${i === activeNote ? 'w-6 bg-gold-400' : 'w-2 bg-forest-700'}`}
                      aria-label={`Note ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Static notes */}
            <div className="space-y-0 border-t border-l border-forest-800">
              {FIELD_NOTES.map((note, i) => (
                <button
                  key={i}
                  onClick={() => setActiveNote(i)}
                  className={`w-full text-left p-5 border-b border-r border-forest-800 transition-colors duration-300 ${activeNote === i ? 'bg-forest-900/60' : 'hover:bg-forest-900/30'}`}
                >
                  <span className="font-jetbrains text-[9px] text-gold-400/40 block mb-1">#{note.id} · {note.location}</span>
                  <p className="text-mist-600 text-xs font-light line-clamp-2 text-left">{note.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Discovery Missions ── */}
      <section className="py-20 bg-forest-900 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Active Missions</p>
            <h2 className="font-display text-3xl font-light text-cream">
              Regions awaiting <em className="italic text-gold-300">their founders.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-forest-800">
            {MISSIONS.map((mission, i) => (
              <div key={i} className="border-b border-r border-forest-800 p-8 group hover:bg-forest-800/40 transition-colors duration-400">
                <div className="flex items-start justify-between mb-4">
                  <span className={`font-jetbrains text-[9px] tracking-widest px-2 py-0.5 border ${mission.active ? 'border-gold-400/30 text-gold-400/70' : 'border-forest-700 text-mist-700'}`}>
                    {mission.active ? 'ACTIVE' : 'UPCOMING'}
                  </span>
                  <span className="font-jetbrains text-[9px] text-mist-700">{mission.signals} signals</span>
                </div>
                <h3 className="font-display text-xl font-light text-cream mb-2 group-hover:text-gold-200 transition-colors duration-300">{mission.region}</h3>
                <p className="text-mist-600 text-xs font-light leading-relaxed mb-6">{mission.objective}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-jetbrains text-[9px] text-mist-700 mb-0.5">REWARD</p>
                    <p className="font-jetbrains text-[10px] text-gold-400/70 tracking-wide">{mission.reward}</p>
                  </div>
                  <p className="font-jetbrains text-[8px] text-mist-800 tracking-widest">{mission.coord}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founder Economy ── */}
      <section className="py-20 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">The Economy of Discovery</p>
              <h2 className="font-display text-4xl md:text-5xl font-light text-cream leading-tight mb-6">
                Every Hidden Gem<br />
                <em className="italic text-gold-300">Has A Founder.</em>
              </h2>
              <p className="text-mist-500 text-sm font-light leading-relaxed mb-8 max-w-md">
                When you discover a place and document it, you are permanently associated with it. As it grows, your recognition grows. Contributors shape the living atlas — and the atlas remembers.
              </p>
              <button
                onClick={() => { if (!user) { alert('Please sign in to add a discovery'); return; } setShowAddModal(true); }}
                className="group flex items-center gap-3 px-8 py-3 border border-gold-400/30 text-gold-300 font-jetbrains text-[11px] tracking-widest uppercase hover:border-gold-400/70 transition-all duration-300"
              >
                <Plus className="h-3 w-3 group-hover:rotate-90 transition-transform duration-300" />
                Submit A Discovery
              </button>
            </div>

            {/* Flow */}
            <div className="flex flex-col gap-0 border border-forest-700">
              {[
                { step: 'Discovery', desc: 'You find an unmapped place and file a signal' },
                { step: 'Verification', desc: 'Other explorers confirm and add field notes' },
                { step: 'Founder Recognition', desc: 'Your name is permanently attached to the gem' },
                { step: 'Community Impact', desc: 'The discovery enters the living atlas — and your legacy grows' },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-5 p-6 group hover:bg-forest-900/40 transition-colors duration-400 ${i < 3 ? 'border-b border-forest-700' : ''}`}>
                  <span className="font-jetbrains text-[9px] text-gold-400/30 tracking-widest flex-shrink-0 mt-0.5">0{i + 1}</span>
                  <div>
                    <h4 className="font-display text-base font-light text-cream mb-1 group-hover:text-gold-200 transition-colors duration-300">{item.step}</h4>
                    <p className="text-mist-700 text-xs font-light group-hover:text-mist-500 transition-colors duration-300">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Verified Gems from DB (if any) ── */}
      {!loading && gems.length > 0 && (
        <section className="py-20 bg-forest-900 border-t border-forest-800">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="mb-12">
              <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Verified Atlas</p>
              <h2 className="font-display text-3xl font-light text-cream">
                Confirmed <em className="italic text-gold-300">discoveries.</em>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-forest-800">
              {gems.map((gem) => (
                <div key={gem.id} className="border-b border-r border-forest-800 group overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={gem.image_url || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800'}
                      alt={gem.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                      style={{ filter: 'grayscale(35%) brightness(0.5)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-950/90 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-base font-light text-cream mb-1 group-hover:text-gold-200 transition-colors duration-300">{gem.title}</h3>
                    <div className="flex items-center gap-1 mb-3">
                      <MapPin className="h-3 w-3 text-gold-400/40" />
                      <span className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase">{gem.location}</span>
                    </div>
                    <p className="text-mist-700 text-xs font-light line-clamp-2">{gem.description}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="font-jetbrains text-[9px] text-mist-700">{gem.total_visits} visits</span>
                      <Eye className="h-3 w-3 text-mist-700" />
                      <span className="font-jetbrains text-[9px] text-mist-700">{gem.total_votes} signals</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Archive Signals ── */}
      <section className="py-16 border-t border-forest-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-jetbrains text-[10px] text-gold-400/40 tracking-widest uppercase mb-6">Archive</p>
          <p
            key={archiveIndex}
            className="font-display text-2xl md:text-3xl italic font-light text-mist-500 transition-all duration-500"
            style={{ opacity: archiveVisible ? 1 : 0, transform: archiveVisible ? 'translateY(0)' : 'translateY(6px)' }}
          >
            "{ARCHIVE_SIGNALS[archiveIndex]}"
          </p>
        </div>
      </section>

      <Footer />

      <AddGemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchGems}
      />

      <style>{`
        @keyframes noteReveal {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default HiddenGemsPage;
