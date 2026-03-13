import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Calendar, Film, Globe, PlayCircle, Heart, MessageSquare } from 'lucide-react';
import { dramas } from '../data/mockData';
import ShareButtons from '../components/ShareButtons';
import { motion } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { getWatchlist, toggleWatchlist, getReviews, addReview } from '../lib/api';

export default function DramaDetails() {
  const { id } = useParams<{ id: string }>();
  const drama = dramas.find(d => d.id === id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, content: '' });

  useEffect(() => {
    if (!id) return;

    async function loadData() {
      const dramaReviews = await getReviews(undefined, id);
      setReviews(dramaReviews);

      if (user) {
        const watchlist = await getWatchlist(user.id);
        setIsWatchlisted(watchlist.includes(id));
      }
    }

    loadData();
  }, [id, user]);

  const handleToggleWatchlist = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!id) return;

    await toggleWatchlist(user.id, id, isWatchlisted);
    setIsWatchlisted(!isWatchlisted);
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
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* Hero Header */}
      <div className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={drama.poster} 
            alt={drama.title} 
            className="w-full h-full object-cover opacity-20 blur-sm scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-end pb-12">
          <div className="flex flex-col md:flex-row gap-8 items-end w-full">
            <motion.img 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              src={drama.poster} 
              alt={drama.title} 
              className="w-48 md:w-64 rounded-xl shadow-2xl border-4 border-zinc-900 hidden md:block"
              referrerPolicy="no-referrer"
            />
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1"
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {drama.genre.map(g => (
                  <span key={g} className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    {g}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">{drama.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-zinc-300 text-sm font-medium mb-8">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="text-white font-bold text-lg">{drama.rating}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-500" /> {drama.year}
                </div>
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-zinc-500" /> {drama.episodes} Episodes
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-zinc-500" /> {drama.country}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button 
                  onClick={handleToggleWatchlist}
                  className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-colors ${
                    isWatchlisted 
                      ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
                      : 'bg-amber-500 text-zinc-950 hover:bg-amber-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWatchlisted ? 'fill-red-500 text-red-500' : ''}`} />
                  {isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
                <ShareButtons title={`Check out ${drama.title} on Legend | Film`} url={window.location.href} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-red-600 rounded-full"></span> Story Summary
              </h2>
              <p className="text-zinc-300 leading-relaxed text-lg">
                {drama.summary}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-red-600 rounded-full"></span> Official Trailer
              </h2>
              <div className="aspect-video rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 relative">
                <iframe
                  src={drama.trailerUrl}
                  title={`${drama.title} Official Trailer`}
                  className="absolute inset-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-red-600 rounded-full"></span> Episode Summaries
              </h2>
              <div className="space-y-4">
                {[1, 2, 3].map((ep) => (
                  <div key={ep} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 hover:bg-zinc-900 transition-colors">
                    <h3 className="text-lg font-bold text-amber-500 mb-2">Episode {ep}</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      A brief, original written summary of the events in episode {ep}. This text does not contain any copyrighted subtitles or transcripts, only an analytical overview of the plot progression.
                    </p>
                  </div>
                ))}
                <button className="w-full py-4 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all font-medium text-sm uppercase tracking-wider">
                  Load More Episodes
                </button>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" /> Reviews ({reviews.length})
              </h3>

              {/* Write Review Form */}
              <form onSubmit={handleSubmitReview} className="mb-8 border-b border-zinc-800 pb-8">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${star <= newReview.rating ? 'text-amber-500 fill-amber-500' : 'text-zinc-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Your Review</label>
                  <textarea
                    required
                    value={newReview.content}
                    onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
                    rows={3}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    placeholder="What did you think of this drama?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !newReview.content.trim()}
                  className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>

              {/* Reviews List */}
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div key={rev.id} className="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <Link to={`/profile/${rev.user_id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                          <img 
                            src={rev.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.user_id}`} 
                            alt={rev.profiles?.display_name || 'User'} 
                            className="w-6 h-6 rounded-full bg-zinc-800"
                          />
                          <span className="text-sm font-medium text-white">{rev.profiles?.display_name || 'User'}</span>
                        </Link>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-zinc-300">{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-zinc-400 text-sm italic">"{rev.content}"</p>
                      <p className="text-xs text-zinc-600 mt-2">{new Date(rev.created_at).toLocaleDateString()}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-zinc-500 text-sm">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
