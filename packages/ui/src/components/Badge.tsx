import React from 'react';
import { cn } from '@qrdine/shared';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled' | 'available' | 'occupied' | 'reserved' | 'inactive' | 'archived';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'pending',
  size = 'sm',
  dot = false,
  className,
}) => {
  const baseStyles = 'inline-flex items-center font-medium rounded-full border';

  const variants = {
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    confirmed: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    preparing: 'bg-orange-500/10 text-orange-500 border-orange-500/20 animate-pulse-soft',
    ready: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    served: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    available: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    occupied: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    reserved: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    archived: 'bg-slate-800 text-slate-500 border-slate-700/60',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  const dotColors = {
    pending: 'bg-amber-500',
    confirmed: 'bg-blue-500',
    preparing: 'bg-orange-500',
    ready: 'bg-emerald-500',
    served: 'bg-slate-500',
    cancelled: 'bg-rose-500',
    available: 'bg-emerald-500',
    occupied: 'bg-orange-500',
    reserved: 'bg-blue-500',
    inactive: 'bg-slate-500',
    archived: 'bg-slate-600',
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)}>
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            dotColors[variant],
            variant === 'preparing' && 'animate-ping'
          )}
        />
      )}
      {children}
    </span>
  );
};
