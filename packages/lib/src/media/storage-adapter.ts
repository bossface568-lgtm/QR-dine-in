import { insforge } from '../client';

/**
 * Common interface for storage providers (InsForge, AWS S3, Cloudflare R2, GCS)
 */
export interface IStorageAdapter {
  upload(bucket: string, path: string, content: Blob | File): Promise<{ url: string; path: string }>;
  delete(bucket: string, path: string): Promise<boolean>;
  deleteMany(bucket: string, paths: string[]): Promise<boolean>;
  getPublicUrl(bucket: string, path: string): string;
}

/**
 * InsForge Storage Adapter implementation
 * 
 * SDK upload() returns: { data: { url, key, bucket, size, uploadedAt, mimeType? }, error }
 * SDK getPublicUrl(key) returns: { data: { publicUrl } }
 */
export class InsForgeStorageAdapter implements IStorageAdapter {
  async upload(bucket: string, path: string, content: Blob | File): Promise<{ url: string; path: string }> {
    const fileToUpload = content instanceof File 
      ? content 
      : new File([content], path.split('/').pop() || 'image.webp', { type: content.type || 'image/webp' });

    const { data, error } = await insforge.storage
      .from(bucket)
      .upload(path, fileToUpload);

    if (error) {
      throw new Error(`Storage upload failed for ${path}: ${error.message}`);
    }

    // SDK returns { url, key, bucket, size, uploadedAt, mimeType? }
    const publicUrl = data?.url || '';
    const storagePath = data?.key || path;

    return {
      url: publicUrl,
      path: storagePath,
    };
  }

  async delete(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await insforge.storage
        .from(bucket)
        .remove(path as any);
      
      if (error) {
        console.warn(`Failed to delete storage path "${path}":`, error.message);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn(`Storage delete exception for "${path}":`, err.message);
      return false;
    }
  }

  async deleteMany(bucket: string, paths: string[]): Promise<boolean> {
    if (!paths.length) return true;
    try {
      for (const p of paths) {
        if (p) {
          await insforge.storage.from(bucket).remove(p as any);
        }
      }
      return true;
    } catch (err: any) {
      console.warn('Storage deleteMany exception:', err.message);
      return false;
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;

    // Use SDK's getPublicUrl which returns { data: { publicUrl } }
    const { data } = insforge.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || '';
  }
}

// Singleton storage adapter instance
export const storageAdapter: IStorageAdapter = new InsForgeStorageAdapter();
