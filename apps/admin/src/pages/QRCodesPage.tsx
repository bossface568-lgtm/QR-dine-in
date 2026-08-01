import React, { useState } from 'react';
import { useTables } from '../hooks/useTables';
import { Button, Spinner, EmptyState, useToast } from '@qrdine/ui';
import { Table, Branch, QRFilterType, QRStatus } from '@qrdine/types';
import { QRCard } from '../components/qr/QRCard';
import { QRPreviewModal } from '../components/qr/QRPreviewModal';
import { QRPrintModal } from '../components/qr/QRPrintModal';
import { qrService } from '@qrdine/lib';
import { buildPublicTableUrl, cn } from '@qrdine/shared';
import {
  QrCode,
  Search,
  Building2,
  Filter,
  Printer,
  Download,
  CheckSquare,
  Square,
  RefreshCw,
  Globe,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

export const QRCodesPage: React.FC = () => {
  const { toast } = useToast();
  const {
    restaurant,
    tables,
    branches,
    loading,
    searchTerm,
    setSearchTerm,
    selectedBranchFilter,
    setSelectedBranchFilter,
    selectedIds,
    setSelectedIds,
    regenerateQR,
    toggleSelectAll,
    toggleSelectOne,
  } = useTables();

  // Status Filter state
  const [qrStatusFilter, setQrStatusFilter] = useState<QRFilterType>('all');

  // Modal States
  const [previewTable, setPreviewTable] = useState<Table | null>(null);
  const [printTables, setPrintTables] = useState<Table[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Filtered list
  const filteredQRTables = tables.filter((table) => {
    // Exclude soft-deleted archived tables from QR operations
    if (table.archived_at) return false;

    // Filter by branch
    if (selectedBranchFilter !== 'all' && table.branch_id !== selectedBranchFilter) {
      return false;
    }

    // Filter by QR status
    const status: QRStatus = table.qr_status || 'active';
    if (qrStatusFilter !== 'all' && status !== qrStatusFilter) {
      return false;
    }

    // Filter by search term
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      return (
        (table.table_number && table.table_number.toLowerCase().includes(lower)) ||
        (table.label && table.label.toLowerCase().includes(lower)) ||
        (table.table_token && table.table_token.toLowerCase().includes(lower)) ||
        (table.floor && table.floor.toLowerCase().includes(lower)) ||
        (table.section && table.section.toLowerCase().includes(lower))
      );
    }

    return true;
  });

  // Calculate QR Statistics
  const activeTables = tables.filter((t) => !t.archived_at);
  const qrStats = {
    total: activeTables.length,
    active: activeTables.filter((t) => (t.qr_status || 'active') === 'active').length,
    expired: activeTables.filter((t) => t.qr_status === 'expired').length,
    revoked: activeTables.filter((t) => t.qr_status === 'revoked').length,
  };

  const allFilteredSelected =
    filteredQRTables.length > 0 && filteredQRTables.every((t) => selectedIds.includes(t.id));

  // Handlers
  const handleSingleDownload = async (table: Table, format: 'png' | 'svg' | 'pdf') => {
    if (!restaurant?.slug) return;
    try {
      const tableUrl = buildPublicTableUrl(restaurant.slug, table.table_token);
      const filename = `${restaurant.slug}_table_${table.table_number}_qr.${format}`;
      const branch = branches.find((b) => b.id === table.branch_id);

      if (format === 'png') {
        const dataUrl = await qrService.generateQRCodeDataURL(tableUrl, {
          logoUrl: restaurant.logo_url,
          size: 1024,
        });
        qrService.downloadFile(dataUrl, filename, true);
        toast(`Downloaded PNG for Table ${table.table_number}`, 'success');
      } else if (format === 'svg') {
        const svgStr = await qrService.generateQRCodeSVG(tableUrl);
        qrService.downloadFile(svgStr, filename, false);
        toast(`Downloaded SVG for Table ${table.table_number}`, 'success');
      } else if (format === 'pdf') {
        const pdfDoc = await qrService.generatePDF([table], restaurant, branch, 'tent');
        pdfDoc.save(filename);
        toast(`Downloaded PDF for Table ${table.table_number}`, 'success');
      }
    } catch (err) {
      console.error('Single download error:', err);
      toast('Failed to download QR code', 'error');
    }
  };

  const handleOpenPrintModalForSingle = (table: Table) => {
    setPrintTables([table]);
    setShowPrintModal(true);
  };

  const handleOpenPrintModalForSelected = () => {
    const selectedTablesList = tables.filter((t) => selectedIds.includes(t.id));
    if (selectedTablesList.length === 0) return;
    setPrintTables(selectedTablesList);
    setShowPrintModal(true);
  };

  const handleOpenPrintModalForAll = () => {
    if (filteredQRTables.length === 0) return;
    setPrintTables(filteredQRTables);
    setShowPrintModal(true);
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-950 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <QrCode className="w-7 h-7 text-orange-500" /> QR Code Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate, preview, download, and print scannable QR codes dynamically for all dining tables.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={handleOpenPrintModalForAll}
            disabled={filteredQRTables.length === 0}
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/20 gap-2"
          >
            <Printer className="w-4 h-4" /> Print All QR Sheets ({filteredQRTables.length})
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Active Tables</span>
          <span className="text-2xl font-bold text-slate-100">{qrStats.total}</span>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Active QR Codes</span>
          <span className="text-2xl font-bold text-emerald-400">{qrStats.active}</span>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 border-l-4 border-l-rose-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">Expired Tokens</span>
          <span className="text-2xl font-bold text-rose-400">{qrStats.expired}</span>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex flex-col gap-1 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Revoked QRs</span>
          <span className="text-2xl font-bold text-amber-400">{qrStats.revoked}</span>
        </div>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl">
        {/* Status Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {(
              [
                { id: 'all', label: 'All QR Codes' },
                { id: 'active', label: 'Active QRs' },
                { id: 'expired', label: 'Expired' },
                { id: 'revoked', label: 'Revoked' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setQrStatusFilter(tab.id as QRFilterType)}
                className={cn(
                  'px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200',
                  qrStatusFilter === tab.id
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => toggleSelectAll(!allFilteredSelected)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800"
          >
            {allFilteredSelected ? (
              <CheckSquare className="w-4 h-4 text-orange-500" />
            ) : (
              <Square className="w-4 h-4 text-slate-600" />
            )}
            <span>{allFilteredSelected ? 'Deselect All' : 'Select All'}</span>
          </button>
        </div>

        {/* Search & Branch Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search table number, name, token, floor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          {/* Branch Filter */}
          <div className="relative">
            <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedBranchFilter}
              onChange={(e) => setSelectedBranchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 appearance-none focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl px-6 py-3 rounded-2xl z-40 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-xs font-semibold text-slate-200 border-r border-slate-700 pr-4">
            {selectedIds.length} tables selected
          </span>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleOpenPrintModalForSelected}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Printer className="w-3.5 h-3.5" /> Print {selectedIds.length} QR Sheets
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-400">Loading QR codes...</p>
        </div>
      ) : filteredQRTables.length === 0 ? (
        <EmptyState
          icon={<QrCode className="w-12 h-12 text-slate-600" />}
          title="No QR codes match"
          description="Try adjusting your active status filter, branch selector, or search term."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredQRTables.map((table) => {
            const branch = branches.find((b) => b.id === table.branch_id);
            return (
              <QRCard
                key={table.id}
                table={table}
                branch={branch}
                restaurantName={restaurant?.name}
                restaurantSlug={restaurant?.slug}
                logoUrl={restaurant?.logo_url}
                isSelected={selectedIds.includes(table.id)}
                onToggleSelect={() => toggleSelectOne(table.id)}
                onPreview={(t) => setPreviewTable(t)}
                onPrint={handleOpenPrintModalForSingle}
                onDownload={handleSingleDownload}
                onRegenerate={(t) => regenerateQR(t.id)}
              />
            );
          })}
        </div>
      )}

      {/* Modals */}
      {previewTable && (
        <QRPreviewModal
          isOpen={!!previewTable}
          onClose={() => setPreviewTable(null)}
          table={previewTable}
          restaurant={restaurant}
          branch={branches.find((b) => b.id === previewTable.branch_id)}
          onRegenerate={async (t) => {
            const ok = await regenerateQR(t.id);
            if (ok) setPreviewTable(null);
            return ok;
          }}
          onOpenPrintModal={handleOpenPrintModalForSingle}
        />
      )}

      {showPrintModal && (
        <QRPrintModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          tables={printTables}
          restaurant={restaurant}
          branches={branches}
        />
      )}
    </div>
  );
};
