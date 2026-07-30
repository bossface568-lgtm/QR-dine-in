import React, { HTMLAttributes } from 'react';
import { cn } from '@qrdine/shared';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'glass',
  hoverable = false,
  padding = 'md',
  ...props
}) => {
  const baseStyles = 'rounded-xl overflow-hidden transition-all duration-200';

  const variants = {
    default: 'bg-slate-900 border border-slate-800 text-slate-100',
    elevated: 'bg-slate-900 border border-slate-800 text-slate-100 shadow-xl shadow-slate-950/50',
    outlined: 'bg-transparent border border-slate-800 text-slate-100',
    glass: 'bg-slate-900/60 backdrop-blur-md border border-slate-800/80 text-slate-100 shadow-lg shadow-slate-950/20',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        paddings[padding],
        hoverable && 'hover:-translate-y-1 hover:border-slate-700/80 hover:shadow-xl hover:shadow-slate-950/30 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
