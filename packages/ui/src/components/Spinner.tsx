import React from 'react';
import { cn } from '@qrdine/shared';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4 stroke-[3px]',
    md: 'w-8 h-8 stroke-[2px]',
    lg: 'w-12 h-12 stroke-[1.5px]',
  };

  return (
    <svg
      className={cn('animate-spin text-orange-500', sizes[size], className)}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('animate-pulse bg-slate-800 rounded', className)} />;
};

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 gap-4 z-50">
      <Spinner size="lg" />
      <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">Loading QR Dine...</p>
    </div>
  );
};
