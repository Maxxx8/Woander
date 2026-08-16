import React, { useState, useEffect, useCallback } from 'react';
import {
  X, Check, Calendar, Users, Clock, MapPin, Mail, Phone, User,
  CheckCircle, XCircle, AlertCircle, FileText, CreditCard,
} from 'lucide-react';
import { supabase } from '../shared/supabase';
import type { TourBooking, Tour } from '../shared/supabase';

interface GuideBookingsProps {
  guideId: string;
  onStatsChange?: () => void;
}

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'text-[#c9a84a]/60 border-[#c9a84a]/20',
  confirmed: 'text-green-400/60 border-green-400/20',
  completed: 'text-blue-400/60 border-blue-400/20',
  cancelled: 'text-red-400/60 border-red-400/20',
  rejected: 'text-red-400/60 border-red-400/20',
};

interface BookingWithTour extends TourBooking {
  tour?: Tour;
}

const GuideBookings: React.FC<GuideBookingsProps> = ({ guideId, onStatsChange }) => {
  const [bookings, setBookings] = useState<BookingWithTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithTour | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [counts, setCounts] = useState({ all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 });

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error: bookingsError } = await supabase
        .from('tour_bookings')
        .select(`
          *,
          tour:tours(*)
        `)
        .eq('guide_id', guideId)
        .order('created_at', { ascending: false });

      if (bookingsError) {
        console.error('[GuideBookings] Database error:', {
          code: bookingsError.code, message: bookingsError.message,
          details: bookingsError.details, hint: bookingsError.hint,
        });
        throw bookingsError;
      }

      const bookingsList = (data as BookingWithTour[]) || [];
      setBookings(bookingsList);
      setCounts({
        all: bookingsList.length,
        pending: bookingsList.filter(b => b.status === 'pending').length,
        confirmed: bookingsList.filter(b => b.status === 'confirmed').length,
        completed: bookingsList.filter(b => b.status === 'completed').length,
        cancelled: bookingsList.filter(b => b.status === 'cancelled' || b.status === 'rejected').length,
      });
    } catch (err: any) {
      console.error('[GuideBookings] Failed to load bookings:', err);
      setError('Could not load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleConfirm = async (booking: BookingWithTour) => {
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('tour_bookings')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', booking.id);

      if (updateError) {
        console.error('[GuideBookings] Failed to confirm booking:', {
          code: updateError.code, message: updateError.message,
          details: updateError.details, hint: updateError.hint,
        });
        throw updateError;
      }

      setActionSuccess('Booking confirmed successfully');
      await loadBookings();
      onStatsChange?.();
      setTimeout(() => {
        setSelectedBooking(null);
        setActionSuccess('');
      }, 1500);
    } catch (err: any) {
      const userMsg = err?.code === '42501'
        ? 'You do not have permission to update this booking.'
        : 'Failed to confirm booking. Please try again.';
      setActionError(userMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (booking: BookingWithTour) => {
    setActionLoading(true);
    setActionError('');
    setActionSuccess('');

    try {
      const { error: updateError } = await supabase
        .from('tour_bookings')
        .update({
          status: 'rejected',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: 'Rejected by guide',
          updated_at: new Date().toISOString(),
        })
        .eq('id', booking.id);

      if (updateError) {
        console.error('[GuideBookings] Failed to reject booking:', {
          code: updateError.code, message: updateError.message,
          details: updateError.details, hint: updateError.hint,
        });
        throw updateError;
      }

      setActionSuccess('Booking rejected');
      await loadBookings();
      onStatsChange?.();
      setTimeout(() => {
        setSelectedBooking(null);
        setActionSuccess('');
      }, 1500);
    } catch (err: any) {
      const userMsg = err?.code === '42501'
        ? 'You do not have permission to update this booking.'
        : 'Failed to reject booking. Please try again.';
      setActionError(userMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = statusFilter === 'all'
    ? bookings
    : statusFilter === 'cancelled'
    ? bookings.filter(b => b.status === 'cancelled' || b.status === 'rejected')
    : bookings.filter(b => b.status === statusFilter);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : currency + ' ';
    return symbol + (amount || 0).toLocaleString();
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-1">Bookings</p>
          <h2 className="font-display text-2xl font-light text-cream">
            Manage your <em className="italic text-gold-300">booking requests</em>
          </h2>
        </div>
      </div>

      {/* Status counts */}
      <div className="flex flex-wrap gap-3 mb-6">
        {STATUS_FILTERS.map(({ key, label }) => {
          const count = counts[key];
          const isActive = statusFilter === key;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`flex items-center gap-2 font-mono text-[9px] tracking-widest uppercase px-3 py-1.5 border transition-colors duration-300 ${
                isActive
                  ? 'text-[#c9a84a] border-[#c9a84a]/40 bg-[#c9a84a]/5'
                  : 'text-mist-700 border-forest-800 hover:text-mist-500 hover:border-forest-700'
              }`}
            >
              {label}
              <span className={`text-[8px] ${isActive ? 'text-[#c9a84a]/60' : 'text-mist-800'}`}>
                {count}
              </span>
            </button>
          );
        })}
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
      ) : filteredBookings.length === 0 ? (
        <div className="border border-forest-800 p-12 text-center">
          <Calendar className="w-10 h-10 text-gold-400/20 mx-auto mb-4" />
          <p className="font-display text-lg italic font-light text-cream mb-2">No bookings yet</p>
          <p className="text-mist-700 text-sm font-light">
            When customers book your experiences, their requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-0 border border-forest-800">
          {filteredBookings.map((booking, i) => (
            <button
              key={booking.id}
              onClick={() => { setSelectedBooking(booking); setActionError(''); setActionSuccess(''); }}
              className={`w-full text-left p-5 ${i > 0 ? 'border-t border-forest-800' : ''} group hover:bg-forest-900/40 transition-colors duration-300`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[9px] text-[#c9a84a]/50 tracking-widest">
                      {booking.confirmation_code || '—'}
                    </span>
                    <span className={`font-mono text-[8px] tracking-widest uppercase px-2 py-0.5 border ${STATUS_COLORS[booking.status] || 'text-mist-700 border-forest-800'}`}>
                      {booking.status}
                    </span>
                  </div>
                  <h4 className="font-display text-base font-light text-cream mb-1 group-hover:text-gold-200 transition-colors duration-300">
                    {booking.tour?.title || 'Experience removed'}
                  </h4>
                  <div className="flex flex-wrap gap-4 text-xs font-light">
                    <span className="text-mist-700 flex items-center gap-1">
                      <User className="w-3 h-3" /> {booking.customer_name}
                    </span>
                    <span className="text-mist-700 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {formatDate(booking.booking_date)}
                    </span>
                    <span className="text-mist-700 flex items-center gap-1">
                      <Users className="w-3 h-3" /> {booking.number_of_people}
                    </span>
                    <span className="text-[#c9a84a]/60 font-display">
                      {formatCurrency(booking.total_price, booking.currency)}
                    </span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-mono text-[8px] text-mist-800 tracking-widest uppercase">
                    {formatDate(booking.created_at)}
                  </p>
                  <p className="font-mono text-[8px] text-mist-800 tracking-widest uppercase mt-1">
                    {booking.payment_status}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0d1a0d] border border-[#1a3020] max-w-2xl w-full my-8">

            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#1a3020]">
              <div>
                <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-1">Booking Details</p>
                <p className="font-mono text-sm text-[#c9a84a]/70 tracking-widest">{selectedBooking.confirmation_code || '—'}</p>
              </div>
              <button onClick={() => setSelectedBooking(null)} className="text-[#7a9a7a] hover:text-[#f5f0e8] transition-colors duration-300 mt-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Action banners */}
              {actionSuccess && (
                <div className="border border-[#c9a84a]/30 bg-[#c9a84a]/5 p-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#c9a84a]/60 flex-shrink-0" />
                  <p className="text-[#c9a84a]/80 text-sm font-light">{actionSuccess}</p>
                </div>
              )}
              {actionError && (
                <div className="border border-red-400/30 bg-red-400/5 p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400/60 flex-shrink-0" />
                  <p className="text-red-400/70 text-sm font-light">{actionError}</p>
                </div>
              )}

              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`font-mono text-[8px] tracking-widest uppercase px-2 py-1 border ${STATUS_COLORS[selectedBooking.status] || 'text-mist-700 border-forest-800'}`}>
                  {selectedBooking.status}
                </span>
                <span className="font-mono text-[8px] tracking-widest uppercase px-2 py-1 border text-mist-700 border-forest-800">
                  Payment: {selectedBooking.payment_status}
                </span>
              </div>

              {/* Customer */}
              <div className="border border-[#1a3020] p-4">
                <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-3">Customer</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#7a9a7a] flex-shrink-0" />
                    <span className="text-[#f5f0e8] text-sm font-light">{selectedBooking.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#7a9a7a] flex-shrink-0" />
                    <span className="text-[#7a9a7a] text-sm font-light">{selectedBooking.customer_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-[#7a9a7a] flex-shrink-0" />
                    <span className="text-[#7a9a7a] text-sm font-light">{selectedBooking.customer_phone}</span>
                  </div>
                </div>
              </div>

              {/* Experience */}
              {selectedBooking.tour && (
                <div className="border border-[#1a3020] p-4">
                  <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-3">Experience</p>
                  <h4 className="font-display text-lg font-light text-cream mb-2">{selectedBooking.tour.title}</h4>
                  {selectedBooking.tour.description && (
                    <p className="text-mist-700 text-xs font-light leading-relaxed mb-3">{selectedBooking.tour.description}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3 text-xs font-light">
                    {selectedBooking.tour.location_city && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#c9a84a]/30" />
                        <span className="text-mist-700">{selectedBooking.tour.location_city}{selectedBooking.tour.location_state ? ', ' + selectedBooking.tour.location_state : ''}</span>
                      </div>
                    )}
                    {selectedBooking.tour.meeting_point && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-[#c9a84a]/30" />
                        <span className="text-mist-700">{selectedBooking.tour.meeting_point}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-[#c9a84a]/30" />
                      <span className="text-mist-700">{selectedBooking.tour.duration_hours}h</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3 h-3 text-[#c9a84a]/30" />
                      <span className="text-mist-700">Max {selectedBooking.tour.max_group_size}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking info */}
              <div className="border border-[#1a3020] p-4">
                <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-3">Booking</p>
                <div className="space-y-2 text-xs font-light">
                  <div className="flex justify-between">
                    <span className="text-mist-700 font-jetbrains text-[9px] tracking-widest uppercase">Tour Date</span>
                    <span className="text-[#f5f0e8]">{formatDate(selectedBooking.booking_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mist-700 font-jetbrains text-[9px] tracking-widest uppercase">Time</span>
                    <span className="text-[#f5f0e8]">{selectedBooking.booking_time || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mist-700 font-jetbrains text-[9px] tracking-widest uppercase">Guests</span>
                    <span className="text-[#f5f0e8]">{selectedBooking.number_of_people}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#1a3020]">
                    <span className="text-[#c9a84a]/60 font-jetbrains text-[9px] tracking-widest uppercase">Total</span>
                    <span className="text-[#c9a84a] font-display text-base">{formatCurrency(selectedBooking.total_price, selectedBooking.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-mist-700 font-jetbrains text-[9px] tracking-widest uppercase">Created</span>
                    <span className="text-mist-700">{formatDate(selectedBooking.created_at)}</span>
                  </div>
                </div>
              </div>

              {/* Special requests */}
              {selectedBooking.special_requests && selectedBooking.special_requests.trim() && (
                <div className="border border-[#1a3020] p-4">
                  <p className="font-jetbrains text-[9px] text-[#c9a84a]/50 tracking-widest uppercase mb-2 flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Special Requests
                  </p>
                  <p className="text-mist-600 text-sm font-light leading-relaxed">{selectedBooking.special_requests}</p>
                </div>
              )}

              {/* Actions for pending bookings */}
              {selectedBooking.status === 'pending' && !actionSuccess && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleReject(selectedBooking)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-red-400/70 border border-red-400/30 px-5 py-2 hover:bg-red-400/10 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? (
                      <div className="w-3 h-3 border border-red-400/30 border-t-red-400/70 rounded-full animate-spin" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    REJECT
                  </button>
                  <button
                    onClick={() => handleConfirm(selectedBooking)}
                    disabled={actionLoading}
                    className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-[#0d1a0d] bg-[#c9a84a] px-5 py-2 hover:bg-[#d4b660] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? (
                      <div className="w-3 h-3 border border-[#0d1a0d]/30 border-t-[#0d1a0d] rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    CONFIRM BOOKING
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuideBookings;
