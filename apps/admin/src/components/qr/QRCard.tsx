import React from 'react';
import { Table, Branch, QRStatus } from '@qrdine/types';
import { Button, useToast } from '@qrdine/ui';
import { cn, formatDate, formatRelativeTime, buildPublicTableUrl } from '@qrdine/shared';
import { QRCodeCanvas } from './QRCodeCanvas';
import {
  QrCode,
  Building2,
  Users,
  Copy,
  ExternalLink,
  Download,
  Printer,
  RefreshCw,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
} from 'lucide-react';

interface QRCardProps {
  table: Table;
  branch?: Branch | null;
  restaurantName?: string;
  restaurantSlug?: string;
  logoUrl?: string | null;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onPreview: (table: Table) => void;
  onPrint: (table: Table) => void;
  onDownload: (table: Table, format: 'png' | 'svg' | 'pdf') => void;
  onRegenerate: (table: Table) => void;
}

export const QRCard: React.FC<QRCardProps> = ({
  table,
  branch,
  restaurantName = 'QR Dine',
  restaurantSlug = '',
  logoUrl,
  isSelected = false,
  onToggleSelect,
  onPreview,
  onPrint,
  onDownload,
  onRegenerate,
}) => {
  const { toast } = useToast();
  const tableUrl = restaurantSlug && table.table_token ? buildPublicTableUrl(restaurantSlug, table.table_token) : '';

  const status: QRStatus = table.qr_status || 'active';
  const qrVersion = table.qr_version || 1;

  const statusBadge = () => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Expired
          </span>
        );
      case 'revoked':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <XCircle className="w-3.5 h-3.5" /> Revoked
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            Unregistered
          </span>
        );
    }
  };

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!tableUrl) return;
    navigator.clipboard.writeText(tableUrl);
    toast('Public Table URL copied to clipboard!', 'success');
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300',
        'bg-slate-900/60 backdrop-blur-md border-slate-800/80 hover:border-slate-700 hover:shadow-xl hover:shadow-orange-500/5',
        isSelected && 'border-orange-500/80 bg-orange-500/5 shadow-lg shadow-orange-500/10',
        status === 'expired' && 'opacity-75 border-rose-500/30'
      )}
    >
      {/* Header Info */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="mt-1 w-4 h-4 rounded border-slate-700 text-orange-500 focus:ring-orange-500/20 bg-slate-950 cursor-pointer"
            />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-orange-400 uppercase tracking-wider">
                {table.table_number}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                v{qrVersion}
              </span>
            </div>
            <h3 className="font-bold text-slate-100 text-base leading-tight mt-0.5">
              {table.label || `Table ${table.table_number}`}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3 text-slate-500" />
              {branch?.name || 'Global Branch'}
            </p>
          </div>
        </div>

        {statusBadge()}
      </div>

      {/* Center Live QR Code Preview */}
      <div className="flex flex-col items-center justify-center p-3 my-2 bg-slate-950/80 rounded-xl border border-slate-800/80">
        {tableUrl ? (
          <QRCodeCanvas
            url={tableUrl}
            size={160}
            logoUrl={logoUrl}
            restaurantName={restaurantName}
            tableLabel={table.label || `Table ${table.table_number}`}
          />
        ) : (
          <div className="w-40 h-40 flex items-center justify-center bg-slate-900 rounded-lg text-slate-500 text-xs">
            No URL available
          </div>
        )}
      </div>

      {/* Metadata & Public Token URL line */}
      <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/50 mb-3 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 flex items-center gap-1">
            <Key className="w-3 h-3 text-orange-400" /> Token:
          </span>
          <span className="font-mono font-semibold text-orange-300 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/20">
            {table.table_token}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-500" /> Generated:
          </span>
          <span className="text-slate-300 font-medium">
            {table.qr_generated_at ? formatDate(table.qr_generated_at) : formatDate(table.created_at)}
          </span>
        </div>

        {table.qr_last_regenerated_at && (
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1 text-amber-400">
              <RefreshCw className="w-3 h-3" /> Regenerated:
            </span>
            <span className="text-slate-300 font-medium">{formatRelativeTime(table.qr_last_regenerated_at)}</span>
          </div>
        )}
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPreview(table)}
          className="text-xs text-slate-200 border-slate-700 hover:bg-slate-800 gap-1.5"
        >
          <Eye className="w-3.5 h-3.5 text-orange-400" /> Preview
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPrint(table)}
          className="text-xs text-orange-400 border-orange-500/30 hover:bg-orange-500/10 gap-1.5"
        >
          <Printer className="w-3.5 h-3.5" /> Print Layout
        </Button>
      </div>

      {/* Download & Copy Secondary Row */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDownload(table, 'png')}
            className="text-[11px] text-slate-300 hover:text-white px-2"
            title="Download PNG"
          >
            <Download className="w-3 h-3 mr-1 text-blue-400" /> PNG
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDownload(table, 'svg')}
            className="text-[11px] text-slate-300 hover:text-white px-2"
            title="Download SVG"
          >
            SVG
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDownload(table, 'pdf')}
            className="text-[11px] text-slate-300 hover:text-white px-2"
            title="Download PDF"
          >
            PDF
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopyUrl}
            className="text-xs text-orange-400 hover:text-orange-300 p-1.5"
            title="Copy Public Table URL"
          >
            <Copy className="w-3.5 h-3.5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRegenerate(table)}
            className="text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 p-1.5"
            title="Regenerate QR (Invalidates Old Code)"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
