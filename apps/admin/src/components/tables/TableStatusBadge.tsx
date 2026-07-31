import React from 'react';
import { TableStatus } from '@qrdine/types';
import { TABLE_STATUS_LABELS, TABLE_STATUS_COLORS } from '@qrdine/shared';

export interface TableStatusBadgeProps {
  status: TableStatus | 'archived' | 'inactive';
  size?: 'sm' | 'md';
  className?: string;
}

export function TableStatusBadge({ status, size = 'md', className = '' }: TableStatusBadgeProps) {
  // Determine color and label, handling archived and inactive cases if not in shared constants
  let colorClass = TABLE_STATUS_COLORS[status as TableStatus] || 'bg-gray-100 text-gray-800';
  let label = TABLE_STATUS_LABELS[status as TableStatus] || status.charAt(0).toUpperCase() + status.slice(1);
  let dotColor = 'bg-gray-400';
  
  if (status === 'archived') {
    colorClass = 'bg-gray-100 text-gray-600';
    label = 'Archived';
    dotColor = 'bg-gray-500';
  } else if (status === 'inactive') {
    colorClass = 'bg-slate-100 text-slate-700';
    label = 'Inactive';
    dotColor = 'bg-slate-500';
  } else {
    // Basic mapping for dots based on status if needed, 
    // though TABLE_STATUS_COLORS typically could include the dot color logic.
    switch (status) {
      case 'available': dotColor = 'bg-green-500'; break;
      case 'occupied': dotColor = 'bg-blue-500'; break;
      case 'reserved': dotColor = 'bg-amber-500'; break;
      case 'cleaning': dotColor = 'bg-purple-500'; break;
    }
  }

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5 space-x-1.5' 
    : 'text-sm px-2.5 py-1 space-x-2';
    
  const dotClasses = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizeClasses} ${className}`}>
      <span className={`${dotColor} ${dotClasses} rounded-full`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
