import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight, ArrowRight } from 'lucide-react';
import Footer from '../components/Footer';
import TourGuideCard from '../components/TourGuideCard';
import TourGuideApplicationModal from '../components/TourGuideApplicationModal';
import BookingModal from '../components/BookingModal';
import { vanguardService } from '../services/vanguardService';
import type { TourGuide } from '../shared/supabase';
import {
  ARCHETYPE_PHILOSOPHY,
  FEATURED_EXPERIENCES,
  EXPLORER_TESTIMONIALS,
} from '../data/vanguardSamples';

const ARCHETYPES = [
  { name: 'Historian', focus: 'Stories & Heritage', desc: 'Temples, monuments, oral histories that guidebooks never reach.' },
  { name: 'Pathfinder', focus: 'Trails & Wilderness', desc: 'Routes that exist only on the ground, not on any map.' },
  { name: 'Food Explorer', focus: 'Local Cuisine', desc: 'Markets, home kitchens, street corners — the real table.' },
  { name: 'Naturalist', focus: 'Wildlife & Ecology', desc: 'Ecosystems, endemic species, the language of a landscape.' },
  { name: 'Architect', focus: 'Buildings & Design', desc: 'Forgotten structures, vernacular forms, spatial memory.' },
  { name: 'Storykeeper', focus: 'Culture & Traditions', desc: 'Festivals, rituals, living customs before they disappear.' },
  { name: 'Photographer', focus: 'Visual Discovery', desc: 'Light at the right hour, angles that change how you see.' },
  { name: 'Adventure Specialist', focus: 'Physical Expeditions', desc: 'Climbs, crossings, and routes that require a guide to survive.' },
];

const WHY_ROWS = [
  { problem: 'Tourist traps', solution: 'Trusted locals who avoid them by default' },
  { problem: 'Generic itineraries', solution: 'Places built around your specific curiosity' },
  { problem: 'Unreliable guides', solution: 'Community-verified, identity-confirmed experts' },
  { problem: 'Overpriced packages', solution: 'Direct, transparent agreements with locals' },
];

const VERIFICATION_CRITERIA = [
  'Verified Identity',
  'Background Checked',
  'Local Expertise Confirmed',
  'Community Rated',
  'Safety Standards Met',
];

const JOURNEY_STEPS = [
  { label: 'Apply', desc: 'Share your story and local knowledge' },
  { label: 'Verification', desc: 'Identity, background and expertise checks' },
  { label: 'Field Notes', desc: 'Document your hidden places and stories' },
  { label: 'Community Review', desc: 'Rated by fellow explorers after every trip' },
  { label: 'Become Vanguard', desc: 'Trusted local friend in the network' },
];

const VanguardPage = () => {
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [bookingGuide, setBookingGuide] = useState<TourGuide | null>(null);
  const [noteIndex, setNoteIndex] = useState(0);
  const [noteVisible, setNoteVisible] = useState(true);

  useEffect(() => {
    loadGuides();
  }, []);

  const allNotes = guides.flatMap((g) =>
    (g.sample_field_notes || []).map((note) => ({ note, name: g.full_name, city: g.location_city }))
  );

  useEffect(() => {
    if (allNotes.length < 2) return;
    const interval = setInterval(() => {
      setNoteVisible(false);
      setTimeout(() => {
        setNoteIndex((i) => (i + 1) % allNotes.length);
        setNoteVisible(true);
      }, 400);
    }, 4000);
    return () => clearInterval(interval);
  }, [allNotes.length]);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const data = await vanguardService.getTourGuides();
      setGuides(data || []);
    } catch (err) {
      console.error('Failed to load tour guides:', err);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-forest-950 pt-16 pb-20 md:pb-0">

      {/* ── Hero ── */}
      <section className="relative min-h-[78vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1920"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'grayscale(20%) brightness(0.35) saturate(0.6)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-950/50 via-forest-950/30 to-forest-950/90" />
        </div>

        {/* Topographic overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.04 }}>
          <defs>
            <pattern id="topo-v" x="0" y="0" width="280" height="280" patternUnits="userSpaceOnUse">
              <ellipse cx="140" cy="140" rx="120" ry="90" fill="none" stroke="#c9a84a" strokeWidth="0.6"/>
              <ellipse cx="140" cy="140" rx="82" ry="60" fill="none" stroke="#c9a84a" strokeWidth="0.5"/>
              <ellipse cx="140" cy="140" rx="44" ry="32" fill="none" stroke="#c9a84a" strokeWidth="0.4"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-v)" />
        </svg>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 w-full">
          <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-8">
            Vanguard · Local Expert Network
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light text-cream leading-[1.05] mb-4 max-w-3xl">
            Explore With Locals<br />
            <em className="italic text-gold-300">Who Know The Place Best.</em>
          </h1>
          <p className="text-mist-400 text-base font-light max-w-lg mb-2">
            Discover hidden places, local stories, authentic food, and culture through trusted locals
            who call these destinations home.
          </p>
          <p className="font-display italic text-gold-300/60 text-lg mb-12">
            Not a guide. A local friend.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-0 border border-forest-800 w-fit">
            {[
              { value: guides.length > 0 ? String(guides.length) : '10', label: 'Local Experts' },
              { value: '48', label: 'Hidden Gems Hosted' },
              { value: '312', label: 'Explorer Expeditions' },
              { value: '156', label: 'Community Field Notes' },
            ].map(({ value, label }, i) => (
              <div key={i} className={`px-6 py-4 ${i < 3 ? 'border-r border-forest-800' : ''}`}>
                <p className="font-display text-xl font-light text-cream">{value}</p>
                <p className="font-mono text-[8px] text-mist-700 tracking-widest uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Vanguard Exists ── */}
      <section className="py-20 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Why This Exists</p>
              <h2 className="font-display text-4xl font-light text-cream leading-tight">
                Travel Feels Different<br />
                <em className="italic text-gold-300">With A Local Friend.</em>
              </h2>
            </div>
            <div className="border-t border-l border-forest-800">
              {WHY_ROWS.map(({ problem, solution }, i) => (
                <div
                  key={i}
                  className="flex items-start gap-6 p-5 border-b border-r border-forest-800 group hover:bg-forest-900/40 transition-colors duration-300"
                >
                  <div className="flex-1">
                    <p className="font-mono text-[9px] text-mist-800 tracking-widest uppercase line-through mb-1">{problem}</p>
                    <p className="text-mist-500 text-sm font-light group-hover:text-mist-400 transition-colors duration-300">{solution}</p>
                  </div>
                  <ChevronRight className="h-3 w-3 text-gold-400/20 mt-1 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Explorer Archetypes ── */}
      <section className="py-20 bg-forest-900 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Explorer Types</p>
            <h2 className="font-display text-3xl font-light text-cream">
              Who can you <em className="italic text-gold-300">explore with?</em>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-l border-forest-800">
            {ARCHETYPES.map((a) => (
              <div
                key={a.name}
                className="border-b border-r border-forest-800 p-5 group hover:bg-forest-800/50 transition-colors duration-400 flex flex-col"
              >
                <p className="font-mono text-[8px] text-gold-400/40 tracking-widest uppercase mb-2">{a.focus}</p>
                <h4 className="font-display text-base font-light text-cream mb-2 group-hover:text-gold-200 transition-colors duration-300">{a.name}</h4>
                <p className="text-mist-700 text-xs font-light leading-relaxed group-hover:text-mist-500 transition-colors duration-300 flex-1">{a.desc}</p>
                <p className="font-display italic text-[11px] text-gold-400/40 mt-3 group-hover:text-gold-400/60 transition-colors duration-300">
                  {ARCHETYPE_PHILOSOPHY[a.name]}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Places They Know Best ── */}
      <section className="py-20 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Featured Experiences</p>
            <h2 className="font-display text-3xl font-light text-cream">
              Places They <em className="italic text-gold-300">Know Best.</em>
            </h2>
          </div>

          {/* Horizontal scrollable row */}
          <div className="flex gap-0 overflow-x-auto pb-2 border-t border-l border-forest-800 scrollbar-none"
               style={{ scrollbarWidth: 'none' }}>
            {FEATURED_EXPERIENCES.map((exp, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-64 md:w-72 border-b border-r border-forest-800 p-6 group hover:bg-forest-900/60 transition-colors duration-300 cursor-pointer"
              >
                <p className="font-mono text-[8px] text-gold-400/40 tracking-widest uppercase mb-3">
                  {exp.archetype}
                </p>
                <h4 className="font-display text-lg font-light text-cream mb-2 group-hover:text-gold-200 transition-colors duration-300 leading-tight">
                  {exp.name}
                </h4>
                <p className="text-mist-700 text-xs font-light leading-relaxed mb-4 group-hover:text-mist-500 transition-colors duration-300">
                  {exp.description}
                </p>
                <div className="flex items-center gap-1 mt-auto">
                  <ArrowRight className="h-3 w-3 text-gold-400/30 group-hover:text-gold-400/60 transition-colors duration-300 group-hover:translate-x-0.5 transition-transform" />
                  <span className="font-mono text-[8px] text-gold-400/30 tracking-widest group-hover:text-gold-400/60 transition-colors duration-300">
                    EXPLORE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Local Expert Grid ── */}
      <section className="py-20 bg-forest-900 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">The Network</p>
              <h2 className="font-display text-3xl font-light text-cream">
                Meet your <em className="italic text-gold-300">local experts.</em>
              </h2>
            </div>
            <button
              onClick={() => setShowApplicationModal(true)}
              className="group hidden md:flex items-center gap-2 font-mono text-[10px] tracking-widest text-gold-300/60 border border-gold-400/20 px-5 py-2 hover:border-gold-400/50 transition-all duration-300"
            >
              <Plus className="h-3 w-3 group-hover:rotate-90 transition-transform duration-300" />
              JOIN AS EXPERT
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-6 h-6 border border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
            </div>
          ) : guides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-forest-800">
              {guides.map((guide) => (
                <TourGuideCard key={guide.id} guide={guide} onBook={setBookingGuide} />
              ))}
            </div>
          ) : (
            <div className="border border-forest-800 p-12 text-center">
              <p className="font-display text-xl italic font-light text-cream mb-2">The network is growing.</p>
              <p className="text-mist-700 text-sm font-light mb-6">
                Local experts are joining the Vanguard. Be the first in your destination.
              </p>
              <button
                onClick={() => setShowApplicationModal(true)}
                className="font-mono text-[10px] tracking-widest text-gold-300/70 border border-gold-400/20 px-6 py-2 hover:border-gold-400/50 transition-colors duration-300"
              >
                BECOME A LOCAL EXPERT
              </button>
            </div>
          )}

          <div className="mt-8 md:hidden text-center">
            <button
              onClick={() => setShowApplicationModal(true)}
              className="font-mono text-[10px] tracking-widest text-gold-300/60 border border-gold-400/20 px-6 py-2 hover:border-gold-400/50 transition-all duration-300"
            >
              JOIN AS LOCAL EXPERT
            </button>
          </div>
        </div>
      </section>

      {/* ── Field Notes Rotator (if DB has notes) ── */}
      {allNotes.length > 0 && (
        <section className="py-16 border-t border-forest-800">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
            <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-8">Recent Field Notes</p>
            <div
              style={{ opacity: noteVisible ? 1 : 0, transform: noteVisible ? 'translateY(0)' : 'translateY(6px)', transition: 'opacity 0.4s, transform 0.4s' }}
            >
              <p className="font-display text-2xl md:text-3xl italic font-light text-cream mb-4">
                "{allNotes[noteIndex]?.note}"
              </p>
              <p className="font-mono text-[9px] text-gold-400/40 tracking-widest">
                — {allNotes[noteIndex]?.name} · {allNotes[noteIndex]?.city}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ── Vanguard Journey ── */}
      <section className="py-20 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">The Path</p>
            <h2 className="font-display text-3xl font-light text-cream">
              The Vanguard <em className="italic text-gold-300">Journey.</em>
            </h2>
          </div>

          {/* Steps — horizontal on desktop, vertical on mobile */}
          <div className="hidden md:flex border border-forest-800">
            {JOURNEY_STEPS.map((step, i) => (
              <div key={i} className="flex-1 relative">
                <div className={`p-6 h-full group hover:bg-forest-900/40 transition-colors duration-300 ${i < JOURNEY_STEPS.length - 1 ? 'border-r border-forest-800' : ''}`}>
                  <p className="font-mono text-[8px] text-gold-400/30 tracking-widest uppercase mb-3">
                    0{i + 1}
                  </p>
                  <h4 className="font-display text-base font-light text-cream mb-2 group-hover:text-gold-200 transition-colors duration-300">
                    {step.label}
                  </h4>
                  <p className="text-mist-700 text-xs font-light leading-relaxed group-hover:text-mist-500 transition-colors duration-300">
                    {step.desc}
                  </p>
                  {i < JOURNEY_STEPS.length - 1 && (
                    <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-3 w-3 text-gold-400/20 z-10 bg-forest-950" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile vertical */}
          <div className="md:hidden border-t border-l border-forest-800">
            {JOURNEY_STEPS.map((step, i) => (
              <div key={i} className="flex items-start gap-4 p-5 border-b border-r border-forest-800">
                <span className="font-mono text-[8px] text-gold-400/30 tracking-widest mt-1 flex-shrink-0">0{i + 1}</span>
                <div>
                  <h4 className="font-display text-base font-light text-cream mb-1">{step.label}</h4>
                  <p className="text-mist-700 text-xs font-light">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="font-display italic text-center text-gold-300/40 text-base mt-8">
            Become the local friend travelers remember.
          </p>
        </div>
      </section>

      {/* ── Verification Layer ── */}
      <section className="py-20 bg-forest-900 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Trust & Safety</p>
              <h2 className="font-display text-3xl font-light text-cream leading-snug">
                Vanguard<br />
                <em className="italic text-gold-300">Verification.</em>
              </h2>
              <p className="text-mist-600 text-sm font-light mt-4 max-w-sm">
                Every local expert in the network passes a multi-layer verification before they can host an expedition.
              </p>
            </div>
            <div className="border-t border-l border-forest-800">
              {VERIFICATION_CRITERIA.map((criterion, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-5 border-b border-r border-forest-800 group hover:bg-forest-800/40 transition-colors duration-300"
                >
                  <p className="font-display text-base font-light text-cream group-hover:text-gold-200 transition-colors duration-300">{criterion}</p>
                  <span className="font-mono text-[8px] text-gold-400/40 border border-gold-400/15 px-2 py-0.5 tracking-widest">REQUIRED</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Explorer Testimonials ── */}
      <section className="py-20 border-t border-forest-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="mb-12">
            <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-4">Explorer Voices</p>
            <h2 className="font-display text-3xl font-light text-cream">
              What they <em className="italic text-gold-300">discovered.</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-forest-800">
            {EXPLORER_TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="border-b border-r border-forest-800 p-8 flex flex-col group hover:bg-forest-900/30 transition-colors duration-300"
              >
                <p className="font-display italic text-lg font-light text-cream leading-relaxed flex-1 mb-6">
                  "{t.quote}"
                </p>
                <div>
                  <p className="font-display text-sm font-light text-mist-500">{t.name}</p>
                  <p className="font-mono text-[8px] text-gold-400/40 tracking-widest uppercase mt-0.5">{t.destination}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ── */}
      <section className="py-20 border-t border-forest-800 bg-forest-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="font-mono text-[10px] text-gold-400/50 tracking-widest uppercase mb-6">Every Place Has Stories</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-cream mb-4 leading-tight">
            The best way to discover them<br />
            <em className="italic text-gold-300">is through the people who live them.</em>
          </h2>
          <p className="text-mist-600 text-sm font-light mb-2 max-w-md mx-auto">
            Join as a local expert and become the guide that travelers remember for the rest of their lives.
          </p>
          <p className="font-display italic text-gold-300/50 text-base mb-10">
            Woander gives every traveler a trusted local friend in every destination.
          </p>
          <button
            onClick={() => setShowApplicationModal(true)}
            className="group inline-flex items-center gap-3 font-mono text-[11px] tracking-widest text-gold-300/70 border border-gold-400/20 px-8 py-3 hover:border-gold-400/60 hover:text-gold-300 transition-all duration-300"
          >
            <Plus className="h-3 w-3 group-hover:rotate-90 transition-transform duration-300" />
            JOIN THE VANGUARD NETWORK
          </button>
        </div>
      </section>

      <Footer />

      <TourGuideApplicationModal
        isOpen={showApplicationModal}
        onClose={() => setShowApplicationModal(false)}
        onSuccess={() => {
          setShowApplicationModal(false);
          loadGuides();
        }}
      />

      {bookingGuide && (
        <BookingModal
          guide={bookingGuide}
          isOpen={bookingGuide !== null}
          onClose={() => setBookingGuide(null)}
        />
      )}
    </div>
  );
};

export default VanguardPage;
