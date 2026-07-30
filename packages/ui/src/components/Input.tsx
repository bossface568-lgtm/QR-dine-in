import React, { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@qrdine/shared';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  as?: 'input' | 'textarea';
  rows?: number;
}

export const Input = forwardRef<HTMLInputElement & HTMLTextAreaElement, InputProps>(({
  className,
  label,
  helperText,
  error,
  leftIcon,
  as = 'input',
  rows = 3,
  id,
  type = 'text',
  disabled,
  ...props
}, ref) => {
  const isError = !!error;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        {leftIcon && (
          <div className="absolute left-3 text-slate-500 pointer-events-none flex items-center justify-center">
            {leftIcon}
          </div>
        )}
        {as === 'input' ? (
          <input
            ref={ref}
            id={id}
            type={type}
            disabled={disabled}
            className={cn(
              'w-full bg-slate-900 border text-slate-100 rounded-lg py-2 px-3 text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon ? 'pl-10' : 'pl-3',
              isError
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-800 focus:border-orange-500 focus:ring-orange-500/20',
              className
            )}
            {...(props as any)}
          />
        ) : (
          <textarea
            ref={ref}
            id={id}
            rows={rows}
            disabled={disabled}
            className={cn(
              'w-full bg-slate-900 border text-slate-100 rounded-lg py-2 px-3 text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed resize-y',
              leftIcon ? 'pl-10' : 'pl-3',
              isError
                ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-800 focus:border-orange-500 focus:ring-orange-500/20',
              className
            )}
            {...(props as any)}
          />
        )}
      </div>
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
      {!error && helperText && <p className="text-xs text-slate-500 mt-0.5">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
