import React from 'react';
import { Star, MapPin, Languages, Award, Calendar } from 'lucide-react';
import type { TourGuide } from '../shared/supabase';

interface TourGuideCardProps {
  guide: TourGuide;
  onClick: () => void;
}

const TourGuideCard: React.FC<TourGuideCardProps> = ({ guide, onClick }) => {
  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case 'verified':
        return 'bg-blue-100 text-blue-700';
      case 'top_rated':
        return 'bg-yellow-100 text-yellow-700';
      case 'certified':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatBadgeName = (badge: string) => {
    return badge.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden group hover:-translate-y-2"
    >
      <div className="relative h-56">
        <img
          src={guide.profile_image || 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={guide.full_name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        {guide.verification_badges.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {guide.verification_badges.map((badge) => (
              <span
                key={badge}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(badge)} flex items-center gap-1`}
              >
                <Award className="w-3 h-3" />
                {formatBadgeName(badge)}
              </span>
            ))}
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-2xl font-bold mb-1">{guide.full_name}</h3>
          <div className="flex items-center gap-2 text-white/90">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{guide.location_city}, {guide.location_state}</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="flex">{renderStars(guide.average_rating)}</div>
            <span className="text-sm font-semibold text-gray-700">
              {guide.average_rating.toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">
              ({guide.total_reviews} reviews)
            </span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {guide.bio}
        </p>

        <div className="space-y-3 mb-4">
          {guide.languages.length > 0 && (
            <div className="flex items-start gap-2">
              <Languages className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {guide.languages.slice(0, 3).map((lang, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                  >
                    {lang}
                  </span>
                ))}
                {guide.languages.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{guide.languages.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {guide.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {guide.specialties.slice(0, 3).map((specialty, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-gradient-to-r from-coral-50 to-sunset-50 text-coral-700 rounded-full text-xs font-medium"
                >
                  {specialty}
                </span>
              ))}
              {guide.specialties.length > 3 && (
                <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-xs">
                  +{guide.specialties.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{guide.years_experience} years</span>
            </div>
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>{guide.total_tours_completed} tours</span>
            </div>
          </div>
        </div>

        <button className="w-full mt-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg font-semibold hover:from-teal-600 hover:to-teal-700 transition-all shadow-md hover:shadow-lg">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default TourGuideCard;
