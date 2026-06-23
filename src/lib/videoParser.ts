/**
 * Utility matching patterns and generating iframe-compatible embed URLs 
 * for popular video platforms in Cambodia (Telegram, Facebook, YouTube, etc.)
 */

export interface ParsedVideo {
  type: 'youtube' | 'facebook' | 'telegram' | 'vimeo' | 'direct' | 'unknown';
  embedUrl: string;
  originalUrl: string;
  isPrivateTelegram?: boolean;
}

export function parseVideoUrl(url: string): ParsedVideo {
  if (!url) {
    return { type: 'unknown', embedUrl: '', originalUrl: '' };
  }

  // Prepend https:// if missing to avoid relative resolution errors
  let cleanUrl = url.trim();
  if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = `https://${cleanUrl}`;
  }

  // 1. YouTube
  // Matches: 
  // - https://www.youtube.com/watch?v=dQw4w9WgXcQ
  // - https://youtu.be/dQw4w9WgXcQ
  // - https://www.youtube.com/embed/dQw4w9WgXcQ
  // - https://youtube.com/shorts/dQw4w9WgXcQ
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
      originalUrl: cleanUrl
    };
  }

  // 2a. Telegram Private Channel/Group Posts
  // Private links are like t.me/c/1922579144/2 or telegram.me/c/1922579144/2
  const tgPrivateMatch = cleanUrl.match(/(?:t\.me|telegram\.me)\/c\/(\d+)\/(\d+)/i);
  if (tgPrivateMatch) {
    return {
      type: 'telegram',
      embedUrl: '', // Private channel cannot be embedded publicly
      originalUrl: cleanUrl,
      isPrivateTelegram: true
    };
  }

  // 2b. Telegram public channel posts
  // Matches:
  // - https://t.me/channel_name/123
  // - https://telegram.me/channel_name/123
  // - https://t.me/s/channel_name/123
  const telegramMatch = cleanUrl.match(/(?:t\.me|telegram\.me)\/(?:s\/)?([a-zA-Z0-9_]+)\/(\d+)/i);
  if (telegramMatch && telegramMatch[1] && telegramMatch[2]) {
    return {
      type: 'telegram',
      embedUrl: `https://t.me/${telegramMatch[1]}/${telegramMatch[2]}?embed=1`,
      originalUrl: cleanUrl
    };
  }

  // 3. Facebook Video
  // Matches:
  // - https://www.facebook.com/watch/?v=12345678
  // - https://www.facebook.com/username/videos/12345678
  // - https://fb.watch/abcd123/
  const isFacebook = /facebook\.com/i.test(cleanUrl) || /fb\.watch/i.test(cleanUrl);
  if (isFacebook) {
    return {
      type: 'facebook',
      embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}&show_text=false&t=0`,
      originalUrl: cleanUrl
    };
  }

  // 4. Vimeo
  const vimeoMatch = cleanUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      originalUrl: cleanUrl
    };
  }

  // 5. Direct Video Link (usually .mp4, .webm, .ogg)
  const isDirectVideo = 
    /\.(mp4|webm|ogg|mov|mkv)(?:\?.*)?$/i.test(cleanUrl) || 
    cleanUrl.startsWith('blob:') ||
    cleanUrl.includes('firebasestorage.googleapis.com') ||
    cleanUrl.includes('.mp4?') ||
    cleanUrl.includes('.webm?') ||
    cleanUrl.includes('.mov?') ||
    cleanUrl.includes('.mkv?');
  if (isDirectVideo) {
    return {
      type: 'direct',
      embedUrl: cleanUrl,
      originalUrl: cleanUrl
    };
  }

  // Fallback to unknown or check if it looks like a general URL we can display in an iframe or browser
  return {
    type: 'unknown',
    embedUrl: cleanUrl,
    originalUrl: cleanUrl
  };
}
