import { useState } from 'react';
import { motion } from 'motion/react';
import { dramas, categories } from '../data/mockData';
import DramaCard from '../components/DramaCard';

export default function Categories() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredDramas = activeCategory === "All" 
    ? dramas 
    : dramas.filter(d => d.genre.includes(activeCategory));

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Browse by Category</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Discover your next favorite drama from our curated collection of genres.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setActiveCategory("All")}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
              activeCategory === "All" 
                ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' 
                : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeCategory === category 
                  ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Results */}
        <motion.div 
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredDramas.map((drama, index) => (
            <motion.div
              key={drama.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <DramaCard drama={drama} />
            </motion.div>
          ))}
        </motion.div>

        {filteredDramas.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-zinc-500 mb-2">No dramas found</h3>
            <p className="text-zinc-600">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
