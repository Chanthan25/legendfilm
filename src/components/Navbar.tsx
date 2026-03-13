import { Link } from 'react-router-dom';
import { Search, Menu, X, Film, User, LogIn, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { getProfile } from '../lib/api';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const profile = await getProfile(user.id);
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        } else {
          setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`);
        }
      } else {
        setAvatarUrl(null);
      }
    }
    loadProfile();

    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [user]);

  return (
    <nav className="bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <Film className="w-8 h-8 text-amber-500 group-hover:text-amber-400 transition-colors" />
              <span className="text-xl font-bold text-zinc-50 tracking-wider uppercase">
                Legend <span className="text-red-600">|</span> Film
              </span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              <Link to="/" className="text-zinc-300 hover:text-amber-500 transition-colors px-3 py-2 rounded-md text-sm font-medium">Home</Link>
              <Link to="/categories" className="text-zinc-300 hover:text-amber-500 transition-colors px-3 py-2 rounded-md text-sm font-medium">Categories</Link>
              <Link to="/search" className="text-zinc-300 hover:text-amber-500 transition-colors px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                <Search className="w-4 h-4" /> Search
              </Link>
              <Link to="/create" className="text-zinc-300 hover:text-amber-500 transition-colors px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create
              </Link>
              {user ? (
                <Link to="/profile" className="text-zinc-300 hover:text-amber-500 transition-colors p-1 rounded-full hover:bg-zinc-800 flex items-center justify-center" title="Profile">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-zinc-700" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-5 h-5 m-1.5" />
                  )}
                </Link>
              ) : (
                <Link to="/auth" className="text-zinc-300 hover:text-amber-500 transition-colors p-2 rounded-full hover:bg-zinc-800 flex items-center justify-center" title="Sign In">
                  <LogIn className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-zinc-400 hover:text-white focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-900 border-b border-zinc-800"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-amber-500 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
              <Link to="/categories" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-amber-500 block px-3 py-2 rounded-md text-base font-medium">Categories</Link>
              <Link to="/search" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-amber-500 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2">
                <Search className="w-4 h-4" /> Search
              </Link>
              <Link to="/create" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-amber-500 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create
              </Link>
              {user ? (
                <Link to="/profile" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-amber-500 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-zinc-700" referrerPolicy="no-referrer" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  Profile
                </Link>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-amber-500 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2">
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
