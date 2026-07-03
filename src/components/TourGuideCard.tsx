import React from 'react';
import { MapPin } from 'lucide-react';
import type { TourGuide } from '../shared/supabase';
import {
  SAMPLE_GEMS_BY_ARCHETYPE,
  SAMPLE_FIELD_NOTES,
  WHY_EXPLORE_BY_ARCHETYPE,
  deterministicNum,
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

  // Deterministic sample metrics when DB values are zero
  const gemsCount =
    guide.hidden_gems_count && guide.hidden_gems_count > 0
      ? guide.hidden_gems_count
      : deterministicNum(guide.id, 12, 28);

  const notesCount =
    guide.field_notes_count && guide.field_notes_count > 0
      ? guide.field_notes_count
      : deterministicNum(guide.id + 'n', 45, 124);

  // "Why They Explore" — bio first sentence, then archetype-based fallback
  const whyExplore = (() => {
    if (guide.bio && guide.bio.trim().length > 0) {
      const firstSentence = guide.bio.split(/[.!?]/)[0].trim();
      if (firstSentence.length > 20) return firstSentence + '.';
    }
    return WHY_EXPLORE_BY_ARCHETYPE[archetype] || WHY_EXPLORE_BY_ARCHETYPE['default'] || '';
  })();

  // Known For — hosted_gems from DB, fallback to archetype-based samples
  const knownFor: string[] =
    guide.hosted_gems && guide.hosted_gems.length > 0
      ? guide.hosted_gems.slice(0, 3)
      : (SAMPLE_GEMS_BY_ARCHETYPE[archetype] || SAMPLE_GEMS_BY_ARCHETYPE['default']).slice(0, 3);

  // Field Notes — sample_field_notes from DB, fallback to index-based samples
  const noteSet = guide.sample_field_notes && guide.sample_field_notes.length > 0
    ? guide.sample_field_notes.slice(0, 2)
    : SAMPLE_FIELD_NOTES[deterministicNum(guide.id, 0, SAMPLE_FIELD_NOTES.length - 1)].slice(0, 2);

  return (
    <div className="group border-b border-r border-forest-800 flex flex-col overflow-hidden">
      {/* Image */}
      <div className="relative h-52 overflow-hidden flex-shrink-0">
        <img
          src={
            guide.profile_image ||
            'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=600'
          }
          alt={guide.full_name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          style={{ filter: 'grayscale(30%) brightness(0.50) saturate(0.7)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/98 via-forest-950/30 to-transparent" />

        {/* Archetype badge */}
        <div className="absolute top-3 right-3">
          <span className="font-mono text-[8px] text-gold-400/70 border border-gold-400/20 px-2 py-0.5 bg-forest-950/70 tracking-widest uppercase">
            {archetype}
          </span>
        </div>

        {/* Name + location */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-display text-xl font-light text-cream leading-tight group-hover:text-gold-200 transition-colors duration-300">
            {guide.full_name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-gold-400/40 flex-shrink-0" />
            <span className="font-mono text-[8px] text-mist-700 tracking-widest uppercase">
              {guide.location_city}, {guide.location_state}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5">

        {/* Why They Explore */}
        <p className="font-display italic text-sm text-gold-300/60 font-light leading-relaxed mb-4">
          {whyExplore}
        </p>

        <div className="border-t border-forest-800 pt-4 mb-4">
          {/* Metrics */}
          <div className="flex gap-4 mb-3">
            {[
              { value: gemsCount, label: 'Hidden Gems' },
              { value: notesCount, label: 'Field Notes' },
              { value: guide.years_experience, label: 'Yrs Exploring' },
            ].map(({ value, label }) => (
              <div key={label}>
                <span className="font-display text-base font-light text-cream">{value}</span>
                <span className="font-mono text-[7px] text-mist-700 tracking-widest uppercase ml-1 block leading-none mt-0.5">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Languages */}
          {guide.languages.length > 0 && (
            <p className="font-mono text-[8px] text-mist-700 tracking-widest">
              {guide.languages.slice(0, 3).join(' · ')}
              {guide.languages.length > 3 && ` +${guide.languages.length - 3}`}
            </p>
          )}
        </div>

        {/* Known For */}
        <div className="mb-4">
          <p className="font-mono text-[8px] text-gold-400/40 tracking-widest uppercase mb-2">
            Known For
          </p>
          <div className="flex flex-wrap gap-1">
            {knownFor.map((gem, i) => (
              <span
                key={i}
                className="font-mono text-[8px] text-mist-600 border border-forest-700 px-2 py-0.5 hover:border-gold-400/20 hover:text-mist-500 transition-colors duration-300"
              >
                {gem}
              </span>
            ))}
          </div>
        </div>

        {/* Field Notes */}
        <div className="mb-5 flex-1">
          <p className="font-mono text-[8px] text-gold-400/40 tracking-widest uppercase mb-2">
            Field Notes
          </p>
          <div className="space-y-1.5">
            {noteSet.map((note, i) => (
              <p key={i} className="font-display italic text-xs text-mist-700 font-light leading-relaxed">
                "{note}"
              </p>
            ))}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => onBook(guide)}
          className="w-full font-mono text-[10px] tracking-widest text-gold-300/60 border border-gold-400/20 py-2.5 hover:border-gold-400/50 hover:text-gold-300 hover:bg-forest-900 transition-all duration-300 mt-auto"
        >
          EXPLORE TOGETHER →
        </button>
      </div>
    </div>
  );
};

export default TourGuideCard;
