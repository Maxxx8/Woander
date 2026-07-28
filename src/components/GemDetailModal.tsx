import React, { useState, useEffect, useCallback } from 'react';
import { X, MapPin, Mountain, Calendar, Lightbulb, Loader, ArrowUp, MessageSquare, Footprints, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../shared/supabase';
import { useAuth } from '../shared/AuthContext';

export interface GemDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  difficulty_level: string;
  image_url: string;
  total_votes: number;
  total_visits: number;
  verification_status: string;
  best_time_to_visit?: string | null;
  tips?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface Comment {
  id: string;
  comment_text: string;
  created_at: string;
  user_id: string;
}

interface GemDetailModalProps {
  gem: GemDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

// Featured gems have non-UUID ids (e.g. "featured-0") — DB actions are disabled for them.
const isRealGem = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

const GemDetailModal: React.FC<GemDetailModalProps> = ({ gem, isOpen, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [hasVisited, setHasVisited] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [voting, setVoting] = useState(false);
  const [loggingVisit, setLoggingVisit] = useState(false);
  // Separate state: auth nag vs action error
  const [needsAuth, setNeedsAuth] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!gem) return;
    setLoading(true);
    setNeedsAuth(false);
    setActionError(null);

    if (!isRealGem(gem.id)) {
      // Featured gem — show static data, no DB queries needed
      setVoteCount(gem.total_votes);
      setVisitCount(gem.total_visits);
      setHasVoted(false);
      setHasVisited(false);
      setComments([]);
      setLoading(false);
      return;
    }

    try {
      const queries: Promise<any>[] = [
        supabase
          .from('gem_comments')
          .select('id, comment_text, created_at, user_id')
          .eq('gem_id', gem.id)
          .order('created_at', { ascending: false }),
      ];

      if (user) {
        queries.push(
          supabase
            .from('gem_votes')
            .select('id')
            .eq('gem_id', gem.id)
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('gem_visits')
            .select('id')
            .eq('gem_id', gem.id)
            .eq('user_id', user.id)
            .maybeSingle()
        );
      }

      const [commentsRes, voteRes, visitRes] = await Promise.all(queries);

      setComments(commentsRes.data || []);
      setVoteCount(gem.total_votes);
      setVisitCount(gem.total_visits);

      if (user) {
        setHasVoted(!!voteRes?.data);
        setHasVisited(!!visitRes?.data);
      } else {
        setHasVoted(false);
        setHasVisited(false);
      }
    } catch {
      // silent — display what we have
    } finally {
      setLoading(false);
    }
  }, [gem, user]);

  useEffect(() => {
    if (isOpen && gem) {
      loadData();
    }
  }, [isOpen, gem, loadData]);

  // Reset local state when a new gem opens
  useEffect(() => {
    if (isOpen) {
      setCommentText('');
      setNeedsAuth(false);
      setActionError(null);
    }
  }, [isOpen, gem?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleVote = async () => {
    if (!gem) return;
    setActionError(null);
    if (!user) { setNeedsAuth(true); return; }
    if (!isRealGem(gem.id)) { setActionError('Signaling is not available for featured previews.'); return; }
    if (hasVoted || voting) return;

    setVoting(true);
    try {
      const { error } = await supabase
        .from('gem_votes')
        .insert({ gem_id: gem.id, user_id: user.id, vote_type: 'upvote' });

      if (error) throw error;
      setHasVoted(true);
      setVoteCount(c => c + 1);
    } catch (err: any) {
      // Unique violation means already voted — treat as success
      if (err?.code === '23505') {
        setHasVoted(true);
      } else {
        setActionError('Could not register your signal. Please try again.');
      }
    } finally {
      setVoting(false);
    }
  };

  const handleLogVisit = async () => {
    if (!gem) return;
    setActionError(null);
    if (!user) { setNeedsAuth(true); return; }
    if (!isRealGem(gem.id)) { setActionError('Visit logging is not available for featured previews.'); return; }
    if (hasVisited || loggingVisit) return;

    setLoggingVisit(true);
    try {
      const { error } = await supabase
        .from('gem_visits')
        .insert({ gem_id: gem.id, user_id: user.id });

      if (error) throw error;
      setHasVisited(true);
      setVisitCount(c => c + 1);
    } catch (err: any) {
      if (err?.code === '23505') {
        setHasVisited(true);
      } else {
        setActionError('Could not log your visit. Please try again.');
      }
    } finally {
      setLoggingVisit(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gem) return;
    setActionError(null);
    if (!user) { setNeedsAuth(true); return; }
    if (!isRealGem(gem.id)) { setActionError('Field notes are not available for featured previews.'); return; }
    if (!commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const { data, error } = await supabase
        .from('gem_comments')
        .insert({
          gem_id: gem.id,
          user_id: user.id,
          comment_text: commentText.trim(),
        })
        .select('id, comment_text, created_at, user_id')
        .single();

      if (error) throw error;
      setComments(prev => [data, ...prev]);
      setCommentText('');
    } catch {
      setActionError('Could not post your field note. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!isOpen || !gem) return null;

  const isFeatured = !isRealGem(gem.id);
  const categoryLabel = gem.category.charAt(0).toUpperCase() + gem.category.slice(1);
  const difficultyLabel = (gem.difficulty_level || 'easy').charAt(0).toUpperCase() + (gem.difficulty_level || 'easy').slice(1);
  const fallbackImage = 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1200';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="flex items-start justify-center min-h-screen p-4 sm:p-6">
        <div className="relative w-full max-w-3xl my-4 bg-forest-950 border border-forest-800 max-h-[90vh] overflow-y-auto">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-mist-700 hover:text-cream transition-colors duration-300"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Hero image */}
          <div className="relative h-56 sm:h-72 overflow-hidden">
            <img
              src={gem.image_url || fallbackImage}
              alt={gem.title}
              className="w-full h-full object-cover"
              style={{ filter: 'grayscale(25%) brightness(0.5)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-950 via-forest-950/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-jetbrains text-[9px] text-gold-400/70 border border-gold-400/20 px-2 py-0.5 bg-forest-950/60">
                  {gem.verification_status.replace(/_/g, ' ').toUpperCase()}
                </span>
                <span className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase">
                  {categoryLabel}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-light text-cream mb-1">{gem.title}</h2>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gold-400/50" />
                <span className="font-jetbrains text-[10px] text-mist-700 tracking-widest uppercase">{gem.location}</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-5 h-5 text-gold-400/50 animate-spin" />
              </div>
            ) : (
              <>
                {/* Sign-in nudge */}
                {needsAuth && (
                  <div className="border border-forest-700 bg-forest-900/60 p-4 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-gold-400/60 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-jetbrains text-[10px] text-gold-400/70 tracking-widest uppercase mb-1">Sign In Required</p>
                      <p className="text-mist-500 text-sm font-light">
                        Sign in to signal gems, log visits, and leave field notes. Your contributions help verify discoveries.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action error */}
                {actionError && (
                  <div className="border border-red-900/40 bg-red-950/30 p-4 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-red-400/60 mt-0.5 flex-shrink-0" />
                    <p className="text-red-300/70 text-sm font-light">{actionError}</p>
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center gap-0 border border-forest-800">
                  <div className="flex-1 px-4 py-3 border-r border-forest-800">
                    <p className="font-display text-xl font-light text-cream">{voteCount}</p>
                    <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase">Signals</p>
                  </div>
                  <div className="flex-1 px-4 py-3 border-r border-forest-800">
                    <p className="font-display text-xl font-light text-cream">{visitCount}</p>
                    <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase">Visits</p>
                  </div>
                  <div className="flex-1 px-4 py-3">
                    <p className="font-display text-xl font-light text-cream">{comments.length}</p>
                    <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase">Field Notes</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleVote}
                    disabled={voting || hasVoted}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border font-jetbrains text-[10px] tracking-widest uppercase transition-all duration-300 ${
                      hasVoted
                        ? 'border-gold-400/40 text-gold-400 bg-gold-400/5 cursor-default'
                        : 'border-forest-700 text-mist-500 hover:border-gold-400/40 hover:text-gold-300'
                    }`}
                  >
                    {voting ? <Loader className="h-4 w-4 animate-spin" /> : hasVoted ? <Check className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                    {hasVoted ? 'Signaled' : 'Signal This Gem'}
                  </button>
                  <button
                    onClick={handleLogVisit}
                    disabled={loggingVisit || hasVisited}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border font-jetbrains text-[10px] tracking-widest uppercase transition-all duration-300 ${
                      hasVisited
                        ? 'border-gold-400/40 text-gold-400 bg-gold-400/5 cursor-default'
                        : 'border-forest-700 text-mist-500 hover:border-gold-400/40 hover:text-gold-300'
                    }`}
                  >
                    {loggingVisit ? <Loader className="h-4 w-4 animate-spin" /> : hasVisited ? <Check className="h-4 w-4" /> : <Footprints className="h-4 w-4" />}
                    {hasVisited ? 'Visited' : 'Log My Visit'}
                  </button>
                </div>

                {/* Description */}
                <div>
                  <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase mb-3">The Discovery</p>
                  <p className="text-mist-500 text-sm font-light leading-relaxed">{gem.description}</p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-t border-l border-forest-800">
                  <div className="p-4 border-b border-r border-forest-800 flex items-start gap-3">
                    <Mountain className="h-4 w-4 text-gold-400/40 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase mb-1">Difficulty</p>
                      <p className="text-mist-500 text-sm font-light">{difficultyLabel}</p>
                    </div>
                  </div>
                  {gem.best_time_to_visit && (
                    <div className="p-4 border-b border-r border-forest-800 flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-gold-400/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase mb-1">Best Time</p>
                        <p className="text-mist-500 text-sm font-light">{gem.best_time_to_visit}</p>
                      </div>
                    </div>
                  )}
                  {gem.tips && (
                    <div className="p-4 border-b border-r border-forest-800 flex items-start gap-3 sm:col-span-2">
                      <Lightbulb className="h-4 w-4 text-gold-400/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase mb-1">Insider Tips</p>
                        <p className="text-mist-500 text-sm font-light">{gem.tips}</p>
                      </div>
                    </div>
                  )}
                  {gem.latitude && gem.longitude && (
                    <div className="p-4 border-b border-r border-forest-800 flex items-start gap-3 sm:col-span-2">
                      <MapPin className="h-4 w-4 text-gold-400/40 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-jetbrains text-[9px] text-mist-700 tracking-widest uppercase mb-1">Coordinates</p>
                        <p className="font-jetbrains text-[11px] text-gold-400/50">{gem.latitude.toFixed(4)}°, {gem.longitude.toFixed(4)}°</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Field notes / comments */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="h-4 w-4 text-gold-400/40" />
                    <p className="font-jetbrains text-[10px] text-gold-400/60 tracking-widest uppercase">Field Notes</p>
                  </div>

                  {/* Comment form — only for real DB gems */}
                  {!isFeatured && (
                    <form onSubmit={handleSubmitComment} className="mb-5">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Share your experience or add a field note..."
                        rows={3}
                        className="w-full bg-forest-900 border border-forest-700 text-cream px-4 py-3 font-light text-sm focus:outline-none focus:border-gold-400/40 transition-colors duration-300 resize-none placeholder:text-mist-800"
                      />
                      <button
                        type="submit"
                        disabled={submittingComment || !commentText.trim()}
                        className="mt-2 px-6 py-2 border border-gold-400/30 text-gold-300 font-jetbrains text-[10px] tracking-widest uppercase hover:border-gold-400/60 transition-colors duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {submittingComment ? 'Posting...' : 'Post Field Note'}
                      </button>
                    </form>
                  )}

                  {isFeatured ? (
                    <div className="border border-forest-800 p-6 text-center">
                      <p className="font-display text-base italic font-light text-mist-600 mb-1">Signal in progress.</p>
                      <p className="text-mist-800 text-xs font-light">Field notes will be available once this discovery is fully verified.</p>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="border border-forest-800 p-6 text-center">
                      <p className="font-display text-base italic font-light text-mist-600 mb-1">No field notes yet.</p>
                      <p className="text-mist-800 text-xs font-light">Be the first to document this discovery.</p>
                    </div>
                  ) : (
                    <div className="space-y-0 border-t border-l border-forest-800">
                      {comments.map((c) => (
                        <div key={c.id} className="p-4 border-b border-r border-forest-800">
                          <p className="text-mist-500 text-sm font-light leading-relaxed mb-2">{c.comment_text}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-jetbrains text-[9px] text-gold-400/40 tracking-widest">
                              EXPLORER {c.user_id.slice(0, 6).toUpperCase()}
                            </span>
                            <span className="font-jetbrains text-[9px] text-mist-800">
                              {new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemDetailModal;
