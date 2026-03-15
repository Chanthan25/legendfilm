import { supabase } from './supabase';

export async function getProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
  }
  return data;
}

export async function updateProfile(userId: string, updates: any) {
  const { error } = await supabase.from('profiles').upsert({ id: userId, ...updates });
  if (error) console.error('Error updating profile:', error);
  return error;
}

export async function uploadImage(userId: string, file: File, bucket: string = 'avatars') {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}-${Math.random()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      console.error(`Error uploading to ${bucket}:`, uploadError);
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error: any) {
    console.error('Image upload failed:', error);
    alert(error.message || `Failed to upload image. Please ensure the "${bucket}" bucket exists in Supabase and has public access policies enabled.`);
    return null;
  }
}

export async function uploadAvatar(userId: string, file: File) {
  return uploadImage(userId, file, 'avatars');
}

export async function uploadCover(userId: string, file: File) {
  return uploadImage(userId, file, 'covers');
}

export async function getWatchlist(userId: string) {
  const { data, error } = await supabase.from('watchlists').select('drama_id').eq('user_id', userId);
  if (error) console.error('Error fetching watchlist:', error);
  return data?.map(item => item.drama_id) || [];
}

export async function toggleWatchlist(userId: string, dramaId: string, isWatchlisted: boolean) {
  if (isWatchlisted) {
    const { error } = await supabase.from('watchlists').delete().match({ user_id: userId, drama_id: dramaId });
    if (error) console.error('Error removing from watchlist:', error);
  } else {
    const { error } = await supabase.from('watchlists').insert({ user_id: userId, drama_id: dramaId });
    if (error) console.error('Error adding to watchlist:', error);
  }
}

export async function getReviews(userId?: string, dramaId?: string) {
  let query = supabase.from('reviews').select('*, profiles(display_name, avatar_url)');
  if (userId) query = query.eq('user_id', userId);
  if (dramaId) query = query.eq('drama_id', dramaId);
  
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) console.error('Error fetching reviews:', error);
  return data || [];
}

export async function getReviewById(reviewId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(display_name, avatar_url)')
    .eq('id', reviewId)
    .single();
    
  if (error) {
    console.error('Error fetching review by ID:', error);
    return null;
  }
  return data;
}

export async function addReview(userId: string, dramaId: string, rating: number, content: string) {
  const { error } = await supabase.from('reviews').insert({
    user_id: userId,
    drama_id: dramaId,
    rating,
    content
  });
  if (error) console.error('Error adding review:', error);
  return error;
}

export async function getFollowStats(userId: string) {
  const { count: followers } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', userId);
  const { count: following } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
  return { followers: followers || 0, following: following || 0 };
}

export async function checkIsFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase.from('followers').select('*').match({ follower_id: followerId, following_id: followingId }).single();
  return !!data;
}

export async function testFollowConstraint() {
  const { error } = await supabase.from('followers').insert({ follower_id: '11111111-1111-1111-1111-111111111111', following_id: '22222222-2222-2222-2222-222222222222' });
  console.log('Test follow constraint error:', error);
  return error;
}

export async function toggleFollow(followerId: string, followingId: string, isFollowing: boolean) {
  if (isFollowing) {
    const { error } = await supabase.from('followers').delete().match({ follower_id: followerId, following_id: followingId });
    if (error) console.error('Error unfollowing:', error);
    return error;
  } else {
    const { error } = await supabase.from('followers').insert({ follower_id: followerId, following_id: followingId });
    if (error) console.error('Error following:', error);
    return error;
  }
}

export async function getDramaStats(dramaId: string) {
  const { count: likes } = await supabase.from('drama_likes').select('*', { count: 'exact', head: true }).eq('drama_id', dramaId).eq('is_like', true);
  const { count: dislikes } = await supabase.from('drama_likes').select('*', { count: 'exact', head: true }).eq('drama_id', dramaId).eq('is_like', false);
  const { count: shares } = await supabase.from('drama_shares').select('*', { count: 'exact', head: true }).eq('drama_id', dramaId);
  return { likes: likes || 0, dislikes: dislikes || 0, shares: shares || 0 };
}

export async function getUserDramaReaction(userId: string, dramaId: string) {
  const { data } = await supabase.from('drama_likes').select('is_like').match({ user_id: userId, drama_id: dramaId }).single();
  return data?.is_like ?? null; // true for like, false for dislike, null for none
}

export async function toggleDramaReaction(userId: string, dramaId: string, isLike: boolean) {
  const currentReaction = await getUserDramaReaction(userId, dramaId);
  
  if (currentReaction === isLike) {
    // Remove reaction if clicking the same button
    const { error } = await supabase.from('drama_likes').delete().match({ user_id: userId, drama_id: dramaId });
    if (error) console.error('Error removing reaction:', error);
  } else {
    // Insert or update reaction
    const { error } = await supabase.from('drama_likes').upsert({ user_id: userId, drama_id: dramaId, is_like: isLike });
    if (error) console.error('Error adding reaction:', error);
  }
}

export async function addDramaShare(userId: string | undefined, dramaId: string) {
  const { error } = await supabase.from('drama_shares').insert({ user_id: userId || null, drama_id: dramaId });
  if (error) console.error('Error adding share:', error);
}

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data || [];
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);
  if (error) console.error('Error marking notification read:', error);
  return error;
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) console.error('Error marking all notifications read:', error);
  return error;
}

export async function getNotificationSettings(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('notification_settings')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Error fetching notification settings:', error);
    return null;
  }
  return data?.notification_settings || { new_episode: true, channel_updates: true, marketing: false };
}

export async function updateNotificationSettings(userId: string, settings: any) {
  const { error } = await supabase
    .from('profiles')
    .upsert({ id: userId, notification_settings: settings });
  if (error) console.error('Error updating notification settings:', error);
  return error;
}

export async function getStorageUsage(userId: string) {
  try {
    const buckets = ['avatars', 'covers'];
    let totalSize = 0;
    
    for (const bucket of buckets) {
      const { data, error } = await supabase.storage.from(bucket).list();
      if (error) continue;
      
      if (data) {
        // Filter files that belong to this user (starting with userId)
        data.forEach(file => {
          if (file.name.startsWith(userId)) {
            totalSize += file.metadata?.size || 0;
          }
        });
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return 0;
  }
}

export async function getSessionInfo() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) return null;
  return session;
}
