import React from 'react';
import { cn } from '@qrdine/shared';
import { Spinner } from './Spinner';

export interface Column<T> {
  key: string;
  header: React.ReactNode;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  rowKey: (row: T, index: number) => string | number;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns,
  data,
  isLoading = false,
  emptyState,
  rowKey,
  className,
  onRowClick,
}: TableProps<T>) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className={cn('w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/35 backdrop-blur-md', className)}>
      <table className="w-full min-w-max border-collapse text-sm text-slate-200">
        <thead>
          <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-semibold uppercase tracking-wider text-xs">
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'px-6 py-4 font-semibold',
                  alignClasses[col.align || 'left'],
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <Spinner size="md" />
                  <span className="text-slate-500 text-xs uppercase tracking-wider">Loading data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12">
                {emptyState || (
                  <div className="text-center text-slate-500 py-4">No records found.</div>
                )}
              </td>
            </tr>
          ) : (
            data.map((row, rIdx) => (
              <tr
                key={rowKey(row, rIdx)}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  'transition-colors duration-150',
                  onRowClick ? 'hover:bg-slate-800/40 cursor-pointer' : 'hover:bg-slate-800/20'
                )}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      'px-6 py-4 text-slate-300 font-medium',
                      alignClasses[col.align || 'left'],
                      col.className
                    )}
                  >
                    {col.render ? col.render(row, rIdx) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
