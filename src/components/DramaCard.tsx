import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Drama } from '../data/mockData';
import { motion } from 'motion/react';

export default function DramaCard({ drama }: { drama: Drama }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-lg hover:shadow-2xl hover:shadow-amber-500/20 hover:border-zinc-700 transition-all duration-300"
    >
      <Link to={`/drama/${drama.id}`} className="block aspect-[2/3] overflow-hidden relative">
        <img 
          src={drama.poster} 
          alt={drama.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />
        
        <div className="absolute top-3 right-3 bg-zinc-950/80 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 border border-zinc-800">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-zinc-50">{drama.rating}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex flex-wrap gap-1 mb-2">
            {drama.genre.slice(0, 2).map(g => (
              <span key={g} className="text-[10px] uppercase tracking-wider font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-sm">
                {g}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-bold text-zinc-50 leading-tight mb-1 group-hover:text-amber-400 transition-colors line-clamp-1">
            {drama.title}
          </h3>
          <p className="text-xs text-zinc-400">
            {drama.year} â {drama.episodes} Episodes
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
