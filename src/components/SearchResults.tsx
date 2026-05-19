import React from 'react';
import { MapPin, DollarSign, Tag, TrendingUp, Calendar } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  location: string;
  image_url?: string;
  category?: string;
  difficulty_level?: string;
  total_cost?: number;
  type: 'hidden_gem' | 'adventure';
}

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}

export default function SearchResults({ results, loading, error }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-gray-600 text-lg">No results found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {results.map((result) => (
        <div
          key={result.id}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          {/* Image */}
          {result.image_url ? (
            <div className="h-48 overflow-hidden">
              <img
                src={result.image_url}
                alt={result.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
              <MapPin size={48} className="text-white opacity-50" />
            </div>
          )}

          {/* Content */}
          <div className="p-5">
            {/* Type Badge */}
            <div className="mb-3">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                  result.type === 'hidden_gem'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {result.type === 'hidden_gem' ? (
                  <>
                    <TrendingUp size={14} />
                    Hidden Gem
                  </>
                ) : (
                  <>
                    <Calendar size={14} />
                    Adventure
                  </>
                )}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
              {result.title}
            </h3>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-600 mb-3">
              <MapPin size={16} className="flex-shrink-0" />
              <span className="text-sm line-clamp-1">{result.location}</span>
            </div>

            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-3">{result.description}</p>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-2">
              {result.category && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  <Tag size={12} />
                  {result.category}
                </div>
              )}
              {result.difficulty_level && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {result.difficulty_level}
                </div>
              )}
              {result.total_cost && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  <DollarSign size={12} />
                  ${result.total_cost.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
