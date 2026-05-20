import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import { useSearch } from '../hooks/useSearch';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { results, loading, error, searchContent } = useSearch();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasSearched(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSearch = async (filters: any) => {
    setHasSearched(true);
    await searchContent(filters);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-start justify-center md:pt-20 md:pb-8 px-0 md:px-4 overflow-y-auto">
        <div className="relative w-full max-w-6xl bg-white md:rounded-2xl shadow-2xl overflow-hidden animate-slideDown md:my-auto flex flex-col h-full md:h-auto md:max-h-[calc(100vh-8rem)]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">Search</h2>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                Discover adventures, hidden gems, and experiences
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="px-4 md:px-6 py-4 md:py-6 border-b border-gray-200 flex-shrink-0 bg-gray-50">
            <SearchBar
              onSearch={handleSearch}
              showBudgetFilter={true}
              showCategoryFilter={true}
              showDifficultyFilter={true}
            />
          </div>

          {/* Results */}
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 md:py-6">
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
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-block p-8 bg-gray-50 rounded-xl">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      Start Your Search
                    </h3>
                    <p className="text-gray-600">
                      Use the search bar above to find adventures and hidden gems
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
