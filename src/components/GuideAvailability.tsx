import React, { useState, useEffect, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Check, X, Calendar, Clock,
  AlertCircle, CheckCircle, Power, PowerOff, Loader,
} from 'lucide-react';
import { supabase } from '../shared/supabase';

interface GuideAvailabilityProps {
  guideId: string;
}

interface AvailabilityRecord {
  id: string;
  guide_id: string;
  date: string;
  is_available: boolean;
  notes: string;
  created_at: string;
}

interface BookingInfo {
  booking_date: string;
  number_of_people: number;
  status: string;
  tour_max_group_size: number;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const GuideAvailability: React.FC<GuideAvailabilityProps> = ({ guideId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [availability, setAvailability] = useState<Record<string, AvailabilityRecord>>({});
  const [bookingsByDate, setBookingsByDate] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const formatDateKey = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const loadAvailability = useCallback(async () => {
    setLoading(true);
    setError('');

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = formatDateKey(firstDay);
    const endDate = formatDateKey(lastDay);

    try {
      const [availRes, bookingsRes] = await Promise.all([
        supabase
          .from('tour_guide_availability')
          .select('*')
          .eq('guide_id', guideId)
          .gte('date', startDate)
          .lte('date', endDate),
        supabase
          .from('tour_bookings')
          .select('booking_date, number_of_people, status, tour:tours(max_group_size)')
          .eq('guide_id', guideId)
          .gte('booking_date', startDate)
          .lte('booking_date', endDate)
          .in('status', ['pending', 'confirmed', 'completed']),
      ]);

      if (availRes.error) {
        console.error('[GuideAvailability] Database error:', {
          code: availRes.error.code, message: availRes.error.message,
          details: availRes.error.details, hint: availRes.error.hint,
        });
        throw availRes.error;
      }

      if (bookingsRes.error) {
        console.error('[GuideAvailability] Bookings query error:', {
          code: bookingsRes.error.code, message: bookingsRes.error.message,
          details: bookingsRes.error.details, hint: bookingsRes.error.hint,
        });
      }

      const availMap: Record<string, AvailabilityRecord> = {};
      (availRes.data as AvailabilityRecord[] | null)?.forEach((rec) => {
        availMap[rec.date] = rec;
      });
      setAvailability(availMap);

      // Calculate total booked guests per date (confirmed bookings only count toward capacity)
      const bookedByDate: Record<string, number> = {};
      (bookingsRes.data as any[] | null)?.forEach((b) => {
        if (!b.booking_date) return;
        if (b.status !== 'confirmed' && b.status !== 'completed') return;
        const guests = b.number_of_people || 0;
        bookedByDate[b.booking_date] = (bookedByDate[b.booking_date] || 0) + guests;
      });
      setBookingsByDate(bookedByDate);
    } catch (err: any) {
      console.error('[GuideAvailability] Failed to load:', err);
      setError('Could not load your availability. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [guideId, currentMonth]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const handleSave = async (dateStr: string, isAvailable: boolean) => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    // If marking unavailable, check for confirmed bookings on that date
    if (!isAvailable) {
      try {
        const { data: confirmedBookings, error: checkError } = await supabase
          .from('tour_bookings')
          .select('id, number_of_people, status')
          .eq('guide_id', guideId)
          .eq('booking_date', dateStr)
          .in('status', ['confirmed', 'completed']);

        if (checkError) {
          console.error('[GuideAvailability] Database error:', {
            code: checkError.code, message: checkError.message,
            details: checkError.details, hint: checkError.hint,
          });
          throw checkError;
        }

        if (confirmedBookings && confirmedBookings.length > 0) {
          setSaveError('This date already has confirmed bookings and cannot be marked unavailable.');
          setSaving(false);
          return;
        }
      } catch (err) {
        setSaveError('Failed to check existing bookings. Please try again.');
        setSaving(false);
        return;
      }
    }

    try {
      const existing = availability[dateStr];

      if (existing) {
        const { error: updateError } = await supabase
          .from('tour_guide_availability')
          .update({ is_available: isAvailable })
          .eq('id', existing.id);

        if (updateError) {
          console.error('[GuideAvailability] Database error:', {
            code: updateError.code, message: updateError.message,
            details: updateError.details, hint: updateError.hint,
          });
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('tour_guide_availability')
          .insert({
            guide_id: guideId,
            date: dateStr,
            is_available: isAvailable,
            notes: '',
          });

        if (insertError) {
          console.error('[GuideAvailability] Database error:', {
            code: insertError.code, message: insertError.message,
            details: insertError.details, hint: insertError.hint,
          });
          throw insertError;
        }
      }

      setSaveSuccess(isAvailable ? 'Date marked as available.' : 'Date marked as unavailable.');
      await loadAvailability();
      setTimeout(() => setSaveSuccess(''), 2500);
    } catch (err: any) {
      const userMsg = err?.code === '42501'
        ? 'You do not have permission to update availability.'
        : 'Failed to save availability. Please try again.';
      setSaveError(userMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvailability = async (dateStr: string) => {
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const existing = availability[dateStr];
      if (!existing) {
        setSaving(false);
        return;
      }

      const { error: deleteError } = await supabase
        .from('tour_guide_availability')
        .delete()
        .eq('id', existing.id);

      if (deleteError) {
        console.error('[GuideAvailability] Database error:', {
          code: deleteError.code, message: deleteError.message,
          details: deleteError.details, hint: deleteError.hint,
        });
        throw deleteError;
      }

      setSaveSuccess('Availability removed for this date.');
      setSelectedDate(null);
      await loadAvailability();
      setTimeout(() => setSaveSuccess(''), 2500);
    } catch (err: any) {
      const userMsg = err?.code === '42501'
        ? 'You do not have permission to remove availability.'
        : 'Failed to remove availability. Please try again.';
      setSaveError(userMsg);
    } finally {
      setSaving(false);
    }
  };

  // Calendar grid generation
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const days: { date: Date; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false, dateStr: formatDateKey(d) });
    }

    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push({ date: d, isCurrentMonth: true, dateStr: formatDateKey(d) });
    }

    // Next month padding to fill grid
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({ date: d, isCurrentMonth: false, dateStr: formatDateKey(d) });
    }

    return days;
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = formatDateKey(today);

  const getDateStatus = (dateStr: string): 'available' | 'unavailable' | 'none' | 'booked' => {
    const avail = availability[dateStr];
    if (avail) {
      return avail.is_available ? 'available' : 'unavailable';
    }
    return 'none';
  };

  const isDatePast = (dateStr: string): boolean => {
    return dateStr < todayStr;
  };

  const hasBookings = (dateStr: string): boolean => {
    return (bookingsByDate[dateStr] || 0) > 0;
  };

  const days = getCalendarDays();
  const hasAnyAvailability = Object.keys(availability).length > 0;

  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;
  const selectedDateFormatted = selectedDateObj
    ? `${MONTH_NAMES[selectedDateObj.getMonth()]} ${selectedDateObj.getDate()}, ${selectedDateObj.getFullYear()}`
    : '';

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-1">Availability</p>
          <h2 className="font-display text-2xl font-light text-cream">
            Manage your <em className="italic text-gold-300">calendar</em>
          </h2>
        </div>
      </div>

      {error && (
        <div className="mb-4 border border-red-400/30 bg-red-400/5 p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-red-400/60 flex-shrink-0" />
          <p className="text-red-400/70 text-sm font-light">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 border border-forest-800">
          <div className="w-6 h-6 border border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
        </div>
      ) : !hasAnyAvailability && Object.keys(bookingsByDate).length === 0 && !showCalendar ? (
        <div className="border border-forest-800 p-12 text-center">
          <Calendar className="w-10 h-10 text-gold-400/20 mx-auto mb-4" />
          <p className="font-display text-lg italic font-light text-cream mb-2">No availability configured</p>
          <p className="text-mist-700 text-sm font-light mb-6">
            Set your available dates and times so customers know when they can book you.
          </p>
          <button
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              setSelectedDate(formatDateKey(tomorrow));
              setShowCalendar(true);
            }}
            className="font-mono text-[10px] tracking-widest text-gold-300/70 border border-gold-400/20 px-6 py-2 hover:border-gold-400/50 transition-colors duration-300"
          >
            SET AVAILABILITY
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 border border-forest-800 p-5">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                className="w-8 h-8 border border-forest-800 text-mist-700 hover:text-gold-300 hover:border-gold-400/30 transition-colors duration-300 flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="font-display text-lg font-light text-cream">
                {MONTH_NAMES[currentMonth.getMonth()]} <span className="text-gold-300/60">{currentMonth.getFullYear()}</span>
              </p>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                className="w-8 h-8 border border-forest-800 text-mist-700 hover:text-gold-300 hover:border-gold-400/30 transition-colors duration-300 flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {DAY_NAMES.map((day) => (
                <div key={day} className="text-center font-mono text-[8px] text-mist-800 tracking-widest uppercase py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {days.map(({ date, isCurrentMonth, dateStr }, i) => {
                const status = getDateStatus(dateStr);
                const isPast = isDatePast(dateStr);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const booked = hasBookings(dateStr);

                return (
                  <button
                    key={i}
                    onClick={() => !isPast && setSelectedDate(dateStr)}
                    disabled={isPast}
                    className={`
                      aspect-square flex flex-col items-center justify-center text-xs font-light transition-colors duration-200 relative
                      ${isCurrentMonth ? '' : 'opacity-30'}
                      ${isPast ? 'cursor-not-allowed text-mist-800' : 'cursor-pointer hover:border-gold-400/30'}
                      ${isSelected ? 'border-gold-400/50 bg-gold-400/5' : 'border'}
                      ${status === 'available' && !isPast ? 'border-[#c9a84a]/20 bg-[#c9a84a]/5' : 'border-forest-800'}
                      ${status === 'unavailable' && !isPast ? 'border-red-400/15 bg-red-400/5' : ''}
                    `}
                  >
                    <span className={`
                      ${isPast ? 'text-mist-800' : status === 'available' ? 'text-[#c9a84a]/80' : status === 'unavailable' ? 'text-red-400/50' : 'text-mist-500'}
                      ${isToday ? 'font-bold' : 'font-light'}
                    `}>
                      {date.getDate()}
                    </span>
                    {booked && !isPast && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400/50" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-forest-800">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-[#c9a84a]/20 bg-[#c9a84a]/5" />
                <span className="font-mono text-[8px] text-mist-700 tracking-widest uppercase">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-red-400/15 bg-red-400/5" />
                <span className="font-mono text-[8px] text-mist-700 tracking-widest uppercase">Unavailable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50" />
                <span className="font-mono text-[8px] text-mist-700 tracking-widest uppercase">Has Bookings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 border border-forest-800 opacity-50" />
                <span className="font-mono text-[8px] text-mist-800 tracking-widest uppercase">Not Set</span>
              </div>
            </div>
          </div>

          {/* Date detail panel */}
          <div className="border border-forest-800 p-5">
            {selectedDate ? (
              <div>
                <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-1">Selected Date</p>
                <h3 className="font-display text-xl font-light text-cream mb-4">{selectedDateFormatted}</h3>

                {saveSuccess && (
                  <div className="mb-3 border border-[#c9a84a]/30 bg-[#c9a84a]/5 p-3 flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#c9a84a]/60 flex-shrink-0" />
                    <p className="text-[#c9a84a]/80 text-xs font-light">{saveSuccess}</p>
                  </div>
                )}
                {saveError && (
                  <div className="mb-3 border border-red-400/30 bg-red-400/5 p-3 flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400/60 flex-shrink-0" />
                    <p className="text-red-400/70 text-xs font-light">{saveError}</p>
                  </div>
                )}

                {/* Current status */}
                <div className="mb-4 p-3 border border-[#1a3020]">
                  <p className="font-mono text-[8px] text-mist-700 tracking-widest uppercase mb-1">Current Status</p>
                  {(() => {
                    const status = getDateStatus(selectedDate);
                    if (status === 'available') {
                      return <p className="text-[#c9a84a]/80 text-sm font-light flex items-center gap-1.5"><Power className="w-3.5 h-3.5" /> Available</p>;
                    }
                    if (status === 'unavailable') {
                      return <p className="text-red-400/60 text-sm font-light flex items-center gap-1.5"><PowerOff className="w-3.5 h-3.5" /> Unavailable</p>;
                    }
                    return <p className="text-mist-700 text-sm font-light">Not configured</p>;
                  })()}
                  {hasBookings(selectedDate) && (
                    <p className="font-mono text-[8px] text-blue-400/50 tracking-widest uppercase mt-2">
                      {bookingsByDate[selectedDate]} guest(s) booked
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleSave(selectedDate, true)}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 font-mono text-[10px] tracking-widest text-[#0d1a0d] bg-[#c9a84a] px-4 py-2.5 hover:bg-[#d4b660] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                    MARK AVAILABLE
                  </button>
                  <button
                    onClick={() => handleSave(selectedDate, false)}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 font-mono text-[10px] tracking-widest text-red-400/70 border border-red-400/30 px-4 py-2.5 hover:bg-red-400/10 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <PowerOff className="w-3.5 h-3.5" />}
                    MARK UNAVAILABLE
                  </button>
                  {availability[selectedDate] && (
                    <button
                      onClick={() => handleRemoveAvailability(selectedDate)}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 font-mono text-[9px] tracking-widest text-mist-700 hover:text-cream border border-forest-800 px-4 py-2 transition-colors duration-300 disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                      REMOVE
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-gold-400/20 mx-auto mb-3" />
                <p className="text-mist-700 text-sm font-light">
                  Select a date from the calendar to manage your availability.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideAvailability;
