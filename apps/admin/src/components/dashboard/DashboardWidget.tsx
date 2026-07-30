import React from 'react';
import { Card, Spinner } from '@qrdine/ui';
import { cn } from '@qrdine/shared';

interface DashboardWidgetProps {
  title: string;
  icon: React.ReactNode;
  value: string | number | null;
  description?: string;
  loading?: boolean;
  trend?: {
    value: string | number;
    isUp?: boolean;
  };
  className?: string;
}

export const DashboardWidget: React.FC<DashboardWidgetProps> = ({
  title,
  icon,
  value,
  description,
  loading = false,
  trend,
  className
}) => {
  return (
    <Card className={cn(
      'p-6 border border-slate-800 bg-slate-900/40 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between h-36 min-w-[200px]',
      className
    )}>
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-10 transition-opacity duration-300">
          <Spinner size="md" className="text-orange-500" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-xs font-semibold uppercase tracking-wider">{title}</span>
        <span className="p-2 rounded-xl bg-slate-950/40 text-slate-300 border border-slate-800/40">
          {icon}
        </span>
      </div>

      {/* Value & Trend */}
      <div className="flex items-end justify-between mt-4">
        <div className="flex flex-col gap-1">
          <span className="text-2xl font-bold text-slate-100 tracking-tight">
            {value !== null ? value : '—'}
          </span>
          {description && (
            <span className="text-xxs text-slate-500 font-medium">
              {description}
            </span>
          )}
        </div>

        {trend && (
          <span className={cn(
            'text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-0.5',
            trend.isUp 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-rose-500/10 text-rose-400'
          )}>
            {trend.isUp ? '↑' : '↓'} {trend.value}
          </span>
        )}
      </div>
    </Card>
  );
};
export default DashboardWidget;
