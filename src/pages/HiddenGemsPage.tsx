import React, { useState, useEffect } from 'react';
import {
  MapPin, Search, Filter, TrendingUp, Heart, Flame, Crown, Eye, Plus,
  Mountain, Coffee, Compass, Waves, TreePine, Camera, Map, Star, Users,
  Award, ChevronDown, X
} from 'lucide-react';
import Footer from '../components/Footer';
import QuoteSection from '../components/QuoteSection';
import AddGemModal from '../components/AddGemModal';
import SwipeableCardContainer from '../components/SwipeableCardContainer';
import { useRandomQuotes } from '../hooks/useRandomQuotes';
import { supabase } from '../shared/supabase';
import { useAuth } from '../shared/AuthContext';

interface HiddenGem {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  difficulty_level: string;
  image_url: string;
  best_time_to_visit: string;
  tips: string;
  total_votes: number;
  total_visits: number;
  verification_status: string;
  created_at: string;
}

const categories = [
  { id: 'all', label: 'All Gems', icon: Compass },
  { id: 'cafe', label: 'Cafés', icon: Coffee },
  { id: 'viewpoint', label: 'Viewpoints', icon: Mountain },
  { id: 'waterfall', label: 'Waterfalls', icon: Waves },
  { id: 'trail', label: 'Trails', icon: TreePine },
  { id: 'beach', label: 'Beaches', icon: Camera },
  { id: 'other', label: 'Other', icon: Map }
];

const difficulties = [
  { id: 'all', label: 'All Levels' },
  { id: 'easy', label: 'Easy', color: 'green' },
  { id: 'moderate', label: 'Moderate', color: 'yellow' },
  { id: 'challenging', label: 'Challenging', color: 'red' }
];

const sortOptions = [
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'newest', label: 'Newest', icon: Star },
  { id: 'most_voted', label: 'Most Voted', icon: Heart },
  { id: 'most_visited', label: 'Most Visited', icon: Eye }
];

const HiddenGemsPage = () => {
  const { quotes: randomQuotes, isLoading: quotesLoading } = useRandomQuotes(2);
  const { user } = useAuth();
  const [gems, setGems] = useState<HiddenGem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedSort, setSelectedSort] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchGems();
  }, [selectedCategory, selectedDifficulty, selectedSort]);

  const fetchGems = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('hidden_gems')
        .select('*')
        .in('verification_status', ['verified', 'featured']);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (selectedDifficulty !== 'all') {
        query = query.eq('difficulty_level', selectedDifficulty);
      }

      switch (selectedSort) {
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'most_voted':
          query = query.order('total_votes', { ascending: false });
          break;
        case 'most_visited':
          query = query.order('total_visits', { ascending: false });
          break;
        default:
          query = query.order('total_votes', { ascending: false }).limit(50);
      }

      const { data, error } = await query;

      if (error) throw error;
      setGems(data || []);
    } catch (error) {
      console.error('Error fetching gems:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (gemId: string, event: React.MouseEvent) => {
    event.preventDefault();

    if (!user) {
      alert('Please sign in to vote on hidden gems');
      return;
    }

    try {
      const { data: existingVote } = await supabase
        .from('gem_votes')
        .select('id')
        .eq('gem_id', gemId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        await supabase
          .from('gem_votes')
          .delete()
          .eq('gem_id', gemId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('gem_votes')
          .insert({ gem_id: gemId, user_id: user.id, vote_type: 'upvote' });
      }

      await fetchGems();
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to register vote. Please try again.');
    }
  };

  const filteredGems = gems.filter(gem => {
    const matchesSearch = gem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gem.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         gem.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-700 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'challenging': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20 md:pb-0">
      {!quotesLoading && randomQuotes[0] && <QuoteSection quote={randomQuotes[0]} />}

      <section className="py-16 bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-sm">
              <MapPin className="h-5 w-5 text-orange-600" />
              <span className="text-orange-600 font-semibold">Community Discovery</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
              Hidden <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600">Gems</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              A digital treasure hunt powered by explorers like you. Discover secret spots that aren't in any guidebook.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-600" />
                  <span className="font-bold text-2xl text-gray-900">{filteredGems.length}</span>
                  <span className="text-gray-600">Gems</span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="font-bold text-2xl text-gray-900">1.2k</span>
                  <span className="text-gray-600">Explorers</span>
                </div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl shadow-sm">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600" />
                  <span className="font-bold text-2xl text-gray-900">156</span>
                  <span className="text-gray-600">Verified</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search hidden gems..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-semibold"
              >
                <Filter className="h-5 w-5" />
                Filters
                <ChevronDown className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                          selectedCategory === category.id
                            ? 'bg-gradient-to-r from-orange-600 to-pink-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-orange-500'
                        }`}
                      >
                        <category.icon className="h-4 w-4" />
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Mountain className="h-4 w-4" />
                      Difficulty Level
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {difficulties.map(difficulty => (
                        <button
                          key={difficulty.id}
                          onClick={() => setSelectedDifficulty(difficulty.id)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            selectedDifficulty === difficulty.id
                              ? 'bg-gray-900 text-white'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-900'
                          }`}
                        >
                          {difficulty.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Sort By
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {sortOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => setSelectedSort(option.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                            selectedSort === option.id
                              ? 'bg-gray-900 text-white'
                              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-900'
                          }`}
                        >
                          <option.icon className="h-4 w-4" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedDifficulty('all');
                    setSelectedSort('trending');
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mb-4"></div>
              <p className="text-gray-600 font-semibold">Loading hidden gems...</p>
            </div>
          ) : filteredGems.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <MapPin className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No hidden gems found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedDifficulty('all');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <p className="text-gray-600">
                  Showing <span className="font-bold text-orange-600">{filteredGems.length}</span> hidden gems
                </p>
              </div>

              <SwipeableCardContainer
                mobileCards={1}
                tabletCards={2}
                desktopCards={3}
                showDots={true}
                showArrows={true}
                className="px-4 md:px-0"
              >
                {filteredGems.map((gem) => (
                  <div
                    key={gem.id}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={gem.image_url || 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={gem.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                      <div className="absolute top-4 left-4 flex gap-2">
                        {gem.verification_status === 'featured' && (
                          <span className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full">
                            <Crown className="h-3 w-3" />
                            Featured
                          </span>
                        )}
                        <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getDifficultyColor(gem.difficulty_level)}`}>
                          {gem.difficulty_level}
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-1">{gem.title}</h3>
                        <div className="flex items-center gap-1 text-white/90 text-sm">
                          <MapPin className="h-4 w-4" />
                          {gem.location}
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                        {gem.description}
                      </p>

                      {gem.tips && (
                        <div className="mb-4 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                          <p className="text-sm text-orange-900 font-medium">💡 {gem.tips}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => handleVote(gem.id, e)}
                            className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors"
                          >
                            <Heart className="h-5 w-5" />
                            <span className="font-semibold">{gem.total_votes}</span>
                          </button>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Eye className="h-5 w-5" />
                            <span className="font-semibold">{gem.total_visits}</span>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </SwipeableCardContainer>
            </>
          )}
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-6">
            <Plus className="h-8 w-8" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Found a Hidden Gem?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Share your secret spot with the community. Help fellow explorers discover amazing places. Earn rewards for positive, valuable contributions!
          </p>
          <button
            onClick={() => {
              if (!user) {
                alert('Please sign in to add a hidden gem');
                return;
              }
              setShowAddModal(true);
            }}
            className="px-8 py-4 bg-white text-teal-600 text-lg font-bold rounded-xl hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-xl"
          >
            Add Your Discovery
          </button>
        </div>
      </section>

      {!quotesLoading && randomQuotes[1] && <QuoteSection quote={randomQuotes[1]} />}

      <Footer />

      <AddGemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchGems}
      />
    </div>
  );
};

export default HiddenGemsPage;
