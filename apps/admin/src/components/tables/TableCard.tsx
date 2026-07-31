import React from 'react';
import { Table, TableStatus, Branch } from '@qrdine/types';
import { Button } from '@qrdine/ui';
import { cn, TABLE_STATUS_COLORS, TABLE_STATUS_LABELS } from '@qrdine/shared';
import { TableStatusBadge } from './TableStatusBadge';
import {
  Users,
  Building2,
  Layers,
  MapPin,
  QrCode,
  Activity,
  ShoppingBag,
  CreditCard,
  MoreVertical,
  Edit,
  Eye,
  Archive,
  RefreshCw,
} from 'lucide-react';

interface TableCardProps {
  table: Table;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDetails: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onSetStatus: (status: TableStatus) => void;
  branches?: Branch[];
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  isSelected,
  onToggleSelect,
  onEdit,
  onDetails,
  onArchive,
  onRestore,
  onSetStatus,
  branches = [],
}) => {
  const branch = branches.find((b) => b.id === table.branch_id);
  const isArchived = !!table.archived_at;

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300',
        'bg-slate-900/60 backdrop-blur-md border-slate-800/80 hover:border-slate-700 hover:shadow-xl hover:shadow-orange-500/5',
        isSelected && 'border-orange-500/80 bg-orange-500/5 shadow-lg shadow-orange-500/10',
        isArchived && 'opacity-60 grayscale-[40%]'
      )}
    >
      {/* Top Bar: Checkbox, Number & Quick Status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="w-4 h-4 rounded border-slate-700 text-orange-500 focus:ring-orange-500/20 bg-slate-950/80 cursor-pointer"
          />
          <div>
            <span className="font-mono text-xs font-bold text-orange-400 uppercase tracking-wider block">
              {table.table_number}
            </span>
            <h3 className="font-bold text-slate-100 text-base leading-tight mt-0.5">
              {table.label || `Table ${table.table_number}`}
            </h3>
          </div>
        </div>

        {/* Status Dropdown / Badge */}
        {isArchived ? (
          <TableStatusBadge status="archived" size="sm" />
        ) : (
          <select
            value={table.status}
            onChange={(e) => onSetStatus(e.target.value as TableStatus)}
            className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer appearance-none outline-none transition-colors',
              TABLE_STATUS_COLORS[table.status] || TABLE_STATUS_COLORS.available
            )}
          >
            {(Object.keys(TABLE_STATUS_LABELS) as TableStatus[]).map((st) => (
              <option key={st} value={st} className="bg-slate-900 text-slate-200">
                {TABLE_STATUS_LABELS[st]}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Meta Specs: Branch, Seating Capacity, Floor & Section */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs text-slate-400">
        {/* Branch */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800/80 text-slate-300">
          <Building2 className="w-3 h-3 text-slate-400" />
          {branch?.name || 'Global'}
        </span>

        {/* Capacity */}
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800/80 text-slate-300 font-medium">
          <Users className="w-3 h-3 text-slate-400" />
          {table.seating_capacity} Seats
        </span>

        {/* Floor */}
        {table.floor && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800/80 text-slate-400">
            <Layers className="w-3 h-3 text-slate-500" />
            {table.floor}
          </span>
        )}

        {/* Section */}
        {table.section && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800/80 text-slate-400">
            <MapPin className="w-3 h-3 text-slate-500" />
            {table.section}
          </span>
        )}
      </div>

      {/* EXPLICIT PLACEHOLDERS FOR FUTURE MODULES */}
      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/50 mb-4 text-[11px]">
        {/* QR Placeholder */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <QrCode className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">QR: Ready</span>
        </div>

        {/* Live Session Placeholder */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <Activity className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">Session: None</span>
        </div>

        {/* Current Order Placeholder */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">Order: None</span>
        </div>

        {/* Current Bill Placeholder */}
        <div className="flex items-center gap-1.5 text-slate-400">
          <CreditCard className="w-3.5 h-3.5 text-slate-500" />
          <span className="truncate">Bill: ₹0.00</span>
        </div>
      </div>

      {/* Action Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
        <Button size="sm" variant="ghost" onClick={onDetails} className="text-xs text-slate-300 hover:text-white">
          <Eye className="w-3.5 h-3.5 mr-1" /> View
        </Button>

        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit} className="text-xs text-slate-300 hover:text-white">
            <Edit className="w-3.5 h-3.5 mr-1" /> Edit
          </Button>

          {!isArchived ? (
            <Button size="sm" variant="ghost" onClick={onArchive} className="text-xs text-rose-400 hover:text-rose-300">
              <Archive className="w-3.5 h-3.5 mr-1" /> Archive
            </Button>
          ) : (
            <Button size="sm" variant="ghost" onClick={onRestore} className="text-xs text-emerald-400 hover:text-emerald-300">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Restore
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
