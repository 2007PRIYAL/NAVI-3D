/**
 * AegisIndoor 3D - Intelligent Splat URL & Dataset Resolver
 * Handles direct model filenames (e.g., fountain_photo.splat),
 * splat-three.vercel.app viewer URLs, Hugging Face CDN links,
 * and arbitrary remote .splat / .ply / .ksplat endpoints.
 */

export const KNOWN_SPLAT_MODELS = {
  'fountain_photo.splat': {
    id: 'fountain_plaza',
    name: 'Fountain Plaza Courtyard',
    url: 'https://huggingface.co/datasets/stpete2/splat/resolve/main/fountain_photo.splat',
    fallbackUrl: 'https://splat-three.vercel.app/fountain_photo.splat',
    format: 'splat',
    icon: '⛲',
  },
  'room.splat': {
    id: 'real_world_interior',
    name: 'Real-World Interior Suite',
    url: 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/room/room.splat',
    fallbackUrl: 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/room/room.splat',
    format: 'splat',
    icon: '🌐',
  },
  'bonsai.splat': {
    id: 'artisan_studio',
    name: 'Artisan Studio Space',
    url: 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai-7k.splat',
    fallbackUrl: 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/bonsai/bonsai.splat',
    format: 'splat',
    icon: '🌿',
  },
  'garden.splat': {
    id: 'courtyard_garden',
    name: 'Garden Courtyard Capture',
    url: 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/garden/garden.splat',
    fallbackUrl: 'https://huggingface.co/datasets/dylanebert/3dgs/resolve/main/garden/garden.splat',
    format: 'splat',
    icon: '🪴',
  },
};

/**
 * Normalizes and resolves any input URL or shortcut to a direct 3DGS binary endpoint.
 *
 * Examples:
 * - "https://splat-three.vercel.app/?url=fountain_photo.splat" -> Hugging Face CDN URL
 * - "fountain_photo.splat" -> Hugging Face CDN URL
 * - "fountain_photo" -> Hugging Face CDN URL
 * - "https://huggingface.co/datasets/.../room.splat" -> direct URL
 */
export function resolveSplatUrl(input) {
  if (!input || typeof input !== 'string') return '';
  let url = input.trim();

  // 1. If user supplied a viewer URL (e.g. https://splat-three.vercel.app/?url=fountain_photo.splat)
  if (url.includes('?url=') || url.includes('&url=')) {
    try {
      const dummyBase = url.startsWith('http') ? url : `http://local.test/${url}`;
      const parsed = new URL(dummyBase);
      const innerUrl = parsed.searchParams.get('url');
      if (innerUrl) {
        url = innerUrl.trim();
      }
    } catch {
      const match = url.match(/[?&]url=([^&#]+)/);
      if (match && match[1]) {
        url = decodeURIComponent(match[1]).trim();
      }
    }
  }

  // 2. Check known shortnames and file aliases
  const lower = url.toLowerCase();
  for (const [key, data] of Object.entries(KNOWN_SPLAT_MODELS)) {
    const baseKey = key.replace('.splat', '');
    if (
      lower === key ||
      lower === baseKey ||
      lower.endsWith(`/${key}`) ||
      lower.includes(baseKey)
    ) {
      return data.url;
    }
  }

  // 3. If relative path starting with / or ./
  if (url.startsWith('/') || url.startsWith('./')) {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin + (url.startsWith('.') ? url.slice(1) : url);
    }
  }

  return url;
}

/**
 * Returns a human-friendly display title for any given model URL or identifier.
 */
export function getModelDisplayName(urlOrId) {
  if (!urlOrId) return '3D Model';
  const resolved = resolveSplatUrl(urlOrId);
  for (const data of Object.values(KNOWN_SPLAT_MODELS)) {
    if (data.url === resolved || data.id === urlOrId) {
      return `${data.icon} ${data.name}`;
    }
  }
  const filename = urlOrId.split('/').pop().split('?')[0];
  return filename || 'Custom 3DGS Model';
}
