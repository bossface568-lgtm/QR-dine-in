import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@qrdine/shared';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
}

export const Toggle = forwardRef<HTMLInputElement, ToggleProps>(({
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
      <label className={cn('inline-flex items-center gap-3 select-none', disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer')}>
        <div className="relative">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          {/* Track */}
          <div className="w-10 h-6 bg-slate-800 rounded-full peer peer-focus:ring-2 peer-focus:ring-orange-500/20 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-slate-300 after:border-slate-800 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-slate-100 border border-slate-700/60" />
        </div>
        {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
      </label>
      {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
    </div>
  );
});

Toggle.displayName = 'Toggle';
