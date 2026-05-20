import { useState, useEffect } from 'react';
import { supabase } from '../shared/supabase';
import { useAuth } from '../shared/AuthContext';
import MyProperties from './MyProperties';
import AddPropertyModal from './AddPropertyModal';
import {
  User,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Star,
  Eye,
  ThumbsUp,
  Edit2,
  Save,
  X,
  Trophy,
  Sparkles,
  Camera,
  Home,
  Plus
} from 'lucide-react';

interface UserProfile {
  display_name: string | null;
  bio: string;
  avatar_url: string | null;
  location: string;
  joined_at: string;
}

interface UserContributions {
  gems_discovered: number;
  gems_verified: number;
  total_votes_received: number;
  explorer_level: number;
  badges: string[];
}

interface UserStats {
  totalAdventures: number;
  totalGems: number;
  totalComments: number;
}

interface Badge {
  id: string;
  badge_type: string;
  badge_name: string;
  badge_description: string;
  earned_at: string;
  metadata: any;
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [contributions, setContributions] = useState<UserContributions | null>(null);
  const [stats, setStats] = useState<UserStats>({ totalAdventures: 0, totalGems: 0, totalComments: 0 });
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [editForm, setEditForm] = useState({
    display_name: '',
    bio: '',
    location: ''
  });

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      const [profileRes, contributionsRes, adventuresRes, gemsRes, commentsRes] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('user_contributions')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('adventures')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        supabase
          .from('hidden_gems')
          .select('id', { count: 'exact', head: true })
          .eq('submitted_by', user.id),
        supabase
          .from('gem_comments')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
      ]);

      if (profileRes.error) {
        console.error('Profile error:', profileRes.error);
      }

      if (contributionsRes.error) {
        console.error('Contributions error:', contributionsRes.error);
      }

      if (profileRes.data) {
        setProfile(profileRes.data);
        setEditForm({
          display_name: profileRes.data.display_name || '',
          bio: profileRes.data.bio || '',
          location: profileRes.data.location || ''
        });
      } else {
        const defaultProfile: UserProfile = {
          display_name: null,
          bio: '',
          avatar_url: null,
          location: '',
          joined_at: new Date().toISOString()
        };
        setProfile(defaultProfile);
      }

      if (contributionsRes.data) {
        setContributions(contributionsRes.data);
        const badgesArray = contributionsRes.data.badges || [];
        setBadges(Array.isArray(badgesArray) ? badgesArray : []);
      } else {
        const defaultContributions: UserContributions = {
          gems_discovered: 0,
          gems_verified: 0,
          total_votes_received: 0,
          explorer_level: 1,
          badges: []
        };
        setContributions(defaultContributions);
        setBadges([]);
      }

      setStats({
        totalAdventures: adventuresRes.count || 0,
        totalGems: gemsRes.count || 0,
        totalComments: commentsRes.count || 0
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: editForm.display_name,
          bio: editForm.bio,
          location: editForm.location
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await loadUserData();
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      setUploadingAvatar(true);

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('Failed to upload avatar. The storage bucket may not be configured.');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        alert('Failed to update profile with new avatar.');
        return;
      }

      await loadUserData();
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('An unexpected error occurred while uploading your avatar.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getLevelProgress = () => {
    if (!contributions) return 0;
    const currentLevel = contributions.explorer_level;
    const gemsNeeded = (currentLevel * 5);
    const votesNeeded = (currentLevel * 20);
    const progress = ((contributions.gems_verified / gemsNeeded) + (contributions.total_votes_received / votesNeeded)) * 50;
    return Math.min(progress, 100);
  };

  const getBadgeIcon = (level: number) => {
    if (level >= 10) return '👑';
    if (level >= 7) return '💎';
    if (level >= 5) return '⭐';
    if (level >= 3) return '🏆';
    return '🌟';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coral-500"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
          <p className="text-neutral-600">Please sign in to view your dashboard</p>
        </div>
      </div>
    );
  }

  const joinedDate = new Date(profile.joined_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-coral-50 to-white pt-20 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative h-48 bg-gradient-to-r from-coral-500 via-sunset-500 to-teal-400">
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          <div className="relative px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 mb-6">
              <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-white p-2 shadow-xl">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.display_name || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-coral-400 to-sunset-500 flex items-center justify-center">
                        <User className="w-16 h-16 text-white" />
                      </div>
                    )}
                  </div>
                  {contributions && (
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                      <span className="text-2xl">{getBadgeIcon(contributions.explorer_level)}</span>
                    </div>
                  )}
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -left-2 bg-coral-500 text-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-coral-600 transition-colors"
                  >
                    {uploadingAvatar ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Camera className="w-5 h-5" />
                    )}
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </div>

                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.display_name}
                      onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                      className="text-3xl font-bold text-neutral-900 border-b-2 border-teal-500 focus:outline-none bg-transparent"
                      placeholder="Your Name"
                    />
                  ) : (
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 break-words max-w-full">
                      {profile.display_name || 'Explorer'}
                    </h1>
                  )}
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 mt-2 text-sm md:text-base text-neutral-600">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="border-b border-neutral-300 focus:outline-none focus:border-teal-500 bg-transparent"
                        placeholder="Your Location"
                      />
                    ) : (
                      profile.location && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {profile.location}
                        </span>
                      )
                    )}
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Joined {joinedDate}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-lg hover:from-coral-600 hover:to-coral-700 transition-all shadow-md flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditForm({
                          display_name: profile.display_name || '',
                          bio: profile.bio || '',
                          location: profile.location || ''
                        });
                      }}
                      className="px-4 py-2 bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-gradient-to-r from-coral-500 to-coral-600 text-white rounded-lg hover:from-coral-600 hover:to-coral-700 transition-all shadow-md flex items-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {isEditing ? (
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full p-3 border-2 border-neutral-200 rounded-lg focus:outline-none focus:border-teal-500 resize-none"
                rows={3}
                placeholder="Tell us about yourself..."
              />
            ) : (
              profile.bio && (
                <p className="text-neutral-700 mb-8">{profile.bio}</p>
              )
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-coral-50 to-sunset-50 rounded-xl p-6 border border-coral-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-600">My Adventures</h3>
                  <MapPin className="w-5 h-5 text-coral-500" />
                </div>
                <p className="text-3xl font-bold text-neutral-900">{stats.totalAdventures}</p>
                <p className="text-sm text-neutral-600 mt-1">Planned trips</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-600">Hidden Gems</h3>
                  <Star className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-neutral-900">{stats.totalGems}</p>
                <p className="text-sm text-neutral-600 mt-1">Discovered locations</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-neutral-600">Community</h3>
                  <ThumbsUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-neutral-900">{stats.totalComments}</p>
                <p className="text-sm text-neutral-600 mt-1">Comments shared</p>
              </div>
            </div>

            {contributions && (
              <div className="bg-gradient-to-br from-sunset-50 to-coral-50 rounded-xl p-8 border border-sunset-100">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-neutral-900 flex items-center space-x-2">
                      <Award className="w-6 h-6 text-coral-500" />
                      <span>Explorer Level {contributions.explorer_level}</span>
                    </h3>
                    <p className="text-neutral-600 mt-1">Keep discovering to level up!</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl mb-1">{getBadgeIcon(contributions.explorer_level)}</div>
                    <p className="text-sm text-neutral-600">
                      {contributions.explorer_level < 10 ? `${10 - contributions.explorer_level} levels to max` : 'Max Level!'}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-neutral-600">Progress to next level</span>
                    <span className="font-semibold text-coral-500">{Math.round(getLevelProgress())}%</span>
                  </div>
                  <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-coral-500 to-sunset-500 transition-all duration-500"
                      style={{ width: `${getLevelProgress()}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-sunset-500" />
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">{contributions.gems_discovered}</p>
                    <p className="text-xs text-neutral-600 mt-1">Gems Discovered</p>
                  </div>

                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center justify-center mb-2">
                      <Award className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">{contributions.gems_verified}</p>
                    <p className="text-xs text-neutral-600 mt-1">Gems Verified</p>
                  </div>

                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="flex items-center justify-center mb-2">
                      <ThumbsUp className="w-5 h-5 text-coral-500" />
                    </div>
                    <p className="text-2xl font-bold text-neutral-900">{contributions.total_votes_received}</p>
                    <p className="text-xs text-neutral-600 mt-1">Total Votes</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-8 border border-yellow-100">
              <div className="flex items-center space-x-3 mb-6">
                <Trophy className="w-7 h-7 text-yellow-600" />
                <h3 className="text-2xl font-bold text-neutral-900">Rewards & Achievements</h3>
                {badges.length > 0 && (
                  <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-200 rounded-full">
                    <Sparkles className="w-4 h-4 text-yellow-700" />
                    <span className="text-sm font-semibold text-yellow-700">{badges.length}</span>
                  </div>
                )}
              </div>
              <p className="text-neutral-600 mb-6">
                {badges.length > 0
                  ? 'Badges earned through your adventures and contributions'
                  : 'Start exploring and earning badges by creating adventures, discovering hidden gems, and engaging with the community!'}
              </p>

              {badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all border-2 border-transparent hover:border-yellow-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-sunset-400 to-coral-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-2xl">{getBadgeEmoji(badge.badge_type)}</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-neutral-900 mb-1">{badge.badge_name}</h4>
                          <p className="text-sm text-neutral-600 mb-2">{badge.badge_description}</p>
                          <p className="text-xs text-neutral-500">
                            Earned {new Date(badge.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg p-12 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-sunset-100 to-coral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-10 h-10 text-sunset-600" />
                  </div>
                  <h4 className="text-xl font-bold text-neutral-900 mb-2">No badges yet</h4>
                  <p className="text-neutral-600 max-w-md mx-auto">
                    Complete activities to earn your first badge! Create an adventure, discover a hidden gem, or engage with the community.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-8 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 border border-blue-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Home className="w-7 h-7 text-blue-600" />
                  <h3 className="text-2xl font-bold text-neutral-900">My Property Listings</h3>
                </div>
                <button
                  onClick={() => setShowAddProperty(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Property
                </button>
              </div>
              <p className="text-neutral-600 mb-6">
                List your unique properties and share them with travelers seeking authentic experiences
              </p>

              <MyProperties />
            </div>
          </div>
        </div>
      </div>

      {showAddProperty && (
        <AddPropertyModal
          onClose={() => setShowAddProperty(false)}
          onSuccess={() => {
            setShowAddProperty(false);
            alert('Property submitted successfully! We\'ll review it shortly.');
          }}
        />
      )}
    </div>
  );
}

function getBadgeEmoji(badgeType: string): string {
  const emojiMap: Record<string, string> = {
    first_gem: '🌟',
    gem_master_5: '⭐',
    gem_master_10: '🌠',
    gem_master_25: '💫',
    explorer_verified: '✅',
    top_rated: '🔥',
    community_star: '⚡',
    adventure_starter: '🗺️',
    globetrotter: '🌍',
    world_traveler: '✈️',
    social_butterfly: '💬',
    level_5: '🏆',
    level_10: '👑'
  };
  return emojiMap[badgeType] || '🎖️';
}
