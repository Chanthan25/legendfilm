import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { User, Settings, Heart, MessageSquare, LogOut, Edit3, UserPlus, UserMinus, Camera } from 'lucide-react';
import { dramas } from '../data/mockData';
import DramaCard from '../components/DramaCard';
import ReviewCard from '../components/ReviewCard';
import { useAuth } from '../lib/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getProfile, updateProfile, uploadAvatar, uploadCover, getWatchlist, getReviews, getFollowStats, checkIsFollowing, toggleFollow } from '../lib/api';

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'watchlist' | 'reviews' | 'settings'>('watchlist');
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const profileId = id || user?.id;
  const isOwnProfile = !id || id === user?.id;

  useEffect(() => {
    if (!authLoading && !user && isOwnProfile) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate, isOwnProfile]);

  useEffect(() => {
    async function loadData() {
      if (!profileId) return;
      setIsLoading(true);
      
      try {
        const [profileData, watchlistIds, reviewsData, followStats] = await Promise.all([
          getProfile(profileId),
          getWatchlist(profileId),
          getReviews(profileId),
          getFollowStats(profileId)
        ]);

        setProfile(profileData || { id: profileId });
        setEditName(profileData?.display_name || '');
        setEditBio(profileData?.bio || '');
        
        const watchlistedDramas = watchlistIds.map((id: string) => dramas.find(d => d.id === id)).filter(Boolean);
        setWatchlist(watchlistedDramas);
        setUserReviews(reviewsData);
        setStats(followStats);

        if (user && !isOwnProfile) {
          const following = await checkIsFollowing(user.id, profileId);
          setIsFollowing(following);
        }
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [profileId, user, isOwnProfile]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    const error = await updateProfile(user.id, { display_name: editName, bio: editBio });
    if (!error) {
      setProfile({ ...profile, display_name: editName, bio: editBio });
      alert('Profile updated successfully!');
    }
    setIsSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = await uploadAvatar(user.id, file);
    if (url) {
      await updateProfile(user.id, { avatar_url: url });
      setProfile({ ...profile, avatar_url: url });
      window.dispatchEvent(new Event('profileUpdated'));
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = await uploadCover(user.id, file);
    if (url) {
      await updateProfile(user.id, { cover_url: url });
      setProfile({ ...profile, cover_url: url });
    }
  };

  const handleToggleFollow = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!profileId) return;
    
    await toggleFollow(user.id, profileId, isFollowing);
    setIsFollowing(!isFollowing);
    setStats(prev => ({
      ...prev,
      followers: isFollowing ? prev.followers - 1 : prev.followers + 1
    }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const displayName = profile?.display_name || (isOwnProfile && user?.email ? user.email.split('@')[0] : 'User');
  const handle = `@${displayName.toLowerCase().replace(/\s+/g, '')}`;
  const avatarUrl = profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileId}`;

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-8 relative overflow-hidden">
          {profile?.cover_url ? (
            <div className="absolute top-0 left-0 w-full h-32">
              <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-900" />
            </div>
          ) : (
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-amber-500/20 to-red-600/20" />
          )}
          
          {isOwnProfile && (
            <>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={coverInputRef}
                onChange={handleCoverUpload}
              />
              <button 
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-4 right-4 z-20 px-4 py-2 bg-zinc-950/50 hover:bg-zinc-950/80 backdrop-blur-md text-white rounded-full text-sm font-medium transition-colors flex items-center gap-2 border border-white/10"
              >
                <Camera className="w-4 h-4" /> Edit Cover
              </button>
            </>
          )}

          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 mt-8">
            <div className="relative">
              <img 
                src={avatarUrl} 
                alt={displayName} 
                className="w-32 h-32 rounded-full border-4 border-zinc-950 object-cover bg-zinc-800"
                referrerPolicy="no-referrer"
              />
              {isOwnProfile && (
                <>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-2 bg-amber-500 text-zinc-950 rounded-full hover:bg-amber-400 transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-1">{displayName}</h1>
              <p className="text-amber-500 font-medium mb-4">{handle}</p>
              <p className="text-zinc-400 max-w-2xl mb-6">{profile?.bio || 'No bio yet.'}</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-6">
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-white">{watchlist.length}</p>
                  <p className="text-sm text-zinc-500 uppercase tracking-wider">Watched</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-white">{userReviews.length}</p>
                  <p className="text-sm text-zinc-500 uppercase tracking-wider">Reviews</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-white">{stats.followers}</p>
                  <p className="text-sm text-zinc-500 uppercase tracking-wider">Followers</p>
                </div>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-bold text-white">{stats.following}</p>
                  <p className="text-sm text-zinc-500 uppercase tracking-wider">Following</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              {isOwnProfile ? (
                <button 
                  onClick={() => setActiveTab('settings')}
                  className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-medium transition-colors flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Edit Profile
                </button>
              ) : (
                <button 
                  onClick={handleToggleFollow}
                  className={`px-6 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                    isFollowing 
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-white' 
                      : 'bg-amber-500 hover:bg-amber-400 text-zinc-950'
                  }`}
                >
                  {isFollowing ? (
                    <><UserMinus className="w-4 h-4" /> Unfollow</>
                  ) : (
                    <><UserPlus className="w-4 h-4" /> Follow</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-8 border-b border-zinc-800 pb-px">
          <button 
            onClick={() => setActiveTab('watchlist')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'watchlist' ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-300'}`}
          >
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" /> Watchlist
            </div>
            {activeTab === 'watchlist' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'reviews' ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-300'}`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Reviews
            </div>
            {activeTab === 'reviews' && (
              <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
          {isOwnProfile && (
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'settings' ? 'text-amber-500' : 'text-zinc-400 hover:text-zinc-300'}`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Settings
              </div>
              {activeTab === 'settings' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
              )}
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'watchlist' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {watchlist.length === 0 ? (
                <div className="col-span-full text-center py-12 text-zinc-500">
                  No dramas in watchlist yet.
                </div>
              ) : (
                watchlist.map((drama, index) => (
                  <motion.div
                    key={drama.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <DramaCard drama={drama} />
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {userReviews.length === 0 ? (
                <div className="col-span-full text-center py-12 text-zinc-500">
                  No reviews written yet.
                </div>
              ) : (
                userReviews.map((review, index) => {
                  const drama = dramas.find(d => d.id === review.drama_id);
                  // Map database review to component format
                  const mappedReview = {
                    id: review.id,
                    dramaId: review.drama_id,
                    author: review.profiles?.display_name || 'User',
                    rating: review.rating,
                    date: new Date(review.created_at).toLocaleDateString(),
                    content: review.content,
                    pros: ['Great acting', 'Good story'],
                    cons: ['Slow pacing'],
                    worthWatching: review.rating >= 3,
                    finalOpinion: review.rating >= 3 ? 'A solid watch.' : 'Not recommended.'
                  };
                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ReviewCard review={mappedReview} drama={drama} />
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}

          {isOwnProfile && activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl p-8"
            >
              <h2 className="text-xl font-bold text-white mb-6">Edit Profile</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-zinc-800">
                  <img 
                    src={avatarUrl} 
                    alt={displayName} 
                    className="w-20 h-20 rounded-full border-2 border-zinc-800 object-cover bg-zinc-800"
                  />
                  <div>
                    <h3 className="text-white font-medium mb-2">Profile Picture</h3>
                    <div className="flex gap-3">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg text-sm font-medium transition-colors"
                      >
                        Change Image
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                  <input 
                    type="email" 
                    disabled
                    value={user?.email || ''} 
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-300 focus:outline-none focus:border-amber-500 transition-colors opacity-70 cursor-not-allowed"
                  />
                  <p className="text-xs text-zinc-500 mt-2">Email cannot be changed.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Display Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Bio</label>
                  <textarea 
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  />
                </div>

                <div className="pt-6 border-t border-zinc-800 flex justify-between items-center">
                  <button 
                    onClick={handleSignOut}
                    className="text-red-500 hover:text-red-400 font-medium flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 px-6 py-2 rounded-lg font-bold transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
