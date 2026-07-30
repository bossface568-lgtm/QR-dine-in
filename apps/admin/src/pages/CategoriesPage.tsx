import React, { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { Button, Spinner, EmptyState, Badge, AppImage } from '@qrdine/ui';
import { cn, formatDate } from '@qrdine/shared';
import { Category, CategoryFilterType, CreateCategoryPayload, UpdateCategoryPayload, Branch } from '@qrdine/types';
import { branchService } from '@qrdine/lib';
import { useAuth } from '../contexts/AuthContext';
import { CategoryCard } from '../components/categories/CategoryCard';
import { CategoryFormModal } from '../components/categories/CategoryFormModal';
import { CategoryDetailsModal } from '../components/categories/CategoryDetailsModal';
import { CategoryArchiveDialog } from '../components/categories/CategoryArchiveDialog';
import { CategoryReorderModal } from '../components/categories/CategoryReorderModal';
import { 
  Plus, Search, LayoutGrid, List, ArrowUpDown, FolderOpen, Tag, 
  CheckCircle2, Star, Archive, Building2, CheckSquare, Square, 
  Trash2, ToggleLeft, ToggleRight, Sparkles 
} from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const { restaurantId } = useAuth();
  const {
    categories,
    filteredCategories,
    loading,
    stats,
    filter,
    searchTerm,
    selectedIds,
    selectedBranchFilter,
    setFilter,
    setSearchTerm,
    setSelectedBranchFilter,
    toggleSelectAll,
    toggleSelectOne,
    createCategory,
    updateCategory,
    archiveCategory: hookArchiveCategory,
    duplicateCategory,
    toggleStatus,
    toggleFeatured,
    reorderCategories,
    restoreCategory,
    bulkArchive,
    bulkToggleStatus,
  } = useCategories();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [detailsCategory, setDetailsCategory] = useState<Category | null>(null);
  const [archiveCategoryState, setArchiveCategoryState] = useState<Category | null>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Fetch branches for branch filter
  useEffect(() => {
    if (restaurantId) {
      branchService.getBranches(restaurantId).then(res => {
        if (res.data) setBranches(res.data);
      });
    }
  }, [restaurantId]);

  // Handlers
  const handleCreateSubmit = async (payload: CreateCategoryPayload | UpdateCategoryPayload) => {
    const success = await createCategory(payload as CreateCategoryPayload);
    if (success) setShowCreateModal(false);
    return success;
  };

  const handleEditSubmit = async (payload: UpdateCategoryPayload) => {
    if (!editCategory) return false;
    const success = await updateCategory(editCategory.id, payload);
    if (success) setEditCategory(null);
    return success;
  };

  const handleConfirmArchive = async () => {
    if (!archiveCategoryState) return;
    setArchiveLoading(true);
    const success = await hookArchiveCategory(archiveCategoryState.id);
    setArchiveLoading(false);
    if (success) setArchiveCategoryState(null);
  };

  const handleReorderSave = async (items: { id: string; sort_order: number }[]) => {
    return await reorderCategories(items);
  };

  const handleBulkActivate = async () => {
    setBulkActionLoading(true);
    await bulkToggleStatus(true);
    setBulkActionLoading(false);
  };

  const handleBulkDeactivate = async () => {
    setBulkActionLoading(true);
    await bulkToggleStatus(false);
    setBulkActionLoading(false);
  };

  const handleBulkArchive = async () => {
    setBulkActionLoading(true);
    await bulkArchive();
    setBulkActionLoading(false);
  };

  const filters: { label: string; value: CategoryFilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Featured', value: 'featured' },
    { label: 'Archived', value: 'archived' },
  ];

  const allFilteredSelected = filteredCategories.length > 0 && filteredCategories.every(c => selectedIds.includes(c.id));

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-16">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            Category Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize menu categories, control branch availability, drag-and-drop sort order, and manage display assets.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowReorderModal(true)}
            leftIcon={<ArrowUpDown size={18} />}
          >
            Reorder
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus size={18} />}
          >
            Create Category
          </Button>
        </div>
      </div>

      {/* 2. Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Categories</p>
            <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Categories</p>
            <p className="text-2xl font-bold text-slate-100">{stats.active}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
            <Star size={24} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Featured Items</p>
            <p className="text-2xl font-bold text-slate-100">{stats.featured}</p>
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
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
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

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Branch Filter Dropdown */}
          {branches.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
              <Building2 className="w-4 h-4 text-orange-400" />
              <select
                value={selectedBranchFilter}
                onChange={e => setSelectedBranchFilter(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer pr-2"
              >
                <option value="all">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search Input */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Search category, slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            />
          </div>

          {/* Grid vs Table View Switch */}
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
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

      {/* Floating Bulk Actions Bar when items are selected */}
      {selectedIds.length > 0 && (
        <div className="bg-slate-900 border border-orange-500/30 shadow-xl rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 font-bold text-xs flex items-center justify-center border border-orange-500/30">
              {selectedIds.length}
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {selectedIds.length} {selectedIds.length === 1 ? 'category' : 'categories'} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkActivate}
              isLoading={bulkActionLoading}
              leftIcon={<ToggleRight className="w-4 h-4 text-emerald-400" />}
            >
              Activate
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleBulkDeactivate}
              isLoading={bulkActionLoading}
              leftIcon={<ToggleLeft className="w-4 h-4 text-rose-400" />}
            >
              Deactivate
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleBulkArchive}
              isLoading={bulkActionLoading}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Archive Selected
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => toggleSelectAll()}
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
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loading Categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<FolderOpen size={48} className="text-slate-600" />}
            title="No categories created yet"
            description="Categories organize your menu items (e.g. Appetizers, Main Course, Drinks). Create your first category to get started."
            action={
              <Button variant="primary" onClick={() => setShowCreateModal(true)} leftIcon={<Plus size={18} />}>
                Create Category
              </Button>
            }
          />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<Search size={48} className="text-slate-600" />}
            title="No matching categories"
            description="No categories match your search query or selected branch/status filter."
            action={
              <Button variant="outline" onClick={() => { setFilter('all'); setSearchTerm(''); setSelectedBranchFilter('all'); }}>
                Clear Filters
              </Button>
            }
          />
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => setEditCategory(category)}
              onViewDetails={() => setDetailsCategory(category)}
              onArchive={() => setArchiveCategoryState(category)}
              onRestore={() => restoreCategory(category.id)}
              onToggleStatus={() => toggleStatus(category.id, category.is_active)}
              onToggleFeatured={() => toggleFeatured(category.id, category.is_featured)}
              onDuplicate={() => duplicateCategory(category.id)}
            />
          ))}
        </div>
      ) : (
        /* Table View with Bulk Selection Checkboxes */
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 text-xs uppercase font-semibold tracking-wider">
                <tr>
                  <th className="px-4 py-4 w-10 text-center">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-200">
                      {allFilteredSelected ? (
                        <CheckSquare className="w-4 h-4 text-orange-500" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-4 font-semibold">Image & Category</th>
                  <th className="px-4 py-4 font-semibold">Slug / URL</th>
                  <th className="px-4 py-4 font-semibold">Status</th>
                  <th className="px-4 py-4 font-semibold">Featured</th>
                  <th className="px-4 py-4 font-semibold">Availability</th>
                  <th className="px-4 py-4 font-semibold">Sort Order</th>
                  <th className="px-4 py-4 font-semibold">Last Updated</th>
                  <th className="px-4 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCategories.map((category) => {
                  const isSelected = selectedIds.includes(category.id);
                  return (
                    <tr
                      key={category.id}
                      className={cn(
                        "hover:bg-slate-800/30 transition-colors",
                        isSelected && "bg-orange-500/5"
                      )}
                    >
                      <td className="px-4 py-4 text-center">
                        <button onClick={() => toggleSelectOne(category.id)} className="text-slate-400 hover:text-slate-200">
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
                            {category.image_url ? (
                              <AppImage src={category.image_url} alt={category.name} entityType="category" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-lg font-bold" style={{ color: category.text_color || '#ffffff' }}>
                                {category.icon || category.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200">{category.name}</span>
                            {category.description && (
                              <span className="text-xs text-slate-500 truncate max-w-[200px]">
                                {category.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                          /{category.slug}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {category.archived_at ? (
                          <Badge variant="archived">Archived</Badge>
                        ) : category.is_active ? (
                          <Badge variant="available">Active</Badge>
                        ) : (
                          <Badge variant="inactive">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button onClick={() => toggleFeatured(category.id, category.is_featured)}>
                          <Star className={cn("w-4 h-4 transition-colors", category.is_featured ? "text-amber-500 fill-amber-500" : "text-slate-600 hover:text-slate-400")} />
                        </button>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-400">
                        {category.available_from && category.available_until ? (
                          <span>{category.available_from} - {category.available_until}</span>
                        ) : (
                          <span className="text-slate-500">Always</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-slate-400">
                        #{category.sort_order ?? 0}
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-500">
                        {formatDate(category.updated_at)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button size="sm" variant="ghost" onClick={() => setDetailsCategory(category)}>
                            View
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditCategory(category)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => duplicateCategory(category.id)}>
                            Duplicate
                          </Button>
                          {!category.archived_at ? (
                            <Button size="sm" variant="ghost" onClick={() => setArchiveCategoryState(category)}>
                              Archive
                            </Button>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => restoreCategory(category.id)}>
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

      {/* 5. Modals */}
      {showCreateModal && (
        <CategoryFormModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

      {editCategory && (
        <CategoryFormModal
          isOpen={!!editCategory}
          onClose={() => setEditCategory(null)}
          category={editCategory}
          onSubmit={handleEditSubmit}
        />
      )}

      {detailsCategory && (
        <CategoryDetailsModal
          isOpen={!!detailsCategory}
          onClose={() => setDetailsCategory(null)}
          category={detailsCategory}
        />
      )}

      {archiveCategoryState && (
        <CategoryArchiveDialog
          isOpen={!!archiveCategoryState}
          onClose={() => setArchiveCategoryState(null)}
          category={archiveCategoryState}
          onConfirm={handleConfirmArchive}
          isLoading={archiveLoading}
        />
      )}

      {showReorderModal && (
        <CategoryReorderModal
          isOpen={showReorderModal}
          onClose={() => setShowReorderModal(false)}
          categories={categories}
          onSave={handleReorderSave}
        />
      )}
    </div>
  );
};
