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
  const { count: followers } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId);
  const { count: following } = await supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId);
  return { followers: followers || 0, following: following || 0 };
}

export async function checkIsFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase.from('follows').select('*').match({ follower_id: followerId, following_id: followingId }).single();
  return !!data;
}

export async function toggleFollow(followerId: string, followingId: string, isFollowing: boolean) {
  if (isFollowing) {
    const { error } = await supabase.from('follows').delete().match({ follower_id: followerId, following_id: followingId });
    if (error) console.error('Error unfollowing:', error);
  } else {
    const { error } = await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
    if (error) console.error('Error following:', error);
  }
}
