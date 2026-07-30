import { 
  MediaAsset, 
  UploadMediaOptions, 
  ApiResponse, 
  MediaUrls, 
  ImageVariant 
} from '@qrdine/types';
import { insforge } from '../client';
import { storageAdapter } from './storage-adapter';
import { MediaValidator } from './media-validator';
import { ImageProcessor } from './image-processor';
import { UrlBuilder } from './url-builder';

export class MediaService {
  private bucket: string = 'menu-images';

  /**
   * Primary Entry Point: Validate, compress, generate responsive variants, upload to storage, and persist metadata
   */
  async uploadImage(
    file: File,
    options: UploadMediaOptions
  ): Promise<ApiResponse<{ asset: MediaAsset; urls: MediaUrls }>> {
    try {
      const { restaurantId, entityType, entityId = 'gen_' + Date.now(), userId, quality } = options;

      // 1. Validate File against Entity Limits & Format
      const validation = await MediaValidator.validateFile(file, entityType);
      if (!validation.valid) {
        return { data: null, error: { message: validation.error || 'File validation failed' } };
      }

      // 2. Client-Side Image Processing (Convert to WebP, Compress 80-85%, EXIF Removal, Generate Variants)
      const processed = await ImageProcessor.processImage(file, entityType, quality);

      // 3. Construct Predictable Storage Paths
      const baseStoragePath = options.customPath || UrlBuilder.buildStoragePath(restaurantId, entityType, entityId, 'original');
      
      // Upload Original/Main WebP Image
      const uploadResult = await storageAdapter.upload(this.bucket, baseStoragePath, processed.originalBlob);

      // Upload Variant WebPs (thumb, small, medium, large)
      const variantsPathMap: Partial<Record<ImageVariant, string>> = {};
      const variantsUrlMap: Partial<Record<ImageVariant, string>> = {};

      for (const [vKey, vBlob] of Object.entries(processed.variants)) {
        if (vBlob) {
          const vPath = UrlBuilder.buildStoragePath(restaurantId, entityType, entityId, vKey as ImageVariant);
          const vUpload = await storageAdapter.upload(this.bucket, vPath, vBlob);
          variantsPathMap[vKey as ImageVariant] = vUpload.path;
          variantsUrlMap[vKey as ImageVariant] = vUpload.url;
        }
      }

      // 4. Persist Asset Metadata Record to Database
      const mediaRecord = {
        restaurant_id: restaurantId,
        entity_type: entityType,
        entity_id: entityId !== 'default' ? entityId : null,
        bucket: this.bucket,
        storage_path: uploadResult.path,
        public_url: uploadResult.url,
        variants_json: variantsPathMap,
        file_name: file.name,
        file_size_bytes: processed.sizeBytes,
        mime_type: processed.mimeType,
        width: processed.width,
        height: processed.height,
        created_by: userId || null,
      };

      const { data: dbData, error: dbError } = await insforge.database
        .from('media_assets')
        .insert([mediaRecord])
        .select()
        .single();

      if (dbError) {
        console.warn('DB record creation warning for media_assets:', dbError.message);
      }

      const asset: MediaAsset = dbData || {
        id: 'temp_' + Date.now(),
        ...mediaRecord,
        variants_json: variantsPathMap as Record<ImageVariant, string>,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: null,
      };

      const urls = UrlBuilder.buildMediaUrls(this.bucket, uploadResult.path, variantsPathMap);

      return {
        data: { asset, urls },
        error: null,
      };
    } catch (err: any) {
      console.error('MediaService.uploadImage Exception:', err);
      return { data: null, error: { message: err.message || 'Image upload failed' } };
    }
  }

  /**
   * Replace Image: Uploads new file, verifies upload success, updates database, and deletes old storage objects to prevent orphans
   */
  async replaceImage(
    oldStoragePathOrAssetId: string | null | undefined,
    newFile: File,
    options: UploadMediaOptions
  ): Promise<ApiResponse<{ asset: MediaAsset; urls: MediaUrls }>> {
    try {
      // 1. Upload new image first
      const uploadRes = await this.uploadImage(newFile, options);
      if (uploadRes.error || !uploadRes.data) {
        return uploadRes;
      }

      // 2. If upload succeeded and old asset exists, clean up old storage files asynchronously
      if (oldStoragePathOrAssetId) {
        this.cleanupOldAsset(options.restaurantId, oldStoragePathOrAssetId).catch(err => {
          console.warn('Background old asset cleanup error:', err);
        });
      }

      return uploadRes;
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Image replacement failed' } };
    }
  }

  /**
   * Delete Image: Deletes database metadata record and storage object variants safely
   */
  async deleteImage(restaurantId: string, assetIdOrPath: string): Promise<ApiResponse<boolean>> {
    try {
      let storagePath = assetIdOrPath;
      let variantPaths: string[] = [];

      // Check if argument is UUID or storage path
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(assetIdOrPath);

      if (isUuid) {
        const { data: assetData } = await insforge.database
          .from('media_assets')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .eq('id', assetIdOrPath)
          .single();

        if (assetData) {
          storagePath = assetData.storage_path;
          if (assetData.variants_json) {
            variantPaths = Object.values(assetData.variants_json).filter(Boolean) as string[];
          }

          // Mark DB soft-deleted
          await insforge.database
            .from('media_assets')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', assetIdOrPath);
        }
      }

      // Delete storage files (main + variants)
      const allPathsToDelete = [storagePath, ...variantPaths].filter(p => p && !p.startsWith('http'));
      await storageAdapter.deleteMany(this.bucket, allPathsToDelete);

      return { data: true, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to delete image' } };
    }
  }

  /**
   * Internal helper to delete old media asset storage objects and DB record
   */
  private async cleanupOldAsset(restaurantId: string, pathOrId: string): Promise<void> {
    await this.deleteImage(restaurantId, pathOrId);
  }

  /**
   * Helper to resolve MediaUrls for an asset or raw storage path
   */
  getMediaUrls(bucket: string, storagePathOrUrl: string, variantsJson?: Record<string, string>): MediaUrls {
    if (!storagePathOrUrl) {
      const placeholder = UrlBuilder.getPlaceholder('menu');
      return { originalUrl: placeholder, variantsUrlMap: {}, srcset: '' };
    }

    if (storagePathOrUrl.startsWith('http://') || storagePathOrUrl.startsWith('https://') || storagePathOrUrl.startsWith('data:')) {
      return { originalUrl: storagePathOrUrl, variantsUrlMap: {}, srcset: '' };
    }

    return UrlBuilder.buildMediaUrls(bucket, storagePathOrUrl, variantsJson || {});
  }
}

export const mediaService = new MediaService();
