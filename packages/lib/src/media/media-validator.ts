import { MediaType, MediaPresetConfig } from '@qrdine/types';

export const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const MEDIA_PRESETS: Record<MediaType, MediaPresetConfig> = {
  logo: {
    entityType: 'logo',
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.85,
    maxWidth: 800,
    maxHeight: 800,
    variants: ['thumb', 'small'],
  },
  category: {
    entityType: 'category',
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.80,
    maxWidth: 1200,
    maxHeight: 1200,
    variants: ['thumb', 'small', 'medium'],
  },
  menu: {
    entityType: 'menu',
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.82,
    maxWidth: 2048,
    maxHeight: 2048,
    variants: ['thumb', 'small', 'medium', 'large'],
  },
  banner: {
    entityType: 'banner',
    maxSizeBytes: 8 * 1024 * 1024, // 8 MB
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.85,
    maxWidth: 2560,
    maxHeight: 1440,
    variants: ['small', 'medium', 'large'],
  },
  staff: {
    entityType: 'staff',
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.80,
    maxWidth: 1000,
    maxHeight: 1000,
    variants: ['thumb', 'small'],
  },
  offer: {
    entityType: 'offer',
    maxSizeBytes: 4 * 1024 * 1024, // 4 MB
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.82,
    maxWidth: 1600,
    maxHeight: 1600,
    variants: ['small', 'medium'],
  },
  qr: {
    entityType: 'qr',
    maxSizeBytes: 2 * 1024 * 1024, // 2 MB
    allowedMimeTypes: ['image/png', 'image/webp', 'image/jpeg', 'image/svg+xml'],
    targetQuality: 0.95,
    maxWidth: 1024,
    maxHeight: 1024,
    variants: ['thumb', 'small'],
  },
  marketing: {
    entityType: 'marketing',
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.85,
    maxWidth: 2048,
    maxHeight: 2048,
    variants: ['small', 'medium', 'large'],
  },
};

export class MediaValidator {
  /**
   * Validate a file against entity preset rules (size, format, corruption check)
   */
  static async validateFile(file: File, entityType: MediaType): Promise<{ valid: boolean; error?: string }> {
    const preset = MEDIA_PRESETS[entityType] || MEDIA_PRESETS.menu;

    // 1. File existence
    if (!file) {
      return { valid: false, error: 'No file provided.' };
    }

    // 2. MIME type check
    if (!preset.allowedMimeTypes.includes(file.type.toLowerCase())) {
      const allowedExts = preset.allowedMimeTypes.map(m => m.replace('image/', '.').toUpperCase()).join(', ');
      return { 
        valid: false, 
        error: `Invalid file format "${file.type}". Allowed formats: ${allowedExts}.` 
      };
    }

    // 3. File size check
    if (file.size > preset.maxSizeBytes) {
      const maxMb = (preset.maxSizeBytes / (1024 * 1024)).toFixed(0);
      const fileMb = (file.size / (1024 * 1024)).toFixed(2);
      return { 
        valid: false, 
        error: `File size (${fileMb} MB) exceeds maximum allowed limit of ${maxMb} MB for ${entityType} images.` 
      };
    }

    // 4. Image corruption / renderability check (if browser environment)
    if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
      try {
        const isRenderable = await MediaValidator.checkImageRenderable(file);
        if (!isRenderable) {
          return { valid: false, error: 'File appears to be corrupted or invalid image format.' };
        }
      } catch (err: any) {
        return { valid: false, error: 'Unable to decode image file. File may be corrupted.' };
      }
    }

    return { valid: true };
  }

  /**
   * Tests whether an image file can be decoded cleanly
   */
  private static checkImageRenderable(file: File): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img.width > 0 && img.height > 0);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;
    });
  }
}
