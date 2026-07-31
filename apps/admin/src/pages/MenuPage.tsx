import React, { useState, useEffect } from 'react';
import { useMenuItems } from '../hooks/useMenuItems';
import { Button, Spinner, EmptyState, Badge, AppImage, Modal } from '@qrdine/ui';
import { cn, formatDate, formatCurrency } from '@qrdine/shared';
import { MenuItem, MenuItemFilterType, CreateMenuItemPayload, UpdateMenuItemPayload, Branch, Category, MenuItemStatus } from '@qrdine/types';
import { branchService } from '@qrdine/lib';
import { useAuth } from '../contexts/AuthContext';
import { MenuItemCard } from '../components/menu/MenuItemCard';
import { MenuItemFormModal } from '../components/menu/MenuItemFormModal';
import { MenuItemDetailsModal } from '../components/menu/MenuItemDetailsModal';
import { DietaryBadge } from '../components/menu/DietaryBadge';
import { MENU_ITEM_STATUS_LABELS, MENU_ITEM_STATUS_COLORS, DIETARY_TAG_OPTIONS } from '@qrdine/shared';
import { 
  Plus, Search, LayoutGrid, List, FolderOpen, Tag, 
  CheckCircle2, Star, Archive, Building2, CheckSquare, Square, 
  Trash2, ToggleLeft, ToggleRight, AlertTriangle, Layers, Filter
} from 'lucide-react';

export const MenuPage: React.FC = () => {
  const { restaurantId } = useAuth();
  const {
    items,
    categories,
    filteredItems,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    selectedIds,
    setSelectedIds,
    selectedBranchFilter,
    setSelectedBranchFilter,
    selectedCategoryFilter,
    setSelectedCategoryFilter,
    selectedStatusFilter,
    setSelectedStatusFilter,
    selectedDietaryFilter,
    setSelectedDietaryFilter,
    stats,
    createMenuItem,
    updateMenuItem,
    archiveMenuItem: hookArchiveMenuItem,
    restoreMenuItem,
    duplicateMenuItem,
    setStatus,
    toggleFeatured,
    bulkArchive,
    bulkSetStatus,
    toggleSelectAll,
    toggleSelectOne
  } = useMenuItems();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [detailsItem, setDetailsItem] = useState<MenuItem | null>(null);
  const [archiveItemState, setArchiveItemState] = useState<MenuItem | null>(null);
  
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Fetch branches
  useEffect(() => {
    if (restaurantId) {
      branchService.getBranches(restaurantId).then(res => {
        if (res.data) setBranches(res.data);
      });
    }
  }, [restaurantId]);

  // Handlers
  const handleCreateSubmit = async (payload: CreateMenuItemPayload | UpdateMenuItemPayload) => {
    const success = await createMenuItem(payload as CreateMenuItemPayload);
    if (success) setShowCreateModal(false);
    return success;
  };

  const handleEditSubmit = async (payload: UpdateMenuItemPayload) => {
    if (!editItem) return false;
    const success = await updateMenuItem(editItem.id, payload);
    if (success) setEditItem(null);
    return success;
  };

  const handleConfirmArchive = async () => {
    if (!archiveItemState) return;
    setArchiveLoading(true);
    const success = await hookArchiveMenuItem(archiveItemState.id);
    setArchiveLoading(false);
    if (success) setArchiveItemState(null);
  };

  const handleBulkSetAvailable = async () => {
    setBulkActionLoading(true);
    await bulkSetStatus('available');
    setBulkActionLoading(false);
  };

  const handleBulkSetUnavailable = async () => {
    setBulkActionLoading(true);
    await bulkSetStatus('unavailable');
    setBulkActionLoading(false);
  };

  const handleBulkArchive = async () => {
    setBulkActionLoading(true);
    await bulkArchive();
    setBulkActionLoading(false);
  };

  const filters: { label: string; value: MenuItemFilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Featured', value: 'featured' },
    { label: 'Out of Stock', value: 'out_of_stock' },
    { label: 'Archived', value: 'archived' },
  ];

  const allFilteredSelected = filteredItems.length > 0 && filteredItems.every(c => selectedIds.includes(c.id));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Menu Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create and organize menu items, manage pricing, status, and availability.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus size={18} />}
          >
            Add Menu Item
          </Button>
        </div>
      </div>

      {/* 2. Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Items</p>
            <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Available</p>
            <p className="text-2xl font-bold text-slate-100">{stats.available}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Star size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured</p>
            <p className="text-2xl font-bold text-slate-100">{stats.featured}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Out of Stock</p>
            <p className="text-2xl font-bold text-slate-100">{stats.outOfStock}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500 border border-slate-500/20">
            <Archive size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Archived</p>
            <p className="text-2xl font-bold text-slate-100">{stats.archived}</p>
          </div>
        </div>
      </div>

      {/* 3. Filter, Search & Branch Controls */}
      <div className="flex flex-col gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
        {/* Top row: Tabs and Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={cn(
                  "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer",
                  filter === f.value 
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 md:max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search items, SKU, code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            />
          </div>
        </div>

        {/* Bottom row: Dropdown filters & View toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/50">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category Filter */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <Layers className="w-4 h-4 text-orange-400" />
              <select
                value={selectedCategoryFilter}
                onChange={e => setSelectedCategoryFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer pr-2 max-w-[150px]"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            {branches.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                <Building2 className="w-4 h-4 text-orange-400" />
                <select
                  value={selectedBranchFilter}
                  onChange={e => setSelectedBranchFilter(e.target.value)}
                  className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer pr-2 max-w-[150px]"
                >
                  <option value="all">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <Filter className="w-4 h-4 text-orange-400" />
              <select
                value={selectedStatusFilter}
                onChange={e => setSelectedStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer pr-2 max-w-[150px]"
              >
                <option value="all">All Statuses</option>
                {Object.entries(MENU_ITEM_STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            {/* Dietary Filter */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <Tag className="w-4 h-4 text-orange-400" />
              <select
                value={selectedDietaryFilter}
                onChange={e => setSelectedDietaryFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer pr-2 max-w-[150px]"
              >
                <option value="all">All Dietary</option>
                {DIETARY_TAG_OPTIONS?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid vs Table View Switch */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === 'grid' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
              )}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === 'table' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
              )}
              title="Table View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 border border-orange-500/30 shadow-xl rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in sticky top-4 z-20">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center border border-orange-500/30">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkSetAvailable}
              isLoading={bulkActionLoading}
              leftIcon={<ToggleRight className="w-4 h-4 text-emerald-400" />}
            >
              Set Available
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkSetUnavailable}
              isLoading={bulkActionLoading}
              leftIcon={<ToggleLeft className="w-4 h-4 text-rose-400" />}
            >
              Set Unavailable
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleBulkArchive}
              isLoading={bulkActionLoading}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Archive
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleSelectAll(false)}
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* 4. Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Spinner size="lg" className="text-orange-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loading Menu Items...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<FolderOpen size={48} className="text-slate-600" />}
            title="No menu items yet"
            description="Start building your menu by adding your first item."
            action={
              <Button variant="primary" onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={18} />}>
                Add Menu Item
              </Button>
            }
          />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<Search size={48} className="text-slate-600" />}
            title="No matching items"
            description="No items match your filters or search query."
            action={
              <Button variant="outline" onClick={() => { 
                setFilter('all'); 
                setSearchTerm(''); 
                setSelectedCategoryFilter('all');
                setSelectedBranchFilter('all');
                setSelectedStatusFilter('all');
                setSelectedDietaryFilter('all');
              }}>
                Clear Filters
              </Button>
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              categories={categories}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={() => toggleSelectOne(item.id)}
              onEdit={() => setEditItem(item)}
              onDetails={() => setDetailsItem(item)}
              onDuplicate={() => duplicateMenuItem(item.id)}
              onArchive={() => setArchiveItemState(item)}
              onRestore={() => restoreMenuItem(item.id)}
              onToggleFeatured={() => toggleFeatured(item.id, item.is_featured)}
              onSetStatus={(status) => setStatus(item.id, status)}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-xs uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-4 w-10 text-center">
                    <button onClick={() => toggleSelectAll(!allFilteredSelected)} className="text-slate-400 hover:text-slate-200">
                      {allFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-4 font-semibold">Image & Name</th>
                  <th className="px-4 py-4 font-semibold">Category</th>
                  <th className="px-4 py-4 font-semibold">Price</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Prep Time</th>
                  <th className="px-4 py-4 font-semibold">Last Updated</th>
                  <th className="px-4 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const category = categories.find(c => c.id === item.category_id);
                  const statusColor = MENU_ITEM_STATUS_COLORS[item.status] || 'slate';
                  
                  return (
                    <tr
                      key={item.id}
                      className={cn(
                        "hover:bg-slate-800/30 transition-colors",
                        isSelected && "bg-orange-500/5"
                      )}
                    >
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => toggleSelectOne(item.id)} className="text-slate-400 hover:text-slate-200">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-orange-500" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-700 bg-slate-900 flex items-center justify-center">
                            {item.image_url ? (
                              <AppImage src={item.image_url} alt={item.name} entityType="menu" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-bold text-slate-500">
                                {item.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                              {item.name}
                              {item.is_featured && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                            </span>
                            {item.sku && (
                              <span className="text-xs font-mono text-slate-500">
                                SKU: {item.sku}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="inactive">{category?.name || 'Uncategorized'}</Badge>
                      </td>
                      <td className="px-4 py-4 font-semibold text-slate-200">
                        {formatCurrency(item.base_price, 'USD')}
                      </td>
                      <td className="px-4 py-4">
                        {item.archived_at ? (
                          <Badge variant="archived">Archived</Badge>
                        ) : (
                          <Badge variant={item.status === 'available' ? 'available' : item.status === 'out_of_stock' ? 'cancelled' : 'inactive'}>
                            {MENU_ITEM_STATUS_LABELS[item.status]}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-4 text-slate-400">
                        {item.preparation_time ? `${item.preparation_time}m` : '-'}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatDate(item.updated_at)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setDetailsItem(item)}>
                            View
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditItem(item)}>
                            Edit
                          </Button>
                          {!item.archived_at ? (
                            <Button size="sm" variant="ghost" onClick={() => setArchiveItemState(item)}>
                              Archive
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => restoreMenuItem(item.id)}>
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
        <MenuItemFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {editItem && (
        <MenuItemFormModal
          isOpen={!!editItem}
          onClose={() => setEditItem(null)}
          menuItem={editItem}
          onSubmit={handleEditSubmit}
        />
      )}

      {detailsItem && (
        <MenuItemDetailsModal
          isOpen={!!detailsItem}
          onClose={() => setDetailsItem(null)}
          item={detailsItem}
          onEdit={() => setEditItem(detailsItem)}
          onDuplicate={() => duplicateMenuItem(detailsItem.id)}
          onArchive={() => setArchiveItemState(detailsItem)}
          categories={categories}
        />
      )}

      {/* Archive Confirmation Dialog */}
      <Modal
        isOpen={!!archiveItemState}
        onClose={() => setArchiveItemState(null)}
        title="Archive Menu Item"
        size="sm"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => setArchiveItemState(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmArchive} isLoading={archiveLoading}>
              Archive
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-3 text-slate-300">
          <p>
            Are you sure you want to archive <strong>{archiveItemState?.name}</strong>?
          </p>
          <p className="text-sm text-slate-400">
            Archived items are hidden from active menus but can be restored later.
          </p>
        </div>
      </Modal>
    </div>
  );
};
