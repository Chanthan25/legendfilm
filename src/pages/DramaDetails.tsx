import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Calendar, Film, Globe, ThumbsUp, Share2, Plus, Check, MessageSquare, MoreVertical, ThumbsDown, ChevronDown, ChevronUp } from 'lucide-react';
import { dramas } from '../data/mockData';
import ShareButtons from '../components/ShareButtons';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { getWatchlist, toggleWatchlist, getReviews, addReview, checkIsFollowing, getFollowStats, toggleFollow, getDramaStats, getUserDramaReaction, toggleDramaReaction, addDramaShare, getProfile } from '../lib/api';

export default function DramaDetails() {
  const { id } = useParams<{ id: string }>();
  const drama = dramas.find(d => d.id === id);
  const relatedDramas = dramas.filter(d => d.id !== id).slice(0, 8);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, content: '' });
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Interaction states
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [sharesCount, setSharesCount] = useState(0);
  const [userReaction, setUserReaction] = useState<boolean | null>(null); // true = like, false = dislike, null = none
  const [showShareMenu, setShowShareMenu] = useState(false);

  const [channelProfile, setChannelProfile] = useState<any>(null);

  useEffect(() => {
    if (!id || !drama) return;

    async function loadData() {
      setIsLoading(true);
      try {
        const dramaReviews = await getReviews(undefined, id);
        setReviews(dramaReviews);

        // Fetch channel stats and profile
        if (drama?.channel_id) {
          const stats = await getFollowStats(drama.channel_id);
          setSubscriberCount(stats.followers);
          
          // Try to fetch the real profile for this channel_id
          const profile = await getProfile(drama.channel_id);
          if (profile) {
            setChannelProfile(profile);
          }
        }

        // Fetch drama interaction stats
        const interactionStats = await getDramaStats(id);
        setLikesCount(interactionStats.likes);
        setDislikesCount(interactionStats.dislikes);
        setSharesCount(interactionStats.shares);

        if (user) {
          const watchlist = await getWatchlist(user.id);
          setIsWatchlisted(watchlist.includes(id));

          if (drama?.channel_id) {
            const following = await checkIsFollowing(user.id, drama.channel_id);
            setIsSubscribed(following);
          }
          
          const reaction = await getUserDramaReaction(user.id, id);
          setUserReaction(reaction);
        }
      } catch (error) {
        console.error("Error loading drama details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    window.scrollTo(0, 0);
  }, [id, user, drama]);

  const handleToggleWatchlist = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!id) return;

    await toggleWatchlist(user.id, id, isWatchlisted);
    setIsWatchlisted(!isWatchlisted);
  };

  const handleToggleSubscribe = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!drama?.channel_id) return;

    const error = await toggleFollow(user.id, drama.channel_id, isSubscribed);
    
    if (error) {
      if (error.code === '23503') {
        alert("មិនអាច Subscribe បានទេ៖ ឆានែលនេះគ្រាន់តែជាទិន្នន័យគំរូ (Mock Data) ដែលមិនទាន់មានក្នុង Database ពិតប្រាកដរបស់អ្នកនៅឡើយទេ។");
      } else {
        alert("មានបញ្ហាក្នុងការ Subscribe សូមព្យាយាមម្តងទៀត។");
      }
      return;
    }

    setIsSubscribed(!isSubscribed);
    setSubscriberCount(prev => prev !== null ? (isSubscribed ? prev - 1 : prev + 1) : null);
  };

  const handleReaction = async (isLike: boolean) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!id) return;

    // Optimistic UI update
    const previousReaction = userReaction;
    
    if (userReaction === isLike) {
      // Removing reaction
      setUserReaction(null);
      if (isLike) setLikesCount(prev => prev - 1);
      else setDislikesCount(prev => prev - 1);
    } else {
      // Changing or adding reaction
      setUserReaction(isLike);
      if (isLike) {
        setLikesCount(prev => prev + 1);
        if (previousReaction === false) setDislikesCount(prev => prev - 1);
      } else {
        setDislikesCount(prev => prev + 1);
        if (previousReaction === true) setLikesCount(prev => prev - 1);
      }
    }

    // API call
    try {
      await toggleDramaReaction(user.id, id, isLike);
    } catch (error) {
      console.error("Error toggling reaction:", error);
      // Revert on error (simplified for this example)
    }
  };

  const handleShare = async () => {
    if (!id) return;
    
    const url = window.location.href;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: drama?.title || 'Check out this drama',
          url: url
        });
        // Record share
        await addDramaShare(user?.id, id);
        setSharesCount(prev => prev + 1);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
        await addDramaShare(user?.id, id);
        setSharesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!id || !newReview.content.trim()) return;

    setIsSubmitting(true);
    const error = await addReview(user.id, id, newReview.rating, newReview.content);
    if (!error) {
      setNewReview({ rating: 5, content: '' });
      // Reload reviews
      const dramaReviews = await getReviews(undefined, id);
      setReviews(dramaReviews);
    }
    setIsSubmitting(false);
  };

  const formatSubscribers = (count: number | null, fallback: string) => {
    if (count === null) return fallback;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M subscribers`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K subscribers`;
    return `${count} subscriber${count !== 1 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950/95 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-50 mb-4">Drama Not Found</h2>
          <Link to="/" className="text-amber-500 hover:text-amber-400 transition-colors">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950/95 pt-6 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-6">
        
        {/* Main Content (Left Column) */}
        <div className="flex-1 lg:max-w-[70%]">
          
          {/* Video Player */}
          <div className="w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 shadow-2xl border border-zinc-800/50">
            <iframe
              src={drama.trailerUrl}
              title={`${drama.title} Official Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>

          {/* Title & Actions */}
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{drama.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="text-zinc-400 text-sm font-medium">
              {drama.year} • {drama.episodes} Episodes • {drama.country}
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <div className="flex items-center bg-zinc-800/80 rounded-full">
                <button 
                  onClick={() => handleReaction(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-l-full font-medium text-sm transition-colors border-r border-zinc-700 ${userReaction === true ? 'text-white bg-zinc-700' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'}`}
                >
                  <ThumbsUp className={`w-4 h-4 ${userReaction === true ? 'fill-white' : ''}`} /> 
                  <span>{formatSubscribers(likesCount, '0')}</span>
                </button>
                <button 
                  onClick={() => handleReaction(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-r-full font-medium text-sm transition-colors ${userReaction === false ? 'text-white bg-zinc-700' : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'}`}
                >
                  <ThumbsDown className={`w-4 h-4 ${userReaction === false ? 'fill-white' : ''}`} />
                </button>
              </div>
              
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 bg-zinc-800/80 hover:bg-zinc-700 px-4 py-2 rounded-full text-white font-medium text-sm transition-colors whitespace-nowrap"
              >
                <Share2 className="w-4 h-4" /> Share {sharesCount > 0 && <span className="text-zinc-400 ml-1">{formatSubscribers(sharesCount, '')}</span>}
              </button>
              
              <button
                onClick={handleToggleWatchlist}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-colors whitespace-nowrap ${
                  isWatchlisted ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800/80 hover:bg-zinc-700 text-white'
                }`}
              >
                {isWatchlisted ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {isWatchlisted ? 'Saved' : 'Save'}
              </button>

              <button className="flex items-center justify-center bg-zinc-800/80 hover:bg-zinc-700 w-9 h-9 rounded-full text-white transition-colors flex-shrink-0">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Channel/Studio Info */}
          <div className="flex items-center justify-between py-3 mb-4">
            <div className="flex items-center gap-3">
              <Link to={`/profile/${drama.channel_id}`} className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
                <img 
                  src={channelProfile?.avatar_url || drama.channel_avatar || drama.poster} 
                  alt={channelProfile?.display_name || drama.channel_name || 'Studio'} 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer" 
                />
              </Link>
              <div>
                <Link to={`/profile/${drama.channel_id}`}>
                  <h3 className="text-white font-medium text-sm sm:text-base hover:text-amber-500 transition-colors">
                    {channelProfile?.display_name || drama.channel_name || 'Legend | Film Studio'}
                  </h3>
                </Link>
                <p className="text-zinc-400 text-xs">
                  {formatSubscribers(subscriberCount, drama.channel_subscribers || '1.2M subscribers')}
                </p>
              </div>
            </div>
            {user?.id !== drama.channel_id && (
              <button 
                onClick={handleToggleSubscribe}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  isSubscribed 
                    ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                    : 'bg-white text-zinc-950 hover:bg-zinc-200'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            )}
          </div>

          {/* Description Box */}
          <div 
            className="bg-zinc-800/60 hover:bg-zinc-800/80 transition-colors rounded-xl p-4 mb-6 cursor-pointer" 
            onClick={() => setShowFullDescription(!showFullDescription)}
          >
            <div className="flex flex-wrap gap-2 text-sm font-medium text-white mb-2">
              <span>{drama.rating} / 5 Rating</span>
              <span className="text-zinc-500">•</span>
              <span>{drama.genre.join(', ')}</span>
            </div>
            <div className={`text-sm text-zinc-200 whitespace-pre-line overflow-hidden transition-all duration-300 ${showFullDescription ? 'max-h-[1000px]' : 'max-h-[40px] line-clamp-2'}`}>
              {drama.summary}
            </div>
            <button className="text-zinc-400 hover:text-white text-sm font-medium mt-2 transition-colors flex items-center gap-1">
              {showFullDescription ? (
                <>Show less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>...more <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          </div>

          {/* Comments / Reviews Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              {reviews.length} Comments
            </h2>
            
            {/* Add comment input */}
            <form onSubmit={handleSubmitReview} className="flex gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden">
                {user ? (
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt="User" className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <input 
                  type="text" 
                  placeholder="Add a comment..." 
                  value={newReview.content}
                  onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                  className="w-full bg-transparent border-b border-zinc-700 focus:border-white text-white pb-1 outline-none transition-colors text-sm" 
                />
                {newReview.content && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-zinc-400 mr-2">Rating:</span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star className={`w-4 h-4 ${star <= newReview.rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-600'}`} />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button" 
                        onClick={() => setNewReview({ rating: 5, content: '' })}
                        className="px-3 py-1.5 rounded-full text-sm font-medium text-white hover:bg-zinc-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors disabled:opacity-50"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {/* Comment list */}
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((rev) => (
                  <div key={rev.id} className="flex gap-4">
                    <Link to={`/profile/${rev.user_id}`} className="w-10 h-10 rounded-full bg-zinc-800 flex-shrink-0 overflow-hidden">
                      <img 
                        src={rev.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.user_id}`} 
                        alt={rev.profiles?.display_name || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/profile/${rev.user_id}`} className="text-white text-sm font-medium hover:text-amber-500 transition-colors">
                          @{rev.profiles?.display_name || 'User'}
                        </Link>
                        <span className="text-zinc-400 text-xs">{new Date(rev.created_at).toLocaleDateString()}</span>
                        <div className="flex items-center gap-1 ml-2 bg-zinc-800/50 px-1.5 py-0.5 rounded text-xs">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-zinc-300 font-medium">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-zinc-200 text-sm mb-2">{rev.content}</p>
                      <div className="flex items-center gap-4 text-zinc-400">
                        <button className="hover:text-white flex items-center gap-1 transition-colors">
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button className="hover:text-white flex items-center gap-1 transition-colors">
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-medium hover:text-white cursor-pointer transition-colors">Reply</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  No comments yet. Be the first to share your thoughts!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (Right Column) - Related Dramas */}
        <div className="flex-1 lg:max-w-[30%] flex flex-col gap-3">
          <h3 className="text-white font-bold text-lg mb-2 hidden lg:block">Up next</h3>
          
          <div className="flex flex-col gap-3">
            {relatedDramas.map(related => (
              <Link to={`/drama/${related.id}`} key={related.id} className="flex gap-2 group">
                <div className="w-40 h-24 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0 relative">
                  <img 
                    src={related.poster} 
                    alt={related.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded font-medium">
                    {related.episodes} EP
                  </span>
                </div>
                <div className="flex flex-col py-0.5">
                  <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-amber-500 transition-colors leading-tight mb-1">
                    {related.title}
                  </h4>
                  <span className="text-zinc-400 text-xs">{related.country}</span>
                  <span className="text-zinc-400 text-xs">{related.year} • {related.genre[0]}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
