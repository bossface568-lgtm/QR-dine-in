import React, { useState } from 'react';
import { useTables } from '../hooks/useTables';
import { Button, Spinner, EmptyState, Modal } from '@qrdine/ui';
import { cn, formatDate } from '@qrdine/shared';
import { Table, TableStatus, TableFilterType, CreateTablePayload, UpdateTablePayload } from '@qrdine/types';
import { TableCard } from '../components/tables/TableCard';
import { TableFormModal } from '../components/tables/TableFormModal';
import { TableDetailsModal } from '../components/tables/TableDetailsModal';
import { TableStatusBadge } from '../components/tables/TableStatusBadge';
import {
  Plus,
  Search,
  Grid3X3,
  List,
  Building2,
  CheckSquare,
  Square,
  Users,
  Layers,
  Archive,
  QrCode,
  AlertTriangle,
} from 'lucide-react';

export const TablesPage: React.FC = () => {
  const {
    tables,
    branches,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    selectedBranchFilter,
    setSelectedBranchFilter,
    selectedFloorFilter,
    setSelectedFloorFilter,
    selectedSectionFilter,
    setSelectedSectionFilter,
    selectedIds,
    filteredTables,
    stats,
    floors,
    sections,
    createTable,
    updateTable,
    archiveTable: hookArchiveTable,
    restoreTable,
    setStatus,
    bulkArchive,
    bulkSetStatus,
    toggleSelectAll,
    toggleSelectOne,
  } = useTables();

  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTable, setEditTable] = useState<Table | null>(null);
  const [detailsTable, setDetailsTable] = useState<Table | null>(null);
  const [archiveTableState, setArchiveTableState] = useState<Table | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  // Handlers
  const handleCreateSubmit = async (payload: CreateTablePayload | UpdateTablePayload) => {
    const success = await createTable(payload as CreateTablePayload);
    if (success) setShowCreateModal(false);
    return success;
  };

  const handleEditSubmit = async (payload: UpdateTablePayload) => {
    if (!editTable) return false;
    const success = await updateTable(editTable.id, payload);
    if (success) setEditTable(null);
    return success;
  };

  const handleConfirmArchive = async () => {
    if (!archiveTableState) return;
    setArchiveLoading(true);
    const success = await hookArchiveTable(archiveTableState.id);
    setArchiveLoading(false);
    if (success) setArchiveTableState(null);
  };

  const allFilteredSelected = filteredTables.length > 0 && filteredTables.every((t) => selectedIds.includes(t.id));

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <Grid3X3 className="w-7 h-7 text-orange-500" /> Table Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure dining tables, seating capacity, floors, and sections across branches.
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/20 gap-2"
        >
          <Plus className="w-4 h-4" /> Add Table
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total</span>
          <span className="text-2xl font-bold text-slate-100">{stats.total}</span>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1 border-l-4 border-l-emerald-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Available</span>
          <span className="text-2xl font-bold text-emerald-400">{stats.available}</span>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1 border-l-4 border-l-orange-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-orange-400">Occupied</span>
          <span className="text-2xl font-bold text-orange-400">{stats.occupied}</span>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1 border-l-4 border-l-blue-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">Reserved</span>
          <span className="text-2xl font-bold text-blue-400">{stats.reserved}</span>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">Cleaning</span>
          <span className="text-2xl font-bold text-amber-400">{stats.cleaning}</span>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1 border-l-4 border-l-slate-500">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Inactive</span>
          <span className="text-2xl font-bold text-slate-400">{stats.inactive}</span>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 p-3.5 rounded-2xl flex flex-col gap-1 border-l-4 border-l-slate-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Archived</span>
          <span className="text-2xl font-bold text-slate-500">{stats.archived}</span>
        </div>
      </div>

      {/* Filter Tabs & Toolbar */}
      <div className="flex flex-col gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-800 p-4 rounded-2xl">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
          {(
            [
              { id: 'all', label: 'All Tables' },
              { id: 'available', label: 'Available' },
              { id: 'occupied', label: 'Occupied' },
              { id: 'reserved', label: 'Reserved' },
              { id: 'cleaning', label: 'Cleaning' },
              { id: 'inactive', label: 'Inactive' },
              { id: 'archived', label: 'Archived' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as TableFilterType)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200',
                filter === tab.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search table number, name, floor, section..."
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

          {/* Floor Filter */}
          <div className="relative">
            <Layers className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedFloorFilter}
              onChange={(e) => setSelectedFloorFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 appearance-none focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Floors</option>
              {floors.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 justify-end">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors',
                viewMode === 'grid' ? 'bg-slate-800 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <Grid3X3 className="w-3.5 h-3.5" /> Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors',
                viewMode === 'table' ? 'bg-slate-800 text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'
              )}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl px-6 py-3 rounded-2xl z-40 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-xs font-semibold text-slate-200 border-r border-slate-700 pr-4">
            {selectedIds.length} selected
          </span>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={() => bulkSetStatus('available')} className="text-xs text-emerald-400 hover:text-emerald-300">
              Set Available
            </Button>
            <Button size="sm" variant="ghost" onClick={() => bulkSetStatus('inactive')} className="text-xs text-slate-400 hover:text-slate-300">
              Set Inactive
            </Button>
            <Button size="sm" variant="danger" onClick={bulkArchive} className="text-xs gap-1.5">
              <Archive className="w-3.5 h-3.5" /> Archive Selected
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-slate-400">Loading tables catalog...</p>
        </div>
      ) : filteredTables.length === 0 ? (
        <EmptyState
          icon={<Grid3X3 className="w-12 h-12 text-slate-600" />}
          title="No tables found"
          description={
            searchTerm || filter !== 'all'
              ? 'No dining tables match your active search criteria or filters.'
              : 'Add your physical restaurant tables to manage seating capacity and layout.'
          }
          action={
            <Button onClick={() => setShowCreateModal(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
              <Plus className="w-4 h-4" /> Add First Table
            </Button>
          }
        />
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTables.map((t) => (
            <TableCard
              key={t.id}
              table={t}
              isSelected={selectedIds.includes(t.id)}
              onToggleSelect={() => toggleSelectOne(t.id)}
              onEdit={() => setEditTable(t)}
              onDetails={() => setDetailsTable(t)}
              onArchive={() => setArchiveTableState(t)}
              onRestore={() => restoreTable(t.id)}
              onSetStatus={(status) => setStatus(t.id, status)}
              branches={branches}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 w-10 text-center">
                    <button onClick={() => toggleSelectAll(!allFilteredSelected)} className="text-slate-400 hover:text-slate-200">
                      {allFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">Table No.</th>
                  <th className="px-4 py-3.5">Name / Label</th>
                  <th className="px-4 py-3.5">Branch</th>
                  <th className="px-4 py-3.5">Capacity</th>
                  <th className="px-4 py-3.5">Floor / Section</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">QR Status</th>
                  <th className="px-4 py-3.5">Last Updated</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTables.map((t) => {
                  const isSelected = selectedIds.includes(t.id);
                  const branch = branches.find((b) => b.id === t.branch_id);

                  return (
                    <tr
                      key={t.id}
                      className={cn(
                        'hover:bg-slate-800/40 transition-colors',
                        isSelected && 'bg-orange-500/5 hover:bg-orange-500/10'
                      )}
                    >
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => toggleSelectOne(t.id)} className="text-slate-400 hover:text-slate-200">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-orange-500" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-slate-200">
                        {t.table_number}
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-100">
                        {t.label || `Table ${t.table_number}`}
                      </td>
                      <td className="px-4 py-4 text-slate-400">
                        {branch?.name || 'Global (All Branches)'}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                          <Users className="w-3 h-3 text-slate-400" /> {t.seating_capacity} Seats
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-400">
                        {t.floor || t.section ? (
                          <span>
                            {t.floor} {t.section ? `• ${t.section}` : ''}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {t.archived_at ? (
                          <TableStatusBadge status="archived" />
                        ) : (
                          <TableStatusBadge status={t.status} />
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-500 font-mono text-[11px]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                          <QrCode className="w-3 h-3 text-slate-600" /> Ready
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {formatDate(t.updated_at)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setDetailsTable(t)}>
                            View
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditTable(t)}>
                            Edit
                          </Button>
                          {!t.archived_at ? (
                            <Button size="sm" variant="ghost" onClick={() => setArchiveTableState(t)}>
                              Archive
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => restoreTable(t.id)}>
                              Restore
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <TableFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
          branches={branches}
        />
      )}

      {editTable && (
        <TableFormModal
          isOpen={!!editTable}
          onClose={() => setEditTable(null)}
          table={editTable}
          onSubmit={handleEditSubmit}
          branches={branches}
        />
      )}

      {detailsTable && (
        <TableDetailsModal
          isOpen={!!detailsTable}
          onClose={() => setDetailsTable(null)}
          table={detailsTable}
          onEdit={() => {
            const item = detailsTable;
            setDetailsTable(null);
            setEditTable(item);
          }}
          onArchive={() => {
            const item = detailsTable;
            setDetailsTable(null);
            setArchiveTableState(item);
          }}
          branches={branches}
        />
      )}

      {/* Archive Confirmation Dialog */}
      {archiveTableState && (
        <Modal
          isOpen={!!archiveTableState}
          onClose={() => setArchiveTableState(null)}
          title="Archive Dining Table"
          size="sm"
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>
                Archiving <strong>{archiveTableState.label || archiveTableState.table_number}</strong> will remove it from active seating layout. Tables are never permanently deleted and can be restored anytime.
              </span>
            </div>
            <div className="flex justify-end gap-2 mt-2">
              <Button variant="ghost" onClick={() => setArchiveTableState(null)}>
                Cancel
              </Button>
              <Button variant="danger" isLoading={archiveLoading} onClick={handleConfirmArchive}>
                Confirm Archive
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
