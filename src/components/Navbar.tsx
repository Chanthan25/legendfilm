import { Link } from 'react-router-dom';
import { Search, Menu, X, Film, User, LogIn, Plus, ChevronDown, Facebook, Twitter, Instagram, Youtube, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../lib/AuthContext';
import { getProfile } from '../lib/api';
import { supabase } from '../lib/supabase';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSocialOpen, setIsSocialOpen] = useState(false);
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const socialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (socialRef.current && !socialRef.current.contains(event.target as Node)) {
        setIsSocialOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const profile = await getProfile(user.id);
        if (profile?.avatar_url) {
          setAvatarUrl(profile.avatar_url);
        } else {
          setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`);
        }
        
        // Load initial unread count
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);
        setUnreadCount(count || 0);

      } else {
        setAvatarUrl(null);
        setUnreadCount(0);
      }
    }
    loadProfile();

    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Real-time notifications subscription
    let subscription: any;
    if (user) {
      subscription = supabase
        .channel('public:notifications_badge')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        }, (payload) => {
          if (payload.eventType === 'INSERT' && !payload.new.read) {
            setUnreadCount(prev => prev + 1);
          } else if (payload.eventType === 'UPDATE') {
            if (payload.old.read === false && payload.new.read === true) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            } else if (payload.old.read === true && payload.new.read === false) {
              setUnreadCount(prev => prev + 1);
            }
          } else if (payload.eventType === 'DELETE' && !payload.old.read) {
            setUnreadCount(prev => Math.max(0, prev - 1));
          }
        })
        .subscribe();
    }

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
      if (subscription) {
        supabase.removeChannel(subscription);
      }
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
              
              {/* Social Media Dropdown */}
              <div className="relative" ref={socialRef}>
                <button 
                  onClick={() => setIsSocialOpen(!isSocialOpen)}
                  className="text-zinc-300 hover:text-amber-500 transition-colors px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
                >
                  Follow Us <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSocialOpen ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isSocialOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 py-1"
                    >
                      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                        <Facebook className="w-4 h-4 text-[#1877F2]" /> Facebook
                      </a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                        <Twitter className="w-4 h-4 text-[#1DA1F2]" /> Twitter
                      </a>
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                        <Instagram className="w-4 h-4 text-[#E4405F]" /> Instagram
                      </a>
                      <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors">
                        <Youtube className="w-4 h-4 text-[#FF0000]" /> YouTube
                      </a>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link to="/notifications" className="relative text-zinc-300 hover:text-amber-500 transition-colors p-2 rounded-full hover:bg-zinc-800 flex items-center justify-center" title="Notifications">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-zinc-950"></span>
                    )}
                  </Link>
                  <Link to="/profile" className="text-zinc-300 hover:text-amber-500 transition-colors p-1 rounded-full hover:bg-zinc-800 flex items-center justify-center" title="Profile">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-zinc-700" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-5 h-5 m-1.5" />
                    )}
                  </Link>
                </div>
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
              
              {/* Mobile Social Links */}
              <div className="px-3 py-3 border-t border-zinc-800 mt-2">
                <div className="text-zinc-500 text-xs font-semibold mb-3 uppercase tracking-wider">Follow Us</div>
                <div className="flex gap-4">
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#1877F2] transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#1DA1F2] transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#E4405F] transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-[#FF0000] transition-colors">
                    <Youtube className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {user ? (
                <>
                  <Link to="/notifications" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-amber-500 block px-3 py-2 rounded-md text-base font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4" /> Notifications
                    </div>
                    {unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="text-zinc-300 hover:text-amber-500 block px-3 py-2 rounded-md text-base font-medium flex items-center gap-2">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-6 h-6 rounded-full object-cover border border-zinc-700" referrerPolicy="no-referrer" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    Profile
                  </Link>
                </>
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
