import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@qrdine/ui';
import { mediaService } from '@qrdine/lib';
import { MediaType, UploadMediaOptions, MediaAsset, MediaUrls } from '@qrdine/types';

export function useMedia() {
  const { restaurantId, user } = useAuth();
  const { toast } = useToast();

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadMedia = async (
    file: File,
    entityType: MediaType,
    entityId?: string
  ): Promise<{ asset: MediaAsset; urls: MediaUrls } | null> => {
    if (!restaurantId) {
      toast('No active restaurant tenant selected.', 'error');
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      const options: UploadMediaOptions = {
        restaurantId,
        entityType,
        entityId,
        userId: user?.id,
      };

      const res = await mediaService.uploadImage(file, options);

      if (res.error || !res.data) {
        const msg = res.error?.message || 'Image upload failed';
        setError(msg);
        toast(msg, 'error');
        return null;
      }

      toast(`Image uploaded & optimized (${(res.data.asset.file_size_bytes / 1024).toFixed(0)} KB WebP)`, 'success');
      return res.data;
    } catch (err: any) {
      const msg = err.message || 'Unexpected upload error';
      setError(msg);
      toast(msg, 'error');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const replaceMedia = async (
    oldPathOrAssetId: string | null | undefined,
    newFile: File,
    entityType: MediaType,
    entityId?: string
  ): Promise<{ asset: MediaAsset; urls: MediaUrls } | null> => {
    if (!restaurantId) {
      toast('No active restaurant tenant selected.', 'error');
      return null;
    }

    setIsUploading(true);
    setError(null);

    try {
      const options: UploadMediaOptions = {
        restaurantId,
        entityType,
        entityId,
        userId: user?.id,
      };

      const res = await mediaService.replaceImage(oldPathOrAssetId, newFile, options);

      if (res.error || !res.data) {
        const msg = res.error?.message || 'Image replacement failed';
        setError(msg);
        toast(msg, 'error');
        return null;
      }

      toast('Image replaced and old file cleaned up!', 'success');
      return res.data;
    } catch (err: any) {
      const msg = err.message || 'Unexpected replacement error';
      setError(msg);
      toast(msg, 'error');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const deleteMedia = async (assetIdOrPath: string): Promise<boolean> => {
    if (!restaurantId) return false;
    try {
      const res = await mediaService.deleteImage(restaurantId, assetIdOrPath);
      if (res.error) {
        toast(res.error.message, 'error');
        return false;
      }
      toast('Image deleted from storage.', 'success');
      return true;
    } catch (err: any) {
      toast(err.message || 'Failed to delete image', 'error');
      return false;
    }
  };

  return {
    uploadMedia,
    replaceMedia,
    deleteMedia,
    isUploading,
    error,
  };
}
