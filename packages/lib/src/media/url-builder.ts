import { ImageVariant, MediaType, MediaUrls } from '@qrdine/types';
import { storageAdapter } from './storage-adapter';

// Default SVG Placeholders for instant UI fallbacks
export const SVG_PLACEHOLDERS: Record<MediaType | 'broken' | 'loading', string> = {
  logo: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`,
  category: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m15 5 4 4"/><path d="M13 7 9 3 2 10l7 7 7-7Z"/><path d="m5 7 5 5"/><path d="m19 13-3 3"/><path d="m14 18-3 3"/></svg>`,
  menu: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h21s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  banner: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
  staff: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  offer: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  qr: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>`,
  marketing: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%23334155" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/></svg>`,
  broken: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%23f43f5e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="2" x2="22" y1="2" y2="22"/><path d="M10.41 10.41a2 2 0 1 1-2.83-2.83"/><path d="M13.5 13.5 6 21"/><path d="M21 15l-3.086-3.086a2 2 0 0 0-1.874-.537"/></svg>`,
  loading: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="%230284c7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
};

export class UrlBuilder {
  private static cdnBaseUrl: string = '';

  /**
   * Set custom CDN URL prefix (e.g. https://cdn.qrdine.com)
   */
  static setCdnBaseUrl(url: string) {
    UrlBuilder.cdnBaseUrl = url ? url.replace(/\/+$/, '') : '';
  }

  /**
   * Resolve public URL for a given bucket and path
   */
  static getPublicUrl(bucket: string, storagePath: string): string {
    if (!storagePath) return '';
    if (storagePath.startsWith('http://') || storagePath.startsWith('https://') || storagePath.startsWith('data:')) {
      return storagePath;
    }

    if (UrlBuilder.cdnBaseUrl) {
      return `${UrlBuilder.cdnBaseUrl}/${bucket}/${storagePath.replace(/^\/+/, '')}`;
    }

    return storageAdapter.getPublicUrl(bucket, storagePath);
  }

  /**
   * Format predictable storage path for an entity
   * Format: restaurants/{restaurantId}/{entityType}s/{entityId}/{variant}.webp
   */
  static buildStoragePath(
    restaurantId: string,
    entityType: MediaType,
    entityId: string = 'default',
    variant: ImageVariant = 'original',
    ext: string = 'webp'
  ): string {
    const cleanRestId = restaurantId.trim();
    const cleanEntityId = entityId.trim();
    const folder = `${entityType}s`;
    
    if (variant === 'original') {
      return `restaurants/${cleanRestId}/${folder}/${cleanEntityId}/original.${ext}`;
    }
    
    return `restaurants/${cleanRestId}/${folder}/${cleanEntityId}/${variant}.${ext}`;
  }

  /**
   * Resolve full MediaUrls object including srcset for responsive images
   */
  static buildMediaUrls(
    bucket: string,
    baseStoragePath: string,
    variantsMap: Partial<Record<ImageVariant, string>> = {}
  ): MediaUrls {
    const originalUrl = UrlBuilder.getPublicUrl(bucket, baseStoragePath);
    const resolvedVariants: Partial<Record<ImageVariant, string>> = {};

    const srcsetParts: string[] = [];

    // Map variant dimensions for srcset width descriptors
    const variantWidths: Record<string, number> = {
      thumb: 150,
      small: 400,
      medium: 800,
      large: 1600,
    };

    for (const [vKey, vPath] of Object.entries(variantsMap)) {
      if (vPath) {
        const vUrl = UrlBuilder.getPublicUrl(bucket, vPath);
        resolvedVariants[vKey as ImageVariant] = vUrl;
        
        if (variantWidths[vKey]) {
          srcsetParts.push(`${vUrl} ${variantWidths[vKey]}w`);
        }
      }
    }

    if (originalUrl && !srcsetParts.length) {
      srcsetParts.push(`${originalUrl} 1200w`);
    }

    return {
      originalUrl,
      variantsUrlMap: resolvedVariants,
      srcset: srcsetParts.join(', '),
    };
  }

  /**
   * Return SVG fallback placeholder data URL for an entity type
   */
  static getPlaceholder(entityType: MediaType | 'broken' | 'loading' = 'menu'): string {
    return SVG_PLACEHOLDERS[entityType] || SVG_PLACEHOLDERS.menu;
  }
}
