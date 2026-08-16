import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Minus, Plus, MapPin, Star, Globe, AlertCircle } from 'lucide-react';
import type { TourGuide, Tour } from '../shared/supabase';
import { vanguardService } from '../services/vanguardService';
import { useAuth } from '../shared/AuthContext';
import { supabase } from '../shared/supabase';

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
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];

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
  const minDateStr = minDate.toISOString().split('T')[0];

  const canAdvance = () => {
    if (step === 1) return selectedTour !== null;
    if (step === 2) return bookingDate !== '' && groupSize >= 1 && !isDateUnavailable(bookingDate);
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
        ? 'This booking already exists. Please try again.'
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
    setGroupSize(1);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setSpecialRequests('');
    setError('');
    setConfirmationCode('');
    onClose();
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#0d1a0d] border border-[#1a3020] max-w-md w-full p-8 text-center">
          <p className="font-jetbrains text-[9px] text-[#c9a84a]/60 tracking-widest uppercase mb-4">Access Required</p>
          <h3 className="font-display text-2xl font-light text-[#f5f0e8] mb-4">Sign In to Book</h3>
          <p className="text-[#7a9a7a] text-sm font-light mb-6">You need to be signed in to book an experience with a local expert.</p>
          <button onClick={handleClose} className="font-jetbrains text-[10px] tracking-widest text-[#c9a84a]/70 border border-[#c9a84a]/20 px-6 py-2 hover:border-[#c9a84a]/50 transition-colors duration-300">
            CLOSE
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

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#0d1a0d] border border-[#1a3020] max-w-2xl w-full my-8">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-[#1a3020]">
          <div>
            <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-1">Booking — {guide.full_name}</p>
            {step < 4 && (
              <p className="font-display text-lg font-light text-[#f5f0e8]">{stepLabels[step - 1]}</p>
            )}
          </div>
          <button onClick={handleClose} className="text-[#7a9a7a] hover:text-[#f5f0e8] transition-colors duration-300 mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        {step < 4 && (
          <div className="flex border-b border-[#1a3020]">
            {stepLabels.slice(0, 3).map((label, i) => (
              <div key={i} className={`flex-1 py-2 text-center font-jetbrains text-[8px] tracking-widest ${i + 1 === step ? 'text-[#c9a84a]/80 border-b border-[#c9a84a]/40' : i + 1 < step ? 'text-[#c9a84a]/40' : 'text-[#3a5a3a]'}`}>
                {label.toUpperCase()}
              </div>
            ))}
          </div>
        )}

        <div className="p-6">

          {/* Step 1: Guide Details + Choose Experience */}
          {step === 1 && (
            <div>
              {/* Guide Details */}
              <div className="border border-[#1a3020] p-5 mb-6">
                <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-4">Guide Details</p>

                <div className="flex gap-5">
                  {/* Profile image */}
                  <div className="flex-shrink-0 w-20 h-20 overflow-hidden">
                    <img
                      src={
                        guide.profile_image ||
                        'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=200'
                      }
                      alt={guide.full_name}
                      className="w-full h-full object-cover"
                      style={{ filter: 'grayscale(20%) brightness(0.7) saturate(0.8)' }}
                    />
                  </div>

                  {/* Name + archetype + location */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-xl font-light text-[#f5f0e8] mb-1">{guide.full_name}</h3>
                    <span className="inline-block font-jetbrains text-[8px] text-[#c9a84a]/70 border border-[#c9a84a]/20 px-2 py-0.5 tracking-widest uppercase mb-2">
                      {archetypeLabel}
                    </span>
                    {locationString && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-[#c9a84a]/40 flex-shrink-0" />
                        <span className="font-jetbrains text-[8px] text-[#7a9a7a] tracking-widest uppercase">{locationString}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Specialty tags */}
                {guide.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {guide.specialties.map((s, i) => (
                      <span key={i} className="font-jetbrains text-[8px] text-[#7a9a7a] border border-[#1a3020] px-2 py-0.5 tracking-widest uppercase">
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* About */}
                {guide.bio && guide.bio.trim() && (
                  <div className="mt-4 pt-4 border-t border-[#1a3020]">
                    <p className="font-jetbrains text-[8px] text-[#c9a84a]/40 tracking-widest uppercase mb-2">About</p>
                    <p className="text-[#7a9a7a] text-sm font-light leading-relaxed">{guide.bio}</p>
                  </div>
                )}

                {/* Languages */}
                {guide.languages.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-[#1a3020]">
                    <p className="font-jetbrains text-[8px] text-[#c9a84a]/40 tracking-widest uppercase mb-2">Languages</p>
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3 w-3 text-[#c9a84a]/30 flex-shrink-0" />
                      <p className="text-[#7a9a7a] text-sm font-light">{guide.languages.join(' · ')}</p>
                    </div>
                  </div>
                )}

                {/* Experience + Rating row */}
                <div className="mt-4 pt-4 border-t border-[#1a3020] flex gap-8">
                  <div>
                    <p className="font-jetbrains text-[8px] text-[#c9a84a]/40 tracking-widest uppercase mb-1">Experience</p>
                    <p className="font-display text-base font-light text-[#f5f0e8]">
                      {guide.years_experience} {guide.years_experience === 1 ? 'year' : 'years'}
                    </p>
                  </div>
                  {guide.total_reviews > 0 && (
                    <div>
                      <p className="font-jetbrains text-[8px] text-[#c9a84a]/40 tracking-widest uppercase mb-1">Rating</p>
                      <div className="flex items-center gap-1.5">
                        <Star className="h-3 w-3 text-[#c9a84a]/60 fill-[#c9a84a]/60" />
                        <span className="font-display text-base font-light text-[#f5f0e8]">
                          {guide.average_rating > 0 ? guide.average_rating.toFixed(1) : 'New'}
                        </span>
                        <span className="font-jetbrains text-[8px] text-[#7a9a7a] tracking-widest">
                          · {guide.total_reviews} {guide.total_reviews === 1 ? 'review' : 'reviews'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Experiences section */}
              <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-3">Choose Experience</p>
              {toursLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border border-[#c9a84a]/30 border-t-[#c9a84a] rounded-full animate-spin" />
                </div>
              ) : tours.length === 0 ? (
                <div className="text-center py-10 border border-[#1a3020]">
                  <p className="font-display text-base italic font-light text-[#f5f0e8] mb-2">No bookable experiences yet</p>
                  <p className="text-[#7a9a7a] text-xs font-light max-w-xs mx-auto">
                    {guide.full_name} hasn't added any experiences yet. You can still learn more about this local expert.
                  </p>
                </div>
              ) : (
                <div className="space-y-0 border border-[#1a3020]">
                  {tours.map((tour, i) => (
                    <button
                      key={tour.id}
                      onClick={() => setSelectedTour(tour)}
                      className={`w-full text-left p-5 transition-colors duration-300 ${i > 0 ? 'border-t border-[#1a3020]' : ''} ${selectedTour?.id === tour.id ? 'bg-[#1a3020]' : 'hover:bg-[#111d11]'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {selectedTour?.id === tour.id && <Check className="w-3 h-3 text-[#c9a84a]" />}
                            <h4 className="font-display text-base font-light text-[#f5f0e8]">{tour.title}</h4>
                          </div>
                          <p className="font-jetbrains text-[9px] text-[#7a9a7a] tracking-widest uppercase mb-2">
                            {tour.tour_type} · {tour.duration_hours}h · {tour.difficulty_level}
                          </p>
                          <p className="text-[#7a9a7a] text-xs font-light line-clamp-2">{tour.description}</p>
                          {tour.meeting_point && (
                            <p className="font-jetbrains text-[8px] text-[#3a5a3a] tracking-widest uppercase mt-2">
                              MEETS AT: {tour.meeting_point}
                            </p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-display text-lg font-light text-[#c9a84a]">
                            {tour.currency || '₹'}{tour.price_per_person.toLocaleString()}
                          </p>
                          <p className="font-jetbrains text-[8px] text-[#7a9a7a] tracking-widest">PER PERSON</p>
                          <p className="font-jetbrains text-[8px] text-[#3a5a3a] tracking-widest mt-1">MAX {tour.max_group_size}</p>
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
              <div className="p-4 border border-[#1a3020] mb-2">
                <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-1">Selected</p>
                <p className="font-display text-base font-light text-[#f5f0e8]">{selectedTour.title}</p>
              </div>

              <div>
                <label className="font-jetbrains text-[9px] text-[#7a9a7a] tracking-widest uppercase block mb-2">Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  min={minDateStr}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full bg-[#0a150a] border border-[#1a3020] text-[#f5f0e8] px-4 py-3 font-jetbrains text-sm focus:outline-none focus:border-[#c9a84a]/40 transition-colors duration-300"
                />
                {bookingDate && isDateUnavailable(bookingDate) && (
                  <div className="mt-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3 text-red-400/60 flex-shrink-0" />
                    <p className="font-jetbrains text-[9px] text-red-400/70 tracking-widest uppercase">
                      This date is unavailable. Please select another date.
                    </p>
                  </div>
                )}
                {availabilityLoading && (
                  <p className="mt-2 font-jetbrains text-[8px] text-[#3a5a3a] tracking-widest uppercase">
                    Loading availability...
                  </p>
                )}
              </div>

              <div>
                <label className="font-jetbrains text-[9px] text-[#7a9a7a] tracking-widest uppercase block mb-2">Preferred Time</label>
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full bg-[#0a150a] border border-[#1a3020] text-[#f5f0e8] px-4 py-3 font-jetbrains text-sm focus:outline-none focus:border-[#c9a84a]/40 transition-colors duration-300"
                />
              </div>

              <div>
                <label className="font-jetbrains text-[9px] text-[#7a9a7a] tracking-widest uppercase block mb-2">Group Size (Max {selectedTour.max_group_size})</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setGroupSize(s => Math.max(1, s - 1))}
                    className="w-10 h-10 border border-[#1a3020] text-[#7a9a7a] hover:text-[#f5f0e8] hover:border-[#c9a84a]/30 transition-colors duration-300 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-display text-2xl font-light text-[#f5f0e8] w-8 text-center">{groupSize}</span>
                  <button
                    onClick={() => setGroupSize(s => Math.min(selectedTour.max_group_size, s + 1))}
                    className="w-10 h-10 border border-[#1a3020] text-[#7a9a7a] hover:text-[#f5f0e8] hover:border-[#c9a84a]/30 transition-colors duration-300 flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="font-jetbrains text-[9px] text-[#7a9a7a] tracking-widest">
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
                  <label className="font-jetbrains text-[9px] text-[#7a9a7a] tracking-widest uppercase block mb-2">{label}</label>
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-[#0a150a] border border-[#1a3020] text-[#f5f0e8] px-4 py-3 font-light text-sm focus:outline-none focus:border-[#c9a84a]/40 transition-colors duration-300 placeholder:text-[#3a5a3a]"
                  />
                </div>
              ))}
              <div>
                <label className="font-jetbrains text-[9px] text-[#7a9a7a] tracking-widest uppercase block mb-2">Special Requests (Optional)</label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  rows={3}
                  placeholder="Dietary requirements, accessibility needs, specific interests..."
                  className="w-full bg-[#0a150a] border border-[#1a3020] text-[#f5f0e8] px-4 py-3 font-light text-sm focus:outline-none focus:border-[#c9a84a]/40 transition-colors duration-300 placeholder:text-[#3a5a3a] resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3 → Confirm: Summary before submit */}
          {step === 3 && selectedTour && (
            <div className="mt-6 p-4 border border-[#1a3020]">
              <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-3">Booking Summary</p>
              <div className="space-y-1.5 text-xs font-light">
                <div className="flex justify-between">
                  <span className="text-[#7a9a7a] font-jetbrains text-[9px] tracking-widest uppercase">Experience</span>
                  <span className="text-[#f5f0e8]">{selectedTour.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a9a7a] font-jetbrains text-[9px] tracking-widest uppercase">Guide</span>
                  <span className="text-[#f5f0e8]">{guide.full_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a9a7a] font-jetbrains text-[9px] tracking-widest uppercase">Date</span>
                  <span className="text-[#f5f0e8]">{bookingDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a9a7a] font-jetbrains text-[9px] tracking-widest uppercase">Time</span>
                  <span className="text-[#f5f0e8]">{bookingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a9a7a] font-jetbrains text-[9px] tracking-widest uppercase">Guests</span>
                  <span className="text-[#f5f0e8]">{groupSize} {groupSize === 1 ? 'person' : 'people'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7a9a7a] font-jetbrains text-[9px] tracking-widest uppercase">Contact</span>
                  <span className="text-[#f5f0e8] text-right max-w-[60%]">{contactName} · {contactEmail} · {contactPhone}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#1a3020] mt-2">
                  <span className="text-[#c9a84a]/60 font-jetbrains text-[9px] tracking-widest uppercase">Total</span>
                  <span className="text-[#c9a84a] font-display text-base">{selectedTour.currency || '₹'}{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmed */}
          {step === 4 && (
            <div className="py-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 border border-[#c9a84a]/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-5 h-5 text-[#c9a84a]" />
                </div>
                <p className="font-jetbrains text-[9px] text-[#c9a84a]/60 tracking-widest uppercase mb-2">Booking Request Submitted</p>
                <h3 className="font-display text-2xl font-light text-[#f5f0e8] mb-2">Your booking request has been submitted successfully.</h3>
                <p className="text-[#7a9a7a] text-sm font-light">
                  {guide.full_name} will be in touch within 24 hours to confirm your expedition.
                </p>
              </div>

              <div className="border border-[#1a3020] p-5">
                <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-3">Booking Details</p>
                <div className="space-y-1.5 text-xs font-light">
                  <div className="flex justify-between">
                    <span className="text-[#7a9a7a] font-jetbrains text-[9px] tracking-widest uppercase">Guide</span>
                    <span className="text-[#f5f0e8]">{guide.full_name}</span>
                  </div>
                  {selectedTour && (
                    <div className="flex justify-between">
                      <span className="text-[#7a9a7a] font-jetbrains text-[9px] tracking-widest uppercase">Experience</span>
                      <span className="text-[#f5f0e8]">{selectedTour.title}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-[#7a9a7a] font-jetbrains text-[9px] tracking-widest uppercase">Date</span>
                    <span className="text-[#f5f0e8]">{bookingDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7a9a7a] font-jetbrains text-[9px] tracking-widest uppercase">Guests</span>
                    <span className="text-[#f5f0e8]">{groupSize} {groupSize === 1 ? 'person' : 'people'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#1a3020] mt-2">
                    <span className="text-[#c9a84a]/60 font-jetbrains text-[9px] tracking-widest uppercase">Reference</span>
                    <span className="text-[#c9a84a] font-jetbrains tracking-widest">{confirmationCode}</span>
                  </div>
                </div>
              </div>

              <p className="text-[#3a5a3a] text-xs font-light text-center mt-4">A confirmation has been sent to {contactEmail}</p>
              <button
                onClick={handleClose}
                className="mt-4 font-jetbrains text-[10px] tracking-widest text-[#c9a84a]/70 border border-[#c9a84a]/20 px-6 py-2 hover:border-[#c9a84a]/50 transition-colors duration-300 block mx-auto"
              >
                DONE
              </button>
            </div>
          )}

          {error && (
            <p className="mt-4 font-jetbrains text-[9px] text-red-400/70 tracking-widest">{error}</p>
          )}
        </div>

        {/* Footer actions */}
        {step < 4 && (
          <div className="flex items-center justify-between p-6 border-t border-[#1a3020]">
            {step > 1 ? (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex items-center gap-2 font-jetbrains text-[10px] tracking-widest text-[#7a9a7a] hover:text-[#f5f0e8] transition-colors duration-300"
              >
                <ChevronLeft className="w-3 h-3" /> BACK
              </button>
            ) : <div />}

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={!canAdvance()}
                className="flex items-center gap-2 font-jetbrains text-[10px] tracking-widest text-[#c9a84a]/70 border border-[#c9a84a]/20 px-6 py-2 hover:border-[#c9a84a]/50 transition-colors duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                CONTINUE <ChevronRight className="w-3 h-3" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !canAdvance()}
                className="flex items-center gap-2 font-jetbrains text-[10px] tracking-widest text-[#0d1a0d] bg-[#c9a84a] px-6 py-2 hover:bg-[#d4b660] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'CONFIRMING...' : 'CONFIRM BOOKING'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
