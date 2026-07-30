import { ImageVariant, ProcessedImageResult, MediaType } from '@qrdine/types';
import { MEDIA_PRESETS } from './media-validator';

export interface VariantDimension {
  maxWidth: number;
  maxHeight?: number;
  cropSquare?: boolean;
}

export const VARIANT_DIMENSIONS: Record<Exclude<ImageVariant, 'original'>, VariantDimension> = {
  thumb: { maxWidth: 150, maxHeight: 150, cropSquare: true },
  small: { maxWidth: 400 },
  medium: { maxWidth: 800 },
  large: { maxWidth: 1600 },
};

export class ImageProcessor {
  /**
   * Process an uploaded file: strip EXIF metadata, convert to WebP, compress, and generate responsive variants
   */
  static async processImage(
    file: File,
    entityType: MediaType,
    overrideQuality?: number
  ): Promise<ProcessedImageResult> {
    const preset = MEDIA_PRESETS[entityType] || MEDIA_PRESETS.menu;
    const quality = overrideQuality ?? preset.targetQuality;

    // Load Image DOM element from File
    const img = await ImageProcessor.loadImage(file);
    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;

    // 1. Process Main Compressed WebP (stripping EXIF metadata via canvas redraw)
    const mainCanvas = document.createElement('canvas');
    const { width: targetWidth, height: targetHeight } = ImageProcessor.calculateScaledDimensions(
      originalWidth,
      originalHeight,
      preset.maxWidth || 2048,
      preset.maxHeight || 2048
    );

    mainCanvas.width = targetWidth;
    mainCanvas.height = targetHeight;
    const ctx = mainCanvas.getContext('2d');
    if (!ctx) throw new Error('Failed to acquire 2D canvas context for image processing');

    // Smooth image scaling quality
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Convert Canvas to compressed WebP Blob
    const originalWebpBlob = await ImageProcessor.canvasToBlob(mainCanvas, 'image/webp', quality);

    // 2. Generate Responsive Variants requested by entity preset
    const variantsResult: Partial<Record<ImageVariant, Blob>> = {};

    for (const variantKey of preset.variants) {
      if (variantKey === 'original') continue;
      const dim = VARIANT_DIMENSIONS[variantKey as Exclude<ImageVariant, 'original'>];
      if (!dim) continue;

      const variantBlob = await ImageProcessor.createVariantBlob(img, dim, quality);
      variantsResult[variantKey] = variantBlob;
    }

    return {
      originalBlob: originalWebpBlob,
      variants: variantsResult,
      width: targetWidth,
      height: targetHeight,
      mimeType: 'image/webp',
      sizeBytes: originalWebpBlob.size,
    };
  }

  /**
   * Generates a single scaled variant Blob (e.g. 150x150 thumb or 400px small)
   */
  private static async createVariantBlob(
    img: HTMLImageElement,
    dim: VariantDimension,
    quality: number
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to acquire canvas context');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const origW = img.naturalWidth || img.width;
    const origH = img.naturalHeight || img.height;

    if (dim.cropSquare) {
      // Center-crop square (e.g., thumbnails)
      const size = Math.min(origW, origH);
      const srcX = (origW - size) / 2;
      const srcY = (origH - size) / 2;

      canvas.width = dim.maxWidth;
      canvas.height = dim.maxHeight || dim.maxWidth;

      ctx.drawImage(img, srcX, srcY, size, size, 0, 0, canvas.width, canvas.height);
    } else {
      // Proportional scale
      const { width, height } = ImageProcessor.calculateScaledDimensions(
        origW,
        origH,
        dim.maxWidth,
        dim.maxHeight || dim.maxWidth * 2
      );

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
    }

    return ImageProcessor.canvasToBlob(canvas, 'image/webp', quality);
  }

  /**
   * Helper to load Image element from file object asynchronously
   */
  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };

      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(err);
      };

      img.src = url;
    });
  }

  /**
   * Proportional scaling calculator keeping aspect ratio intact
   */
  private static calculateScaledDimensions(
    srcWidth: number,
    srcHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let width = srcWidth;
    let height = srcHeight;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    if (height > maxHeight) {
      width = Math.round((width * maxHeight) / height);
      height = maxHeight;
    }

    return { width: Math.max(1, width), height: Math.max(1, height) };
  }

  /**
   * Convert canvas element to Blob wrapped in Promise
   */
  private static canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas to Blob conversion failed'));
          }
        },
        mimeType,
        quality
      );
    });
  }
}
