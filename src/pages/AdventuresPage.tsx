import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  MapPin, Plus, ArrowRight, Loader, Compass, X, Filter, ChevronDown,
  Search, SlidersHorizontal, Check, Star, ShieldCheck, Layers,
} from 'lucide-react';
import Footer from '../components/Footer';
import PackageCard from '../components/PackageCard';
import PackageDetailModal from '../components/PackageDetailModal';
import CompareDrawer from '../components/CompareDrawer';
import ListYourTourModal from '../components/ListYourTourModal';
import { type MarketplacePackage, TOUR_TYPE_LABELS, DIFFICULTY_LABELS, formatPrice, formatDuration, getLocationString } from '../components/marketplaceTypes';
import { supabase } from '../shared/supabase';
import { useAuth } from '../shared/AuthContext';
import { TopoBackground } from '../components/FieldElements';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'duration_short', label: 'Duration: Shortest' },
  { value: 'duration_long', label: 'Duration: Longest' },
  { value: 'rating', label: 'Highest Rated' },
];

const PRICE_RANGES = [
  { value: '0-5000', label: 'Under ₹5,000', min: 0, max: 5000 },
  { value: '5000-15000', label: '₹5,000 – ₹15,000', min: 5000, max: 15000 },
  { value: '15000-50000', label: '₹15,000 – ₹50,000', min: 15000, max: 50000 },
  { value: '50000-100000', label: '₹50,000 – ₹1,00,000', min: 50000, max: 100000 },
  { value: '100000+', label: 'Above ₹1,00,000', min: 100000, max: 9999999 },
];

const DURATION_OPTIONS = [
  { value: '1', label: '1 day' },
  { value: '2-3', label: '2–3 days' },
  { value: '4-7', label: '4–7 days' },
  { value: '8+', label: '8+ days' },
];

const AdventuresPage = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<MarketplacePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<MarketplacePackage | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Compare state
  const [compareList, setCompareList] = useState<MarketplacePackage[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState('');
  const [filterDuration, setFilterDuration] = useState('');
  const [filterBookingType, setFilterBookingType] = useState('');
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState(false);
  const [filterAccommodation, setFilterAccommodation] = useState('');
  const [filterTransport, setFilterTransport] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('is_active', true)
        .in('package_status', ['published', 'draft', 'pending_review'])
        .order('created_at', { ascending: false });

      if (error) {
        setFetchError(error.message);
      } else {
        // Only show published packages to the public (drafts/pending are filtered out unless user owns them)
        const published = (data || []).filter((pkg: MarketplacePackage) =>
          pkg.package_status === 'published'
        );
        setPackages(published as MarketplacePackage[]);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load packages';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  // Derive filter options from data
  const uniqueDestinations = useMemo(() => {
    const dests = new Set<string>();
    packages.forEach(p => {
      const loc = getLocationString(p);
      if (loc && loc !== '—') dests.add(loc);
    });
    return Array.from(dests).sort();
  }, [packages]);

  const uniqueTypes = useMemo(() => {
    const types = new Set<string>();
    packages.forEach(p => { if (p.tour_type) types.add(p.tour_type); });
    return Array.from(types).sort();
  }, [packages]);

  const uniqueAccommodations = useMemo(() => {
    const accs = new Set<string>();
    packages.forEach(p => { if (p.accommodation_type) accs.add(p.accommodation_type); });
    return Array.from(accs).sort();
  }, [packages]);

  const uniqueTransports = useMemo(() => {
    const trans = new Set<string>();
    packages.forEach(p => { if (p.transport_type) trans.add(p.transport_type); });
    return Array.from(trans).sort();
  }, [packages]);

  // Filtered + sorted packages
  const filteredPackages = useMemo(() => {
    let result = [...packages];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        getLocationString(p).toLowerCase().includes(q) ||
        (p.operator_name || '').toLowerCase().includes(q)
      );
    }

    // Type
    if (filterType) result = result.filter(p => p.tour_type === filterType);
    // Destination
    if (filterDestination) result = result.filter(p => getLocationString(p) === filterDestination);
    // Difficulty
    if (filterDifficulty) result = result.filter(p => p.difficulty_level === filterDifficulty);
    // Booking type
    if (filterBookingType) result = result.filter(p => p.booking_type === filterBookingType);
    // Verified only
    if (filterVerifiedOnly) result = result.filter(p => p.is_operator_verified);
    // Accommodation
    if (filterAccommodation) result = result.filter(p => p.accommodation_type === filterAccommodation);
    // Transport
    if (filterTransport) result = result.filter(p => p.transport_type === filterTransport);

    // Price range
    if (filterPriceRange) {
      const range = PRICE_RANGES.find(r => r.value === filterPriceRange);
      if (range) {
        result = result.filter(p => {
          const price = Number(p.price_per_person);
          return price >= range.min && price <= range.max;
        });
      }
    }

    // Duration
    if (filterDuration) {
      result = result.filter(p => {
        const days = p.duration_days || (p.duration_hours >= 24 ? Math.floor(p.duration_hours / 24) : 0);
        if (filterDuration === '1') return days === 1 || (days === 0 && p.duration_hours <= 24);
        if (filterDuration === '2-3') return days >= 2 && days <= 3;
        if (filterDuration === '4-7') return days >= 4 && days <= 7;
        if (filterDuration === '8+') return days >= 8;
        return true;
      });
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => Number(a.price_per_person) - Number(b.price_per_person));
        break;
      case 'price_high':
        result.sort((a, b) => Number(b.price_per_person) - Number(a.price_per_person));
        break;
      case 'duration_short':
        result.sort((a, b) => {
          const da = a.duration_days || a.duration_hours / 24;
          const db = b.duration_days || b.duration_hours / 24;
          return da - db;
        });
        break;
      case 'duration_long':
        result.sort((a, b) => {
          const da = a.duration_days || a.duration_hours / 24;
          const db = b.duration_days || b.duration_hours / 24;
          return db - da;
        });
        break;
      case 'rating':
        result.sort((a, b) => Number(b.average_rating) - Number(a.average_rating));
        break;
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [packages, searchQuery, filterType, filterDestination, filterDifficulty, filterPriceRange, filterDuration, filterBookingType, filterVerifiedOnly, filterAccommodation, filterTransport, sortBy]);

  const hasActiveFilters = searchQuery || filterType || filterDestination || filterDifficulty || filterPriceRange || filterDuration || filterBookingType || filterVerifiedOnly || filterAccommodation || filterTransport;

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterType('');
    setFilterDestination('');
    setFilterDifficulty('');
    setFilterPriceRange('');
    setFilterDuration('');
    setFilterBookingType('');
    setFilterVerifiedOnly(false);
    setFilterAccommodation('');
    setFilterTransport('');
    setSortBy('newest');
  };

  const handleViewDetails = (pkg: MarketplacePackage) => {
    setSelectedPkg(pkg);
    setShowDetailModal(true);
  };

  const handleCompare = (pkg: MarketplacePackage) => {
    const isInList = compareList.some(p => p.id === pkg.id);
    if (isInList) {
      setCompareList(compareList.filter(p => p.id !== pkg.id));
    } else {
      if (compareList.length >= 3) return;
      setCompareList([...compareList, pkg]);
    }
  };

  const handleRemoveCompare = (id: string) => {
    setCompareList(compareList.filter(p => p.id !== id));
  };

  const handleListClick = () => {
    setShowListModal(true);
  };

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight * 0.85, behavior: 'smooth' });
  };

  const selectStyle: React.CSSProperties = {
    width: '100%',
    padding: '9px 12px',
    border: '1px solid rgba(38,61,53,0.15)',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#263D35',
    fontSize: '13px',
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 300,
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23486547' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '32px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '9px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(48,51,47,0.4)',
    marginBottom: '5px',
  };

  const FilterSection = () => (
    <div className="space-y-5">
      {/* Destination */}
      <div>
        <label style={labelStyle}>Destination</label>
        <select value={filterDestination} onChange={(e) => setFilterDestination(e.target.value)} style={selectStyle}>
          <option value="">All destinations</option>
          {uniqueDestinations.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Activity Type */}
      <div>
        <label style={labelStyle}>Activity Type</label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={selectStyle}>
          <option value="">All types</option>
          {uniqueTypes.map(t => <option key={t} value={t}>{TOUR_TYPE_LABELS[t] || t}</option>)}
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label style={labelStyle}>Price Range</label>
        <select value={filterPriceRange} onChange={(e) => setFilterPriceRange(e.target.value)} style={selectStyle}>
          <option value="">Any price</option>
          {PRICE_RANGES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Duration */}
      <div>
        <label style={labelStyle}>Duration</label>
        <select value={filterDuration} onChange={(e) => setFilterDuration(e.target.value)} style={selectStyle}>
          <option value="">Any duration</option>
          {DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
        </select>
      </div>

      {/* Difficulty */}
      <div>
        <label style={labelStyle}>Difficulty</label>
        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} style={selectStyle}>
          <option value="">Any difficulty</option>
          {Object.entries(DIFFICULTY_LABELS).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
        </select>
      </div>

      {/* Booking Type */}
      <div>
        <label style={labelStyle}>Booking Type</label>
        <select value={filterBookingType} onChange={(e) => setFilterBookingType(e.target.value)} style={selectStyle}>
          <option value="">Any booking type</option>
          <option value="instant">Instant Booking</option>
          <option value="enquiry">Request to Book</option>
        </select>
      </div>

      {/* Accommodation */}
      {uniqueAccommodations.length > 0 && (
        <div>
          <label style={labelStyle}>Accommodation</label>
          <select value={filterAccommodation} onChange={(e) => setFilterAccommodation(e.target.value)} style={selectStyle}>
            <option value="">Any accommodation</option>
            {uniqueAccommodations.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      )}

      {/* Transport */}
      {uniqueTransports.length > 0 && (
        <div>
          <label style={labelStyle}>Transport</label>
          <select value={filterTransport} onChange={(e) => setFilterTransport(e.target.value)} style={selectStyle}>
            <option value="">Any transport</option>
            {uniqueTransports.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {/* Verified Only */}
      <div>
        <label style={labelStyle}>Operator Status</label>
        <button
          onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
          className="flex items-center gap-2 w-full p-2.5 transition-all duration-300"
          style={{
            border: filterVerifiedOnly ? '1px solid rgba(182,154,99,0.4)' : '1px solid rgba(38,61,53,0.15)',
            backgroundColor: filterVerifiedOnly ? 'rgba(182,154,99,0.06)' : 'transparent',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          <ShieldCheck className="h-4 w-4" style={{ color: filterVerifiedOnly ? '#B69A63' : 'rgba(48,51,47,0.3)' }} strokeWidth={1.5} />
          <span className="text-xs font-light" style={{ color: filterVerifiedOnly ? '#263D35' : 'rgba(48,51,47,0.5)' }}>Verified operators only</span>
          {filterVerifiedOnly && <Check className="h-3.5 w-3.5 ml-auto" style={{ color: '#B69A63' }} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F2E9' }}>

      {/* ── HERO ── */}
      <section className="relative flex items-center overflow-hidden" style={{ minHeight: '80vh', paddingTop: '6rem' }}>
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=2400"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(1.02) saturate(1.05) sepia(0.05)' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(38,61,53,0.35) 0%, transparent 30%, transparent 40%, rgba(38,61,53,0.55) 100%)' }} />
        </div>
        <TopoBackground opacity={0.04} />

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-10 lg:px-16 w-full text-center">
          <p className="font-mono text-[11px] tracking-[0.28em] uppercase mb-8" style={{ color: 'rgba(246,242,233,0.85)', textShadow: '0 1px 8px rgba(38,61,53,0.3)' }}>
            Adventures
          </p>
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl font-light leading-[1.05] mb-8 tracking-tight" style={{ color: '#F6F2E9', textShadow: '0 2px 20px rgba(38,61,53,0.4)' }}>
            Find your kind of<br /><em className="italic" style={{ color: '#E7D9C5' }}>adventure.</em>
          </h1>
          <p className="font-display italic text-lg sm:text-xl md:text-2xl font-light mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(231,217,197,0.8)', textShadow: '0 1px 12px rgba(38,61,53,0.35)' }}>
            Discover and compare tours from independent operators.<br className="hidden sm:block" />
            Know what's included, what it costs, and what makes each trip different.
          </p>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: 'rgba(48,51,47,0.3)' }} strokeWidth={1.5} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by destination, activity, or operator..."
                className="w-full pl-12 pr-4 py-4 text-sm font-light transition-all duration-300"
                style={{
                  backgroundColor: 'rgba(246,242,233,0.95)',
                  border: '1px solid rgba(38,61,53,0.1)',
                  borderRadius: '8px',
                  color: '#263D35',
                  outline: 'none',
                  boxShadow: '0 4px 24px rgba(38,61,53,0.15)',
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.1)'}
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={scrollDown}
              className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
              style={{ backgroundColor: '#F6F2E9', color: '#263D35', border: '1px solid #F6F2E9' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.border = '1px solid rgba(246,242,233,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#F6F2E9'; e.currentTarget.style.color = '#263D35'; e.currentTarget.style.border = '1px solid #F6F2E9'; }}
            >
              Explore Packages
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={handleListClick}
              className="inline-flex items-center gap-2 px-6 py-4 text-sm tracking-[0.12em] uppercase font-light transition-all duration-300"
              style={{ color: 'rgba(246,242,233,0.7)', border: '1px solid rgba(246,242,233,0.2)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F6F2E9'; e.currentTarget.style.borderColor = 'rgba(246,242,233,0.4)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(246,242,233,0.7)'; e.currentTarget.style.borderColor = 'rgba(246,242,233,0.2)'; }}
            >
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              List Your Tour
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

      {/* ── MARKETPLACE ── */}
      <section className="py-16 lg:py-20" style={{ backgroundColor: '#F6F2E9' }}>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12">
          {/* Results header */}
          <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(48,51,47,0.4)' }}>Marketplace</p>
              <h2 className="font-display text-3xl md:text-4xl font-light" style={{ color: '#263D35' }}>
                {loading ? 'Loading packages...' : `${filteredPackages.length} package${filteredPackages.length !== 1 ? 's' : ''} available`}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-light p-2.5 transition-all duration-300"
                style={{
                  border: '1px solid rgba(38,61,53,0.15)',
                  borderRadius: '6px',
                  backgroundColor: 'transparent',
                  color: '#263D35',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {SORT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>

              {/* Mobile filter toggle */}
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden inline-flex items-center gap-2 px-4 py-2.5 text-xs tracking-[0.12em] uppercase font-light transition-all duration-300"
                style={{
                  border: hasActiveFilters ? '1px solid rgba(182,154,99,0.4)' : '1px solid rgba(38,61,53,0.15)',
                  color: hasActiveFilters ? '#B69A63' : 'rgba(48,51,47,0.5)',
                  backgroundColor: hasActiveFilters ? 'rgba(182,154,99,0.06)' : 'transparent',
                  borderRadius: '6px',
                }}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
                Filters
                {hasActiveFilters && <span className="font-mono text-[9px]">({[searchQuery, filterType, filterDestination, filterDifficulty, filterPriceRange, filterDuration, filterBookingType, filterVerifiedOnly, filterAccommodation, filterTransport].filter(Boolean).length})</span>}
              </button>
            </div>
          </div>

          {/* Active filter chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5" style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '4px' }}>
                  "{searchQuery}" <button onClick={() => setSearchQuery('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {filterType && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5" style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '4px' }}>
                  {TOUR_TYPE_LABELS[filterType] || filterType} <button onClick={() => setFilterType('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {filterDestination && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5" style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '4px' }}>
                  {filterDestination} <button onClick={() => setFilterDestination('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {filterDifficulty && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5" style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '4px' }}>
                  {DIFFICULTY_LABELS[filterDifficulty] || filterDifficulty} <button onClick={() => setFilterDifficulty('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {filterPriceRange && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5" style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '4px' }}>
                  {PRICE_RANGES.find(r => r.value === filterPriceRange)?.label} <button onClick={() => setFilterPriceRange('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {filterDuration && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5" style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '4px' }}>
                  {DURATION_OPTIONS.find(d => d.value === filterDuration)?.label} <button onClick={() => setFilterDuration('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {filterBookingType && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5" style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '4px' }}>
                  {filterBookingType === 'instant' ? 'Instant Booking' : 'Request to Book'} <button onClick={() => setFilterBookingType('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {filterAccommodation && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5" style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '4px' }}>
                  {filterAccommodation} <button onClick={() => setFilterAccommodation('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {filterTransport && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5" style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '4px' }}>
                  {filterTransport} <button onClick={() => setFilterTransport('')}><X className="h-3 w-3" /></button>
                </span>
              )}
              {filterVerifiedOnly && (
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5" style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '4px' }}>
                  Verified Only <button onClick={() => setFilterVerifiedOnly(false)}><X className="h-3 w-3" /></button>
                </span>
              )}
              <button
                onClick={clearAllFilters}
                className="font-mono text-[9px] tracking-[0.12em] uppercase transition-colors duration-300 ml-2"
                style={{ color: '#B69A63' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#263D35'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#B69A63'; }}
              >
                Clear All
              </button>
            </div>
          )}

          <div className="flex gap-8">
            {/* Desktop filter sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 p-5" style={{ border: '1px solid rgba(38,61,53,0.1)', borderRadius: '10px', backgroundColor: '#FBF8F1' }}>
                <div className="flex items-center justify-between mb-5">
                  <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(48,51,47,0.4)' }}>Filters</p>
                  {hasActiveFilters && (
                    <button onClick={clearAllFilters} className="font-mono text-[8px] tracking-[0.12em] uppercase transition-colors" style={{ color: '#B69A63' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#263D35'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#B69A63'; }}>
                      Reset
                    </button>
                  )}
                </div>
                <FilterSection />
              </div>
            </aside>

            {/* Mobile filter panel */}
            {showMobileFilters && (
              <div className="lg:hidden fixed inset-0 z-30 overflow-y-auto">
                <div className="absolute inset-0" style={{ backgroundColor: 'rgba(38,61,53,0.6)' }} onClick={() => setShowMobileFilters(false)} />
                <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] p-6 overflow-y-auto" style={{ backgroundColor: '#FBF8F1' }}>
                  <div className="flex items-center justify-between mb-6">
                    <p className="font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: '#263D35' }}>Filters</p>
                    <button onClick={() => setShowMobileFilters(false)}><X className="h-5 w-5" style={{ color: 'rgba(48,51,47,0.4)' }} strokeWidth={1.5} /></button>
                  </div>
                  <FilterSection />
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full mt-6 py-3 text-xs tracking-[0.12em] uppercase font-light"
                    style={{ backgroundColor: '#263D35', color: '#F6F2E9', borderRadius: '6px' }}
                  >
                    Show {filteredPackages.length} results
                  </button>
                </div>
              </div>
            )}

            {/* Package grid */}
            <div className="flex-1">
              {loading && (
                <div className="flex items-center justify-center py-20">
                  <Loader className="h-6 w-6 animate-spin" style={{ color: '#B69A63' }} strokeWidth={1.5} />
                  <span className="ml-3 font-mono text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(48,51,47,0.4)' }}>Loading packages...</span>
                </div>
              )}

              {fetchError && !loading && (
                <div className="text-center py-20">
                  <p className="text-sm font-light mb-4" style={{ color: 'rgba(48,51,47,0.5)' }}>Unable to load packages at this time.</p>
                  <button onClick={fetchPackages} className="font-mono text-[10px] tracking-[0.2em] uppercase px-5 py-2" style={{ border: '1px solid rgba(38,61,53,0.2)', color: '#263D35', borderRadius: '6px' }}>Retry</button>
                </div>
              )}

              {!loading && !fetchError && filteredPackages.length === 0 && packages.length === 0 && (
                <div className="text-center py-20">
                  <Compass className="mx-auto h-10 w-10 mb-6" style={{ color: 'rgba(48,51,47,0.15)' }} strokeWidth={1} />
                  <p className="font-display text-xl font-light italic mb-3" style={{ color: 'rgba(48,51,47,0.5)' }}>
                    No packages published yet.
                  </p>
                  <p className="text-sm font-light mb-8" style={{ color: 'rgba(48,51,47,0.4)' }}>
                    Be the first to list your adventure on Woander.
                  </p>
                  <button
                    onClick={handleListClick}
                    className="inline-flex items-center gap-2 px-8 py-3 text-sm tracking-[0.15em] uppercase transition-all duration-300"
                    style={{ backgroundColor: '#263D35', color: '#F6F2E9', border: '1px solid #263D35', borderRadius: '6px' }}
                  >
                    <Plus className="h-4 w-4" strokeWidth={1.5} />
                    List Your Tour
                  </button>
                </div>
              )}

              {!loading && !fetchError && filteredPackages.length === 0 && packages.length > 0 && (
                <div className="text-center py-20">
                  <p className="font-display text-xl font-light italic mb-3" style={{ color: 'rgba(48,51,47,0.5)' }}>
                    No packages match your filters.
                  </p>
                  <button onClick={clearAllFilters} className="font-mono text-[10px] tracking-[0.2em] uppercase px-5 py-2" style={{ border: '1px solid rgba(38,61,53,0.2)', color: '#263D35', borderRadius: '6px' }}>Clear filters</button>
                </div>
              )}

              {!loading && !fetchError && filteredPackages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredPackages.map(pkg => (
                    <PackageCard
                      key={pkg.id}
                      pkg={pkg}
                      onViewDetails={handleViewDetails}
                      onCompare={handleCompare}
                      isSelected={compareList.some(p => p.id === pkg.id)}
                      disabled={compareList.length >= 3 && !compareList.some(p => p.id === pkg.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── OPERATOR CTA ── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: '#263D35' }}>
        <div className="max-w-3xl mx-auto px-6 sm:px-10 lg:px-16 text-center">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(201,168,74,0.4)' }}>For Operators</p>
          <h2 className="font-display text-3xl md:text-5xl font-light leading-tight mb-6" style={{ color: '#F6F2E9' }}>
            Run trips worth<br />taking <em className="italic" style={{ color: '#E7D9C5' }}>seriously?</em>
          </h2>
          <p className="font-display italic text-lg font-light mb-12 max-w-xl mx-auto leading-relaxed" style={{ color: 'rgba(231,217,197,0.6)' }}>
            List your tours on Woander. Reach travelers who care about what's included,
            who's running the trip, and what makes it different.
          </p>
          <button
            onClick={handleListClick}
            className="inline-flex items-center gap-3 px-10 py-4 text-sm tracking-[0.15em] uppercase font-medium transition-all duration-300"
            style={{ border: '1px solid rgba(246,242,233,0.25)', color: '#F6F2E9', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F6F2E9'; e.currentTarget.style.color = '#263D35'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#F6F2E9'; }}
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            List Your Tour
          </button>
        </div>
      </section>

      {/* ── COMPARE BAR ── */}
      {compareList.length > 0 && !showCompare && (
        <div className="fixed bottom-0 left-0 right-0 z-30 px-6 py-4" style={{ backgroundColor: 'rgba(38,61,53,0.97)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(201,168,74,0.2)' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5" style={{ color: '#B69A63' }} strokeWidth={1.5} />
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: 'rgba(246,242,233,0.7)' }}>
                {compareList.length}/3 selected for comparison
              </span>
              <div className="hidden sm:flex items-center gap-2 ml-3">
                {compareList.map(p => (
                  <span key={p.id} className="font-mono text-[9px] tracking-[0.12em] uppercase px-2.5 py-1" style={{ border: '1px solid rgba(201,168,74,0.25)', color: 'rgba(231,217,197,0.6)', borderRadius: '3px' }}>
                    {p.title.slice(0, 20)}{p.title.length > 20 ? '...' : ''}
                    <button onClick={() => handleRemoveCompare(p.id)} className="ml-1.5"><X className="h-3 w-3 inline" strokeWidth={1.5} /></button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setCompareList([])} className="font-mono text-[9px] tracking-[0.12em] uppercase transition-colors" style={{ color: 'rgba(246,242,233,0.4)' }} onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(246,242,233,0.7)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(246,242,233,0.4)'; }}>
                Clear
              </button>
              <button
                onClick={() => setShowCompare(true)}
                disabled={compareList.length < 2}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs tracking-[0.12em] uppercase font-light transition-all duration-300"
                style={{
                  backgroundColor: compareList.length >= 2 ? '#B69A63' : 'rgba(182,154,99,0.2)',
                  color: compareList.length >= 2 ? '#263D35' : 'rgba(246,242,233,0.4)',
                  borderRadius: '6px',
                  cursor: compareList.length >= 2 ? 'pointer' : 'not-allowed',
                }}
              >
                Compare Now
                {compareList.length < 2 && <span className="font-mono text-[8px]">({2 - compareList.length} more needed)</span>}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      {/* Modals */}
      <PackageDetailModal
        pkg={selectedPkg as MarketplacePackage}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
      <CompareDrawer
        packages={compareList}
        onRemove={handleRemoveCompare}
        onClear={() => { setCompareList([]); setShowCompare(false); }}
        onViewDetails={(pkg) => { setShowCompare(false); setSelectedPkg(pkg); setShowDetailModal(true); }}
        isOpen={showCompare}
      />
      <ListYourTourModal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        onSuccess={fetchPackages}
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

export default AdventuresPage;
