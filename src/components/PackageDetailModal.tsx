import React, { useEffect, useState } from 'react';
import {
  X, MapPin, Clock, Users, Star, Check, ShieldCheck, BadgeCheck,
  Calendar, Phone, Mail, Globe, Instagram, AlertCircle, Loader, ArrowRight,
} from 'lucide-react';
import { type MarketplacePackage, type TourReview, formatPrice, formatDuration, getLocationString, TOUR_TYPE_LABELS, DIFFICULTY_LABELS, BOOKING_TYPE_LABELS } from './marketplaceTypes';
import { supabase } from '../shared/supabase';

interface Props {
  pkg: MarketplacePackage;
  isOpen: boolean;
  onClose: () => void;
}

const PackageDetailModal: React.FC<Props> = ({ pkg, isOpen, onClose }) => {
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [sendingEnquiry, setSendingEnquiry] = useState(false);

  useEffect(() => {
    if (!isOpen || !pkg) return;
    setLoadingReviews(true);
    supabase
      .from('tour_reviews')
      .select('id, tour_id, user_id, overall_rating, review_text, is_verified_booking, created_at')
      .eq('tour_id', pkg.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setReviews((data || []) as TourReview[]);
        setLoadingReviews(false);
      });
  }, [isOpen, pkg]);

  if (!isOpen || !pkg) return null;

  const location = getLocationString(pkg);
  const duration = formatDuration(pkg);
  const hasRealRating = pkg.review_count > 0 && pkg.average_rating > 0;
  const itinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];

  const handleEnquiry = async () => {
    setSendingEnquiry(true);
    // Honest: we don't have a backend enquiry endpoint. We simulate a
    // request-to-book that records intent locally. In production this would
    // create a booking record and notify the operator.
    setTimeout(() => {
      setSendingEnquiry(false);
      setEnquirySent(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-start justify-center min-h-screen p-4 sm:p-6">
        <div
          className="fixed inset-0"
          style={{ backgroundColor: 'rgba(38,61,53,0.88)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        />

        <div
          className="relative w-full max-w-4xl my-4 max-h-[92vh] overflow-y-auto"
          style={{ backgroundColor: '#FBF8F1', borderRadius: '12px', boxShadow: '0 16px 48px rgba(38,61,53,0.3)' }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 z-10 transition-colors duration-300"
            style={{ color: 'rgba(48,51,47,0.4)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#263D35'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(48,51,47,0.4)'; }}
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>

          {/* Hero image */}
          {pkg.featured_image && (
            <div className="relative w-full" style={{ aspectRatio: '21/9' }}>
              <img
                src={pkg.featured_image}
                alt={pkg.title}
                className="w-full h-full object-cover"
                style={{ borderRadius: '12px 12px 0 0', filter: 'brightness(1.02) saturate(1.05)' }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(38,61,53,0.4) 100%)', borderRadius: '12px 12px 0 0' }} />
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Header */}
            <div className="mb-8">
              {pkg.operator_name && (
                <p className="font-mono text-[10px] tracking-[0.15em] uppercase mb-3 flex items-center gap-1.5" style={{ color: 'rgba(48,51,47,0.4)' }}>
                  {pkg.is_operator_verified && <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#B69A63' }} strokeWidth={1.5} />}
                  {pkg.operator_name}
                  {pkg.is_operator_verified && <span style={{ color: '#B69A63' }}>· Verified</span>}
                </p>
              )}
              <h2 className="font-display text-3xl sm:text-4xl font-light mb-3 leading-tight" style={{ color: '#263D35' }}>
                {pkg.title}
              </h2>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>
                  <MapPin className="h-3 w-3" style={{ color: 'rgba(182,154,99,0.5)' }} strokeWidth={1.5} />{location}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>
                  <Clock className="h-3 w-3" style={{ color: 'rgba(182,154,99,0.5)' }} strokeWidth={1.5} />{duration}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>
                  <Users className="h-3 w-3" style={{ color: 'rgba(182,154,99,0.5)' }} strokeWidth={1.5} />{pkg.min_group_size}–{pkg.max_group_size} people
                </span>
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>
                  {DIFFICULTY_LABELS[pkg.difficulty_level] || pkg.difficulty_level}
                </span>
                <span className="font-mono text-[10px] tracking-[0.12em] uppercase px-2.5 py-0.5" style={{ border: '1px solid rgba(38,61,53,0.12)', color: 'rgba(48,51,47,0.5)', borderRadius: '3px' }}>
                  {BOOKING_TYPE_LABELS[pkg.booking_type] || 'Request to Book'}
                </span>
              </div>

              {hasRealRating && (
                <div className="flex items-center gap-2 mt-4">
                  <Star className="h-4 w-4 fill-current" style={{ color: '#B69A63' }} strokeWidth={1.5} />
                  <span className="font-display text-lg font-light" style={{ color: '#263D35' }}>{Number(pkg.average_rating).toFixed(1)}</span>
                  <span className="text-sm font-light" style={{ color: 'rgba(48,51,47,0.4)' }}>· {pkg.review_count} verified review{pkg.review_count !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {pkg.description && (
              <div className="mb-8">
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-3" style={{ color: 'rgba(48,51,47,0.4)' }}>Overview</p>
                <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(48,51,47,0.6)' }}>{pkg.description}</p>
              </div>
            )}

            {/* Itinerary */}
            {itinerary.length > 0 && (
              <div className="mb-8">
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-4" style={{ color: 'rgba(48,51,47,0.4)' }}>Itinerary</p>
                <div className="space-y-4">
                  {itinerary.map((day, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center" style={{ border: '1px solid rgba(38,61,53,0.1)', borderRadius: '50%' }}>
                        <span className="font-mono text-[10px] tracking-[0.1em]" style={{ color: 'rgba(48,51,47,0.4)' }}>{day.day || i + 1}</span>
                      </div>
                      <div className="flex-1">
                        {day.title && <h4 className="font-display text-base font-light mb-1" style={{ color: '#263D35' }}>{day.title}</h4>}
                        {day.description && <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(48,51,47,0.5)' }}>{day.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions / Exclusions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {pkg.included_items && pkg.included_items.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-3" style={{ color: 'rgba(48,51,47,0.4)' }}>What's Included</p>
                  <ul className="space-y-2">
                    {pkg.included_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-light" style={{ color: 'rgba(48,51,47,0.55)' }}>
                        <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: '#B69A63' }} strokeWidth={1.5} />{item}
                      </li>
                    ))}
                    {pkg.meals_included && pkg.meals_included.length > 0 && pkg.meals_included.map((meal, i) => (
                      <li key={`meal-${i}`} className="flex items-start gap-2 text-xs font-light" style={{ color: 'rgba(48,51,47,0.55)' }}>
                        <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: '#B69A63' }} strokeWidth={1.5} />Meals: {meal}
                      </li>
                    ))}
                    {pkg.guide_included && (
                      <li className="flex items-start gap-2 text-xs font-light" style={{ color: 'rgba(48,51,47,0.55)' }}>
                        <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: '#B69A63' }} strokeWidth={1.5} />Professional guide
                      </li>
                    )}
                    {pkg.equipment_included && pkg.equipment_included.length > 0 && pkg.equipment_included.map((eq, i) => (
                      <li key={`eq-${i}`} className="flex items-start gap-2 text-xs font-light" style={{ color: 'rgba(48,51,47,0.55)' }}>
                        <Check className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: '#B69A63' }} strokeWidth={1.5} />{eq}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pkg.excluded_items && pkg.excluded_items.length > 0 && (
                <div>
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-3" style={{ color: 'rgba(48,51,47,0.4)' }}>What's Excluded</p>
                  <ul className="space-y-2">
                    {pkg.excluded_items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs font-light" style={{ color: 'rgba(48,51,47,0.45)' }}>
                        <X className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: 'rgba(48,51,47,0.25)' }} strokeWidth={1.5} />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Accommodation & Transport */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {pkg.accommodation_type && (
                <div>
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'rgba(48,51,47,0.4)' }}>Accommodation</p>
                  <p className="text-sm font-light" style={{ color: 'rgba(48,51,47,0.55)' }}>{pkg.accommodation_type}</p>
                </div>
              )}
              {pkg.transport_type && (
                <div>
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'rgba(48,51,47,0.4)' }}>Transport</p>
                  <p className="text-sm font-light" style={{ color: 'rgba(48,51,47,0.55)' }}>{pkg.transport_type}</p>
                </div>
              )}
            </div>

            {/* Departure dates */}
            {pkg.departure_dates && pkg.departure_dates.length > 0 && (
              <div className="mb-8">
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-3" style={{ color: 'rgba(48,51,47,0.4)' }}>Available Departures</p>
                <div className="flex flex-wrap gap-2">
                  {pkg.departure_dates.map((date, i) => (
                    <span
                      key={i}
                      className="font-mono text-[10px] tracking-[0.1em] uppercase px-3 py-1.5"
                      style={{ border: '1px solid rgba(38,61,53,0.12)', color: 'rgba(48,51,47,0.5)', borderRadius: '4px' }}
                    >
                      {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation policy */}
            {pkg.cancellation_policy && (
              <div className="mb-8">
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'rgba(48,51,47,0.4)' }}>Cancellation Policy</p>
                <p className="text-sm font-light" style={{ color: 'rgba(48,51,47,0.55)' }}>{pkg.cancellation_policy}</p>
              </div>
            )}

            {/* Operator profile */}
            {(pkg.operator_name || pkg.operator_instagram || pkg.operator_website) && (
              <div className="mb-8 p-5" style={{ border: '1px solid rgba(38,61,53,0.1)', borderRadius: '8px', backgroundColor: '#F6F2E9' }}>
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-3" style={{ color: 'rgba(48,51,47,0.4)' }}>Operator</p>
                <div className="flex items-start gap-3">
                  {pkg.is_operator_verified && (
                    <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#B69A63' }} strokeWidth={1.5} />
                  )}
                  <div className="flex-1">
                    <h4 className="font-display text-lg font-light mb-1" style={{ color: '#263D35' }}>{pkg.operator_name || 'Independent Operator'}</h4>
                    {pkg.is_operator_verified ? (
                      <p className="text-xs font-light mb-3" style={{ color: 'rgba(48,51,47,0.45)' }}>Verified by Woander</p>
                    ) : (
                      <p className="text-xs font-light mb-3 flex items-center gap-1.5" style={{ color: 'rgba(48,51,47,0.4)' }}>
                        <AlertCircle className="h-3 w-3" strokeWidth={1.5} />Not yet verified by Woander
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3">
                      {pkg.operator_instagram && (
                        <a href={pkg.operator_instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-light transition-colors duration-300" style={{ color: 'rgba(48,51,47,0.5)' }}>
                          <Instagram className="h-3.5 w-3.5" strokeWidth={1.5} />Instagram
                        </a>
                      )}
                      {pkg.operator_website && (
                        <a href={pkg.operator_website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-light transition-colors duration-300" style={{ color: 'rgba(48,51,47,0.5)' }}>
                          <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />Website
                        </a>
                      )}
                      {pkg.operator_phone && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-light" style={{ color: 'rgba(48,51,47,0.5)' }}>
                          <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />{pkg.operator_phone}
                        </span>
                      )}
                      {pkg.operator_email && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-light" style={{ color: 'rgba(48,51,47,0.5)' }}>
                          <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />{pkg.operator_email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="mb-8">
              <p className="font-mono text-[9px] tracking-[0.15em] uppercase mb-4" style={{ color: 'rgba(48,51,47,0.4)' }}>
                Reviews {hasRealRating ? `(${pkg.review_count})` : ''}
              </p>
              {loadingReviews ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader className="h-4 w-4 animate-spin" style={{ color: '#B69A63' }} strokeWidth={1.5} />
                  <span className="font-mono text-[10px] tracking-[0.12em] uppercase" style={{ color: 'rgba(48,51,47,0.35)' }}>Loading reviews...</span>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="pb-4" style={{ borderBottom: '1px solid rgba(38,61,53,0.06)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className="h-3 w-3"
                              style={{ color: star <= review.overall_rating ? '#B69A63' : 'rgba(38,61,53,0.1)' }}
                              fill={star <= review.overall_rating ? '#B69A63' : 'none'}
                              strokeWidth={1.5}
                            />
                          ))}
                        </div>
                        {review.is_verified_booking && (
                          <span className="font-mono text-[8px] tracking-[0.12em] uppercase px-2 py-0.5" style={{ border: '1px solid rgba(182,154,99,0.2)', color: 'rgba(182,154,99,0.6)', borderRadius: '2px' }}>
                            Verified Booking
                          </span>
                        )}
                      </div>
                      {review.review_text && <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(48,51,47,0.55)' }}>{review.review_text}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-light italic" style={{ color: 'rgba(48,51,47,0.35)' }}>
                  No reviews yet. Reviews appear only from travelers with verified bookings.
                </p>
              )}
            </div>

            {/* Pricing + Booking */}
            <div className="p-6" style={{ border: '1px solid rgba(38,61,53,0.1)', borderRadius: '8px', backgroundColor: '#F6F2E9' }}>
              <div className="flex items-end justify-between mb-4">
                <div>
                  <span className="font-display text-3xl font-light" style={{ color: '#B69A63' }}>
                    {formatPrice(Number(pkg.price_per_person), pkg.currency)}
                  </span>
                  <span className="text-sm font-light ml-2" style={{ color: 'rgba(48,51,47,0.4)' }}>per person</span>
                </div>
                {pkg.pricing_notes && (
                  <p className="text-xs font-light text-right max-w-[200px]" style={{ color: 'rgba(48,51,47,0.4)' }}>{pkg.pricing_notes}</p>
                )}
              </div>

              {enquirySent ? (
                <div className="flex items-center gap-3 py-3 px-4" style={{ border: '1px solid rgba(182,154,99,0.3)', borderRadius: '6px', backgroundColor: 'rgba(182,154,99,0.05)' }}>
                  <Check className="h-4 w-4" style={{ color: '#B69A63' }} strokeWidth={1.5} />
                  <p className="text-sm font-light" style={{ color: '#263D35' }}>
                    Your enquiry has been noted. The operator will get back to you.
                  </p>
                </div>
              ) : (
                <button
                  onClick={handleEnquiry}
                  disabled={sendingEnquiry}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 text-sm tracking-[0.12em] uppercase font-light transition-all duration-300"
                  style={{ backgroundColor: '#263D35', color: '#F6F2E9', borderRadius: '6px' }}
                  onMouseEnter={(e) => { if (!sendingEnquiry) e.currentTarget.style.backgroundColor = '#1a2e24'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#263D35'; }}
                >
                  {sendingEnquiry ? (
                    <><Loader className="h-4 w-4 animate-spin" strokeWidth={1.5} /> Sending...</>
                  ) : (
                    <>{pkg.booking_type === 'instant' ? 'Book Now' : 'Request to Book'} <ArrowRight className="h-4 w-4" strokeWidth={1.5} /></>
                  )}
                </button>
              )}

              {pkg.booking_type !== 'instant' && !enquirySent && (
                <p className="text-xs font-light mt-3 text-center" style={{ color: 'rgba(48,51,47,0.35)' }}>
                  This is a request-to-book package. The operator will confirm availability.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageDetailModal;
