import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { dramas, categories } from '../data/mockData';
import DramaCard from '../components/DramaCard';
import { Filter, ArrowDownUp } from 'lucide-react';

export default function Categories() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeCountry, setActiveCountry] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("rating"); // "rating" | "year"
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const countries = ["All", ...Array.from(new Set(dramas.map(d => d.country)))];

  const filteredAndSortedDramas = useMemo(() => {
    let result = dramas;

    // Filter by genre
    if (activeCategory !== "All") {
      result = result.filter(d => d.genre.includes(activeCategory));
    }

    // Filter by country
    if (activeCountry !== "All") {
      result = result.filter(d => d.country === activeCountry);
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sortBy === "rating") {
        return b.rating - a.rating; // Highest rating first
      } else if (sortBy === "year") {
        return b.year - a.year; // Newest first
      }
      return 0;
    });

    return result;
  }, [activeCategory, activeCountry, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Browse by Category</h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Discover your next favorite drama from our curated collection of genres.
          </p>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            
            {/* Country Filter */}
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-zinc-500" />
              <span className="text-zinc-300 font-medium">Country:</span>
              <div className="flex flex-wrap gap-2">
                {countries.map(country => (
                  <button
                    key={country}
                    onClick={() => setActiveCountry(country)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeCountry === country
                        ? 'bg-amber-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-3">
              <ArrowDownUp className="w-5 h-5 text-zinc-500" />
              <span className="text-zinc-300 font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block p-2 outline-none"
              >
                <option value="rating">Highest Rated</option>
                <option value="year">Newest Release</option>
              </select>
            </div>
          </div>

          <div className="w-full h-px bg-zinc-800 my-6"></div>

          {/* Genre Filters */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveCategory("All")}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                activeCategory === "All" 
                  ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' 
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
              }`}
            >
              All Genres
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 ${
                  activeCategory === category 
                    ? 'bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20' 
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white border border-zinc-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <motion.div 
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {filteredAndSortedDramas.map((drama, index) => (
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

        {filteredAndSortedDramas.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-zinc-500 mb-2">No dramas found</h3>
            <p className="text-zinc-600">Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
