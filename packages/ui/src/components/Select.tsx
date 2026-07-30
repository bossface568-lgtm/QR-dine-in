import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@qrdine/shared';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  label,
  error,
  options,
  id,
  disabled,
  placeholder,
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
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          className={cn(
            'w-full bg-slate-900 border text-slate-100 rounded-lg py-2 px-3 pr-10 text-sm transition-all duration-200 outline-none focus:ring-2 focus:ring-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed appearance-none cursor-pointer',
            isError
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
              : 'border-slate-800 focus:border-orange-500 focus:ring-orange-500/20',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom Chevron Indicator */}
        <div className="absolute right-3 pointer-events-none text-slate-500 flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
