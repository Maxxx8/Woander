import React from 'react';
import { MapPin } from 'lucide-react';
import type { TourGuide } from '../shared/supabase';

interface TourGuideCardProps {
  guide: TourGuide;
  onBook: (guide: TourGuide) => void;
}

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

const TourGuideCard: React.FC<TourGuideCardProps> = ({ guide, onBook }) => {
  const archetype =
    guide.archetype ||
    (guide.specialties.length > 0 ? ARCHETYPE_FALLBACK[guide.specialties[0]] : null) ||
    'Local Expert';

  const fieldNote = guide.sample_field_notes?.[0] || null;
  const hostedGems = guide.hosted_gems?.slice(0, 3) || [];

  return (
    <div className="group border-b border-r border-forest-800 overflow-hidden">
      {/* Image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={
            guide.profile_image ||
            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600'
          }
          alt={guide.full_name}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
          style={{ filter: 'grayscale(25%) brightness(0.55)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/95 via-forest-950/30 to-transparent" />
        <div className="absolute top-3 right-3">
          <span className="font-jetbrains text-[9px] text-gold-400/70 border border-gold-400/20 px-2 py-0.5 bg-forest-950/60 tracking-widest">
            {archetype.toUpperCase()}
          </span>
        </div>
        <div className="absolute bottom-3 left-4">
          <div className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-gold-400/40" />
            <span className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase">
              {guide.location_city}, {guide.location_state}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="font-display text-lg font-light text-cream mb-1 group-hover:text-gold-200 transition-colors duration-300">
          {guide.full_name}
        </h3>

        {/* Metrics */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
          {[
            { label: 'Hidden Gems', value: guide.hidden_gems_count ?? 0 },
            { label: 'Field Notes', value: guide.field_notes_count ?? 0 },
            { label: 'Yrs Exploring', value: guide.years_experience },
          ].map(({ label, value }) => (
            <div key={label}>
              <span className="font-display text-sm font-light text-cream">{value}</span>
              <span className="font-jetbrains text-[8px] text-mist-700 tracking-widest ml-1 uppercase">{label}</span>
            </div>
          ))}
        </div>

        {/* Languages */}
        {guide.languages.length > 0 && (
          <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest mb-3">
            {guide.languages.slice(0, 3).join(' · ')}
            {guide.languages.length > 3 && ` +${guide.languages.length - 3}`}
          </p>
        )}

        {/* Hosted Gems */}
        {hostedGems.length > 0 && (
          <div className="mb-4">
            <p className="font-jetbrains text-[8px] text-gold-400/40 tracking-widest uppercase mb-1">Places I Know</p>
            <div className="flex flex-wrap gap-1">
              {hostedGems.map((gem, i) => (
                <span key={i} className="font-jetbrains text-[8px] text-mist-700 border border-forest-700 px-2 py-0.5">
                  {gem}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Field note */}
        {fieldNote && (
          <p className="font-display italic text-xs text-mist-600 font-light line-clamp-2 mb-4">
            "{fieldNote}"
          </p>
        )}

        {/* Action */}
        <button
          onClick={() => onBook(guide)}
          className="w-full font-jetbrains text-[10px] tracking-widest text-gold-300/70 border border-gold-400/20 py-2 hover:border-gold-400/50 hover:text-gold-300 transition-all duration-300 mt-auto"
        >
          EXPLORE TOGETHER
        </button>
      </div>
    </div>
  );
};

export default TourGuideCard;
