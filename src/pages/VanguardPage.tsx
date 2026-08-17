import React, { useState, useEffect, useRef } from 'react';
import { Plus, ArrowRight, Loader } from 'lucide-react';
import Footer from '../components/Footer';
import TourGuideCard from '../components/TourGuideCard';
import TourGuideApplicationModal from '../components/TourGuideApplicationModal';
import BookingModal from '../components/BookingModal';
import { vanguardService } from '../services/vanguardService';
import type { TourGuide } from '../shared/supabase';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const VanguardPage = () => {
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [bookingGuide, setBookingGuide] = useState<TourGuide | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadGuides();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.vg-fade',
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
          scrollTrigger: { trigger: '.vg-fade', start: 'top 78%', toggleActions: 'play none none reverse' },
        }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [guides]);

  const loadGuides = async () => {
    try {
      setLoading(true);
      const data = await vanguardService.getTourGuides();
      setGuides(data ?? []);
    } catch (err) {
      console.error('Failed to load tour guides:', err);
      setGuides([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollToGuides = () => {
    const el = document.getElementById('guide-grid');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div ref={pageRef} className="min-h-screen" style={{ backgroundColor: '#F6F2E9' }}>

      {/* ── Hero ── */}
      <section
        className="relative flex items-center overflow-hidden"
        style={{ minHeight: '82vh', paddingTop: '6rem' }}
      >
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=2400"
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
            The Vanguard
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-medium leading-[1.05] mb-6 tracking-tight max-w-3xl mx-auto" style={{ color: '#F6F2E9', textShadow: '0 2px 20px rgba(38,61,53,0.4)' }}>
            Meet the people who know India differently.
          </h1>
          <p className="text-sm sm:text-base max-w-xl mx-auto mb-12 leading-relaxed font-light" style={{ color: 'rgba(246,242,233,0.85)', textShadow: '0 1px 8px rgba(38,61,53,0.3)' }}>
            Local guides, storytellers and explorers who reveal the places you wouldn't find on an ordinary map.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button
              onClick={scrollToGuides}
              className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
              style={{ backgroundColor: '#263D35', color: '#F6F2E9', border: '1px solid #263D35' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.border = '1px solid rgba(246,242,233,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#263D35'; e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.border = '1px solid #263D35'; }}
            >
              Explore Guides
            </button>
            <button
              onClick={() => setShowApplicationModal(true)}
              className="group font-display text-base tracking-wide transition-colors duration-300"
              style={{ color: 'rgba(246,242,233,0.85)' }}
            >
              <span className="border-b pb-0.5 transition-all duration-300 group-hover:border-[#E7D9C5]" style={{ borderColor: 'rgba(246,242,233,0.3)' }}>
                Become a Guide →
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ── Introduction ── */}
      <section className="py-24" style={{ backgroundColor: '#FBF8F1' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-6" style={{ color: 'rgba(48,51,47,0.5)' }}>Local Experts</p>
          <h2 className="font-display text-3xl md:text-4xl font-light leading-tight mb-6" style={{ color: '#263D35' }}>
            Travel with someone who <em className="italic" style={{ color: '#B77B65' }}>knows the way.</em>
          </h2>
          <p className="text-sm font-light leading-relaxed max-w-xl mx-auto" style={{ color: 'rgba(48,51,47,0.6)' }}>
            Not a guide — a local friend. Each expert is verified, community-rated, and deeply rooted in the place they call home.
          </p>
        </div>
      </section>

      {/* ── Guide Grid ── */}
      <section id="guide-grid" className="py-20" style={{ backgroundColor: '#F6F2E9' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(48,51,47,0.5)' }}>The Network</p>
              <h2 className="font-display text-4xl md:text-5xl font-light leading-tight" style={{ color: '#263D35' }}>
                Meet your <em className="italic" style={{ color: '#B77B65' }}>local experts.</em>
              </h2>
            </div>
            <button
              onClick={() => setShowApplicationModal(true)}
              className="group hidden md:flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase transition-all duration-300 hover:text-[#B69A63]"
              style={{ color: 'rgba(48,51,47,0.5)', border: '1px solid rgba(38,61,53,0.15)', padding: '0.5rem 1.25rem', borderRadius: '999px' }}
            >
              <Plus className="h-3 w-3" strokeWidth={1.5} />
              Join as Expert
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-5 w-5 animate-spin" style={{ color: '#B69A63' }} />
              <span className="ml-3 font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(48,51,47,0.4)' }}>Loading experts...</span>
            </div>
          ) : guides.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {guides.map((guide) => (
                <TourGuideCard key={guide.id} guide={guide} onBook={setBookingGuide} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="font-display text-xl font-light italic mb-3" style={{ color: 'rgba(48,51,47,0.5)' }}>
                The network is growing.
              </p>
              <p className="text-sm font-light mb-8 max-w-md mx-auto" style={{ color: 'rgba(48,51,47,0.4)' }}>
                Local experts are joining the Vanguard. Be the first in your destination.
              </p>
              <button
                onClick={() => setShowApplicationModal(true)}
                className="inline-flex items-center gap-2 px-8 py-3 text-sm tracking-[0.15em] uppercase transition-all duration-300"
                style={{ backgroundColor: '#263D35', color: '#F6F2E9', border: '1px solid #263D35', borderRadius: '999px' }}
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
                Become a Local Expert
              </button>
            </div>
          )}

          <div className="mt-12 md:hidden text-center">
            <button
              onClick={() => setShowApplicationModal(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs tracking-[0.15em] uppercase transition-all duration-300"
              style={{ border: '1px solid rgba(38,61,53,0.15)', color: '#263D35', borderRadius: '999px' }}
            >
              <Plus className="h-3 w-3" strokeWidth={1.5} />
              Join as Expert
            </button>
          </div>
        </div>
      </section>

      {/* ── Why Travel With a Local ── */}
      <section className="py-32" style={{ backgroundColor: '#E8EDE5' }}>
        <div className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center mb-20">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-6" style={{ color: 'rgba(48,51,47,0.5)' }}>Why Vanguard</p>
            <h2 className="font-display text-3xl md:text-4xl font-light leading-tight max-w-2xl mx-auto" style={{ color: '#263D35' }}>
              The best discoveries happen <em className="italic" style={{ color: '#B77B65' }}>through people.</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { title: 'Trusted locals', desc: 'Every expert is identity-verified, background-checked, and community-rated.' },
              { title: 'Places, not tourist traps', desc: 'Your guide takes you to the corners only locals know — not the places the algorithm rewards.' },
              { title: 'Direct and transparent', desc: 'No middleman. You agree directly with the person who actually knows the place.' },
              { title: 'Stories you carry home', desc: 'History, food, culture — told by someone who lives it, not someone who memorized a script.' },
            ].map((item, i) => (
              <div key={i} className="vg-fade" style={{ opacity: 0 }}>
                <h3 className="font-display text-xl font-light mb-3" style={{ color: '#263D35' }}>{item.title}</h3>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(48,51,47,0.6)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-32" style={{ backgroundColor: '#263D35' }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-light leading-tight mb-6" style={{ color: '#F6F2E9' }}>
            Every place has <em className="italic" style={{ color: '#E7D9C5' }}>stories.</em>
          </h2>
          <p className="text-sm font-light mb-12 max-w-md mx-auto" style={{ color: 'rgba(246,242,233,0.55)' }}>
            The best way to discover them is through the people who live them.
          </p>
          <button
            onClick={() => setShowApplicationModal(true)}
            className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-500"
            style={{ border: '1px solid rgba(246,242,233,0.25)', color: '#F6F2E9', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F6F2E9'; e.currentTarget.style.color = '#263D35'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F6F2E9'; }}
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Join the Vanguard Network
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
