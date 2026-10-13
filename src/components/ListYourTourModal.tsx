import React, { useState } from 'react';
import {
  X, Check, Loader, Plus, Trash2, ArrowRight, ArrowLeft, Eye, AlertCircle,
  Instagram, Globe,
} from 'lucide-react';
import { supabase } from '../shared/supabase';
import { useAuth } from '../shared/AuthContext';
import {
  TOUR_TYPE_LABELS, DIFFICULTY_LABELS, ACCOMMODATION_OPTIONS, TRANSPORT_OPTIONS, MEAL_OPTIONS, EQUIPMENT_OPTIONS,
} from './marketplaceTypes';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEPS = ['Package Details', 'Itinerary & Inclusions', 'Operator Info', 'Review & Submit'];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  border: '1px solid rgba(38,61,53,0.15)',
  borderRadius: '6px',
  backgroundColor: 'transparent',
  color: '#263D35',
  fontSize: '14px',
  fontFamily: 'Inter, system-ui, sans-serif',
  fontWeight: 300,
  outline: 'none',
  transition: 'border-color 0.3s',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: '9px',
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
  color: 'rgba(48,51,47,0.5)',
  marginBottom: '6px',
};

const ListYourTourModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [destination, setDestination] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [locationState, setLocationState] = useState('');
  const [tourType, setTourType] = useState('adventure');
  const [durationDays, setDurationDays] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [pricePerPerson, setPricePerPerson] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [maxGroupSize, setMaxGroupSize] = useState('10');
  const [minGroupSize, setMinGroupSize] = useState('1');
  const [difficulty, setDifficulty] = useState('moderate');
  const [bookingType, setBookingType] = useState('enquiry');
  const [featuredImage, setFeaturedImage] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [transport, setTransport] = useState('');
  const [mealsIncluded, setMealsIncluded] = useState<string[]>([]);
  const [equipmentIncluded, setEquipmentIncluded] = useState<string[]>([]);
  const [guideIncluded, setGuideIncluded] = useState(true);
  const [includedItems, setIncludedItems] = useState<string[]>([]);
  const [excludedItems, setExcludedItems] = useState<string[]>([]);
  const [cancellationPolicy, setCancellationPolicy] = useState('Free cancellation up to 7 days before departure. 50% refund for cancellations 3-7 days before. No refund for cancellations within 72 hours of departure.');
  const [pricingNotes, setPricingNotes] = useState('');
  const [itinerary, setItinerary] = useState<{ day: number; title: string; description: string }[]>([
    { day: 1, title: '', description: '' },
  ]);
  const [operatorName, setOperatorName] = useState('');
  const [operatorInstagram, setOperatorInstagram] = useState('');
  const [operatorWebsite, setOperatorWebsite] = useState('');
  const [operatorPhone, setOperatorPhone] = useState('');
  const [operatorEmail, setOperatorEmail] = useState('');

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(38,61,53,0.88)', backdropFilter: 'blur(6px)' }} onClick={onClose} />
        <div className="relative p-10 text-center max-w-md" style={{ backgroundColor: '#FBF8F1', borderRadius: '12px' }}>
          <AlertCircle className="h-8 w-8 mx-auto mb-4" style={{ color: '#B69A63' }} strokeWidth={1.5} />
          <h3 className="font-display text-xl font-light mb-2" style={{ color: '#263D35' }}>Please sign in to list your tour</h3>
          <p className="text-sm font-light mb-6" style={{ color: 'rgba(48,51,47,0.45)' }}>You need an account to publish a package on Woander.</p>
          <button onClick={onClose} className="font-mono text-[10px] tracking-[0.15em] uppercase px-6 py-2.5" style={{ border: '1px solid rgba(38,61,53,0.15)', color: '#263D35', borderRadius: '6px' }}>Close</button>
        </div>
      </div>
    );
  }

  const toggleArrayItem = (arr: string[], setArr: (v: string[]) => void, item: string) => {
    setArr(arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]);
  };

  const validateStep = (): boolean => {
    setError('');
    if (step === 0) {
      if (!title.trim()) { setError('Package title is required.'); return false; }
      if (!description.trim() || description.trim().length < 50) { setError('Description must be at least 50 characters.'); return false; }
      if (!destination.trim() && !locationCity.trim()) { setError('Destination or city is required.'); return false; }
      if (!pricePerPerson || parseFloat(pricePerPerson) <= 0) { setError('Price per person is required.'); return false; }
    }
    if (step === 2) {
      if (!operatorName.trim()) { setError('Operator name is required.'); return false; }
      if (!operatorEmail.trim() && !operatorPhone.trim()) { setError('At least one contact method (email or phone) is required.'); return false; }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError('');
    setStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async (asDraft: boolean) => {
    setError('');
    setSubmitting(true);
    try {
      // Find or create a minimal guide profile for this user
      const { data: existingGuide } = await supabase
        .from('tour_guides')
        .select('id')
        .eq('user_id', user!.id)
        .maybeSingle();

      let guideId = existingGuide?.id;

      if (!guideId) {
        const { data: newGuide, error: guideErr } = await supabase
          .from('tour_guides')
          .insert({
            user_id: user!.id,
            full_name: operatorName || user!.email || 'Independent Operator',
            status: 'approved',
            is_active: true,
            location_city: locationCity,
            location_state: locationState,
            email: operatorEmail,
            phone: operatorPhone,
          })
          .select('id')
          .maybeSingle();

        if (guideErr || !newGuide) {
          setError('Could not create operator profile: ' + (guideErr?.message || 'Unknown error'));
          setSubmitting(false);
          return;
        }
        guideId = newGuide.id;
      }

      const { data: submission, error: submissionError } = await supabase.functions.invoke('submit-worthy-place', {
        body: {
        kind: 'tour_package',
        guide_id: guideId,
        title: title.trim(),
        description: description.trim(),
        tour_type: tourType,
        duration_hours: durationHours ? parseFloat(durationHours) : (durationDays ? parseFloat(durationDays) * 24 : 4),
        duration_days: durationDays ? parseInt(durationDays) : null,
        price_per_person: parseFloat(pricePerPerson),
        currency,
        max_group_size: parseInt(maxGroupSize) || 10,
        min_group_size: parseInt(minGroupSize) || 1,
        difficulty_level: difficulty,
        booking_type: bookingType,
        featured_image: featuredImage.trim() || null,
        location_city: locationCity.trim(),
        location_state: locationState.trim(),
        destination: destination.trim() || null,
        accommodation_type: accommodation || null,
        transport_type: transport || null,
        meals_included: mealsIncluded,
        equipment_included: equipmentIncluded,
        guide_included: guideIncluded,
        included_items: includedItems,
        excluded_items: excludedItems,
        cancellation_policy: cancellationPolicy.trim(),
        pricing_notes: pricingNotes.trim() || null,
        itinerary: itinerary.filter(d => d.title.trim() || d.description.trim()),
        operator_name: operatorName.trim(),
        operator_instagram: operatorInstagram.trim() || null,
        operator_website: operatorWebsite.trim() || null,
        operator_phone: operatorPhone.trim() || null,
        operator_email: operatorEmail.trim() || null,
        package_status: asDraft ? 'draft' : 'pending_review',
        },
      });

      if (submissionError || !submission?.success) {
        const errMsg = submission?.error || submissionError?.message || 'The package could not be saved.';
        setError('Could not save package: ' + errMsg);
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
        onClose();
        // Reset form
        setStep(0);
        setTitle(''); setDescription(''); setDestination(''); setLocationCity(''); setLocationState('');
        setTourType('adventure'); setDurationDays(''); setDurationHours(''); setPricePerPerson('');
        setMaxGroupSize('10'); setMinGroupSize('1'); setDifficulty('moderate'); setBookingType('enquiry');
        setFeaturedImage(''); setAccommodation(''); setTransport(''); setMealsIncluded([]); setEquipmentIncluded([]);
        setGuideIncluded(true); setIncludedItems([]); setExcludedItems([]); setPricingNotes('');
        setItinerary([{ day: 1, title: '', description: '' }]);
        setOperatorName(''); setOperatorInstagram(''); setOperatorWebsite(''); setOperatorPhone(''); setOperatorEmail('');
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError('Submission failed: ' + msg);
      setSubmitting(false);
    }
  };

  const chipStyle = (selected: boolean): React.CSSProperties => ({
    border: selected ? '1px solid rgba(182,154,99,0.4)' : '1px solid rgba(38,61,53,0.12)',
    backgroundColor: selected ? 'rgba(182,154,99,0.06)' : 'transparent',
    color: selected ? '#263D35' : 'rgba(48,51,47,0.5)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen p-4 sm:p-6">
        <div className="fixed inset-0" style={{ backgroundColor: 'rgba(38,61,53,0.88)', backdropFilter: 'blur(6px)' }} onClick={onClose} />

        <div className="relative w-full max-w-3xl my-4 max-h-[92vh] overflow-y-auto" style={{ backgroundColor: '#FBF8F1', borderRadius: '12px', boxShadow: '0 16px 48px rgba(38,61,53,0.3)' }}>
          {/* Close */}
          <button onClick={onClose} className="absolute top-5 right-5 z-10 transition-colors" style={{ color: 'rgba(48,51,47,0.4)' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#263D35'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(48,51,47,0.4)'; }}>
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {success ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="flex items-center justify-center mb-6 animate-discovery-pulse" style={{ width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(201,168,74,0.3)', background: 'radial-gradient(circle, rgba(201,168,74,0.1) 0%, transparent 70%)' }}>
                <Check className="w-6 h-6" style={{ color: '#B69A63' }} strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-2xl font-light mb-2" style={{ color: '#263D35' }}>Your package has been submitted</h3>
              <p className="text-sm font-light" style={{ color: 'rgba(48,51,47,0.45)' }}>It will appear in the marketplace once reviewed by our team.</p>
            </div>
          ) : (
            <div className="p-6 sm:p-10">
              {/* Header */}
              <div className="mb-8">
                <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(48,51,47,0.4)' }}>List Your Tour</p>
                <h2 className="font-display text-2xl sm:text-3xl font-light mb-2" style={{ color: '#263D35' }}>Publish your <em className="italic" style={{ color: '#B77B65' }}>adventure.</em></h2>
                <p className="text-sm font-light" style={{ color: 'rgba(48,51,47,0.45)' }}>Share your package with travelers looking for authentic experiences.</p>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-8">
                {STEPS.map((s, i) => (
                  <React.Fragment key={s}>
                    <div
                      className="flex items-center gap-2 transition-all duration-300"
                      style={{ opacity: i <= step ? 1 : 0.3 }}
                    >
                      <div
                        className="flex items-center justify-center transition-all duration-300"
                        style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          border: i === step ? '1px solid #B69A63' : i < step ? '1px solid #B69A63' : '1px solid rgba(38,61,53,0.15)',
                          backgroundColor: i < step ? '#B69A63' : 'transparent',
                          color: i < step ? '#FBF8F1' : '#263D35',
                          fontSize: '11px',
                          fontFamily: 'JetBrains Mono, monospace',
                        }}
                      >
                        {i < step ? <Check className="h-3 w-3" strokeWidth={2} /> : i + 1}
                      </div>
                      <span className="font-mono text-[8px] tracking-[0.12em] uppercase hidden sm:inline" style={{ color: i <= step ? '#263D35' : 'rgba(48,51,47,0.35)' }}>{s}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 h-px mx-1" style={{ backgroundColor: i < step ? '#B69A63' : 'rgba(38,61,53,0.1)', transition: 'background-color 0.3s' }} />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-4 py-3 mb-6" style={{ border: '1px solid rgba(185,120,98,0.2)', backgroundColor: 'rgba(185,120,98,0.05)', borderRadius: '6px' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" style={{ color: '#B97862' }} strokeWidth={1.5} />
                  <p className="text-sm font-light" style={{ color: '#B97862' }}>{error}</p>
                </div>
              )}

              {/* Step 0: Package Details */}
              {step === 0 && (
                <div className="space-y-5">
                  <div>
                    <label style={labelStyle}>Package Title *</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., 7-Day Spiti Valley Circuit Adventure" style={inputStyle} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Description * <span style={{ textTransform: 'none', letterSpacing: '0', color: 'rgba(48,51,47,0.3)' }}>(min 50 characters)</span></label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what makes this trip unique, what travelers will experience, and why they should choose it..." rows={4} style={{ ...inputStyle, resize: 'none' }} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                    <p className="font-mono text-[9px] mt-1" style={{ color: 'rgba(48,51,47,0.3)' }}>{description.length} characters</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label style={labelStyle}>Destination / Region *</label>
                      <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g., Spiti Valley, Himachal Pradesh" style={inputStyle} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Activity Type</label>
                      <select value={tourType} onChange={(e) => setTourType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {Object.entries(TOUR_TYPE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label style={labelStyle}>Duration (days)</label>
                      <input type="number" min="0" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} placeholder="e.g., 7" style={inputStyle} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Or Hours</label>
                      <input type="number" min="0" value={durationHours} onChange={(e) => setDurationHours(e.target.value)} placeholder="e.g., 6" style={inputStyle} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Price / Person *</label>
                      <input type="number" min="0" value={pricePerPerson} onChange={(e) => setPricePerPerson(e.target.value)} placeholder="e.g., 35000" style={inputStyle} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Currency</label>
                      <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label style={labelStyle}>Min Group Size</label>
                      <input type="number" min="1" value={minGroupSize} onChange={(e) => setMinGroupSize(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Max Group Size</label>
                      <input type="number" min="1" value={maxGroupSize} onChange={(e) => setMaxGroupSize(e.target.value)} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Difficulty</label>
                      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        {Object.entries(DIFFICULTY_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Booking Type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setBookingType('enquiry')} className="p-3 text-center transition-all duration-300" style={chipStyle(bookingType === 'enquiry')}>
                        <p className="font-display text-sm font-light">Request to Book</p>
                        <p className="font-mono text-[8px] mt-1" style={{ opacity: 0.5 }}>Traveler sends enquiry, you confirm</p>
                      </button>
                      <button type="button" onClick={() => setBookingType('instant')} className="p-3 text-center transition-all duration-300" style={chipStyle(bookingType === 'instant')}>
                        <p className="font-display text-sm font-light">Instant Booking</p>
                        <p className="font-mono text-[8px] mt-1" style={{ opacity: 0.5 }}>Traveler books immediately</p>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={labelStyle}>Cover Image URL</label>
                    <input type="text" value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="https://..." style={inputStyle} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                  </div>
                </div>
              )}

              {/* Step 1: Itinerary & Inclusions */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Itinerary */}
                  <div>
                    <label style={labelStyle}>Day-by-Day Itinerary</label>
                    <div className="space-y-3">
                      {itinerary.map((day, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center" style={{ border: '1px solid rgba(38,61,53,0.12)', borderRadius: '50%' }}>
                            <span className="font-mono text-[10px]" style={{ color: 'rgba(48,51,47,0.4)' }}>{day.day}</span>
                          </div>
                          <div className="flex-1 space-y-2">
                            <input type="text" value={day.title} onChange={(e) => { const next = [...itinerary]; next[i] = { ...day, title: e.target.value }; setItinerary(next); }} placeholder="Day title (e.g., Drive to Chandratal Lake)" style={inputStyle} />
                            <textarea value={day.description} onChange={(e) => { const next = [...itinerary]; next[i] = { ...day, description: e.target.value }; setItinerary(next); }} placeholder="Brief description of the day's activities..." rows={2} style={{ ...inputStyle, resize: 'none' }} />
                          </div>
                          {itinerary.length > 1 && (
                            <button type="button" onClick={() => setItinerary(itinerary.filter((_, idx) => idx !== i))} className="p-2 mt-1 transition-colors" style={{ color: 'rgba(48,51,47,0.3)' }}>
                              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setItinerary([...itinerary, { day: itinerary.length + 1, title: '', description: '' }])} className="inline-flex items-center gap-2 mt-3 font-mono text-[9px] tracking-[0.12em] uppercase transition-colors" style={{ color: '#B69A63' }}>
                      <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />Add Day
                    </button>
                  </div>

                  {/* Accommodation & Transport */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label style={labelStyle}>Accommodation</label>
                      <select value={accommodation} onChange={(e) => setAccommodation(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">Select...</option>
                        {ACCOMMODATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Transport</label>
                      <select value={transport} onChange={(e) => setTransport(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                        <option value="">Select...</option>
                        {TRANSPORT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Meals */}
                  <div>
                    <label style={labelStyle}>Meals Included</label>
                    <div className="flex flex-wrap gap-2">
                      {MEAL_OPTIONS.map(meal => (
                        <button key={meal} type="button" onClick={() => toggleArrayItem(mealsIncluded, setMealsIncluded, meal)} className="font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-2" style={chipStyle(mealsIncluded.includes(meal))}>{meal}</button>
                      ))}
                    </div>
                  </div>

                  {/* Equipment */}
                  <div>
                    <label style={labelStyle}>Equipment Included</label>
                    <div className="flex flex-wrap gap-2">
                      {EQUIPMENT_OPTIONS.map(eq => (
                        <button key={eq} type="button" onClick={() => toggleArrayItem(equipmentIncluded, setEquipmentIncluded, eq)} className="font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-2" style={chipStyle(equipmentIncluded.includes(eq))}>{eq}</button>
                      ))}
                    </div>
                  </div>

                  {/* Guide */}
                  <div>
                    <label style={labelStyle}>Guide Included?</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setGuideIncluded(true)} className="p-2.5 text-center font-display text-sm font-light" style={chipStyle(guideIncluded)}>Yes, guide included</button>
                      <button type="button" onClick={() => setGuideIncluded(false)} className="p-2.5 text-center font-display text-sm font-light" style={chipStyle(!guideIncluded)}>No guide</button>
                    </div>
                  </div>

                  {/* Included items (custom) */}
                  <div>
                    <label style={labelStyle}>Additional Inclusions</label>
                    <p className="text-xs font-light mb-2" style={{ color: 'rgba(48,51,47,0.35)' }}>Press Enter to add each item</p>
                    <input
                      type="text"
                      placeholder="e.g., Permits, Entry tickets..."
                      style={inputStyle}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          e.preventDefault();
                          setIncludedItems([...includedItems, e.currentTarget.value.trim()]);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    {includedItems.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {includedItems.map((item, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-2.5 py-1" style={{ border: '1px solid rgba(182,154,99,0.3)', color: 'rgba(48,51,47,0.5)', borderRadius: '3px' }}>
                            {item}
                            <button type="button" onClick={() => setIncludedItems(includedItems.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Excluded items (custom) */}
                  <div>
                    <label style={labelStyle}>Exclusions</label>
                    <input
                      type="text"
                      placeholder="e.g., Personal expenses, Travel insurance..."
                      style={inputStyle}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                          e.preventDefault();
                          setExcludedItems([...excludedItems, e.currentTarget.value.trim()]);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    {excludedItems.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {excludedItems.map((item, i) => (
                          <span key={i} className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.12em] uppercase px-2.5 py-1" style={{ border: '1px solid rgba(48,51,47,0.15)', color: 'rgba(48,51,47,0.4)', borderRadius: '3px' }}>
                            {item}
                            <button type="button" onClick={() => setExcludedItems(excludedItems.filter((_, idx) => idx !== i))}><X className="h-3 w-3" /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Cancellation + Pricing notes */}
                  <div>
                    <label style={labelStyle}>Cancellation Policy</label>
                    <textarea value={cancellationPolicy} onChange={(e) => setCancellationPolicy(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'none' }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Pricing Notes <span style={{ textTransform: 'none', letterSpacing: '0', color: 'rgba(48,51,47,0.3)' }}>(optional)</span></label>
                    <input type="text" value={pricingNotes} onChange={(e) => setPricingNotes(e.target.value)} placeholder="e.g., Group discount for 4+ travelers" style={inputStyle} />
                  </div>
                </div>
              )}

              {/* Step 2: Operator Info */}
              {step === 2 && (
                <div className="space-y-5">
                  <div>
                    <label style={labelStyle}>Operator / Business Name *</label>
                    <input type="text" value={operatorName} onChange={(e) => setOperatorName(e.target.value)} placeholder="e.g., Himalayan Trails Co." style={inputStyle} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input type="email" value={operatorEmail} onChange={(e) => setOperatorEmail(e.target.value)} placeholder="contact@yourbusiness.com" style={inputStyle} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                    </div>
                    <div>
                      <label style={labelStyle}>Phone *</label>
                      <input type="tel" value={operatorPhone} onChange={(e) => setOperatorPhone(e.target.value)} placeholder="+91 98765 43210" style={inputStyle} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label style={labelStyle}>Instagram Profile</label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(48,51,47,0.3)' }} strokeWidth={1.5} />
                        <input type="text" value={operatorInstagram} onChange={(e) => setOperatorInstagram(e.target.value)} placeholder="https://instagram.com/..." style={{ ...inputStyle, paddingLeft: '36px' }} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'rgba(48,51,47,0.3)' }} strokeWidth={1.5} />
                        <input type="text" value={operatorWebsite} onChange={(e) => setOperatorWebsite(e.target.value)} placeholder="https://..." style={{ ...inputStyle, paddingLeft: '36px' }} onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(182,154,99,0.4)'} onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(38,61,53,0.15)'} />
                      </div>
                    </div>
                  </div>
                  <div className="p-4" style={{ border: '1px solid rgba(38,61,53,0.1)', borderRadius: '6px', backgroundColor: 'rgba(182,154,99,0.04)' }}>
                    <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(48,51,47,0.45)' }}>
                      Your package will be reviewed by the Woander team before it appears in the marketplace.
                      Verification badges are awarded to operators who demonstrate consistent quality and reliability —
                      they are not guaranteed upon submission.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-5">
                  <p className="font-mono text-[10px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.4)' }}>Review your package</p>
                  <div className="p-5" style={{ border: '1px solid rgba(38,61,53,0.1)', borderRadius: '8px', backgroundColor: '#F6F2E9' }}>
                    <h3 className="font-display text-xl font-light mb-3" style={{ color: '#263D35' }}>{title || 'Untitled Package'}</h3>
                    <p className="text-sm font-light mb-4" style={{ color: 'rgba(48,51,47,0.5)' }}>{description.slice(0, 150)}{description.length > 150 ? '...' : ''}</p>
                    <div className="grid grid-cols-2 gap-3 text-xs font-light" style={{ color: 'rgba(48,51,47,0.5)' }}>
                      <p><strong style={{ color: '#263D35' }}>Destination:</strong> {destination || locationCity || '—'}</p>
                      <p><strong style={{ color: '#263D35' }}>Type:</strong> {TOUR_TYPE_LABELS[tourType] || tourType}</p>
                      <p><strong style={{ color: '#263D35' }}>Duration:</strong> {durationDays ? `${durationDays} days` : durationHours ? `${durationHours} hours` : '—'}</p>
                      <p><strong style={{ color: '#263D35' }}>Price:</strong> {pricePerPerson ? `${currency === 'INR' ? '₹' : '$'}${pricePerPerson}` : '—'}/person</p>
                      <p><strong style={{ color: '#263D35' }}>Group:</strong> {minGroupSize}–{maxGroupSize}</p>
                      <p><strong style={{ color: '#263D35' }}>Difficulty:</strong> {DIFFICULTY_LABELS[difficulty] || difficulty}</p>
                      <p><strong style={{ color: '#263D35' }}>Booking:</strong> {bookingType === 'instant' ? 'Instant' : 'Enquiry'}</p>
                      <p><strong style={{ color: '#263D35' }}>Operator:</strong> {operatorName || '—'}</p>
                    </div>
                    {itinerary.filter(d => d.title).length > 0 && (
                      <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(38,61,53,0.08)' }}>
                        <p className="font-mono text-[9px] tracking-[0.12em] uppercase mb-2" style={{ color: 'rgba(48,51,47,0.35)' }}>Itinerary: {itinerary.filter(d => d.title).length} days</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSubmit(true)}
                      disabled={submitting}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 text-xs tracking-[0.12em] uppercase font-light transition-all duration-300"
                      style={{ border: '1px solid rgba(38,61,53,0.15)', color: 'rgba(48,51,47,0.5)', borderRadius: '6px', cursor: submitting ? 'wait' : 'pointer' }}
                    >
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.5} /> Save as Draft
                    </button>
                    <button
                      onClick={() => handleSubmit(false)}
                      disabled={submitting}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 text-xs tracking-[0.12em] uppercase font-light transition-all duration-300"
                      style={{ backgroundColor: '#263D35', color: '#F6F2E9', borderRadius: '6px', cursor: submitting ? 'wait' : 'pointer' }}
                      onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.backgroundColor = '#1a2e24'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#263D35'; }}
                    >
                      {submitting ? <><Loader className="h-4 w-4 animate-spin" strokeWidth={1.5} /> Submitting...</> : <>Submit for Review <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} /></>}
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              {step < 3 && (
                <div className="flex items-center justify-between mt-8 pt-6" style={{ borderTop: '1px solid rgba(38,61,53,0.08)' }}>
                  <button
                    onClick={handleBack}
                    disabled={step === 0}
                    className="inline-flex items-center gap-2 font-mono text-[9px] tracking-[0.12em] uppercase transition-all duration-300"
                    style={{ color: step === 0 ? 'rgba(48,51,47,0.2)' : 'rgba(48,51,47,0.5)', cursor: step === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Back
                  </button>
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center gap-2 px-6 py-2.5 font-mono text-[9px] tracking-[0.12em] uppercase transition-all duration-300"
                    style={{ backgroundColor: '#263D35', color: '#F6F2E9', borderRadius: '6px' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a2e24'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#263D35'; }}
                  >
                    Continue <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListYourTourModal;
