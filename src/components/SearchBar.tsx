import React, { useState } from 'react';
import { Search, MapPin, DollarSign, Calendar, Filter, X, Compass } from 'lucide-react';

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
        <div className="glass-card flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 sm:p-4">
          <div className="flex items-center gap-3 flex-1 px-2">
            <Compass className="text-gold-400/70 flex-shrink-0" size={20} />
            <input
              type="text"
              placeholder={placeholder}
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 bg-transparent outline-none text-cream placeholder-mist-700 min-w-0 font-light text-sm tracking-wide"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2 border transition-all whitespace-nowrap text-xs tracking-widest uppercase ${
                showFilters || hasActiveFilters
                  ? 'border-gold-400/50 text-gold-300 bg-gold-400/8'
                  : 'border-forest-700 text-mist-500 hover:border-gold-400/30 hover:text-mist-300'
              }`}
            >
              <Filter size={16} />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="bg-gold-400/30 text-gold-200 rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
                  •
                </span>
              )}
            </button>
            <button
              onClick={handleSearch}
              className="bg-gold-400/15 border border-gold-400/40 text-gold-200 px-6 py-2 hover:bg-gold-400/25 hover:border-gold-400/70 transition-all font-light text-xs tracking-widest uppercase whitespace-nowrap flex-shrink-0"
            >
              Seek
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 glass-card p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-jetbrains text-[10px] text-gold-400/70 tracking-widest uppercase">Refine The Search</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-mist-700 hover:text-mist-400 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Location Filter */}
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-mist-400 mb-2 tracking-wide">
                <MapPin size={14} className="text-gold-400/50" />
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Wayanad, Idukki, Kochi"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-4 py-2 bg-forest-900/60 border border-forest-700 text-cream placeholder-mist-700 outline-none focus:border-gold-400/40 transition-colors text-sm font-light"
              />
            </div>

            {/* Category Filter */}
            {showCategoryFilter && (
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-mist-400 mb-2 tracking-wide">
                  <Filter size={14} className="text-gold-400/50" />
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-2 bg-forest-900/60 border border-forest-700 text-cream outline-none focus:border-gold-400/40 transition-colors text-sm font-light"
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
                  <label className="flex items-center gap-2 text-xs font-medium text-mist-400 mb-2 tracking-wide">
                    <DollarSign size={14} className="text-gold-400/50" />
                    Min Budget (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={filters.minBudget}
                    onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                    className="w-full px-4 py-2 bg-forest-900/60 border border-forest-700 text-cream placeholder-mist-700 outline-none focus:border-gold-400/40 transition-colors text-sm font-light"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-mist-400 mb-2 tracking-wide">
                    <DollarSign size={14} className="text-gold-400/50" />
                    Max Budget (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={filters.maxBudget}
                    onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                    className="w-full px-4 py-2 bg-forest-900/60 border border-forest-700 text-cream placeholder-mist-700 outline-none focus:border-gold-400/40 transition-colors text-sm font-light"
                  />
                </div>
              </>
            )}

            {/* Difficulty Level */}
            {showDifficultyFilter && (
              <div>
                <label className="flex items-center gap-2 text-xs font-medium text-mist-400 mb-2 tracking-wide">
                  <Calendar size={14} className="text-gold-400/50" />
                  Difficulty Level
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="w-full px-4 py-2 bg-forest-900/60 border border-forest-700 text-cream outline-none focus:border-gold-400/40 transition-colors text-sm font-light"
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
              className="flex-1 px-4 py-2 border border-forest-700 text-mist-500 hover:border-mist-700 hover:text-mist-300 transition-all text-xs tracking-widest uppercase font-light"
            >
              Reset
            </button>
            <button
              onClick={() => {
                handleSearch();
                setShowFilters(false);
              }}
              className="flex-1 px-4 py-2 bg-gold-400/15 border border-gold-400/40 text-gold-200 hover:bg-gold-400/25 hover:border-gold-400/70 transition-all text-xs tracking-widest uppercase font-light"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
