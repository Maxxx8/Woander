import React from 'react';
import { X, Check, MapPin, Clock, Users, Star, ArrowRight } from 'lucide-react';
import { type MarketplacePackage, formatPrice, formatDuration, getLocationString } from './marketplaceTypes';

interface Props {
  packages: MarketplacePackage[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onViewDetails: (pkg: MarketplacePackage) => void;
  isOpen: boolean;
}

const CompareRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="py-3" style={{ borderBottom: '1px solid rgba(38,61,53,0.06)' }}>
    <p className="font-mono text-[8px] tracking-[0.15em] uppercase mb-1.5" style={{ color: 'rgba(48,51,47,0.35)' }}>{label}</p>
    <div className="text-sm font-light" style={{ color: 'rgba(48,51,47,0.6)' }}>{children}</div>
  </div>
);

const CompareDrawer: React.FC<Props> = ({ packages, onRemove, onClear, onViewDetails, isOpen }) => {
  if (!isOpen || packages.length === 0) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(38,61,53,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={onClear}
      />

      <div
        className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: '#FBF8F1', borderRadius: '12px 12px 0 0', boxShadow: '0 -8px 32px rgba(38,61,53,0.2)' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4" style={{ backgroundColor: '#FBF8F1', borderBottom: '1px solid rgba(38,61,53,0.1)' }}>
          <div>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(48,51,47,0.4)' }}>Comparing {packages.length} of 3</p>
            <h3 className="font-display text-xl font-light" style={{ color: '#263D35' }}>Compare Packages</h3>
          </div>
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 font-mono text-[9px] tracking-[0.15em] uppercase transition-colors duration-300"
            style={{ color: 'rgba(48,51,47,0.4)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#263D35'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(48,51,47,0.4)'; }}
          >
            <X className="h-4 w-4" strokeWidth={1.5} /> Close
          </button>
        </div>

        {/* Comparison grid */}
        <div className="p-6">
          <div className="grid" style={{ gridTemplateColumns: `repeat(${packages.length}, 1fr)`, gap: '16px' }}>
            {packages.map((pkg) => {
              const location = getLocationString(pkg);
              const duration = formatDuration(pkg);
              const hasRealRating = pkg.review_count > 0 && pkg.average_rating > 0;
              const itinerary = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];

              return (
                <div key={pkg.id} className="flex flex-col">
                  {/* Image + title */}
                  <div className="relative overflow-hidden mb-4" style={{ aspectRatio: '4/3', borderRadius: '8px' }}>
                    <img
                      src={pkg.featured_image || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={pkg.title}
                      className="w-full h-full object-cover"
                      style={{ filter: 'brightness(1.02) saturate(1.05)' }}
                    />
                    <button
                      onClick={() => onRemove(pkg.id)}
                      className="absolute top-2 right-2 p-1.5 transition-colors duration-300"
                      style={{ backgroundColor: 'rgba(38,61,53,0.7)', borderRadius: '50%' }}
                    >
                      <X className="h-3.5 w-3.5" style={{ color: '#F6F2E9' }} strokeWidth={1.5} />
                    </button>
                  </div>

                  <h4 className="font-display text-lg font-light mb-1 leading-tight" style={{ color: '#263D35' }}>{pkg.title}</h4>
                  {pkg.operator_name && (
                    <p className="font-mono text-[9px] tracking-[0.12em] uppercase mb-4" style={{ color: 'rgba(48,51,47,0.35)' }}>{pkg.operator_name}</p>
                  )}

                  <CompareRow label="Price">
                    <span className="font-display text-lg font-light" style={{ color: '#B69A63' }}>
                      {formatPrice(Number(pkg.price_per_person), pkg.currency)}
                    </span>
                    <span className="text-xs ml-1" style={{ color: 'rgba(48,51,47,0.35)' }}>/person</span>
                  </CompareRow>

                  <CompareRow label="Destination">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" style={{ color: 'rgba(182,154,99,0.5)' }} strokeWidth={1.5} />{location}</span>
                  </CompareRow>

                  <CompareRow label="Duration">
                    <span className="flex items-center gap-1.5"><Clock className="h-3 w-3" style={{ color: 'rgba(182,154,99,0.5)' }} strokeWidth={1.5} />{duration}</span>
                  </CompareRow>

                  <CompareRow label="Group Size">
                    <span className="flex items-center gap-1.5"><Users className="h-3 w-3" style={{ color: 'rgba(182,154,99,0.5)' }} strokeWidth={1.5} />{pkg.min_group_size}–{pkg.max_group_size}</span>
                  </CompareRow>

                  <CompareRow label="Difficulty">
                    {pkg.difficulty_level}
                  </CompareRow>

                  <CompareRow label="Accommodation">
                    {pkg.accommodation_type || '—'}
                  </CompareRow>

                  <CompareRow label="Transport">
                    {pkg.transport_type || '—'}
                  </CompareRow>

                  <CompareRow label="Meals">
                    {pkg.meals_included && pkg.meals_included.length > 0 ? pkg.meals_included.join(', ') : '—'}
                  </CompareRow>

                  <CompareRow label="Inclusions">
                    {pkg.included_items && pkg.included_items.length > 0 ? (
                      <ul className="space-y-1">
                        {pkg.included_items.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs">
                            <Check className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: '#B69A63' }} strokeWidth={1.5} />{item}
                          </li>
                        ))}
                      </ul>
                    ) : '—'}
                  </CompareRow>

                  <CompareRow label="Exclusions">
                    {pkg.excluded_items && pkg.excluded_items.length > 0 ? (
                      <ul className="space-y-1">
                        {pkg.excluded_items.map((item, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-xs">
                            <X className="h-3 w-3 mt-0.5 flex-shrink-0" style={{ color: 'rgba(48,51,47,0.25)' }} strokeWidth={1.5} />{item}
                          </li>
                        ))}
                      </ul>
                    ) : '—'}
                  </CompareRow>

                  <CompareRow label="Itinerary">
                    {itinerary.length > 0 ? `${itinerary.length} day${itinerary.length > 1 ? 's' : ''} detailed` : '—'}
                  </CompareRow>

                  <CompareRow label="Cancellation">
                    <span className="text-xs leading-relaxed">{pkg.cancellation_policy || '—'}</span>
                  </CompareRow>

                  <CompareRow label="Rating">
                    {hasRealRating ? (
                      <span className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 fill-current" style={{ color: '#B69A63' }} strokeWidth={1.5} />
                        {Number(pkg.average_rating).toFixed(1)} ({pkg.review_count})
                      </span>
                    ) : 'No reviews yet'}
                  </CompareRow>

                  <CompareRow label="Booking">
                    {pkg.booking_type === 'instant' ? 'Instant Booking' : 'Request to Book'}
                  </CompareRow>

                  <div className="mt-4">
                    <button
                      onClick={() => onViewDetails(pkg)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-xs tracking-[0.12em] uppercase font-light transition-all duration-300"
                      style={{ backgroundColor: '#263D35', color: '#F6F2E9', borderRadius: '6px' }}
                    >
                      View Details <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareDrawer;
