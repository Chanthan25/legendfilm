import { useParams, Link } from 'react-router-dom';
import { Star, ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react';
import { reviews as mockReviews, dramas } from '../data/mockData';
import ShareButtons from '../components/ShareButtons';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { getReviewById } from '../lib/api';

export default function Review() {
  const { id } = useParams<{ id: string }>();
  const [review, setReview] = useState<any>(null);
  const [drama, setDrama] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReview() {
      if (!id) return;
      setIsLoading(true);

      // Try to find in mock data first
      let foundReview = mockReviews.find(r => r.id === id);
      
      if (!foundReview) {
        // Fetch from Supabase
        const dbReview = await getReviewById(id);
        if (dbReview) {
          foundReview = {
            id: dbReview.id,
            dramaId: dbReview.drama_id,
            author: dbReview.profiles?.display_name || 'User',
            rating: dbReview.rating,
            date: new Date(dbReview.created_at).toLocaleDateString(),
            content: dbReview.content,
            pros: ['Great acting', 'Good story'],
            cons: ['Slow pacing'],
            worthWatching: dbReview.rating >= 3,
            finalOpinion: dbReview.rating >= 3 ? 'A solid watch.' : 'Not recommended.'
          };
        }
      }

      if (foundReview) {
        setReview(foundReview);
        setDrama(dramas.find(d => d.id === foundReview?.dramaId));
      }
      
      setIsLoading(false);
    }

    loadReview();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!review || !drama) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-50 mb-4">Review Not Found</h2>
          <Link to="/" className="text-amber-500 hover:text-amber-400 transition-colors">Return Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to={`/drama/${drama.id}`} className="inline-flex items-center gap-2 text-zinc-400 hover:text-amber-500 transition-colors mb-8 font-medium text-sm uppercase tracking-wider">
          <ArrowLeft className="w-4 h-4" /> Back to Drama
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-zinc-800 bg-zinc-900/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Star className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={drama.poster} 
                  alt={drama.title} 
                  className="w-16 h-24 object-cover rounded-md shadow-lg"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-1">Review For</h3>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">{drama.title}</h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-white border border-zinc-700">
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-bold">{review.author}</p>
                    <p className="text-zinc-500 text-sm">{new Date(review.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 bg-zinc-950 px-6 py-3 rounded-xl border border-zinc-800 shadow-inner">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-6 h-6 ${i < Math.floor(review.rating) ? 'text-amber-500 fill-amber-500' : 'text-zinc-700'}`} />
                    ))}
                  </div>
                  <span className="text-2xl font-bold text-white ml-2">{review.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="prose prose-invert prose-lg max-w-none mb-12">
              <p className="text-zinc-300 leading-relaxed text-lg">
                {review.content}
              </p>
              {/* Add more placeholder text for a longer review feel */}
              <p className="text-zinc-300 leading-relaxed text-lg mt-6">
                The cinematography deserves a special mention, capturing the essence of the setting perfectly. Every frame feels deliberate, adding to the overall atmosphere. While there are minor flaws, they are easily overshadowed by the strong performances of the main cast.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-6">
                <h3 className="flex items-center gap-3 text-emerald-500 font-bold text-lg mb-4">
                  <ThumbsUp className="w-5 h-5" /> What Worked (Pros)
                </h3>
                <ul className="space-y-3">
                  {review.pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-300">
                      <span className="text-emerald-500 mt-1">â</span> {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-6">
                <h3 className="flex items-center gap-3 text-red-500 font-bold text-lg mb-4">
                  <ThumbsDown className="w-5 h-5" /> What Didn't (Cons)
                </h3>
                <ul className="space-y-3">
                  {review.cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-3 text-zinc-300">
                      <span className="text-red-500 mt-1">â</span> {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Final Verdict */}
            <div className="bg-zinc-950 rounded-xl p-8 border border-zinc-800 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50"></div>
              <h3 className="text-zinc-500 uppercase tracking-widest text-sm font-bold mb-4">Final Verdict</h3>
              <p className="text-2xl font-bold text-white mb-6 italic">"{review.finalOpinion}"</p>
              
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-zinc-900 border border-zinc-800">
                <span className="text-zinc-400 font-medium">Conclusion:</span>
                <span className={`font-bold text-lg ${review.worthWatching ? 'text-emerald-500' : 'text-red-500'}`}>
                  {review.worthWatching ? 'Absolutely Worth Watching' : 'Skip It'}
                </span>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-center">
              <ShareButtons title={`Read the review for ${drama.title} on Legend | Film`} url={window.location.href} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
