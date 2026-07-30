import React, { useState } from 'react';
import { cn, getInitials } from '@qrdine/shared';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  statusDot?: 'online' | 'offline' | null;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
  statusDot = null,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-500',
  };

  const showInitials = !src || imageError;

  return (
    <div className="relative inline-block flex-shrink-0">
      <div
        className={cn(
          'flex items-center justify-center font-semibold rounded-full overflow-hidden border border-slate-800 bg-slate-800 text-slate-200 uppercase transition-all duration-200',
          sizes[size],
          className
        )}
      >
        {showInitials ? (
          <span>{getInitials(name)}</span>
        ) : (
          <img
            src={src}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      {statusDot && (
        <span
          className={cn(
            'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-slate-900',
            statusColors[statusDot]
          )}
        />
      )}
    </div>
  );
};
