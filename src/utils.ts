/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Parses various video URLs (YouTube, Vimeo, direct MP4 links) and returns
 * the exact type and final source to render.
 */
export function getVideoSource(url: string): { type: 'youtube' | 'vimeo' | 'iframe' | 'direct' | 'unknown'; src: string } {
  if (!url) return { type: 'unknown', src: '' };

  let trimmed = url.trim();

  // If the input is a full iframe tag (e.g. <iframe src="..."></iframe>), extract the src URL
  if (trimmed.startsWith('<iframe') || trimmed.includes('<iframe')) {
    const srcMatch = trimmed.match(/src="([^"]+)"/);
    if (srcMatch) {
      trimmed = srcMatch[1];
    }
  }

  // YouTube checks
  const ytRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const ytMatch = trimmed.match(ytRegex);
  if (ytMatch) {
    return { type: 'youtube', src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0` };
  }

  // Vimeo checks
  const vimeoDetails = parseVimeo(trimmed);
  if (vimeoDetails) {
    const { id, hash } = vimeoDetails;
    const embedUrl = hash 
      ? `https://player.vimeo.com/video/${id}?h=${hash}&autoplay=1`
      : `https://player.vimeo.com/video/${id}?autoplay=1`;
    return { type: 'vimeo', src: embedUrl };
  }

  // Vimeo direct external links (MP4 files hosted on Vimeo Pro)
  if (trimmed.includes('player.vimeo.com/external')) {
    return { type: 'direct', src: trimmed };
  }

  // Gumlet check
  if (trimmed.includes('gumlet.com') || trimmed.includes('gumlet.io') || trimmed.includes('gumlet.tv')) {
    if (
      trimmed.endsWith('.mp4') ||
      trimmed.endsWith('.webm') ||
      trimmed.endsWith('.m3u8') ||
      trimmed.includes('.mp4?') ||
      trimmed.includes('.webm?') ||
      trimmed.includes('.m3u8?')
    ) {
      return { type: 'direct', src: trimmed };
    }
    
    let embedSrc = trimmed;
    // Handle gumlet.tv/watch/XYZ
    if (trimmed.includes('gumlet.tv/watch/')) {
      const match = trimmed.match(/gumlet\.tv\/watch\/([^?&\s\/]+)/);
      if (match) {
        embedSrc = `https://play.gumlet.io/embed/${match[1]}`;
      }
    } else if (trimmed.includes('play.gumlet.com/') && !trimmed.includes('/embed/')) {
      embedSrc = trimmed.replace('play.gumlet.com/', 'play.gumlet.com/embed/');
    } else if (trimmed.includes('video.gumlet.com/') && !trimmed.includes('/embed/')) {
      embedSrc = trimmed.replace('video.gumlet.com/', 'video.gumlet.com/embed/');
    }
    return { type: 'iframe', src: embedSrc };
  }

  // General embed/iframe fallback (e.g. if URL contains /embed/)
  if (trimmed.includes('/embed/') || trimmed.includes('embed.') || trimmed.includes('player.')) {
    return { type: 'iframe', src: trimmed };
  }

  // Common direct video extensions
  if (
    trimmed.endsWith('.mp4') ||
    trimmed.endsWith('.webm') ||
    trimmed.endsWith('.ogg') ||
    trimmed.includes('.mp4?') ||
    trimmed.includes('.webm?')
  ) {
    return { type: 'direct', src: trimmed };
  }

  // Fallback to iframe if it is a general web URL, supporting embeds/iframes instead of breaking html5 players
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return { type: 'iframe', src: trimmed };
  }

  return { type: 'unknown', src: trimmed };
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Helper to parse complex Vimeo URL shapes
 */
function parseVimeo(url: string): { id: string; hash?: string } | null {
  // Try to parse player.vimeo.com/video/123456789
  const embedMatch = url.match(/player\.vimeo\.com\/video\/(\d+)(?:\?h=([^&\s]+))?/);
  if (embedMatch) {
    return { id: embedMatch[1], hash: embedMatch[2] };
  }

  // Strip protocol and www.vimeo.com
  let path = url.replace(/^(?:https?:\/\/)?(?:www\.)?vimeo\.com\//, '');
  
  // Extract hash if provided via query param e.g. ?h=abcdef
  const queryParamHash = url.match(/[?&]h=([^&\s]+)/);
  let hash = queryParamHash ? queryParamHash[1] : undefined;
  
  path = path.split('?')[0];

  // If path starts with manage/videos/
  if (path.startsWith('manage/videos/')) {
    path = path.replace('manage/videos/', '');
  }
  // If path starts with showcase/
  else if (path.startsWith('showcase/')) {
    const parts = path.split('/');
    const videoIndex = parts.indexOf('video');
    if (videoIndex !== -1 && videoIndex < parts.length - 1) {
      path = parts.slice(videoIndex + 1).join('/');
    }
  }
  // If path starts with channels/
  else if (path.startsWith('channels/')) {
    const parts = path.split('/');
    path = parts[parts.length - 1];
  }
  // If path starts with groups/
  else if (path.includes('/videos/')) {
    const parts = path.split('/videos/');
    path = parts[parts.length - 1];
  }

  // Now path should be "ID" or "ID/hash"
  const pathParts = path.split('/');
  const id = pathParts[0];
  if (/^\d+$/.test(id)) {
    if (!hash && pathParts[1]) {
      hash = pathParts[1];
    }
    return { id, hash };
  }

  return null;
}

