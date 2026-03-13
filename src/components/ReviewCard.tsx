import { Link } from 'react-router-dom';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Review, Drama } from '../data/mockData';
import { motion } from 'motion/react';

export default function ReviewCard({ review, drama }: { review: Review, drama?: Drama }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          {drama && (
            <Link to={`/drama/${drama.id}`} className="text-amber-500 hover:text-amber-400 text-sm font-semibold uppercase tracking-wider mb-1 block">
              {drama.title}
            </Link>
          )}
          <h4 className="text-zinc-50 font-bold text-lg">{review.author}</h4>
          <span className="text-zinc-500 text-xs">{new Date(review.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-1 bg-zinc-950 px-3 py-1.5 rounded-full border border-zinc-800">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-zinc-50">{review.rating}/5</span>
        </div>
      </div>

      <p className="text-zinc-300 text-sm leading-relaxed mb-6 line-clamp-3">
        "{review.content}"
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-emerald-500 font-semibold text-sm mb-2">
            <ThumbsUp className="w-4 h-4" /> Pros
          </div>
          <ul className="list-disc list-inside text-zinc-400 text-xs space-y-1">
            {review.pros.slice(0, 2).map((pro, i) => (
              <li key={i}>{pro}</li>
            ))}
          </ul>
        </div>
        <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-500 font-semibold text-sm mb-2">
            <ThumbsDown className="w-4 h-4" /> Cons
          </div>
          <ul className="list-disc list-inside text-zinc-400 text-xs space-y-1">
            {review.cons.slice(0, 2).map((con, i) => (
              <li key={i}>{con}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Final Verdict</span>
        <span className={`text-sm font-bold px-3 py-1 rounded-full ${review.worthWatching ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
          {review.worthWatching ? 'Worth Watching' : 'Skip It'}
        </span>
      </div>
      
      {drama && (
        <div className="mt-4 pt-4 border-t border-zinc-800 text-center">
          <Link to={`/review/${review.id}`} className="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors">
            Read Full Review &rarr;
          </Link>
        </div>
      )}
    </motion.div>
  );
}
