import { Link } from 'react-router-dom';
import { Play, ChevronRight } from 'lucide-react';
import { dramas, reviews } from '../data/mockData';
import DramaCard from '../components/DramaCard';
import ReviewCard from '../components/ReviewCard';
import HeroSlider from '../components/HeroSlider';
import { motion } from 'motion/react';

export default function Home() {
  const trendingDramas = dramas.slice(0, 4);
  const latestReviews = reviews.slice(0, 2);
  const featuredDrama = dramas[0];

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={featuredDrama.poster} 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30 scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/50 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-sm">Legend | Film Exclusive</span>
              <span className="text-amber-500 text-sm font-semibold tracking-wider uppercase">{featuredDrama.country} Drama</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {featuredDrama.title}
            </h1>
            <p className="text-lg text-zinc-300 mb-8 line-clamp-3 leading-relaxed">
              {featuredDrama.summary}
            </p>
            <div className="flex items-center gap-4">
              <Link 
                to={`/drama/${featuredDrama.id}`}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-8 py-3 rounded-full font-bold transition-colors flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" /> Read Summary
              </Link>
              <Link 
                to={`/review/${reviews.find(r => r.dramaId === featuredDrama.id)?.id}`}
                className="bg-zinc-800/80 hover:bg-zinc-700 backdrop-blur-md text-white border border-zinc-700 px-8 py-3 rounded-full font-bold transition-colors"
              >
                View Review
              </Link>
            </div>
          </motion.div>

          <div className="hidden lg:block w-[400px]">
            <HeroSlider dramas={dramas.slice(0, 5)} />
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <span className="w-2 h-8 bg-amber-500 rounded-full"></span> Trending Dramas
            </h2>
            <p className="text-zinc-400">Most discussed Chinese & Khmer series this week</p>
          </div>
          <Link to="/categories" className="hidden sm:flex items-center gap-1 text-amber-500 hover:text-amber-400 font-semibold transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {trendingDramas.map((drama, index) => (
            <motion.div 
              key={drama.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <DramaCard drama={drama} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Latest Reviews Section */}
      <section className="py-20 bg-zinc-900/50 border-y border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Latest Reviews</h2>
            <p className="text-zinc-400">In-depth analysis and honest opinions</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {latestReviews.map((review, index) => {
              const drama = dramas.find(d => d.id === review.dramaId);
              return (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                >
                  <ReviewCard review={review} drama={drama} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
