import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { cn } from '@qrdine/shared';
import { MediaType, MediaUrls, MediaAsset } from '@qrdine/types';
import { MEDIA_PRESETS, MediaValidator, mediaService } from '@qrdine/lib';
import { Button } from './Button';
import { AppImage } from './AppImage';

export type UploadPhase = 'idle' | 'optimizing' | 'uploading' | 'complete' | 'error';

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
  const [phase, setPhase] = useState<UploadPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [compressionInfo, setCompressionInfo] = useState<{ original: number; compressed: number } | null>(null);

  const preset = MEDIA_PRESETS[entityType] || MEDIA_PRESETS.menu;

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setCompressionInfo(null);

    if (!file) return;

    // 1. Validate format and corruption
    const val = await MediaValidator.validateFile(file, entityType);
    if (!val.valid) {
      setErrorMessage(val.error || 'Invalid file');
      setPhase('error');
      return;
    }

    // 2. Instant local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // 3. Process and upload
    setPhase('optimizing');
    try {
      const origSizeBytes = file.size;

      // Short delay to show the optimizing state visually
      await new Promise(r => setTimeout(r, 300));

      setPhase('uploading');

      const uploadRes = await mediaService.uploadImage(file, {
        restaurantId,
        entityType,
        entityId,
      });

      if (uploadRes.error || !uploadRes.data) {
        setErrorMessage(uploadRes.error?.message || 'Upload failed. Please try again.');
        setPhase('error');
        setPreviewUrl(currentImageUrl || null);
      } else {
        const { asset, urls } = uploadRes.data;
        setCompressionInfo({ original: origSizeBytes, compressed: asset.file_size_bytes });
        setPreviewUrl(urls.originalUrl);
        setPhase('complete');
        onUploadSuccess(uploadRes.data);

        // Reset phase after showing success
        setTimeout(() => setPhase('idle'), 2500);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Image processing failed');
      setPhase('error');
      setPreviewUrl(currentImageUrl || null);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && phase === 'idle') setIsDragging(true);
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

    if (disabled || phase !== 'idle') return;

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
    setPhase('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (onRemove) onRemove();
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const compressionPercent = compressionInfo
    ? Math.round((1 - compressionInfo.compressed / compressionInfo.original) * 100)
    : 0;

  const isProcessing = phase === 'optimizing' || phase === 'uploading';

  return (
    <div className={cn('flex flex-col gap-2 w-full', className)}>
      {label && (
        <div className="flex justify-between items-center">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </label>
          <span className="text-xs text-slate-500">JPG, PNG, WebP</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={preset.allowedMimeTypes.join(',')}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isProcessing}
      />

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer overflow-hidden min-h-[180px] bg-slate-900/40',
          isDragging ? 'border-orange-500 bg-orange-500/10 scale-[1.01]' : 'border-slate-800 hover:border-slate-600 hover:bg-slate-900/70',
          disabled && 'opacity-50 cursor-not-allowed',
          phase === 'error' && 'border-rose-500/80 bg-rose-500/5',
          phase === 'complete' && 'border-emerald-500/40 bg-emerald-500/5'
        )}
      >
        {/* Processing Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4">
            {/* Animated progress ring */}
            <div className="relative w-14 h-14">
              <svg className="w-14 h-14 animate-spin" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="24" fill="none" stroke="#1e293b" strokeWidth="3" />
                <circle
                  cx="28" cy="28" r="24" fill="none"
                  stroke={phase === 'optimizing' ? '#f97316' : '#22c55e'}
                  strokeWidth="3"
                  strokeDasharray="150"
                  strokeDashoffset={phase === 'optimizing' ? '100' : '40'}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                {phase === 'optimizing' ? (
                  <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                )}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-200">
                {phase === 'optimizing' ? 'Optimizing image...' : 'Uploading...'}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {phase === 'optimizing'
                  ? 'Converting to WebP & compressing'
                  : 'Almost there'
                }
              </p>
            </div>
          </div>
        )}

        {/* Success Flash Overlay */}
        {phase === 'complete' && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 animate-fade-in">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-semibold text-emerald-400">Uploaded</span>
          </div>
        )}

        {/* Image Preview State */}
        {previewUrl && !isProcessing ? (
          <div className="relative w-full h-full flex flex-col items-center gap-3 group p-4">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-700 shadow-md">
              <AppImage src={previewUrl} alt="Preview" entityType={entityType} className="w-full h-full object-cover" />
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
        ) : !isProcessing ? (
          /* Empty Drag/Drop Placeholder */
          <div className="flex flex-col items-center justify-center gap-3 text-center p-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-400 border border-slate-700/60 shadow-inner">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-300">
                <span className="text-orange-500 underline decoration-orange-500/40 underline-offset-2">Drag & Drop or Click to Upload</span>
              </p>
              <p className="text-xs text-slate-500 mt-1.5">Supports JPG, PNG and WebP</p>
              <p className="text-[11px] text-slate-600 mt-0.5">Images are automatically optimized for fast loading.</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Compression Stats */}
      {compressionInfo && (
        <div className="flex items-center gap-2 px-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700"
              style={{ width: `${Math.min(100, compressionPercent)}%` }}
            />
          </div>
          <span className="text-xs font-mono text-emerald-400 whitespace-nowrap">
            {formatSize(compressionInfo.original)} → {formatSize(compressionInfo.compressed)}
            <span className="text-emerald-500/60 ml-1">({compressionPercent}% smaller)</span>
          </span>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 px-2">
          <svg className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs text-rose-500">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
