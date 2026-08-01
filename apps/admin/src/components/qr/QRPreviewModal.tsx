import React, { useState } from 'react';
import { Table, Branch, Restaurant } from '@qrdine/types';
import { Modal, Button, useToast } from '@qrdine/ui';
import { buildPublicTableUrl, formatDate } from '@qrdine/shared';
import { QRCodeCanvas } from './QRCodeCanvas';
import { qrService } from '@qrdine/lib';
import {
  QrCode,
  Building2,
  Users,
  Download,
  Printer,
  RefreshCw,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Key,
} from 'lucide-react';

interface QRPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  table: Table | null;
  restaurant: Restaurant | null;
  branch?: Branch | null;
  onRegenerate: (table: Table) => Promise<boolean>;
  onOpenPrintModal: (table: Table) => void;
}

export const QRPreviewModal: React.FC<QRPreviewModalProps> = ({
  isOpen,
  onClose,
  table,
  restaurant,
  branch,
  onRegenerate,
  onOpenPrintModal,
}) => {
  const { toast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  if (!table || !restaurant) return null;

  const tableUrl = buildPublicTableUrl(restaurant.slug, table.table_token);
  const tableLabel = table.label || `Table ${table.table_number}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(tableUrl);
    toast('Public Table URL copied to clipboard!', 'success');
  };

  const handleDownload = async (format: 'png' | 'svg' | 'pdf') => {
    try {
      setDownloading(format);
      const filename = `${restaurant.slug}_table_${table.table_number}_qr.${format}`;

      if (format === 'png') {
        const dataUrl = await qrService.generateQRCodeDataURL(tableUrl, {
          logoUrl: restaurant.logo_url,
          size: 1024,
          darkColor: '#0F172A',
          lightColor: '#FFFFFF',
        });
        qrService.downloadFile(dataUrl, filename, true);
        toast('PNG QR code downloaded!', 'success');
      } else if (format === 'svg') {
        const svgStr = await qrService.generateQRCodeSVG(tableUrl, {
          darkColor: '#0F172A',
          lightColor: '#FFFFFF',
        });
        qrService.downloadFile(svgStr, filename, false);
        toast('SVG QR code downloaded!', 'success');
      } else if (format === 'pdf') {
        const pdfDoc = await qrService.generatePDF([table], restaurant, branch, 'tent');
        pdfDoc.save(filename);
        toast('PDF QR Printable downloaded!', 'success');
      }
    } catch (err: any) {
      console.error('Download error:', err);
      toast('Failed to download QR code', 'error');
    } finally {
      setDownloading(null);
    }
  };

  const handleConfirmRegenerate = async () => {
    setRegenerating(true);
    const success = await onRegenerate(table);
    setRegenerating(false);
    if (success) {
      setConfirmRegenerate(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Table QR Code Specification">
      <div className="flex flex-col gap-6 py-2 text-slate-200">
        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Canvas Preview */}
          <div className="md:col-span-6 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
            <QRCodeCanvas
              url={tableUrl}
              size={240}
              logoUrl={restaurant.logo_url}
              restaurantName={restaurant.name}
              tableLabel={tableLabel}
            />

            <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4" /> Level H (30% Error Recovery)
            </div>
          </div>

          {/* Right Details Panel */}
          <div className="md:col-span-6 flex flex-col gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
                {branch?.name || 'Global Branch'}
              </span>
              <h2 className="text-2xl font-bold text-slate-100 mt-0.5">{tableLabel}</h2>
              <p className="text-xs text-slate-400 mt-1">
                Seating Capacity: <span className="text-slate-200 font-semibold">{table.seating_capacity} Guests</span> • Floor: <span className="text-slate-200 font-semibold">{table.floor || 'Main'}</span>
              </p>
            </div>

            {/* Token & Version Info */}
            <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-orange-400" /> Table Token:
                </span>
                <span className="font-mono font-bold text-orange-300 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                  {table.table_token}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">QR Code Version:</span>
                <span className="font-mono font-semibold text-slate-200">v{table.qr_version || 1}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Generated Date:</span>
                <span className="text-slate-300">{table.qr_generated_at ? formatDate(table.qr_generated_at) : formatDate(table.created_at)}</span>
              </div>
            </div>

            {/* Encoded URL box */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Encoded Table URL</label>
              <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="font-mono text-slate-300 truncate">{tableUrl}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={handleCopyUrl}
                    className="p-1.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors"
                    title="Copy URL"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(tableUrl, '_blank')}
                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                    title="Open URL"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Regeneration Warning Box */}
        {confirmRegenerate && (
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold text-rose-200 block">Regenerate QR Token?</strong>
                <span>
                  This action generates a brand new table token and permanently invalidates all physical printed QR codes currently at this table. Customers scanning old QR codes will be notified that the code has expired.
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-1">
              <Button size="sm" variant="ghost" onClick={() => setConfirmRegenerate(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="danger" isLoading={regenerating} onClick={handleConfirmRegenerate}>
                Confirm Regeneration
              </Button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setConfirmRegenerate(!confirmRegenerate)}
            className="text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 gap-1.5 w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" /> Regenerate Token
          </Button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              size="sm"
              variant="outline"
              isLoading={downloading === 'png'}
              onClick={() => handleDownload('png')}
              className="gap-1 text-xs"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" /> PNG
            </Button>

            <Button
              size="sm"
              variant="outline"
              isLoading={downloading === 'svg'}
              onClick={() => handleDownload('svg')}
              className="gap-1 text-xs"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" /> SVG
            </Button>

            <Button
              size="sm"
              variant="outline"
              isLoading={downloading === 'pdf'}
              onClick={() => handleDownload('pdf')}
              className="gap-1 text-xs text-slate-200"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" /> PDF
            </Button>

            <Button
              size="sm"
              onClick={() => {
                onClose();
                onOpenPrintModal(table);
              }}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold gap-1.5 shadow-lg shadow-orange-500/20"
            >
              <Printer className="w-4 h-4" /> Print Templates
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
