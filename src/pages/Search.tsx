import { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { dramas } from '../data/mockData';
import DramaCard from '../components/DramaCard';

export default function Search() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const filteredDramas = dramas.filter(d => 
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    d.genre.some(g => g.toLowerCase().includes(query.toLowerCase()))
  );

  useEffect(() => {
    if (query) {
      setIsSearching(true);
      const timeout = setTimeout(() => setIsSearching(false), 500);
      return () => clearTimeout(timeout);
    } else {
      setIsSearching(false);
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 text-center">Find Your Drama</h1>
          
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <SearchIcon className="h-6 w-6 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-zinc-900 border-2 border-zinc-800 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-lg shadow-xl"
              placeholder="Search by title or genre..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button 
                onClick={() => setQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {query && !isSearching && (
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Search Results for <span className="text-amber-500">"{query}"</span>
            </h2>
            <span className="text-zinc-500 text-sm font-medium bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800">
              {filteredDramas.length} found
            </span>
          </div>
        )}

        {isSearching ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-zinc-800 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {filteredDramas.map((drama, index) => (
              <motion.div
                key={drama.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <DramaCard drama={drama} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {query && !isSearching && filteredDramas.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <SearchIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-zinc-400 mb-2">No results found</h3>
            <p className="text-zinc-500">We couldn't find any dramas matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
