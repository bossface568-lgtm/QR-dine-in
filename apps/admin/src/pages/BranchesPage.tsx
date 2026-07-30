import React, { useState } from 'react';
import { useBranches } from '../hooks/useBranches';
import { Branch } from '@qrdine/types';
import { Button, Input, EmptyState, Spinner } from '@qrdine/ui';
import { BranchCard } from '../components/branches/BranchCard';
import { BranchTableView } from '../components/branches/BranchTableView';
import { BranchFormModal } from '../components/branches/BranchFormModal';
import { BranchDetailsModal } from '../components/branches/BranchDetailsModal';
import { BranchArchiveDialog } from '../components/branches/BranchArchiveDialog';
import { BranchDeleteDialog } from '../components/branches/BranchDeleteDialog';
import {
  MapPin,
  Plus,
  Search,
  Grid,
  List,
  Store,
  CheckCircle2,
  XCircle,
  Archive,
  Star,
  RefreshCw
} from 'lucide-react';

export const BranchesPage: React.FC = () => {
  const {
    filteredBranches,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    refreshBranches,
    createBranch,
    updateBranch,
    toggleStatus,
    setDefaultBranch,
    archiveBranch,
    deleteBranch,
  } = useBranches();

  // View state
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingBranch, setViewingBranch] = useState<Branch | null>(null);

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [archivingBranch, setArchivingBranch] = useState<Branch | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBranch, setDeletingBranch] = useState<Branch | null>(null);

  const handleOpenCreate = () => {
    setEditingBranch(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormModalOpen(true);
  };

  const handleOpenView = (branch: Branch) => {
    setViewingBranch(branch);
    setDetailsModalOpen(true);
  };

  const handleOpenArchive = (branch: Branch) => {
    setArchivingBranch(branch);
    setArchiveDialogOpen(true);
  };

  const handleOpenDelete = (branch: Branch) => {
    setDeletingBranch(branch);
    setDeleteDialogOpen(true);
  };

  const handleFormSubmit = async (payload: any): Promise<boolean> => {
    if (editingBranch) {
      return await updateBranch(editingBranch.id, payload);
    } else {
      return await createBranch(payload);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
              <MapPin className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">Branch Outlets & Locations</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage restaurant outlets, operating schedules, geo-locations, and primary HQ default branch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshBranches}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="text-slate-400 hover:text-slate-200"
          >
            Refresh
          </Button>
          <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
            Add New Branch
          </Button>
        </div>
      </div>

      {/* Metrics Summary Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Outlets</span>
            <span className="text-2xl font-bold text-slate-100 mt-1">{stats.total}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/80 text-slate-400 border border-slate-700/60">
            <Store className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Outlets</span>
            <span className="text-2xl font-bold text-emerald-400 mt-1">{stats.active}</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Primary HQ Default</span>
            <span className="text-sm font-bold text-amber-400 mt-2 truncate max-w-[140px]">
              {stats.defaultBranch?.name || 'None Set'}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Archived Outlets</span>
            <span className="text-2xl font-bold text-slate-400 mt-1">{stats.archived}</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 text-slate-500 border border-slate-700/60">
            <Archive className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-3 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {(
            [
              { key: 'all', label: `All (${stats.total})` },
              { key: 'active', label: `Active (${stats.active})` },
              { key: 'inactive', label: `Inactive (${stats.inactive})` },
              { key: 'archived', label: `Archived (${stats.archived})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filter === tab.key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Layout View Toggles */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <Input
              id="branchSearch"
              placeholder="Search by name, code, city, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs py-1.5 bg-slate-950/40"
            />
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/40 border border-slate-800 flex-shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-slate-800 text-orange-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Card Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-slate-800 text-orange-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
          <Spinner size="lg" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading branch outlets...
          </span>
        </div>
      ) : filteredBranches.length === 0 ? (
        <div className="p-12 rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
          <EmptyState
            icon={<MapPin className="w-10 h-10 text-orange-500" />}
            title={
              filter === 'archived'
                ? 'No Archived Branches'
                : searchTerm
                ? 'No Branches Found'
                : 'No Branch Outlets Configured'
            }
            description={
              searchTerm
                ? `No branch matches your search "${searchTerm}". Try a different keyword.`
                : filter === 'archived'
                ? 'You do not have any archived branches.'
                : 'Create your first branch outlet to organize menu availability, tables, and operations.'
            }
            action={
              !searchTerm && filter !== 'archived' ? (
                <Button onClick={handleOpenCreate} leftIcon={<Plus className="w-4 h-4" />}>
                  Create Branch Outlet
                </Button>
              ) : undefined
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBranches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              onEdit={handleOpenEdit}
              onView={handleOpenView}
              onArchive={handleOpenArchive}
              onDelete={handleOpenDelete}
              onToggleStatus={toggleStatus}
              onSetDefault={setDefaultBranch}
            />
          ))}
        </div>
      ) : (
        <BranchTableView
          branches={filteredBranches}
          onEdit={handleOpenEdit}
          onView={handleOpenView}
          onArchive={handleOpenArchive}
          onDelete={handleOpenDelete}
          onToggleStatus={toggleStatus}
          onSetDefault={setDefaultBranch}
        />
      )}

      {/* Modals */}
      <BranchFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        editingBranch={editingBranch}
      />

      <BranchDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        branch={viewingBranch}
        onEdit={handleOpenEdit}
      />

      <BranchArchiveDialog
        isOpen={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        branch={archivingBranch}
        onConfirm={archiveBranch}
      />

      <BranchDeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        branch={deletingBranch}
        onConfirm={deleteBranch}
      />
    </div>
  );
};
export default BranchesPage;
