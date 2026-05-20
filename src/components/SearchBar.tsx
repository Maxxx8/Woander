import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Calendar, Filter, X } from 'lucide-react';

interface SearchFilters {
  query: string;
  location: string;
  minBudget: string;
  maxBudget: string;
  category: string;
  difficulty: string;
}

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  showBudgetFilter?: boolean;
  showCategoryFilter?: boolean;
  showDifficultyFilter?: boolean;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  showBudgetFilter = true,
  showCategoryFilter = true,
  showDifficultyFilter = false,
  placeholder = 'Search destinations, experiences, hidden gems...',
}: SearchBarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    location: '',
    minBudget: '',
    maxBudget: '',
    category: '',
    difficulty: '',
  });

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleReset = () => {
    const resetFilters: SearchFilters = {
      query: '',
      location: '',
      minBudget: '',
      maxBudget: '',
      category: '',
      difficulty: '',
    };
    setFilters(resetFilters);
    onSearch(resetFilters);
  };

  const hasActiveFilters =
    filters.location ||
    filters.minBudget ||
    filters.maxBudget ||
    filters.category ||
    filters.difficulty;

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Main Search Bar */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="text-gray-400 flex-shrink-0" size={24} />
            <input
              type="text"
              placeholder={placeholder}
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 outline-none text-gray-800 placeholder-gray-400 min-w-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                showFilters || hasActiveFilters
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter size={20} />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                  •
                </span>
              )}
            </button>
            <button
              onClick={handleSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap flex-shrink-0"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Filter Results</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Filter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} />
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Bali, Tokyo, Paris"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            {showCategoryFilter && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Filter size={16} />
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="nature">Nature & Outdoors</option>
                  <option value="culture">Culture & Heritage</option>
                  <option value="food">Food & Dining</option>
                  <option value="adventure">Adventure</option>
                  <option value="relaxation">Relaxation</option>
                  <option value="urban">Urban Exploration</option>
                </select>
              </div>
            )}

            {/* Budget Range */}
            {showBudgetFilter && (
              <>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <DollarSign size={16} />
                    Min Budget ($)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minBudget}
                    onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <DollarSign size={16} />
                    Max Budget ($)
                  </label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={filters.maxBudget}
                    onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* Difficulty Level */}
            {showDifficultyFilter && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} />
                  Difficulty Level
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Reset Filters
            </button>
            <button
              onClick={() => {
                handleSearch();
                setShowFilters(false);
              }}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
