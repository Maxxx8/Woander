import React from 'react';
import { MapPin, Clock, Users, Star, Check, ArrowRight, Calendar, ShieldCheck, BadgeCheck } from 'lucide-react';
import { type MarketplacePackage, formatPrice, formatDuration, getLocationString, TOUR_TYPE_LABELS, BOOKING_TYPE_LABELS } from './marketplaceTypes';

interface Props {
  pkg: MarketplacePackage;
  onViewDetails: (pkg: MarketplacePackage) => void;
  onCompare: (pkg: MarketplacePackage) => void;
  isSelected: boolean;
  disabled?: boolean;
}

const PackageCard: React.FC<Props> = ({ pkg, onViewDetails, onCompare, isSelected, disabled }) => {
  const location = getLocationString(pkg);
  const duration = formatDuration(pkg);
  const hasRealRating = pkg.review_count > 0 && pkg.average_rating > 0;

  return (
    <div
      className="group flex flex-col overflow-hidden transition-all duration-500"
      style={{
        backgroundColor: '#FBF8F1',
        border: isSelected ? '1px solid rgba(182,154,99,0.5)' : '1px solid rgba(38,61,53,0.08)',
        borderRadius: '10px',
      }}
      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(38,61,53,0.18)'; }}
      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'rgba(38,61,53,0.08)'; }}
    >
      {/* Cover image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        <img
          src={pkg.featured_image || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={pkg.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms]"
          style={{ filter: 'brightness(1.05) saturate(1.05) sepia(0.03)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 50%, rgba(38,61,53,0.3) 100%)' }} />

        {/* Tour type badge */}
        <div className="absolute top-3 left-3">
          <span
            className="font-mono text-[8px] tracking-[0.15em] uppercase px-2.5 py-1"
            style={{ backgroundColor: 'rgba(38,61,53,0.75)', color: 'rgba(201,168,74,0.9)', borderRadius: '3px' }}
          >
            {TOUR_TYPE_LABELS[pkg.tour_type] || pkg.tour_type}
          </span>
        </div>

        {/* Booking type badge */}
        <div className="absolute top-3 right-3">
          <span
            className="font-mono text-[8px] tracking-[0.12em] uppercase px-2 py-1"
            style={{
              backgroundColor: pkg.booking_type === 'instant' ? 'rgba(38,61,53,0.75)' : 'rgba(246,242,233,0.85)',
              color: pkg.booking_type === 'instant' ? 'rgba(231,217,197,0.9)' : 'rgba(48,51,47,0.6)',
              borderRadius: '3px',
            }}
          >
            {BOOKING_TYPE_LABELS[pkg.booking_type] || 'Request to Book'}
          </span>
        </div>

        {/* Operator verified badge */}
        {pkg.is_operator_verified && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" style={{ color: 'rgba(231,217,197,0.9)' }} strokeWidth={1.5} />
            <span className="font-mono text-[8px] tracking-[0.12em] uppercase" style={{ color: 'rgba(231,217,197,0.8)' }}>Verified Operator</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Operator name */}
        {pkg.operator_name && (
          <p className="font-mono text-[9px] tracking-[0.12em] uppercase mb-2 flex items-center gap-1.5" style={{ color: 'rgba(48,51,47,0.4)' }}>
            {pkg.is_operator_verified && <BadgeCheck className="h-3 w-3" style={{ color: '#B69A63' }} strokeWidth={1.5} />}
            {pkg.operator_name}
          </p>
        )}

        {/* Title */}
        <h3
          className="font-display text-xl font-light leading-tight mb-2 cursor-pointer transition-colors duration-300"
          style={{ color: '#263D35' }}
          onClick={() => onViewDetails(pkg)}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#B77B65'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#263D35'; }}
        >
          {pkg.title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin className="h-3 w-3" style={{ color: 'rgba(48,51,47,0.3)' }} strokeWidth={1.5} />
          <span className="font-mono text-[9px] tracking-[0.12em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>{location}</span>
        </div>

        {/* Key stats */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
          <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>
            <Clock className="h-3 w-3" style={{ color: 'rgba(182,154,99,0.5)' }} strokeWidth={1.5} />{duration}
          </span>
          <span className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em] uppercase" style={{ color: 'rgba(48,51,47,0.45)' }}>
            <Users className="h-3 w-3" style={{ color: 'rgba(182,154,99,0.5)' }} strokeWidth={1.5} />{pkg.max_group_size} max
          </span>
          {hasRealRating && (
            <span className="flex items-center gap-1 font-mono text-[9px] tracking-[0.1em] uppercase" style={{ color: 'rgba(48,51,47,0.5)' }}>
              <Star className="h-3 w-3 fill-current" style={{ color: '#B69A63' }} strokeWidth={1.5} />
              {Number(pkg.average_rating).toFixed(1)} ({pkg.review_count})
            </span>
          )}
        </div>

        {/* Inclusions preview */}
        {pkg.included_items && pkg.included_items.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {pkg.included_items.slice(0, 3).map((item, i) => (
              <span
                key={i}
                className="font-mono text-[7px] tracking-[0.12em] uppercase px-2 py-0.5"
                style={{ border: '1px solid rgba(38,61,53,0.1)', color: 'rgba(48,51,47,0.5)', borderRadius: '3px' }}
              >
                {item}
              </span>
            ))}
            {pkg.included_items.length > 3 && (
              <span className="font-mono text-[7px] tracking-[0.12em] uppercase px-2 py-0.5" style={{ color: 'rgba(48,51,47,0.35)' }}>
                +{pkg.included_items.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Departure dates preview */}
        {pkg.departure_dates && pkg.departure_dates.length > 0 && (
          <div className="flex items-center gap-1.5 mb-4">
            <Calendar className="h-3 w-3" style={{ color: 'rgba(48,51,47,0.3)' }} strokeWidth={1.5} />
            <span className="text-xs font-light" style={{ color: 'rgba(48,51,47,0.45)' }}>
              {pkg.departure_dates.length} departure{pkg.departure_dates.length > 1 ? 's' : ''} available
            </span>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: price + actions */}
        <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid rgba(38,61,53,0.08)' }}>
          <div>
            <span className="font-display text-xl font-light" style={{ color: '#B69A63' }}>
              {formatPrice(Number(pkg.price_per_person), pkg.currency)}
            </span>
            <span className="text-xs font-light ml-1" style={{ color: 'rgba(48,51,47,0.4)' }}>/person</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={() => onViewDetails(pkg)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs tracking-[0.12em] uppercase font-light transition-all duration-300"
            style={{ backgroundColor: '#263D35', color: '#F6F2E9', borderRadius: '6px' }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1a2e24'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#263D35'; }}
          >
            View Details
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </button>
          <button
            onClick={() => onCompare(pkg)}
            disabled={disabled && !isSelected}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs tracking-[0.12em] uppercase font-light transition-all duration-300"
            style={{
              border: isSelected ? '1px solid rgba(182,154,99,0.5)' : '1px solid rgba(38,61,53,0.15)',
              color: isSelected ? '#B69A63' : 'rgba(48,51,47,0.5)',
              backgroundColor: isSelected ? 'rgba(182,154,99,0.06)' : 'transparent',
              borderRadius: '6px',
              cursor: disabled && !isSelected ? 'not-allowed' : 'pointer',
              opacity: disabled && !isSelected ? 0.4 : 1,
            }}
          >
            {isSelected ? <Check className="h-3.5 w-3.5" strokeWidth={1.5} /> : null}
            {isSelected ? 'Added' : 'Compare'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
