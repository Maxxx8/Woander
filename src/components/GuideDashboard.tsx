import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star, Globe, Plus, CreditCard as Edit2, Trash2, Power, PowerOff, Calendar, Users, Clock, TrendingUp, CheckCircle, AlertCircle, Save, X, Camera, Compass, Award } from 'lucide-react';
import { supabase } from '../shared/supabase';
import { useAuth } from '../shared/AuthContext';
import type { TourGuide, Tour } from '../shared/supabase';
import GuideExperienceModal from './GuideExperienceModal';
import GuideBookings from './GuideBookings';
import GuideAvailability from './GuideAvailability';

interface GuideStats {
  activeExperiences: number;
  totalBookings: number;
  pendingBookings: number;
  completedTours: number;
}

const TOUR_TYPES: Tour['tour_type'][] = [
  'cultural', 'adventure', 'food', 'history', 'nature', 'photography', 'walking', 'cycling', 'wildlife', 'spiritual', 'other',
];

const GuideDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [guide, setGuide] = useState<TourGuide | null>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [stats, setStats] = useState<GuideStats>({
    activeExperiences: 0, totalBookings: 0, pendingBookings: 0, completedTours: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [actionError, setActionError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '', bio: '', profile_image: '', cover_image: '',
    languages: [] as string[], specialties: [] as string[],
    years_experience: 0, location_city: '', location_state: '', location_country: '',
    phone: '', email: '',
  });
  const [newLanguage, setNewLanguage] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const loadGuideData = useCallback(async () => {
    setLoading(true);
    setActionError('');

    try {
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error('[GuideDashboard] Auth error:', authError);
        setGuide(null);
        return;
      }

      if (!authUser) {
        console.log('[GuideDashboard] No authenticated user found');
        setGuide(null);
        return;
      }

      console.log('[GuideDashboard] Auth user ID:', authUser.id);

      const { data: guideData, error: guideError } = await supabase
        .from('tour_guides')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      console.log('[GuideDashboard] Guide profile:', guideData);
      console.log('[GuideDashboard] Guide profile error:', guideError);

      if (guideError) {
        console.error('[GuideDashboard] Failed to load guide:', {
          code: guideError.code, message: guideError.message,
          details: guideError.details, hint: guideError.hint,
        });
        setActionError('Could not load your guide profile. Please try again.');
        return;
      }

      if (!guideData) {
        setGuide(null);
        return;
      }

      const g = guideData as TourGuide;
      setGuide(g);
      setProfileForm({
        full_name: g.full_name || '',
        bio: g.bio || '',
        profile_image: g.profile_image || '',
        cover_image: g.cover_image || '',
        languages: g.languages || [],
        specialties: g.specialties || [],
        years_experience: g.years_experience || 0,
        location_city: g.location_city || '',
        location_state: g.location_state || '',
        location_country: g.location_country || '',
        phone: g.phone || '',
        email: g.email || '',
      });

      // Load tours
      const { data: toursData, error: toursError } = await supabase
        .from('tours')
        .select('*')
        .eq('guide_id', g.id)
        .order('created_at', { ascending: false });

      if (toursError) {
        console.error('[GuideDashboard] Failed to load tours:', {
          code: toursError.code, message: toursError.message,
          details: toursError.details, hint: toursError.hint,
        });
      }
      const toursList = (toursData as Tour[]) || [];
      setTours(toursList);

      // Load booking stats
      const [totalRes, pendingRes, completedRes] = await Promise.all([
        supabase.from('tour_bookings').select('id', { count: 'exact', head: true }).eq('guide_id', g.id),
        supabase.from('tour_bookings').select('id', { count: 'exact', head: true }).eq('guide_id', g.id).eq('status', 'pending'),
        supabase.from('tour_bookings').select('id', { count: 'exact', head: true }).eq('guide_id', g.id).eq('status', 'completed'),
      ]);

      if (totalRes.error) console.error('[GuideDashboard] totalBookings error:', totalRes.error);
      if (pendingRes.error) console.error('[GuideDashboard] pendingBookings error:', pendingRes.error);
      if (completedRes.error) console.error('[GuideDashboard] completedTours error:', completedRes.error);

      setStats({
        activeExperiences: toursList.filter(t => t.is_active).length,
        totalBookings: totalRes.count || 0,
        pendingBookings: pendingRes.count || 0,
        completedTours: completedRes.count || 0,
      });
    } catch (err) {
      console.error('[GuideDashboard] Unexpected error:', err);
      setActionError('Something went wrong while loading your dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    loadGuideData();
  }, [loadGuideData, authLoading, user]);

  const handleSaveProfile = async () => {
    if (!user || !guide) return;
    setSavingProfile(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const { error } = await supabase
        .from('tour_guides')
        .update({
          full_name: profileForm.full_name.trim(),
          bio: profileForm.bio.trim(),
          profile_image: profileForm.profile_image.trim() || null,
          cover_image: profileForm.cover_image.trim() || null,
          languages: profileForm.languages,
          specialties: profileForm.specialties,
          years_experience: profileForm.years_experience,
          location_city: profileForm.location_city.trim(),
          location_state: profileForm.location_state.trim(),
          location_country: profileForm.location_country.trim() || 'India',
          phone: profileForm.phone.trim() || null,
          email: profileForm.email.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', guide.id);

      if (error) {
        console.error('[GuideDashboard] Failed to update profile:', {
          code: error.code, message: error.message,
          details: error.details, hint: error.hint,
        });
        throw error;
      }

      setProfileSuccess('Profile updated successfully');
      await loadGuideData();
      setTimeout(() => {
        setIsEditingProfile(false);
        setProfileSuccess('');
      }, 1500);
    } catch (err: any) {
      const userMsg = err?.code === '42501'
        ? 'You do not have permission to update this profile.'
        : 'Failed to update your profile. Please try again.';
      setProfileError(userMsg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleToggleActive = async (tour: Tour) => {
    setActionError('');
    setSuccessMsg('');
    try {
      const { error } = await supabase
        .from('tours')
        .update({ is_active: !tour.is_active, updated_at: new Date().toISOString() })
        .eq('id', tour.id);

      if (error) {
        console.error('[GuideDashboard] Failed to toggle tour active:', {
          code: error.code, message: error.message, details: error.details, hint: error.hint,
        });
        throw error;
      }

      setSuccessMsg(`Experience "${tour.title}" is now ${!tour.is_active ? 'active' : 'inactive'}`);
      await loadGuideData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setActionError('Failed to update experience status. Please try again.');
    }
  };

  const handleDelete = async (tour: Tour) => {
    setActionError('');
    setSuccessMsg('');

    try {
      // Check if there are any bookings for this tour
      const { count, error: countError } = await supabase
        .from('tour_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('tour_id', tour.id);

      if (countError) {
        console.error('[GuideDashboard] Failed to check bookings before delete:', {
          code: countError.code, message: countError.message, details: countError.details, hint: countError.hint,
        });
        throw countError;
      }

      if (count && count > 0) {
        // Archive instead of delete
        const { error: archiveError } = await supabase
          .from('tours')
          .update({ is_active: false, updated_at: new Date().toISOString() })
          .eq('id', tour.id);

        if (archiveError) throw archiveError;

        setSuccessMsg(`"${tour.title}" has been archived because it has ${count} existing booking(s). It is now inactive but booking records are preserved.`);
      } else {
        // Safe to delete
        const { error: deleteError } = await supabase
          .from('tours')
          .delete()
          .eq('id', tour.id);

        if (deleteError) throw deleteError;

        setSuccessMsg(`Experience "${tour.title}" has been deleted.`);
      }

      setConfirmDelete(null);
      await loadGuideData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error('[GuideDashboard] Failed to delete tour:', err);
      setActionError('Failed to delete this experience. Please try again.');
      setConfirmDelete(null);
    }
  };

  const handleEditTour = (tour: Tour) => {
    setEditingTour(tour);
    setShowExperienceModal(true);
  };

  const handleCreateTour = () => {
    setEditingTour(null);
    setShowExperienceModal(true);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-forest-950 pt-20 pb-20 md:pb-0 flex items-center justify-center">
        <div className="w-6 h-6 border border-gold-400/30 border-t-gold-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-forest-950 pt-20 pb-20 md:pb-0 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-xl italic font-light text-cream mb-2">Please sign in</p>
          <p className="text-mist-700 text-sm font-light">You need to be signed in to access your guide dashboard.</p>
        </div>
      </div>
    );
  }

  if (!guide) {
    return (
      <div className="min-h-screen bg-forest-950 pt-20 pb-20 md:pb-0 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Compass className="w-12 h-12 text-gold-400/30 mx-auto mb-4" />
          <p className="font-display text-2xl italic font-light text-cream mb-2">No guide profile found</p>
          <p className="text-mist-700 text-sm font-light mb-6">
            You haven't applied to become a local expert yet. Join the Vanguard network to start creating experiences.
          </p>
          <button
            onClick={() => navigate('/vanguard')}
            className="font-mono text-[10px] tracking-widest text-gold-300/70 border border-gold-400/20 px-6 py-2 hover:border-gold-400/50 transition-colors duration-300"
          >
            JOIN THE VANGUARD
          </button>
        </div>
      </div>
    );
  }

  const locationString = [guide.location_city, guide.location_state, guide.location_country]
    .filter(Boolean).join(', ');

  const inputClass = 'w-full bg-[#0a150a] border border-[#1a3020] text-[#f5f0e8] px-4 py-3 font-light text-sm focus:outline-none focus:border-[#c9a84a]/40 transition-colors duration-300 placeholder:text-[#3a5a3a]';
  const labelClass = 'font-jetbrains text-[9px] text-[#7a9a7a] tracking-widest uppercase block mb-2';
  const sectionClass = 'border border-[#1a3020] p-5';

  const statCards = [
    { label: 'Active Experiences', value: stats.activeExperiences, icon: Compass },
    { label: 'Total Bookings', value: stats.totalBookings, icon: Calendar },
    { label: 'Pending Bookings', value: stats.pendingBookings, icon: AlertCircle },
    { label: 'Completed Tours', value: stats.completedTours, icon: CheckCircle },
    { label: 'Average Rating', value: guide.average_rating > 0 ? guide.average_rating.toFixed(1) : '0.0', icon: Star },
    { label: 'Total Reviews', value: guide.total_reviews, icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-forest-950 pt-16 pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-8">
          <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-2">Guide Dashboard</p>
          <h1 className="font-display text-3xl sm:text-4xl font-light text-cream">
            Welcome, <em className="italic text-gold-300">{guide.full_name}</em>
          </h1>
        </div>

        {/* Success / Error banners */}
        {successMsg && (
          <div className="mb-6 border border-[#c9a84a]/30 bg-[#c9a84a]/5 p-4 flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-[#c9a84a]/60 flex-shrink-0" />
            <p className="text-[#c9a84a]/80 text-sm font-light">{successMsg}</p>
          </div>
        )}
        {actionError && (
          <div className="mb-6 border border-red-400/30 bg-red-400/5 p-4 flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-red-400/60 flex-shrink-0" />
            <p className="text-red-400/70 text-sm font-light">{actionError}</p>
          </div>
        )}

        {/* Profile Summary */}
        <div className="border border-forest-800 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase">Profile Summary</p>
            {!isEditingProfile && (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 font-mono text-[9px] tracking-widest text-[#7a9a7a] hover:text-[#c9a84a] transition-colors duration-300"
              >
                <Edit2 className="w-3 h-3" /> EDIT
              </button>
            )}
          </div>

          {!isEditingProfile ? (
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0 w-24 h-24 overflow-hidden">
                <img
                  src={guide.profile_image || 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=200'}
                  alt={guide.full_name}
                  className="w-full h-full object-cover"
                  style={{ filter: 'grayscale(20%) brightness(0.7) saturate(0.8)' }}
                />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-light text-cream mb-2">{guide.full_name}</h2>
                {locationString && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <MapPin className="h-3.5 w-3.5 text-gold-400/40" />
                    <span className="font-mono text-[9px] text-mist-600 tracking-widest uppercase">{locationString}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`font-mono text-[8px] tracking-widest uppercase px-2 py-1 border ${guide.status === 'approved' ? 'text-[#c9a84a]/60 border-[#c9a84a]/20' : 'text-mist-700 border-forest-800'}`}>
                    {guide.status}
                  </span>
                  <span className={`font-mono text-[8px] tracking-widest uppercase px-2 py-1 border ${guide.is_active ? 'text-[#c9a84a]/60 border-[#c9a84a]/20' : 'text-mist-700 border-forest-800'}`}>
                    {guide.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {guide.bio && (
                  <p className="text-mist-600 text-sm font-light leading-relaxed mb-3 max-w-xl">{guide.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 text-xs font-light">
                  <div className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-gold-400/30" />
                    <span className="text-mist-700">{guide.years_experience} {guide.years_experience === 1 ? 'year' : 'years'}</span>
                  </div>
                  {guide.languages.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-gold-400/30" />
                      <span className="text-mist-700">{guide.languages.join(' · ')}</span>
                    </div>
                  )}
                  {guide.total_reviews > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Star className="h-3.5 w-3.5 text-gold-400/40" />
                      <span className="text-mist-700">{guide.average_rating.toFixed(1)} · {guide.total_reviews} reviews</span>
                    </div>
                  )}
                </div>
                {guide.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {guide.specialties.map((s, i) => (
                      <span key={i} className="font-mono text-[8px] text-mist-700 border border-forest-800 px-2 py-0.5 tracking-widest uppercase">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <p className="font-mono text-[8px] text-mist-800 tracking-widest uppercase mt-3">
                  {guide.total_tours_completed} tours completed
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {profileSuccess && (
                <div className="border border-[#c9a84a]/30 bg-[#c9a84a]/5 p-3 flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-[#c9a84a]/60" />
                  <p className="text-[#c9a84a]/80 text-xs font-light">{profileSuccess}</p>
                </div>
              )}
              {profileError && (
                <div className="border border-red-400/30 bg-red-400/5 p-3 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400/60" />
                  <p className="text-red-400/70 text-xs font-light">{profileError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input type="text" value={profileForm.full_name} onChange={e => setProfileForm(p => ({ ...p, full_name: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Profile Image URL</label>
                  <input type="text" value={profileForm.profile_image} onChange={e => setProfileForm(p => ({ ...p, profile_image: e.target.value }))} placeholder="https://..." className={inputClass} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Bio</label>
                <textarea value={profileForm.bio} onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))} rows={3} className={`${inputClass} resize-none`} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" value={profileForm.location_city} onChange={e => setProfileForm(p => ({ ...p, location_city: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input type="text" value={profileForm.location_state} onChange={e => setProfileForm(p => ({ ...p, location_state: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Country</label>
                  <input type="text" value={profileForm.location_country} onChange={e => setProfileForm(p => ({ ...p, location_country: e.target.value }))} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Phone</label>
                  <input type="text" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={profileForm.email} onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Years of Experience</label>
                  <input type="number" min="0" value={profileForm.years_experience} onChange={e => setProfileForm(p => ({ ...p, years_experience: Number(e.target.value) }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Cover Image URL</label>
                  <input type="text" value={profileForm.cover_image} onChange={e => setProfileForm(p => ({ ...p, cover_image: e.target.value }))} placeholder="https://..." className={inputClass} />
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className={labelClass}>Languages</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newLanguage} onChange={e => setNewLanguage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newLanguage.trim()) { setProfileForm(p => ({ ...p, languages: [...p.languages, newLanguage.trim()] })); setNewLanguage(''); } } }} placeholder="e.g. English" className={inputClass} />
                  <button onClick={() => { if (newLanguage.trim()) { setProfileForm(p => ({ ...p, languages: [...p.languages, newLanguage.trim()] })); setNewLanguage(''); } }} className="flex-shrink-0 w-10 h-10 border border-[#1a3020] text-[#7a9a7a] hover:text-[#c9a84a] hover:border-[#c9a84a]/30 transition-colors duration-300 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {profileForm.languages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profileForm.languages.map((lang, i) => (
                      <span key={i} className="flex items-center gap-1 font-mono text-[8px] text-mist-700 border border-forest-800 px-2 py-1 tracking-widest uppercase">
                        {lang}
                        <button onClick={() => setProfileForm(p => ({ ...p, languages: p.languages.filter((_, idx) => idx !== i) }))} className="text-mist-800 hover:text-red-400/60">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Specialties */}
              <div>
                <label className={labelClass}>Specialties</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (newSpecialty.trim()) { setProfileForm(p => ({ ...p, specialties: [...p.specialties, newSpecialty.trim()] })); setNewSpecialty(''); } } }} placeholder="e.g. wildlife" className={inputClass} />
                  <button onClick={() => { if (newSpecialty.trim()) { setProfileForm(p => ({ ...p, specialties: [...p.specialties, newSpecialty.trim()] })); setNewSpecialty(''); } }} className="flex-shrink-0 w-10 h-10 border border-[#1a3020] text-[#7a9a7a] hover:text-[#c9a84a] hover:border-[#c9a84a]/30 transition-colors duration-300 flex items-center justify-center">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {profileForm.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {profileForm.specialties.map((s, i) => (
                      <span key={i} className="flex items-center gap-1 font-mono text-[8px] text-mist-700 border border-forest-800 px-2 py-1 tracking-widest uppercase">
                        {s}
                        <button onClick={() => setProfileForm(p => ({ ...p, specialties: p.specialties.filter((_, idx) => idx !== i) }))} className="text-mist-800 hover:text-red-400/60">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => { setIsEditingProfile(false); setProfileError(''); setProfileSuccess(''); }}
                  className="font-mono text-[10px] tracking-widest text-mist-600 hover:text-cream transition-colors duration-300"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-[#0d1a0d] bg-[#c9a84a] px-6 py-2 hover:bg-[#d4b660] transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProfile ? (
                    <>
                      <div className="w-3 h-3 border border-[#0d1a0d]/30 border-t-[#0d1a0d] rounded-full animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" /> SAVE PROFILE
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 border-t border-l border-forest-800 mb-8">
          {statCards.map(({ label, value, icon: Icon }, i) => (
            <div key={i} className="border-b border-r border-forest-800 p-4">
              <Icon className="w-4 h-4 text-gold-400/30 mb-2" />
              <p className="font-display text-2xl font-light text-cream">{value}</p>
              <p className="font-mono text-[8px] text-mist-700 tracking-widest uppercase mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <GuideBookings guideId={guide.id} onStatsChange={loadGuideData} />

        {/* Availability */}
        <GuideAvailability guideId={guide.id} />

        {/* My Experiences */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-mono text-[10px] text-gold-400/60 tracking-widest uppercase mb-1">My Experiences</p>
              <h2 className="font-display text-2xl font-light text-cream">
                Manage your <em className="italic text-gold-300">offerings</em>
              </h2>
            </div>
            <button
              onClick={handleCreateTour}
              className="group flex items-center gap-2 font-mono text-[10px] tracking-widest text-gold-300/70 border border-gold-400/20 px-5 py-2 hover:border-gold-400/50 transition-all duration-300"
            >
              <Plus className="h-3 w-3 group-hover:rotate-90 transition-transform duration-300" />
              CREATE
            </button>
          </div>

          {tours.length === 0 ? (
            <div className="border border-forest-800 p-12 text-center">
              <Compass className="w-10 h-10 text-gold-400/20 mx-auto mb-4" />
              <p className="font-display text-lg italic font-light text-cream mb-2">No experiences yet</p>
              <p className="text-mist-700 text-sm font-light mb-6">
                Create your first bookable experience and start welcoming explorers.
              </p>
              <button
                onClick={handleCreateTour}
                className="font-mono text-[10px] tracking-widest text-gold-300/70 border border-gold-400/20 px-6 py-2 hover:border-gold-400/50 transition-colors duration-300"
              >
                + CREATE EXPERIENCE
              </button>
            </div>
          ) : (
            <div className="space-y-0 border border-forest-800">
              {tours.map((tour, i) => (
                <div
                  key={tour.id}
                  className={`p-5 ${i > 0 ? 'border-t border-forest-800' : ''} ${!tour.is_active ? 'opacity-60' : ''} group hover:bg-forest-900/40 transition-colors duration-300`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-display text-base font-light text-cream">{tour.title}</h4>
                        {!tour.is_active && (
                          <span className="font-mono text-[8px] text-mist-800 border border-forest-800 px-2 py-0.5 tracking-widest uppercase">
                            {confirmDelete === tour.id ? 'Deleting...' : 'Archived'}
                          </span>
                        )}
                        {tour.is_featured && (
                          <span className="font-mono text-[8px] text-[#c9a84a]/40 border border-[#c9a84a]/15 px-2 py-0.5 tracking-widest uppercase">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[9px] text-mist-700 tracking-widest uppercase mb-2">
                        {tour.tour_type} · {tour.duration_hours}h · {tour.difficulty_level}
                      </p>
                      {tour.description && (
                        <p className="text-mist-700 text-xs font-light line-clamp-2 mb-2">{tour.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs font-light">
                        <span className="text-[#c9a84a]/60 font-display">
                          {tour.currency === 'INR' ? '₹' : tour.currency + ' '}{tour.price_per_person.toLocaleString()}
                          <span className="font-mono text-[8px] text-mist-800 tracking-widest ml-1">/ PERSON</span>
                        </span>
                        <span className="text-mist-700 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Max {tour.max_group_size}
                        </span>
                        {tour.location_city && (
                          <span className="text-mist-700 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {tour.location_city}
                          </span>
                        )}
                        {tour.meeting_point && (
                          <span className="text-mist-800 flex items-center gap-1">
                            <Compass className="w-3 h-3" /> {tour.meeting_point}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleEditTour(tour)}
                        className="w-8 h-8 border border-forest-800 text-mist-700 hover:text-[#c9a84a] hover:border-[#c9a84a]/30 transition-colors duration-300 flex items-center justify-center"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(tour)}
                        className={`w-8 h-8 border border-forest-800 transition-colors duration-300 flex items-center justify-center ${tour.is_active ? 'text-mist-700 hover:text-[#c9a84a] hover:border-[#c9a84a]/30' : 'text-mist-800 hover:text-[#c9a84a] hover:border-[#c9a84a]/30'}`}
                        title={tour.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {tour.is_active ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                      </button>
                      {confirmDelete === tour.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(tour)}
                            className="font-mono text-[8px] tracking-widest text-red-400/70 border border-red-400/30 px-2 py-1 hover:bg-red-400/10 transition-colors duration-300"
                          >
                            CONFIRM
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="font-mono text-[8px] tracking-widest text-mist-700 border border-forest-800 px-2 py-1 hover:text-cream transition-colors duration-300"
                          >
                            CANCEL
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDelete(tour.id)}
                          className="w-8 h-8 border border-forest-800 text-mist-800 hover:text-red-400/60 hover:border-red-400/30 transition-colors duration-300 flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <GuideExperienceModal
        isOpen={showExperienceModal}
        onClose={() => { setShowExperienceModal(false); setEditingTour(null); }}
        onSuccess={() => { loadGuideData(); setSuccessMsg(editingTour ? 'Experience updated successfully.' : 'Experience created successfully.'); setTimeout(() => setSuccessMsg(''), 3000); }}
        guideId={guide.id}
        editingTour={editingTour}
      />
    </div>
  );
};

export default GuideDashboard;
