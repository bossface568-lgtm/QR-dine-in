import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { cn } from '@qrdine/shared';
import { MediaType, MediaUrls, MediaAsset } from '@qrdine/types';
import { MEDIA_PRESETS, MediaValidator, mediaService } from '@qrdine/lib';
import { Button } from './Button';
import { Spinner } from './Spinner';
import { AppImage } from './AppImage';

export interface MediaUploaderProps {
  restaurantId: string;
  entityType: MediaType;
  entityId?: string;
  currentImageUrl?: string | null;
  onUploadSuccess: (res: { asset: MediaAsset; urls: MediaUrls }) => void;
  onRemove?: () => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  restaurantId,
  entityType,
  entityId,
  currentImageUrl,
  onUploadSuccess,
  onRemove,
  label,
  className,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);

  const preset = MEDIA_PRESETS[entityType] || MEDIA_PRESETS.menu;
  const maxMb = (preset.maxSizeBytes / (1024 * 1024)).toFixed(0);

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setCompressionInfo(null);

    if (!file) return;

    // 1. Client-Side Validation against entity preset rules
    const val = await MediaValidator.validateFile(file, entityType);
    if (!val.valid) {
      setErrorMessage(val.error || 'Invalid file');
      return;
    }

    // 2. Show local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // 3. Upload via MediaService (validates -> converts to WebP -> compresses -> uploads -> tracks metadata)
    setIsUploading(true);
    try {
      const origSizeMb = (file.size / (1024 * 1024)).toFixed(2);
      
      const uploadRes = await mediaService.uploadImage(file, {
        restaurantId,
        entityType,
        entityId,
      });

      if (uploadRes.error || !uploadRes.data) {
        setErrorMessage(uploadRes.error?.message || 'Upload failed');
        setPreviewUrl(currentImageUrl || null);
      } else {
        const { asset, urls } = uploadRes.data;
        const newSizeMb = (asset.file_size_bytes / (1024 * 1024)).toFixed(2);
        setCompressionInfo(`Compressed WebP: ${origSizeMb} MB → ${newSizeMb} MB`);
        setPreviewUrl(urls.originalUrl);
        onUploadSuccess(uploadRes.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Image processing failed');
      setPreviewUrl(currentImageUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveClick = () => {
    setPreviewUrl(null);
    setErrorMessage(null);
    setCompressionInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
  };

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </label>
          <span className="text-xs text-slate-500">Max {maxMb} MB (WebP/PNG/JPG)</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={preset.allowedMimeTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer overflow-hidden min-h-[160px] bg-slate-900/40',
          isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/70',
          disabled && 'opacity-50 cursor-not-allowed',
          errorMessage && 'border-rose-500/80 bg-rose-500/5'
        )}
      >
        {/* Loading Overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="md" />
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-400 animate-pulse">
              Optimizing & Uploading WebP...
            </span>
          </div>
        )}

        {/* Image Preview State */}
        {previewUrl && !isUploading ? (
          <div className="relative w-full h-full flex flex-col items-center gap-3 group">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-700 shadow-md">
              <AppImage src={previewUrl} alt="Uploaded Media Preview" entityType={entityType} className="w-full h-full object-cover" />
            </div>
            <div className="flex gap-2 z-10">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Change Image
              </Button>
              {onRemove && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveClick();
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Empty Drag/Drop Placeholder */
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-300">
              <span className="text-orange-500 underline">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">Auto-compressed into WebP format</p>
          </div>
        )}
      </div>

      {/* Info / Error Messages */}
      {compressionInfo && (
        <p className="text-xs text-emerald-400 font-mono mt-0.5">{compressionInfo}</p>
      )}
      {errorMessage && (
        <p className="text-xs text-rose-500 mt-0.5">{errorMessage}</p>
      )}
    </div>
  );
};
