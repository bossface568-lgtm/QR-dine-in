import React, { useState, ImgHTMLAttributes } from 'react';
import { cn } from '@qrdine/shared';
import { MediaType } from '@qrdine/types';
import { UrlBuilder } from '@qrdine/lib';

export interface AppImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  entityType?: MediaType;
  srcset?: string;
  sizes?: string;
  aspectRatio?: 'square' | 'video' | 'banner' | 'auto';
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  className?: string;
  wrapperClassName?: string;
  showSkeleton?: boolean;
}

export const AppImage: React.FC<AppImageProps> = ({
  src,
  alt,
  entityType = 'menu',
  srcset,
  sizes,
  aspectRatio = 'auto',
  objectFit = 'cover',
  className,
  wrapperClassName,
  showSkeleton = true,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Fallback SVG placeholder for entity type or broken link
  const fallbackSvg = UrlBuilder.getPlaceholder(hasError ? 'broken' : entityType);
  const effectiveSrc = hasError || !src ? fallbackSvg : src;

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
    auto: '',
  };

  const objectFitClasses = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    setIsLoaded(true);
    if (onError) onError(e);
  };

  return (
    <div className={cn('relative overflow-hidden bg-slate-900/50', aspectRatioClasses[aspectRatio], wrapperClassName)}>
      {/* Loading Skeleton */}
      {showSkeleton && !isLoaded && (
        <div className="absolute inset-0 bg-slate-800 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-slate-700 border-t-orange-500 animate-spin" />
        </div>
      )}

      {/* Image Element */}
      <img
        src={effectiveSrc}
        alt={alt}
        srcSet={!hasError && src ? srcset : undefined}
        sizes={sizes}
        loading="lazy"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={cn(
          'w-full h-full transition-opacity duration-300',
          objectFitClasses[objectFit],
          isLoaded ? 'opacity-100' : 'opacity-0',
          className
        )}
        {...props}
      />
    </div>
  );
};
