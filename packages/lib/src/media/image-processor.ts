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
   * Process an uploaded file: strip EXIF metadata, convert to WebP,
   * apply adaptive compression to hit target size range, and generate responsive variants.
   *
   * Adaptive Compression Strategy:
   * 1. Start at preset's targetQuality (e.g. 0.85)
   * 2. If result exceeds target max, iteratively reduce quality by 0.05
   * 3. If result is below target min, try increasing quality by 0.03
   * 4. Stop when within range or quality floor (0.30) is hit
   * 5. If still too large after quality floor, reduce dimensions by 20% and retry
   */
  static async processImage(
    file: File,
    entityType: MediaType,
    overrideQuality?: number
  ): Promise<ProcessedImageResult> {
    const preset = MEDIA_PRESETS[entityType] || MEDIA_PRESETS.menu;
    const startQuality = overrideQuality ?? preset.targetQuality;
    const targetMin = preset.targetSizeRange.min;
    const targetMax = preset.targetSizeRange.max;
    const targetWidth = preset.dimensions.width;
    const targetHeight = preset.dimensions.height;

    // Load Image DOM element from File
    const img = await ImageProcessor.loadImage(file);
    const originalWidth = img.naturalWidth || img.width;
    const originalHeight = img.naturalHeight || img.height;

    // 1. Calculate scaled dimensions respecting target dimensions and aspect ratio
    let { width: scaledWidth, height: scaledHeight } = ImageProcessor.calculateScaledDimensions(
      originalWidth,
      originalHeight,
      targetWidth,
      targetHeight
    );

    // 2. Apply adaptive compression to hit target size range
    let mainBlob: Blob | null = null;
    let quality = startQuality;
    let attempts = 0;
    const MAX_ATTEMPTS = 12;
    const QUALITY_FLOOR = 0.30;
    const QUALITY_STEP_DOWN = 0.05;
    const QUALITY_STEP_UP = 0.03;

    while (attempts < MAX_ATTEMPTS) {
      attempts++;
      const canvas = ImageProcessor.drawToCanvas(img, scaledWidth, scaledHeight);
      mainBlob = await ImageProcessor.canvasToBlob(canvas, 'image/webp', quality);

      const size = mainBlob.size;

      // Within target range — perfect
      if (size >= targetMin && size <= targetMax) {
        break;
      }

      // Too large — reduce quality or dimensions
      if (size > targetMax) {
        if (quality > QUALITY_FLOOR) {
          quality = Math.max(QUALITY_FLOOR, quality - QUALITY_STEP_DOWN);
        } else {
          // Quality floor hit, reduce dimensions by 20%
          scaledWidth = Math.round(scaledWidth * 0.8);
          scaledHeight = Math.round(scaledHeight * 0.8);
          quality = startQuality; // Reset quality for new dimensions
        }
        continue;
      }

      // Too small and quality can increase — try higher quality for better visual result
      if (size < targetMin && quality < 0.95) {
        quality = Math.min(0.95, quality + QUALITY_STEP_UP);
        continue;
      }

      // Can't improve further, accept current result
      break;
    }

    // Ensure we have a blob (in case the loop didn't execute properly)
    if (!mainBlob) {
      const canvas = ImageProcessor.drawToCanvas(img, scaledWidth, scaledHeight);
      mainBlob = await ImageProcessor.canvasToBlob(canvas, 'image/webp', quality);
    }

    // 3. Generate Responsive Variants requested by entity preset
    const variantsResult: Partial<Record<ImageVariant, Blob>> = {};

    for (const variantKey of preset.variants) {
      if (variantKey === 'original') continue;
      const dim = VARIANT_DIMENSIONS[variantKey as Exclude<ImageVariant, 'original'>];
      if (!dim) continue;

      // Variants use a slightly lower quality for smaller file sizes
      const variantQuality = Math.min(quality, 0.78);
      const variantBlob = await ImageProcessor.createVariantBlob(img, dim, variantQuality);
      variantsResult[variantKey] = variantBlob;
    }

    return {
      originalBlob: mainBlob,
      variants: variantsResult,
      width: scaledWidth,
      height: scaledHeight,
      mimeType: 'image/webp',
      sizeBytes: mainBlob.size,
    };
  }

  /**
   * Draw image to a new canvas at specified dimensions, stripping EXIF metadata
   */
  private static drawToCanvas(
    img: HTMLImageElement,
    width: number,
    height: number
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to acquire 2D canvas context for image processing');

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
    return canvas;
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
