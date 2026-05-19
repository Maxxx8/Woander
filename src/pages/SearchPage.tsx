import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import { useSearch } from '../hooks/useSearch';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { results, loading, error, searchContent } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);

  // Load initial search from URL params
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const location = searchParams.get('location') || '';
    const category = searchParams.get('category') || '';

    if (query || location || category) {
      handleSearch({
        query,
        location,
        category,
        minBudget: '',
        maxBudget: '',
        difficulty: '',
      });
    }
  }, []);

  const handleSearch = async (filters: any) => {
    setHasSearched(true);

    // Update URL params
    const params = new URLSearchParams();
    if (filters.query) params.set('q', filters.query);
    if (filters.location) params.set('location', filters.location);
    if (filters.category) params.set('category', filters.category);
    if (filters.minBudget) params.set('minBudget', filters.minBudget);
    if (filters.maxBudget) params.set('maxBudget', filters.maxBudget);
    if (filters.difficulty) params.set('difficulty', filters.difficulty);

    setSearchParams(params);

    // Perform search
    await searchContent(filters);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Search</h1>
          <p className="text-gray-600">
            Discover adventures, hidden gems, and experiences around the world
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SearchBar
          onSearch={handleSearch}
          showBudgetFilter={true}
          showCategoryFilter={true}
          showDifficultyFilter={true}
        />
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {hasSearched ? (
          <>
            {!loading && !error && results.length > 0 && (
              <div className="mb-6">
                <p className="text-gray-600">
                  Found <span className="font-semibold text-gray-800">{results.length}</span>{' '}
                  {results.length === 1 ? 'result' : 'results'}
                </p>
              </div>
            )}
            <SearchResults results={results} loading={loading} error={error} />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="inline-block p-8 bg-white rounded-xl shadow-md">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Start Your Search
              </h3>
              <p className="text-gray-600">
                Use the search bar above to find adventures and hidden gems
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
