import { useState, useEffect } from 'react';
import { supabase } from '../shared/supabase';

interface SearchFilters {
  query: string;
  location: string;
  minBudget: string;
  maxBudget: string;
  category: string;
  difficulty: string;
}

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

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchContent = async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      // Search Hidden Gems
      let gemsQuery = supabase
        .from('hidden_gems')
        .select('*')
        .eq('verification_status', 'verified');

      // Apply text search
      if (filters.query) {
        gemsQuery = gemsQuery.or(
          `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,location.ilike.%${filters.query}%`
        );
      }

      // Apply location filter
      if (filters.location) {
        gemsQuery = gemsQuery.ilike('location', `%${filters.location}%`);
      }

      // Apply category filter
      if (filters.category) {
        gemsQuery = gemsQuery.eq('category', filters.category);
      }

      // Apply difficulty filter
      if (filters.difficulty) {
        gemsQuery = gemsQuery.eq('difficulty_level', filters.difficulty);
      }

      const { data: gems, error: gemsError } = await gemsQuery;

      if (gemsError) throw gemsError;

      // Search Adventures
      let adventuresQuery = supabase
        .from('adventures')
        .select('*');

      // Apply text search
      if (filters.query) {
        adventuresQuery = adventuresQuery.or(
          `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,destination.ilike.%${filters.query}%`
        );
      }

      // Apply location filter
      if (filters.location) {
        adventuresQuery = adventuresQuery.ilike('destination', `%${filters.location}%`);
      }

      // Apply budget filters
      if (filters.minBudget) {
        adventuresQuery = adventuresQuery.gte('total_cost', parseFloat(filters.minBudget));
      }
      if (filters.maxBudget) {
        adventuresQuery = adventuresQuery.lte('total_cost', parseFloat(filters.maxBudget));
      }

      const { data: adventures, error: adventuresError } = await adventuresQuery;

      if (adventuresError) throw adventuresError;

      // Combine and format results
      const formattedGems: SearchResult[] = (gems || []).map((gem) => ({
        id: gem.id,
        title: gem.title,
        description: gem.description,
        location: gem.location,
        image_url: gem.image_url,
        category: gem.category,
        difficulty_level: gem.difficulty_level,
        type: 'hidden_gem' as const,
      }));

      const formattedAdventures: SearchResult[] = (adventures || []).map((adventure) => ({
        id: adventure.id,
        title: adventure.title,
        description: adventure.description || '',
        location: adventure.destination,
        total_cost: adventure.total_cost,
        type: 'adventure' as const,
      }));

      setResults([...formattedGems, ...formattedAdventures]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    searchContent,
  };
}
