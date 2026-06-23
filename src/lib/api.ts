import { db } from './firebase';
import { 
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, 
  query, where, orderBy, serverTimestamp, runTransaction 
} from 'firebase/firestore';
import { supabase } from './supabase';

export const auth = {
  get currentUser() {
    try {
      const keys = Object.keys(localStorage);
      const authKey = keys.find(key => key.startsWith('sb-') && key.endsWith('-auth-token'));
      if (authKey) {
        const tokenData = JSON.parse(localStorage.getItem(authKey) || '{}');
        const user = tokenData?.user;
        if (user) {
          return {
            uid: user.id,
            id: user.id,
            email: user.email,
            displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || '',
            photoURL: user.user_metadata?.avatar_url || '',
          };
        }
      }
    } catch (e) {
      console.error('Error getting synchronous user from localStorage:', e);
    }
    return null;
  }
};

export async function uploadFileWithProgress(
  file: File, 
  path: string, 
  onProgress: (progress: number) => void
): Promise<string> {
  // Extract bucket and folder/file path from full path
  const parts = path.split('/');
  const bucketName = parts[0] || 'media';
  const filePath = parts.slice(1).join('/') || file.name;

  console.log(`Uploading to Supabase Storage: bucket="${bucketName}", file="${filePath}"`);

  // Report initial progress
  onProgress(15);

  // Perform upload
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error(`Supabase upload failed in bucket "${bucketName}":`, error);
    
    // Fallback: If bucket Name isn't 'media', try writing inside 'media' bucket, path 'bucketName/filePath'
    if (bucketName !== 'media') {
      console.log(`Failed bucket "${bucketName}", trying fallback to "media" bucket...`);
      onProgress(45);
      const fallbackPath = `${bucketName}/${filePath}`;
      const { error: fbError } = await supabase.storage
        .from('media')
        .upload(fallbackPath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (fbError) {
        throw new Error(
          `Supabase storage upload failed. Please ensure either the bucket "${bucketName}" or a fallback bucket "media" is created and public in your Supabase Dashboard under Storage.\nError details: ${fbError.message}`
        );
      }

      onProgress(100);

      const { data: urlData } = supabase.storage
        .from('media')
        .getPublicUrl(fallbackPath);

      return urlData.publicUrl;
    }

    throw new Error(
      `Supabase storage upload failed. Please ensure the bucket "${bucketName}" exists and is set to public in your Supabase Storage.\nError details: ${error.message}`
    );
  }

  onProgress(100);

  // Get public download URL
  const { data: urlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  if (!urlData || !urlData.publicUrl) {
    throw new Error(`Failed to retrieve public URL for uploaded file in bucket "${bucketName}"`);
  }

  return urlData.publicUrl;
}

// Helper for error handling
enum OperationType {
  CREATE = 'create', UPDATE = 'update', DELETE = 'delete', LIST = 'list', GET = 'get', WRITE = 'write'
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: any;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', errInfo);
  throw new Error(JSON.stringify(errInfo));
}

// Ensure profiles are populated
export async function getProfile(userId: string) {
  try {
    const docRef = doc(db, 'profiles', userId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const profileData = { id: docSnap.id, ...docSnap.data() };
      try {
        localStorage.setItem(`profile_cache_${userId}`, JSON.stringify(profileData));
      } catch (e) {
        console.warn('Storage limit or error caching profile:', e);
      }
      return profileData;
    }
    const cached = localStorage.getItem(`profile_cache_${userId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    return null;
  } catch (error) {
    console.warn('getProfile offline or failed, attempting cache recovery:', error);
    const cached = localStorage.getItem(`profile_cache_${userId}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {}
    }
    // Return a default offline profile model
    return {
      id: userId,
      username: auth.currentUser?.email?.split('@')[0] || 'User',
      display_name: auth.currentUser?.email?.split('@')[0] || 'អ្នកប្រើប្រាស់ (Offline Mode)',
      avatar_url: '',
      is_offline: true
    };
  }
}

export async function updateProfile(userId: string, updates: any) {
  try {
    const docRef = doc(db, 'profiles', userId);
    await setDoc(docRef, updates, { merge: true });
    
    // Update local cache
    const cached = localStorage.getItem(`profile_cache_${userId}`);
    let existing = {};
    if (cached) {
      try { existing = JSON.parse(cached); } catch (e) {}
    }
    localStorage.setItem(`profile_cache_${userId}`, JSON.stringify({ ...existing, ...updates, id: userId }));
    return null;
  } catch (error) {
    console.error('Error updating profile, writing to offline cache:', error);
    
    // Still write to local cache so user sees changes instantly
    const cached = localStorage.getItem(`profile_cache_${userId}`);
    let existing = {};
    if (cached) {
      try { existing = JSON.parse(cached); } catch (e) {}
    }
    localStorage.setItem(`profile_cache_${userId}`, JSON.stringify({ ...existing, ...updates, id: userId }));
    return error;
  }
}

export async function uploadImage(
  userId: string, 
  file: File, 
  bucket: string = 'avatars',
  onProgress?: (progress: number) => void
) {
  return uploadFileWithProgress(
    file,
    `${bucket}/${userId}_${Date.now()}_${file.name}`,
    onProgress || (() => {})
  );
}

export async function uploadAvatar(userId: string, file: File, onProgress?: (progress: number) => void) {
  return uploadImage(userId, file, 'avatars', onProgress);
}

export async function uploadCover(userId: string, file: File, onProgress?: (progress: number) => void) {
  return uploadImage(userId, file, 'covers', onProgress);
}

export async function getWatchlist(userId: string) {
  try {
    const q = query(collection(db, 'watchlists'), where('user_id', '==', userId));
    const querySnapshot = await getDocs(q);
    const results: string[] = [];
    querySnapshot.forEach((docSnap) => results.push(docSnap.data().drama_id));
    return results;
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    return [];
  }
}

export async function toggleWatchlist(userId: string, dramaId: string, isWatchlisted: boolean) {
  try {
    if (isWatchlisted) {
      const q = query(collection(db, 'watchlists'), where('user_id', '==', userId), where('drama_id', '==', dramaId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (docSnap) => {
        await deleteDoc(docSnap.ref);
      });
    } else {
      await setDoc(doc(collection(db, 'watchlists')), { user_id: userId, drama_id: dramaId, created_at: serverTimestamp() });
    }
  } catch (error) {
    console.error('Error toggling watchlist:', error);
  }
}

async function populateProfilesForList(documents: any[]) {
  const profileIds = Array.from(new Set(documents.filter(d => Boolean(d.user_id || d.channel_id)).map(d => d.user_id || d.channel_id)));
  const profilesMap: Record<string, any> = {};
  
  if (profileIds.length > 0) {
    // In a real app we would chunk if >10, but for mock purposes we load them 1 by 1 or assume few
    await Promise.all(
      profileIds.map(async (pid) => {
        const p = await getProfile(pid);
        if (p) profilesMap[pid] = p;
      })
    );
  }
  
  return documents.map(d => {
    return {
      ...d,
      profiles: profilesMap[d.user_id || d.channel_id] || {}
    }
  });
}

export async function getReviews(userId?: string, dramaId?: string) {
  try {
    let q = query(collection(db, 'reviews'));
    if (userId) q = query(q, where('user_id', '==', userId));
    if (dramaId) q = query(q, where('drama_id', '==', dramaId));
    
    // We omit orderBy to prevent index requirement for now
    const querySnapshot = await getDocs(q);
    const reviews: any[] = [];
    querySnapshot.forEach((docSnap) => reviews.push({ id: docSnap.id, ...docSnap.data() }));
    
    return await populateProfilesForList(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export async function getReviewById(reviewId: string) {
  try {
    const docRef = doc(db, 'reviews', reviewId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = { id: docSnap.id, ...docSnap.data() };
    const populated = await populateProfilesForList([data]);
    return populated[0];
  } catch (error) {
    console.error('Error fetching review by ID:', error);
    return null;
  }
}

export async function addReview(userId: string, dramaId: string, rating: number, content: string) {
  try {
    await setDoc(doc(collection(db, 'reviews')), {
      user_id: userId,
      drama_id: dramaId,
      rating,
      content,
      created_at: serverTimestamp()
    });
    return null;
  } catch (error) {
    console.error('Error adding review:', error);
    return error;
  }
}

export async function getDramas() {
  try {
    const q = query(collection(db, 'dramas')); // omitted orderby initially
    const querySnapshot = await getDocs(q);
    let dramas: any[] = [];
    querySnapshot.forEach((docSnap) => dramas.push({ id: docSnap.id, ...docSnap.data() }));
    
    // sort manually to avoid requiring an index
    dramas.sort((a, b) => {
      const t1 = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
      const t2 = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
      return t2 - t1;
    });
    
    return await populateProfilesForList(dramas);
  } catch (error) {
    console.error('Error fetching dramas:', error);
    return [];
  }
}

export async function getDramaById(dramaId: string) {
  try {
    const docRef = doc(db, 'dramas', dramaId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    const data = { id: docSnap.id, ...docSnap.data() };
    const populated = await populateProfilesForList([data]);
    return populated[0];
  } catch (error) {
    console.error('Error fetching drama:', error);
    return null;
  }
}

export async function getDramasByIds(dramaIds: string[]) {
  if (!dramaIds || dramaIds.length === 0) return [];
  try {
    // Firestore in memory fetch since batch 'in' queries have limits of 10
    const dramaPromises = dramaIds.map(id => getDramaById(id));
    const results = await Promise.all(dramaPromises);
    const dramas = results.filter(d => Boolean(d));
    return dramas;
  } catch (error) {
    console.error('Error fetching dramas by IDs:', error);
    return [];
  }
}

export async function getDramasByChannel(channelId: string) {
  try {
    const q = query(collection(db, 'dramas'), where('channel_id', '==', channelId));
    const querySnapshot = await getDocs(q);
    const dramas: any[] = [];
    querySnapshot.forEach((docSnap) => dramas.push({ id: docSnap.id, ...docSnap.data() }));
    return await populateProfilesForList(dramas);
  } catch (error) {
    console.error('Error fetching channel dramas:', error);
    return [];
  }
}

export async function uploadDramaData(dramaData: any) {
  try {
    const docRef = doc(collection(db, 'dramas'));
    const newDrama = { ...dramaData, created_at: serverTimestamp() };
    await setDoc(docRef, newDrama);
    return { id: docRef.id, ...newDrama };
  } catch (error) {
    console.error('Error uploading drama:', error);
    throw error;
  }
}

export async function updateDramaData(dramaId: string, dramaData: any) {
  try {
    const docRef = doc(db, 'dramas', dramaId);
    await updateDoc(docRef, dramaData);
    return { id: dramaId, ...dramaData };
  } catch (error) {
    console.error('Error updating drama:', error);
    throw error;
  }
}

export async function deleteDrama(dramaId: string) {
  try {
    await deleteDoc(doc(db, 'dramas', dramaId));
    return true;
  } catch (error) {
    console.error('Error deleting drama:', error);
    throw error;
  }
}

export async function getFollowStats(userId: string) {
  try {
    const qFollowers = query(collection(db, 'followers'), where('following_id', '==', userId));
    const qFollowing = query(collection(db, 'followers'), where('follower_id', '==', userId));
    
    const snapFollowers = await getDocs(qFollowers);
    const snapFollowing = await getDocs(qFollowing);
    
    return { followers: snapFollowers.size, following: snapFollowing.size };
  } catch (e) {
    return { followers: 0, following: 0 };
  }
}

export async function checkIsFollowing(followerId: string, followingId: string) {
  try {
    const q = query(collection(db, 'followers'), where('follower_id', '==', followerId), where('following_id', '==', followingId));
    const snap = await getDocs(q);
    return !snap.empty;
  } catch (e) {
    return false;
  }
}

export async function testFollowConstraint() {
  return null;
}

export async function toggleFollow(followerId: string, followingId: string, isFollowing: boolean): Promise<any> {
  try {
    if (isFollowing) {
      const q = query(collection(db, 'followers'), where('follower_id', '==', followerId), where('following_id', '==', followingId));
      const snap = await getDocs(q);
      snap.forEach(async (d) => await deleteDoc(d.ref));
    } else {
      await setDoc(doc(collection(db, 'followers')), { follower_id: followerId, following_id: followingId, created_at: serverTimestamp() });
    }
    return null;
  } catch (e) {
    console.error(e);
    return e;
  }
}

export async function getDramaStats(dramaId: string) {
  try {
    const qLikes = query(collection(db, 'drama_likes'), where('drama_id', '==', dramaId), where('is_like', '==', true));
    const qDislikes = query(collection(db, 'drama_likes'), where('drama_id', '==', dramaId), where('is_like', '==', false));
    const qShares = query(collection(db, 'drama_shares'), where('drama_id', '==', dramaId));
    
    const [snapLikes, snapDislikes, snapShares] = await Promise.all([
      getDocs(qLikes), getDocs(qDislikes), getDocs(qShares)
    ]);
    
    return { likes: snapLikes.size, dislikes: snapDislikes.size, shares: snapShares.size };
  } catch (e) {
    return { likes: 0, dislikes: 0, shares: 0 };
  }
}

export async function getUserDramaReaction(userId: string, dramaId: string) {
  try {
    const q = query(collection(db, 'drama_likes'), where('drama_id', '==', dramaId), where('user_id', '==', userId));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return snap.docs[0].data().is_like;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function toggleDramaReaction(userId: string, dramaId: string, isLike: boolean) {
  try {
    const currentReaction = await getUserDramaReaction(userId, dramaId);
    
    const q = query(collection(db, 'drama_likes'), where('drama_id', '==', dramaId), where('user_id', '==', userId));
    const snap = await getDocs(q);
    
    if (currentReaction === isLike) {
      snap.forEach(async (d) => await deleteDoc(d.ref));
    } else {
      if (!snap.empty) {
        snap.forEach(async (d) => await updateDoc(d.ref, { is_like: isLike }));
      } else {
        await setDoc(doc(collection(db, 'drama_likes')), { user_id: userId, drama_id: dramaId, is_like: isLike, created_at: serverTimestamp() });
      }
    }
  } catch (e) {
    console.error(e);
  }
}

export async function addDramaShare(userId: string | undefined, dramaId: string) {
  try {
    await setDoc(doc(collection(db, 'drama_shares')), { user_id: userId || null, drama_id: dramaId, created_at: serverTimestamp() });
  } catch (e) {}
}

export async function getNotifications(userId: string) {
  try {
    const q = query(collection(db, 'notifications'), where('user_id', '==', userId));
    const snap = await getDocs(q);
    const notifications: any[] = [];
    snap.forEach((d) => notifications.push({ id: d.id, ...d.data() }));
    return notifications;
  } catch (e) {
    return [];
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true });
  } catch (e) {}
}

export async function markAllNotificationsRead(userId: string) {
  try {
    const q = query(collection(db, 'notifications'), where('user_id', '==', userId), where('read', '==', false));
    const snap = await getDocs(q);
    snap.forEach(async (d) => await updateDoc(d.ref, { read: true }));
  } catch (e) {}
}

export async function getNotificationSettings(userId: string) {
  try {
    const localSettings = localStorage.getItem(`notification_settings_${userId}`);
    if (localSettings) {
      return JSON.parse(localSettings);
    }
  } catch (e) {
    console.error('Error parsing local notification settings:', e);
  }
  return { new_episode: true, channel_updates: true, marketing: false };
}

export async function updateNotificationSettings(userId: string, settings: any) {
  try {
    localStorage.setItem(`notification_settings_${userId}`, JSON.stringify(settings));
    return null;
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return error;
  }
}

export async function getStorageUsage(userId: string) {
  return 0; // Using dummy data limits
}

export async function getSessionInfo() {
  return { user: auth.currentUser }; // Return roughly similar object to Supabase
}
