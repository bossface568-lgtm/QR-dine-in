import React, { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { Button, Spinner, EmptyState, Badge } from '@qrdine/ui';
import { cn, formatDate } from '@qrdine/shared';
import { Category, CategoryFilterType, CreateCategoryPayload, UpdateCategoryPayload } from '@qrdine/types';
import { CategoryCard } from '../components/categories/CategoryCard';
import { CategoryFormModal } from '../components/categories/CategoryFormModal';
import { CategoryDetailsModal } from '../components/categories/CategoryDetailsModal';
import { CategoryArchiveDialog } from '../components/categories/CategoryArchiveDialog';
import { CategoryReorderModal } from '../components/categories/CategoryReorderModal';
import { Plus, Search, LayoutGrid, List, ArrowUpDown, FolderOpen, Tag, CheckCircle2, Star, Archive } from 'lucide-react';

export const CategoriesPage: React.FC = () => {
  const {
    categories,
    filteredCategories,
    loading,
    stats,
    filter,
    searchTerm,
    setFilter,
    setSearchTerm,
    createCategory,
    updateCategory,
    archiveCategory: hookArchiveCategory,
    duplicateCategory,
    toggleStatus,
    toggleFeatured,
    reorderCategories,
    restoreCategory,
    uploadImage,
  } = useCategories();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [detailsCategory, setDetailsCategory] = useState<Category | null>(null);
  const [archiveCategoryState, setArchiveCategoryState] = useState<Category | null>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [archiveLoading, setArchiveLoading] = useState(false);

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

  const filters: { label: string; value: CategoryFilterType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Featured', value: 'featured' },
    { label: 'Archived', value: 'archived' },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Categories</h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage menu categories, reorder, and control visibility
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
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Total</p>
            <p className="text-2xl font-bold text-slate-100">{stats.total}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Active</p>
            <p className="text-2xl font-bold text-slate-100">{stats.active}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Star size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Featured</p>
            <p className="text-2xl font-bold text-slate-100">{stats.featured}</p>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-500">
            <Archive size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-400">Archived</p>
            <p className="text-2xl font-bold text-slate-100">{stats.archived}</p>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-slate-900/30 p-2 rounded-2xl border border-slate-800/50">
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer",
                filter === f.value 
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
            />
          </div>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === 'grid' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "p-1.5 rounded-lg transition-colors cursor-pointer",
                viewMode === 'table' ? "bg-slate-800 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" className="text-orange-500" />
        </div>
      ) : categories.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<FolderOpen size={48} className="text-slate-600" />}
            title="No categories yet"
            description="Create your first category to start organizing your menu."
            action={
              <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                Create Category
              </Button>
            }
          />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-12">
          <EmptyState
            icon={<Search size={48} className="text-slate-600" />}
            title="No categories found"
            description="No categories match your current filters and search query."
            action={
              <Button variant="outline" onClick={() => { setFilter('all'); setSearchTerm(''); }}>
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
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Featured</th>
                  <th className="px-6 py-4 font-medium">Sort Order</th>
                  <th className="px-6 py-4 font-medium">Created</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {category.image_url ? (
                          <img src={category.image_url} alt={category.name} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: category.bg_color || '#334155', color: category.text_color || '#f8fafc' }}>
                            {category.icon || category.name.charAt(0)}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-200">{category.name}</span>
                          {category.description && (
                            <span className="text-xs text-slate-500 truncate max-w-[200px]">
                              {category.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {category.archived_at ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400">Archived</span>
                      ) : category.is_active ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">Active</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {category.is_featured ? (
                        <Star size={16} className="text-amber-500 fill-amber-500" />
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {category.sort_order ?? 0}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {formatDate(category.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setDetailsCategory(category)}>
                          View
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditCategory(category)}>
                          Edit
                        </Button>
                        {!category.archived_at && (
                          <Button size="sm" variant="ghost" onClick={() => setArchiveCategoryState(category)}>
                            Archive
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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
          onUploadImage={uploadImage}
        />
      )}

      {editCategory && (
        <CategoryFormModal
          isOpen={!!editCategory}
          onClose={() => setEditCategory(null)}
          category={editCategory}
          onSubmit={handleEditSubmit}
          onUploadImage={uploadImage}
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
