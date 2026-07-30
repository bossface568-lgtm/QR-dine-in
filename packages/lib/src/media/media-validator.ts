import { MediaType, MediaPresetConfig } from '@qrdine/types';

export const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/**
 * Adaptive Media Presets
 *
 * Each entity type has:
 * - maxInputSizeBytes: Maximum accepted input file size (50MB for all)
 * - targetSizeRange: { min, max } in bytes — adaptive compression target
 * - dimensions: { width, height } — target output dimensions
 * - targetQuality: starting WebP quality for adaptive compression loop
 * - variants: responsive image variants to generate
 *
 * Compression Strategy:
 * - Logo:     100–200 KB  (small, crisp icon)
 * - Category: 150–300 KB  (category card image)
 * - Menu:     200–400 KB  (detailed food photo)
 * - Banner:   300–700 KB  (wide cover image)
 * - Staff:    100–200 KB  (portrait photo)
 * - Offer:    200–400 KB  (promotional graphic)
 * - QR:       50–150 KB   (high-contrast QR code)
 * - Marketing:300–600 KB  (marketing material)
 */
export const MEDIA_PRESETS: Record<MediaType, MediaPresetConfig> = {
  logo: {
    entityType: 'logo',
    maxInputSizeBytes: 50 * 1024 * 1024,
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.85,
    targetSizeRange: { min: 100 * 1024, max: 200 * 1024 },
    dimensions: { width: 512, height: 512 },
    variants: ['thumb', 'small'],
  },
  category: {
    entityType: 'category',
    maxInputSizeBytes: 50 * 1024 * 1024,
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.82,
    targetSizeRange: { min: 150 * 1024, max: 300 * 1024 },
    dimensions: { width: 800, height: 800 },
    variants: ['thumb', 'small', 'medium'],
  },
  menu: {
    entityType: 'menu',
    maxInputSizeBytes: 50 * 1024 * 1024,
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.84,
    targetSizeRange: { min: 200 * 1024, max: 400 * 1024 },
    dimensions: { width: 1200, height: 1200 },
    variants: ['thumb', 'small', 'medium', 'large'],
  },
  banner: {
    entityType: 'banner',
    maxInputSizeBytes: 50 * 1024 * 1024,
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.86,
    targetSizeRange: { min: 300 * 1024, max: 700 * 1024 },
    dimensions: { width: 1920, height: 800 },
    variants: ['small', 'medium', 'large'],
  },
  staff: {
    entityType: 'staff',
    maxInputSizeBytes: 50 * 1024 * 1024,
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.82,
    targetSizeRange: { min: 100 * 1024, max: 200 * 1024 },
    dimensions: { width: 512, height: 512 },
    variants: ['thumb', 'small'],
  },
  offer: {
    entityType: 'offer',
    maxInputSizeBytes: 50 * 1024 * 1024,
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.84,
    targetSizeRange: { min: 200 * 1024, max: 400 * 1024 },
    dimensions: { width: 1200, height: 1200 },
    variants: ['small', 'medium'],
  },
  qr: {
    entityType: 'qr',
    maxInputSizeBytes: 50 * 1024 * 1024,
    allowedMimeTypes: ['image/png', 'image/webp', 'image/jpeg', 'image/svg+xml'],
    targetQuality: 0.95,
    targetSizeRange: { min: 50 * 1024, max: 150 * 1024 },
    dimensions: { width: 1024, height: 1024 },
    variants: ['thumb', 'small'],
  },
  marketing: {
    entityType: 'marketing',
    maxInputSizeBytes: 50 * 1024 * 1024,
    allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES,
    targetQuality: 0.85,
    targetSizeRange: { min: 300 * 1024, max: 600 * 1024 },
    dimensions: { width: 2048, height: 2048 },
    variants: ['small', 'medium', 'large'],
  },
};

export class MediaValidator {
  /**
   * Validate a file: checks format, input size cap (50MB), and corruption.
   * No restrictive size limits — all valid images are auto-compressed via adaptive pipeline.
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
        error: `Unsupported format. Please use ${allowedExts}.`
      };
    }

    // 3. Input size safety cap (50MB — to prevent browser tab crashes)
    if (file.size > preset.maxInputSizeBytes) {
      const maxMb = (preset.maxInputSizeBytes / (1024 * 1024)).toFixed(0);
      return {
        valid: false,
        error: `File is too large to process in-browser (>${maxMb} MB). Please use a smaller image.`
      };
    }

    // 4. Image corruption / renderability check (browser environment)
    if (typeof window !== 'undefined' && typeof Image !== 'undefined') {
      try {
        const isRenderable = await MediaValidator.checkImageRenderable(file);
        if (!isRenderable) {
          return { valid: false, error: 'File appears to be corrupted or is not a valid image.' };
        }
      } catch (err: any) {
        return { valid: false, error: 'Unable to decode image file. It may be corrupted.' };
      }
    }

    return { valid: true };
  }

  /**
   * Tests whether an image file can be decoded cleanly by the browser
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
