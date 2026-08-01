import React from 'react';
import { Table, Branch } from '@qrdine/types';
import { Modal, Button, useToast } from '@qrdine/ui';
import { formatDate, TABLE_STATUS_COLORS, TABLE_STATUS_LABELS, buildPublicTableUrl } from '@qrdine/shared';
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
  Edit,
  Archive,
  Clock,
  Sparkles,
  Key,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface TableDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
  branches?: Branch[];
  restaurantSlug?: string;
}

export const TableDetailsModal: React.FC<TableDetailsModalProps> = ({
  isOpen,
  onClose,
  table,
  onEdit,
  onArchive,
  onDelete,
  branches = [],
  restaurantSlug = '',
}) => {
  const { toast } = useToast();
  if (!table) return null;

  const branch = branches.find((b) => b.id === table.branch_id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Table Specifications & Status">
      <div className="flex flex-col gap-6 py-2 text-slate-200">
        {/* Table Overview Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-orange-400 uppercase tracking-wider">
                {table.table_number}
              </span>
              <h2 className="text-xl font-bold text-slate-100">{table.label || `Table ${table.table_number}`}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              {branch?.name || 'Global (All Branches)'}
            </p>
          </div>

          <TableStatusBadge status={table.archived_at ? 'archived' : table.status} size="md" />
        </div>

        {/* Technical Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
              <Users className="w-3.5 h-3.5 text-slate-500" /> Capacity
            </span>
            <span className="text-sm font-bold text-slate-100">{table.seating_capacity} Guests</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" /> Floor Level
            </span>
            <span className="text-sm font-bold text-slate-100">{table.floor || 'Main Level'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" /> Section
            </span>
            <span className="text-sm font-bold text-slate-100">{table.section || 'General'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Last Updated
            </span>
            <span className="text-xs font-semibold text-slate-200">{formatDate(table.updated_at)}</span>
          </div>
        </div>

        {/* FUTURE INTEGRATION PLACEHOLDERS SECTION */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" /> Operational Features (Reserved Placeholders)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* QR Integration Placeholder */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">QR Code Integration</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  QR Printable Sheet generator & table pairing will be enabled in the next module.
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded">
                  Status: Ready for Pairing
                </span>
              </div>
            </div>

            {/* Live Session Placeholder */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Live Table Session</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Customer QR scan active sessions & table timers will stream in real-time.
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  Active Session: None
                </span>
              </div>
            </div>

            {/* Current Order Placeholder */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Active Table Order</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Orders placed at this table will stream directly to KDS & Admin view.
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  Current Order: None
                </span>
              </div>
            </div>

            {/* Current Bill Placeholder */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Running Bill Total</h4>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                  Live billing amount & payment checkout status for occupied session.
                </p>
                <span className="inline-block mt-2 text-[10px] font-mono font-semibold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  Bill Total: ₹0.00
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* PUBLIC URL & TABLE TOKEN FOUNDATION SECTION */}
        {restaurantSlug && table.table_token && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-slate-950 to-slate-950 border border-orange-500/30 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-orange-400" /> Public Customer Table Endpoint
              </h3>
              <span className="text-[11px] font-mono font-semibold text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded border border-orange-500/30">
                Token: {table.table_token}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-xs font-mono text-slate-300 w-full sm:w-auto">
                {buildPublicTableUrl(restaurantSlug, table.table_token)}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(buildPublicTableUrl(restaurantSlug, table.table_token));
                    toast('Table URL copied to clipboard!', 'success');
                  }}
                  className="gap-1 text-xs text-orange-400 border-orange-500/30 hover:bg-orange-500/10"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy URL
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(buildPublicTableUrl(restaurantSlug, table.table_token), '_blank')}
                  className="gap-1 text-xs text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Link
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onEdit} className="gap-1.5">
              <Edit className="w-4 h-4" /> Edit Specs
            </Button>

            {!table.archived_at && (
              <Button variant="outline" onClick={onArchive} className="gap-1.5 text-amber-400 border-amber-500/30 hover:bg-amber-500/10">
                <Archive className="w-4 h-4" /> Archive
              </Button>
            )}

            <Button variant="danger" onClick={onDelete} className="gap-1.5">
              Delete Permanently
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
