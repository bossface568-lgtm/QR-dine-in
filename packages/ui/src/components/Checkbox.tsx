import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@qrdine/shared';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  className,
  label,
  error,
  id,
  disabled,
  checked,
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1">
      <label className={cn('inline-flex items-start gap-3 select-none', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
        <div className="relative flex items-center mt-0.5">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          {/* Custom Checkbox Box */}
          <div className="w-5 h-5 rounded border border-slate-800 bg-slate-900 transition-all flex items-center justify-center peer-checked:bg-orange-500 peer-checked:border-orange-500 text-slate-900 peer-focus:ring-2 peer-focus:ring-orange-500/20">
            <svg className="w-3.5 h-3.5 text-slate-950 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        {label && <span className="text-sm text-slate-300 font-medium leading-tight">{label}</span>}
      </label>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';
