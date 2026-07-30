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
 */
export class InsForgeStorageAdapter implements IStorageAdapter {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (import.meta as any).env?.VITE_INSFORGE_URL || 'https://vy3qe8cs.ap-southeast.insforge.app';
  }

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

    const publicUrl = (data as any)?.url || `${this.baseUrl}/storage/v1/object/public/${bucket}/${path}`;
    const storagePath = (data as any)?.path || path;

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
    return `${this.baseUrl}/storage/v1/object/public/${bucket}/${path}`;
  }
}

// Singleton storage adapter instance
export const storageAdapter: IStorageAdapter = new InsForgeStorageAdapter();
