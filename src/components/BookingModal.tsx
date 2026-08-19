import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Minus, Plus, MapPin, Star, Globe, AlertCircle, Loader, Clock } from 'lucide-react';
import type { TourGuide, Tour } from '../shared/supabase';
import { vanguardService } from '../services/vanguardService';
import { useAuth } from '../shared/AuthContext';
import { supabase } from '../shared/supabase';

// Format a Date as YYYY-MM-DD in local time (not UTC), avoiding the common
// off-by-one caused by toISOString().
const formatLocalDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const TIME_SLOTS = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00',
];

const ARCHETYPE_FALLBACK: Record<string, string> = {
  cultural: 'Storykeeper',
  adventure: 'Pathfinder',
  food: 'Food Explorer',
  history: 'Historian',
  nature: 'Naturalist',
  photography: 'Photographer',
  walking: 'Pathfinder',
  cycling: 'Adventure Specialist',
  wildlife: 'Naturalist',
  spiritual: 'Storykeeper',
};

interface BookingModalProps {
  guide: TourGuide;
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3 | 4;

const BookingModal: React.FC<BookingModalProps> = ({ guide, isOpen, onClose }) => {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [tours, setTours] = useState<Tour[]>([]);
  const [toursLoading, setToursLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');

  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('09:00');
  const [groupSize, setGroupSize] = useState(1);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [error, setError] = useState('');
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(new Set());
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<Record<string, string>>({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTours();
      loadAvailability();
      if (user?.email) setContactEmail(user.email);
      if (user?.user_metadata?.full_name) setContactName(user.user_metadata.full_name);
      if (user?.user_metadata?.name) setContactName(user.user_metadata.name);
      if (user?.user_metadata?.phone) setContactPhone(user.user_metadata.phone);
    }
  }, [isOpen, guide.id]);

  const loadAvailability = async () => {
    setAvailabilityLoading(true);
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear() + 1, now.getMonth(), 0);
      const startDateStr = formatLocalDate(startDate);
      const endDateStr = formatLocalDate(endDate);

      const { data, error: availError } = await supabase
        .from('tour_guide_availability')
        .select('date, is_available')
        .eq('guide_id', guide.id)
        .gte('date', startDateStr)
        .lte('date', endDateStr);

      if (availError) {
        console.error('[BookingModal] Availability query error:', {
          code: availError.code, message: availError.message,
          details: availError.details, hint: availError.hint,
        });
        return;
      }

      const unavailable = new Set<string>();
      (data || []).forEach((rec: any) => {
        if (!rec.is_available) {
          unavailable.add(rec.date);
        }
      });
      setUnavailableDates(unavailable);
    } catch (err) {
      console.error('[BookingModal] Failed to load availability:', err);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  // Fetch booked time slots for the selected date so we can disable taken times.
  const loadBookedSlots = useCallback(async (dateStr: string) => {
    if (!dateStr) {
      setBookedSlots({});
      return;
    }
    setSlotsLoading(true);
    setSlotsError('');
    try {
      const slots = await vanguardService.getBookedTimeSlots(guide.id, dateStr);
      setBookedSlots(slots);
    } catch (err) {
      console.error('[BookingModal] Failed to load booked slots:', err);
      setSlotsError('Could not load time slot availability. Please try again.');
      setBookedSlots({});
    } finally {
      setSlotsLoading(false);
    }
  }, [guide.id]);

  // When the selected date changes, refresh booked slots and reset the time.
  useEffect(() => {
    if (bookingDate) {
      loadBookedSlots(bookingDate);
    } else {
      setBookedSlots({});
    }
  }, [bookingDate, loadBookedSlots]);

  const loadTours = async () => {
    setToursLoading(true);
    try {
      const data = await vanguardService.getTours({ guideId: guide.id });
      setTours((data as Tour[]) || []);
    } catch {
      setTours([]);
    } finally {
      setToursLoading(false);
    }
  };

  const totalPrice = selectedTour ? selectedTour.price_per_person * groupSize : 0;
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = formatLocalDate(minDate);

  // A time slot is selectable only if it is in the future and not already booked.
  const isSlotBooked = (time: string): boolean => Boolean(bookedSlots[time]);

  const isSlotPast = (time: string): boolean => {
    if (!bookingDate) return false;
    const now = new Date();
    const slot = new Date(`${bookingDate}T${time}:00`);
    return slot.getTime() <= now.getTime();
  };

  const isSlotDisabled = (time: string): boolean => isSlotBooked(time) || isSlotPast(time);

  const canAdvance = () => {
    if (step === 1) return selectedTour !== null;
    if (step === 2) return bookingDate !== '' && groupSize >= 1 && !isDateUnavailable(bookingDate) && !isSlotDisabled(bookingTime);
    if (step === 3) return contactName.trim() !== '' && contactEmail.trim() !== '' && contactPhone.trim() !== '';
    return false;
  };

  const isDateUnavailable = (dateStr: string): boolean => {
    return unavailableDates.has(dateStr);
  };

  const handleNext = () => {
    setError('');
    if (!canAdvance()) {
      setError(
        step === 1 ? 'Please select an experience to continue.' :
        step === 2 ? 'Please select a date and group size.' :
        'Please fill in all contact details.'
      );
      return;
    }
    setStep((s) => (s + 1) as Step);
  };

  const handleSubmit = async () => {
    if (!user || !selectedTour) return;
    setSubmitting(true);
    setError('');
    try {
      // Final server-side conflict check before creating the booking.
      let slotFree = false;
      try {
        slotFree = await vanguardService.checkSlotAvailability(guide.id, bookingDate, bookingTime);
      } catch (err) {
        console.error('[Booking] Slot availability check failed:', err);
        setError('Could not verify availability right now. Please try again.');
        setSubmitting(false);
        return;
      }
      if (!slotFree) {
        setError('Sorry, this guide is no longer available for this time slot. Please choose another time.');
        setStep(2 as Step);
        await loadBookedSlots(bookingDate);
        setSubmitting(false);
        return;
      }

      const booking = await vanguardService.createBooking({
        tour_id: selectedTour.id,
        guide_id: guide.id,
        user_id: user.id,
        booking_date: bookingDate,
        booking_time: bookingTime,
        number_of_people: groupSize,
        total_price: totalPrice,
        currency: selectedTour.currency || 'INR',
        status: 'pending',
        payment_status: 'pending',
        customer_name: contactName,
        customer_email: contactEmail,
        customer_phone: contactPhone,
        special_requests: specialRequests,
      });
      setConfirmationCode(booking.confirmation_code || 'VG-' + Math.random().toString(36).slice(2, 8).toUpperCase());
      setStep(4 as Step);
    } catch (err: any) {
      console.error('[Booking] Failed to create booking:', {
        code: err?.code,
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
      });
      const userMsg = err?.code === '42501'
        ? 'You do not have permission to create this booking. Please ensure you are signed in.'
        : err?.code === '23505'
        ? 'Sorry, this guide is no longer available for this time slot. Please choose another time.'
        : 'Something went wrong while submitting your booking. Please try again.';
      setError(userMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedTour(null);
    setBookingDate('');
    setBookingTime('09:00');
    setGroupSize(1);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setSpecialRequests('');
    setError('');
    setConfirmationCode('');
    setBookedSlots({});
    setSlotsError('');
    onClose();
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(38,61,53,0.6)', backdropFilter: 'blur(6px)' }}>
        <div className="max-w-md w-full p-10 text-center" style={{ backgroundColor: '#FBF8F1', borderRadius: '12px', border: '1px solid rgba(38,61,53,0.08)' }}>
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase mb-5" style={{ color: 'rgba(48,51,47,0.5)' }}>Access Required</p>
          <h3 className="font-display text-2xl font-light mb-4" style={{ color: '#263D35' }}>Sign In to Book</h3>
          <p className="text-sm font-light mb-8" style={{ color: 'rgba(48,51,47,0.6)' }}>You need to be signed in to book an experience with a local expert.</p>
          <button onClick={handleClose} className="px-6 py-2.5 text-xs tracking-[0.15em] uppercase transition-all duration-300" style={{ border: '1px solid rgba(38,61,53,0.2)', color: '#263D35', borderRadius: '999px' }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const stepLabels = ['Guide Details', 'Date & Group', 'Your Details', 'Confirm'];

  const archetypeLabel =
    guide.specialties.length > 0
      ? ARCHETYPE_FALLBACK[guide.specialties[0]] || guide.specialties[0]
      : 'Local Expert';

  const locationString = [guide.location_city, guide.location_state, guide.location_country]
    .filter(Boolean)
    .join(', ');

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#F6F2E9',
    border: '1px solid rgba(38,61,53,0.12)',
    color: '#263D35',
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: '9px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(48,51,47,0.5)',
    display: 'block',
    marginBottom: '0.5rem',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(38,61,53,0.5)', backdropFilter: 'blur(6px)' }}>
      <div className="max-w-2xl w-full my-8" style={{ backgroundColor: '#FBF8F1', borderRadius: '12px', border: '1px solid rgba(38,61,53,0.08)', boxShadow: '0 8px 40px rgba(38,61,53,0.12)' }}>

        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid rgba(38,61,53,0.08)' }}>
          <div>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-1" style={{ color: 'rgba(48,51,47,0.4)' }}>Booking — {guide.full_name}</p>
            {step < 4 && (
              <p className="font-display text-lg font-light" style={{ color: '#263D35' }}>{stepLabels[step - 1]}</p>
            )}
          </div>
          <button onClick={handleClose} className="transition-colors duration-300 mt-1" style={{ color: 'rgba(48,51,47,0.4)' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        {step < 4 && (
          <div className="flex" style={{ borderBottom: '1px solid rgba(38,61,53,0.08)' }}>
            {stepLabels.slice(0, 3).map((label, i) => (
              <div key={i} className="flex-1 py-3 text-center font-mono text-[8px] tracking-[0.15em] uppercase transition-colors duration-300"
                style={{
                  color: i + 1 === step ? '#B69A63' : i + 1 < step ? 'rgba(182,154,99,0.5)' : 'rgba(48,51,47,0.25)',
                  borderBottom: i + 1 === step ? '2px solid #B69A63' : '2px solid transparent',
                }}>
                {label}
              </div>
            ))}
          </div>
        )}

        <div className="p-6">

          {/* Step 1: Guide Details + Choose Experience */}
          {step === 1 && (
            <div>
              {/* Guide Details */}
              <div className="p-5 mb-6" style={{ border: '1px solid rgba(38,61,53,0.08)', borderRadius: '8px' }}>
                <p style={labelStyle} className="mb-4">Guide Details</p>

                <div className="flex gap-5">
                  <div className="flex-shrink-0 w-20 h-20 overflow-hidden" style={{ borderRadius: '8px' }}>
                    <img
                      src={guide.profile_image || 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=200'}
                      alt={guide.full_name}
                      className="w-full h-full object-cover"
                      style={{ filter: 'brightness(1.1) saturate(1.05) sepia(0.05)' }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl font-light mb-1" style={{ color: '#263D35' }}>{guide.full_name}</h3>
                    <span className="inline-block font-mono text-[8px] tracking-[0.15em] uppercase px-2.5 py-1 mb-2" style={{ color: '#B69A63', border: '1px solid rgba(182,154,99,0.2)', borderRadius: '999px' }}>
                      {archetypeLabel}
                    </span>
                    {locationString && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" style={{ color: 'rgba(48,51,47,0.35)' }} strokeWidth={1.5} />
                        <span className="font-mono text-[8px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.5)' }}>{locationString}</span>
                      </div>
                    )}
                  </div>
                </div>

                {guide.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {guide.specialties.map((s, i) => (
                      <span key={i} className="font-mono text-[8px] tracking-[0.15em] uppercase px-2.5 py-1" style={{ color: 'rgba(48,51,47,0.5)', border: '1px solid rgba(38,61,53,0.08)', borderRadius: '999px' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {guide.bio && guide.bio.trim() && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(38,61,53,0.08)' }}>
                    <p style={labelStyle} className="mb-2">About</p>
                    <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(48,51,47,0.65)' }}>{guide.bio}</p>
                  </div>
                )}

                {guide.languages.length > 0 && (
                  <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(38,61,53,0.08)' }}>
                    <p style={labelStyle} className="mb-2">Languages</p>
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3 w-3 flex-shrink-0" style={{ color: 'rgba(48,51,47,0.3)' }} strokeWidth={1.5} />
                      <p className="text-sm font-light" style={{ color: 'rgba(48,51,47,0.65)' }}>{guide.languages.join(' · ')}</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 flex gap-8" style={{ borderTop: '1px solid rgba(38,61,53,0.08)' }}>
                  <div>
                    <p style={labelStyle} className="mb-1">Experience</p>
                    <p className="font-display text-base font-light" style={{ color: '#263D35' }}>
                      {guide.years_experience} {guide.years_experience === 1 ? 'year' : 'years'}
                    </p>
                  </div>
                  {guide.total_reviews > 0 && (
                    <div>
                      <p style={labelStyle} className="mb-1">Rating</p>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3 w-3" style={{ color: '#B69A63', fill: '#B69A63' }} />
                        <span className="font-display text-base font-light" style={{ color: '#263D35' }}>
                          {guide.average_rating > 0 ? guide.average_rating.toFixed(1) : 'New'}
                        </span>
                        <span className="font-mono text-[8px] tracking-[0.15em]" style={{ color: 'rgba(48,51,47,0.45)' }}>
                          · {guide.total_reviews} {guide.total_reviews === 1 ? 'review' : 'reviews'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Experiences */}
              <p style={labelStyle} className="mb-3">Choose Experience</p>
              {toursLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(182,154,99,0.2)', borderTopColor: '#B69A63' }} />
                </div>
              ) : tours.length === 0 ? (
                <div className="text-center py-10" style={{ border: '1px solid rgba(38,61,53,0.08)', borderRadius: '8px' }}>
                  <p className="font-display text-base italic font-light mb-2" style={{ color: '#263D35' }}>No bookable experiences yet</p>
                  <p className="text-xs font-light max-w-xs mx-auto" style={{ color: 'rgba(48,51,47,0.5)' }}>
                    {guide.full_name} hasn't added any experiences yet. You can still learn more about this local expert.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tours.map((tour, i) => (
                    <button
                      key={tour.id}
                      onClick={() => setSelectedTour(tour)}
                      className="w-full text-left p-5 transition-all duration-300"
                      style={{
                        border: selectedTour?.id === tour.id ? '1px solid #B69A63' : '1px solid rgba(38,61,53,0.08)',
                        backgroundColor: selectedTour?.id === tour.id ? 'rgba(182,154,99,0.05)' : 'transparent',
                        borderRadius: '8px',
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {selectedTour?.id === tour.id && <Check className="w-3 h-3" style={{ color: '#B69A63' }} />}
                            <h4 className="font-display text-base font-light" style={{ color: '#263D35' }}>{tour.title}</h4>
                          </div>
                          <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'rgba(48,51,47,0.45)' }}>
                            {tour.tour_type} · {tour.duration_hours}h · {tour.difficulty_level}
                          </p>
                          <p className="text-xs font-light line-clamp-2" style={{ color: 'rgba(48,51,47,0.55)' }}>{tour.description}</p>
                          {tour.meeting_point && (
                            <p className="font-mono text-[8px] tracking-[0.15em] uppercase mt-2" style={{ color: 'rgba(48,51,47,0.35)' }}>
                              Meets at: {tour.meeting_point}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-display text-lg font-light" style={{ color: '#B69A63' }}>
                            {tour.currency || '₹'}{tour.price_per_person.toLocaleString()}
                          </p>
                          <p className="font-mono text-[8px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>Per Person</p>
                          <p className="font-mono text-[8px] tracking-[0.15em] uppercase mt-1" style={{ color: 'rgba(48,51,47,0.35)' }}>Max {tour.max_group_size}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Date & Group */}
          {step === 2 && selectedTour && (
            <div className="space-y-6">
              <div className="p-4 mb-2" style={{ border: '1px solid rgba(38,61,53,0.08)', borderRadius: '8px' }}>
                <p style={labelStyle} className="mb-1">Selected</p>
                <p className="font-display text-base font-light" style={{ color: '#263D35' }}>{selectedTour.title}</p>
              </div>

              <div>
                <label style={labelStyle}>Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  min={minDateStr}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={inputStyle}
                />
                {bookingDate && isDateUnavailable(bookingDate) && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-red-500/70 flex-shrink-0" />
                    <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-red-500/70">
                      This date is unavailable. Please select another date.
                    </p>
                  </div>
                )}
                {availabilityLoading && (
                  <p className="mt-2 font-mono text-[8px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.35)' }}>
                    Loading availability...
                  </p>
                )}
              </div>

              <div>
                <label style={labelStyle}>Preferred Time</label>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 py-2">
                    <Loader className="w-3.5 h-3.5 animate-spin" style={{ color: '#B69A63' }} />
                    <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.5)' }}>
                      Checking available times...
                    </span>
                  </div>
                ) : slotsError ? (
                  <div className="flex items-center gap-1.5 py-2">
                    <AlertCircle className="w-3 h-3 text-red-500/70 flex-shrink-0" />
                    <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-red-500/70">{slotsError}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {TIME_SLOTS.map((time) => {
                      const booked = isSlotBooked(time);
                      const past = isSlotPast(time);
                      const disabled = booked || past;
                      const selected = bookingTime === time;
                      return (
                        <button
                          key={time}
                          type="button"
                          disabled={disabled}
                          onClick={() => setBookingTime(time)}
                          className="font-mono text-[10px] tracking-[0.1em] py-2 transition-all duration-200"
                          style={{
                            border: selected ? '1px solid #B69A63' : disabled ? '1px solid rgba(38,61,53,0.06)' : '1px solid rgba(38,61,53,0.12)',
                            backgroundColor: selected ? 'rgba(182,154,99,0.1)' : disabled ? 'rgba(38,61,53,0.03)' : 'transparent',
                            color: selected ? '#B69A63' : disabled ? 'rgba(48,51,47,0.25)' : 'rgba(48,51,47,0.65)',
                            borderRadius: '6px',
                            cursor: disabled ? 'not-allowed' : 'pointer',
                            textDecoration: booked ? 'line-through' : 'none',
                          }}
                        >
                          {time}
                        </button>
                      );
                    })}
                  </div>
                )}
                {bookedSlots[bookingTime] && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-red-500/70 flex-shrink-0" />
                    <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-red-500/70">
                      This time is already booked. Please choose another time.
                    </p>
                  </div>
                )}
                {!bookedSlots[bookingTime] && !slotsLoading && !slotsError && bookingDate && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" style={{ color: '#B69A63' }} />
                    <p className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.5)' }}>
                      Selected: {bookingTime}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Group Size (Max {selectedTour.max_group_size})</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setGroupSize(s => Math.max(1, s - 1))}
                    className="w-10 h-10 flex items-center justify-center transition-colors duration-300"
                    style={{ border: '1px solid rgba(38,61,53,0.12)', color: 'rgba(48,51,47,0.6)', borderRadius: '8px' }}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-display text-2xl font-light w-8 text-center" style={{ color: '#263D35' }}>{groupSize}</span>
                  <button
                    onClick={() => setGroupSize(s => Math.min(selectedTour.max_group_size, s + 1))}
                    className="w-10 h-10 flex items-center justify-center transition-colors duration-300"
                    style={{ border: '1px solid rgba(38,61,53,0.12)', color: 'rgba(48,51,47,0.6)', borderRadius: '8px' }}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[9px] tracking-[0.1em]" style={{ color: 'rgba(48,51,47,0.5)' }}>
                    {selectedTour.currency || '₹'}{selectedTour.price_per_person.toLocaleString()} × {groupSize} = {selectedTour.currency || '₹'}{totalPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Contact Details */}
          {step === 3 && (
            <div className="space-y-4">
              {[
                { label: 'Full Name', value: contactName, onChange: setContactName, type: 'text', placeholder: 'Your full name' },
                { label: 'Email', value: contactEmail, onChange: setContactEmail, type: 'email', placeholder: 'your@email.com' },
                { label: 'Phone', value: contactPhone, onChange: setContactPhone, type: 'tel', placeholder: '+91 9876543210' },
              ].map(({ label, value, onChange, type, placeholder }) => (
                <div key={label}>
                  <label style={labelStyle}>{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    style={{ ...inputStyle, color: '#263D35' }}
                  />
                </div>
              ))}
              <div>
                <label style={labelStyle}>Special Requests (Optional)</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  placeholder="Dietary requirements, accessibility needs, specific interests..."
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
            </div>
          )}

          {/* Step 3: Booking Summary */}
          {step === 3 && selectedTour && (
            <div className="mt-6 p-4" style={{ border: '1px solid rgba(38,61,53,0.08)', borderRadius: '8px' }}>
              <p style={labelStyle} className="mb-3">Booking Summary</p>
              <div className="space-y-2 text-xs font-light">
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>Experience</span>
                  <span style={{ color: '#263D35' }}>{selectedTour.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>Guide</span>
                  <span style={{ color: '#263D35' }}>{guide.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>Date</span>
                  <span style={{ color: '#263D35' }}>{bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>Time</span>
                  <span style={{ color: '#263D35' }}>{bookingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>Guests</span>
                  <span style={{ color: '#263D35' }}>{groupSize} {groupSize === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>Contact</span>
                  <span className="text-right max-w-[60%]" style={{ color: '#263D35' }}>{contactName} · {contactEmail} · {contactPhone}</span>
                </div>
                <div className="flex justify-between pt-2 mt-2" style={{ borderTop: '1px solid rgba(38,61,53,0.08)' }}>
                  <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: '#B69A63' }}>Total</span>
                  <span className="font-display text-base" style={{ color: '#B69A63' }}>{selectedTour.currency || '₹'}{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmed */}
          {step === 4 && (
            <div className="py-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ border: '1px solid rgba(182,154,99,0.3)' }}>
                  <Check className="w-5 h-5" style={{ color: '#B69A63' }} />
                </div>
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: '#B69A63' }}>Booking Request Submitted</p>
                <h3 className="font-display text-2xl font-light mb-2" style={{ color: '#263D35' }}>Your booking request has been submitted successfully.</h3>
                <p className="text-sm font-light" style={{ color: 'rgba(48,51,47,0.6)' }}>
                  {guide.full_name} will be in touch within 24 hours to confirm your expedition.
                </p>
              </div>

              <div className="p-5" style={{ border: '1px solid rgba(38,61,53,0.08)', borderRadius: '8px' }}>
                <p style={labelStyle} className="mb-3">Booking Details</p>
                <div className="space-y-2 text-xs font-light">
                  <div className="flex justify-between">
                    <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>Guide</span>
                    <span style={{ color: '#263D35' }}>{guide.full_name}</span>
                  </div>
                  {selectedTour && (
                    <div className="flex justify-between">
                      <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>Experience</span>
                      <span style={{ color: '#263D35' }}>{selectedTour.title}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>Date</span>
                    <span style={{ color: '#263D35' }}>{bookingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>Guests</span>
                    <span style={{ color: '#263D35' }}>{groupSize} {groupSize === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-2" style={{ borderTop: '1px solid rgba(38,61,53,0.08)' }}>
                    <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: '#B69A63' }}>Reference</span>
                    <span className="font-mono tracking-[0.15em]" style={{ color: '#B69A63' }}>{confirmationCode}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs font-light text-center mt-4" style={{ color: 'rgba(48,51,47,0.4)' }}>A confirmation has been sent to {contactEmail}</p>
              <button
                onClick={handleClose}
                className="mt-4 px-6 py-2.5 text-xs tracking-[0.15em] uppercase transition-all duration-300 block mx-auto"
                style={{ border: '1px solid rgba(38,61,53,0.2)', color: '#263D35', borderRadius: '999px' }}
              >
                Done
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 font-mono text-[9px] tracking-[0.15em] text-red-500/70">{error}</p>
          )}
        </div>

        {/* Footer actions */}
        {step < 4 && (
          <div className="flex items-center justify-between p-6" style={{ borderTop: '1px solid rgba(38,61,53,0.08)' }}>
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors duration-300"
                style={{ color: 'rgba(48,51,47,0.5)' }}
              >
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canAdvance()}
                className="flex items-center gap-2 px-6 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ border: '1px solid rgba(38,61,53,0.2)', color: '#263D35', borderRadius: '999px' }}
              >
                Continue <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !canAdvance()}
                className="flex items-center gap-2 px-6 py-2.5 font-mono text-[10px] tracking-[0.15em] uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#263D35', color: '#F6F2E9', borderRadius: '999px' }}
              >
                {submitting ? 'Confirming...' : 'Confirm Booking'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
