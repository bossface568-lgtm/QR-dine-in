import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { categoryService } from '@qrdine/lib';
import { Category, CreateCategoryPayload, UpdateCategoryPayload, CategoryFilterType } from '@qrdine/types';
import { useToast } from '@qrdine/ui';

export function useCategories() {
  const { restaurantId, user } = useAuth();
  const { toast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<CategoryFilterType>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');

  const fetchCategories = useCallback(async () => {
    if (!restaurantId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const branchIdParam = selectedBranchFilter !== 'all' ? selectedBranchFilter : undefined;
      const res = await categoryService.getCategories(restaurantId, branchIdParam, true);
      if (res.error) {
        toast(res.error.message, 'error');
      } else if (res.data) {
        setCategories(res.data);
      }
    } catch (err: any) {
      toast(err.message || 'Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, selectedBranchFilter, toast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // 1. Filter by tab status
    switch (filter) {
      case 'active':
        result = result.filter(c => c.is_active && !c.archived_at);
        break;
      case 'inactive':
        result = result.filter(c => !c.is_active && !c.archived_at);
        break;
      case 'featured':
        result = result.filter(c => c.is_featured && !c.archived_at);
        break;
      case 'archived':
        result = result.filter(c => c.archived_at !== null);
        break;
      case 'all':
      default:
        result = result.filter(c => !c.archived_at);
        break;
    }

    // 2. Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        c =>
          c.name.toLowerCase().includes(term) ||
          c.slug.toLowerCase().includes(term) ||
          (c.description && c.description.toLowerCase().includes(term))
      );
    }

    // 3. Sort by sort_order ascending
    return result.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [categories, filter, searchTerm]);

  const stats = useMemo(() => {
    const allNotArchived = categories.filter(c => !c.archived_at);
    return {
      total: allNotArchived.length,
      active: allNotArchived.filter(c => c.is_active).length,
      featured: allNotArchived.filter(c => c.is_featured).length,
      archived: categories.filter(c => c.archived_at !== null).length,
    };
  }, [categories]);

  const createCategory = async (payload: CreateCategoryPayload): Promise<boolean> => {
    if (!restaurantId || !user) {
      toast('Authentication error: Missing restaurant or user context.', 'error');
      return false;
    }
    try {
      const res = await categoryService.createCategory(restaurantId, user.id, payload);
      if (res.error) {
        toast(res.error.message, 'error');
        return false;
      }
      toast(`Category "${payload.name}" created successfully!`, 'success');
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast(err.message || 'Failed to create category', 'error');
      return false;
    }
  };

  const updateCategory = async (id: string, payload: UpdateCategoryPayload): Promise<boolean> => {
    if (!restaurantId || !user) {
      toast('Authentication error: Missing restaurant or user context.', 'error');
      return false;
    }
    try {
      const res = await categoryService.updateCategory(restaurantId, user.id, id, payload);
      if (res.error) {
        toast(res.error.message, 'error');
        return false;
      }
      toast('Category updated successfully!', 'success');
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast(err.message || 'Failed to update category', 'error');
      return false;
    }
  };

  const archiveCategory = async (id: string): Promise<boolean> => {
    if (!restaurantId) return false;
    try {
      const res = await categoryService.archiveCategory(restaurantId, id);
      if (res.error) {
        toast(res.error.message, 'error');
        return false;
      }
      toast('Category archived successfully!', 'success');
      setSelectedIds(prev => prev.filter(i => i !== id));
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast(err.message || 'Failed to archive category', 'error');
      return false;
    }
  };

  const restoreCategory = async (id: string): Promise<boolean> => {
    if (!restaurantId) return false;
    try {
      const res = await categoryService.restoreCategory(restaurantId, id);
      if (res.error) {
        toast(res.error.message, 'error');
        return false;
      }
      toast('Category restored successfully!', 'success');
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast(err.message || 'Failed to restore category', 'error');
      return false;
    }
  };

  const duplicateCategory = async (id: string): Promise<boolean> => {
    if (!restaurantId || !user) return false;
    try {
      const res = await categoryService.duplicateCategory(restaurantId, user.id, id);
      if (res.error) {
        toast(res.error.message, 'error');
        return false;
      }
      toast('Category duplicated successfully!', 'success');
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast(err.message || 'Failed to duplicate category', 'error');
      return false;
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean): Promise<boolean> => {
    if (!restaurantId) return false;
    try {
      const res = await categoryService.toggleCategoryStatus(restaurantId, id, !currentStatus);
      if (res.error) {
        toast(res.error.message, 'error');
        return false;
      }
      toast(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast(err.message || 'Failed to toggle category status', 'error');
      return false;
    }
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean): Promise<boolean> => {
    if (!restaurantId) return false;
    try {
      const res = await categoryService.toggleFeatured(restaurantId, id, !currentFeatured);
      if (res.error) {
        toast(res.error.message, 'error');
        return false;
      }
      toast(`Category ${!currentFeatured ? 'featured' : 'unfeatured'} successfully!`, 'success');
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast(err.message || 'Failed to toggle featured status', 'error');
      return false;
    }
  };

  const reorderCategories = async (items: { id: string; sort_order: number }[]): Promise<boolean> => {
    if (!restaurantId) return false;
    try {
      const res = await categoryService.reorderCategories(restaurantId, items);
      if (res.error) {
        toast(res.error.message, 'error');
        return false;
      }
      toast('Categories reordered successfully!', 'success');
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast(err.message || 'Failed to reorder categories', 'error');
      return false;
    }
  };

  const bulkArchive = async (): Promise<boolean> => {
    if (!restaurantId || !selectedIds.length) return false;
    try {
      const res = await categoryService.bulkArchiveCategories(restaurantId, selectedIds);
      if (res.error) {
        toast(res.error.message, 'error');
        return false;
      }
      toast(`${selectedIds.length} categories archived successfully!`, 'success');
      setSelectedIds([]);
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast(err.message || 'Failed to bulk archive categories', 'error');
      return false;
    }
  };

  const bulkToggleStatus = async (isActive: boolean): Promise<boolean> => {
    if (!restaurantId || !selectedIds.length) return false;
    try {
      const res = await categoryService.bulkToggleStatus(restaurantId, selectedIds, isActive);
      if (res.error) {
        toast(res.error.message, 'error');
        return false;
      }
      toast(`${selectedIds.length} categories ${isActive ? 'activated' : 'deactivated'}!`, 'success');
      setSelectedIds([]);
      await fetchCategories();
      return true;
    } catch (err: any) {
      toast(err.message || 'Failed to update categories status', 'error');
      return false;
    }
  };

  const toggleSelectAll = () => {
    const allFilteredIds = filteredCategories.map(c => c.id);
    if (selectedIds.length === allFilteredIds.length && allFilteredIds.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allFilteredIds);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return {
    categories,
    filteredCategories,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    selectedIds,
    setSelectedIds,
    selectedBranchFilter,
    setSelectedBranchFilter,
    toggleSelectAll,
    toggleSelectOne,
    refreshCategories: fetchCategories,
    createCategory,
    updateCategory,
    archiveCategory,
    restoreCategory,
    duplicateCategory,
    toggleStatus,
    toggleFeatured,
    reorderCategories,
    bulkArchive,
    bulkToggleStatus,
  };
}
