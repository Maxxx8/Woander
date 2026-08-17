import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import type { TourGuide } from '../shared/supabase';
import {
  WHY_EXPLORE_BY_ARCHETYPE,
} from '../data/vanguardSamples';

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

  const gemsCount = guide.hidden_gems_count ?? 0;
  const yearsExp = guide.years_experience ?? 0;

  const whyExplore = (() => {
    if (guide.bio && guide.bio.trim().length > 0) {
      const firstSentence = guide.bio.split(/[.!?]/)[0].trim();
      if (firstSentence.length > 20) return firstSentence + '.';
    }
    return WHY_EXPLORE_BY_ARCHETYPE[archetype] || WHY_EXPLORE_BY_ARCHETYPE['default'] || '';
  })();

  return (
    <div
      className="group flex flex-col overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        backgroundColor: '#FBF8F1',
        borderRadius: '10px',
        border: '1px solid rgba(38,61,53,0.06)',
        boxShadow: '0 4px 16px rgba(38,61,53,0.05)',
      }}
      onClick={() => onBook(guide)}
    >
      {/* Image — bright, warm */}
      <div className="relative h-72 overflow-hidden flex-shrink-0">
        <img
          src={guide.profile_image || 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=800'}
          alt={guide.full_name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ filter: 'brightness(1.12) saturate(1.08) sepia(0.05)' }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(38,61,53,0.7), rgba(38,61,53,0.05) 50%, transparent)' }} />

        {/* Archetype label */}
        <div className="absolute top-4 right-4">
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase px-3 py-1" style={{ color: 'rgba(246,242,233,0.85)', backgroundColor: 'rgba(38,61,53,0.5)', borderRadius: '999px', backdropFilter: 'blur(4px)' }}>
            {archetype}
          </span>
        </div>

        {/* Name + location over image */}
        <div className="absolute bottom-4 left-5 right-5">
          <h3 className="font-display text-2xl font-light leading-tight mb-1" style={{ color: '#F6F2E9' }}>
            {guide.full_name}
          </h3>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 flex-shrink-0" style={{ color: 'rgba(231,217,197,0.7)' }} strokeWidth={1.5} />
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase" style={{ color: 'rgba(246,242,233,0.7)' }}>
              {guide.location_city}{guide.location_state ? `, ${guide.location_state}` : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-6">

        {/* Why They Explore */}
        <p className="font-display italic text-sm font-light leading-relaxed mb-5" style={{ color: '#B77B65' }}>
          {whyExplore}
        </p>

        {/* Metrics — minimal */}
        <div className="flex items-center gap-5 mb-5 pt-4" style={{ borderTop: '1px solid rgba(38,61,53,0.08)' }}>
          <div>
            <span className="font-display text-lg font-light" style={{ color: '#263D35' }}>{gemsCount}</span>
            <span className="font-mono text-[8px] tracking-[0.15em] uppercase ml-1" style={{ color: 'rgba(48,51,47,0.45)' }}>Gems</span>
          </div>
          <div>
            <span className="font-display text-lg font-light" style={{ color: '#263D35' }}>{yearsExp}</span>
            <span className="font-mono text-[8px] tracking-[0.15em] uppercase ml-1" style={{ color: 'rgba(48,51,47,0.45)' }}>Yrs</span>
          </div>
          {guide.languages.length > 0 && (
            <div className="ml-auto">
              <span className="font-mono text-[8px] tracking-[0.1em] uppercase" style={{ color: 'rgba(48,51,47,0.4)' }}>
                {guide.languages.slice(0, 2).join(' · ')}
                {guide.languages.length > 2 && ` +${guide.languages.length - 2}`}
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={(e) => { e.stopPropagation(); onBook(guide); }}
          className="group/btn flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] uppercase transition-colors duration-300 mt-auto self-start"
          style={{ color: '#263D35' }}
        >
          <span className="border-b pb-0.5 transition-all duration-300 group-hover/btn:border-[#B69A63]" style={{ borderColor: 'rgba(38,61,53,0.2)' }}>
            Explore Together
          </span>
          <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/btn:translate-x-0.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
};

export default TourGuideCard;
