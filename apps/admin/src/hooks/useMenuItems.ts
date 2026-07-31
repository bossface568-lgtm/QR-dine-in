import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { menuItemService } from '@qrdine/lib';
import { categoryService } from '@qrdine/lib';
import { MenuItem, CreateMenuItemPayload, UpdateMenuItemPayload, MenuItemFilterType, MenuItemStatus, Category } from '@qrdine/types';
import { useToast } from '@qrdine/ui';

export function useMenuItems() {
  const { restaurantId, user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filters
  const [filter, setFilter] = useState<MenuItemFilterType>('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedDietaryFilter, setSelectedDietaryFilter] = useState('all');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchMenuItems = useCallback(async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        menuItemService.getMenuItems(restaurantId, { includeArchived: true }),
        categoryService.getCategories(restaurantId)
      ]);
      
      if (itemsResponse.error) {
        toast('Failed to load menu items', 'error');
        console.error(itemsResponse.error);
      } else {
        setItems(itemsResponse.data || []);
      }

      if (categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (err) {
      toast('An unexpected error occurred while loading menu items', 'error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, toast]);

  useEffect(() => {
    fetchMenuItems();
  }, [fetchMenuItems]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // 1. Status/Tab Filter
      const isArchived = item.archived_at !== null;
      if (filter === 'all' && isArchived) return false;
      if (filter === 'active' && (isArchived || item.status !== 'available')) return false;
      if (filter === 'inactive' && (isArchived || item.status === 'available')) return false;
      if (filter === 'featured' && (isArchived || !item.is_featured)) return false;
      if (filter === 'out_of_stock' && (isArchived || item.status !== 'out_of_stock')) return false;
      if (filter === 'archived' && !isArchived) return false;

      // 2. Search Term Filter
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(term);
        const matchesSku = item.sku ? item.sku.toLowerCase().includes(term) : false;
        const matchesCode = item.internal_code ? item.internal_code.toLowerCase().includes(term) : false;
        const matchesSlug = item.slug.toLowerCase().includes(term);
        
        if (!matchesName && !matchesSku && !matchesCode && !matchesSlug) return false;
      }

      // 3. Category Filter
      if (selectedCategoryFilter !== 'all' && item.category_id !== selectedCategoryFilter) return false;

      // 4. Branch Filter
      if (selectedBranchFilter !== 'all' && item.branch_id !== selectedBranchFilter) return false;

      // 5. Status Filter
      if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) return false;

      // 6. Dietary Filter
      if (selectedDietaryFilter !== 'all') {
        if (!item.dietary_tags || !item.dietary_tags.includes(selectedDietaryFilter as any)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  }, [items, filter, searchTerm, selectedCategoryFilter, selectedBranchFilter, selectedStatusFilter, selectedDietaryFilter]);

  const stats = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const isArchived = item.archived_at !== null;
        if (isArchived) {
          acc.archived++;
        } else {
          acc.total++;
          if (item.status === 'available') acc.available++;
          if (item.is_featured) acc.featured++;
          if (item.status === 'out_of_stock') acc.outOfStock++;
        }
        return acc;
      },
      { total: 0, available: 0, featured: 0, outOfStock: 0, archived: 0 }
    );
  }, [items]);

  const createMenuItem = async (payload: CreateMenuItemPayload) => {
    if (!restaurantId || !user) return false;
    const { data, error } = await menuItemService.createMenuItem(restaurantId, user.id, payload);
    if (error) {
      toast('Failed to create menu item', 'error');
      return false;
    }
    toast('Menu item created successfully', 'success');
    fetchMenuItems();
    return true;
  };

  const updateMenuItem = async (id: string, payload: UpdateMenuItemPayload) => {
    if (!restaurantId || !user) return false;
    const { data, error } = await menuItemService.updateMenuItem(restaurantId, user.id, id, payload);
    if (error) {
      toast('Failed to update menu item', 'error');
      return false;
    }
    toast('Menu item updated successfully', 'success');
    fetchMenuItems();
    return true;
  };

  const archiveMenuItem = async (id: string) => {
    if (!restaurantId) return false;
    const { error } = await menuItemService.archiveMenuItem(restaurantId, id);
    if (error) {
      toast('Failed to archive menu item', 'error');
      return false;
    }
    toast('Menu item archived successfully', 'success');
    fetchMenuItems();
    return true;
  };

  const restoreMenuItem = async (id: string) => {
    if (!restaurantId) return false;
    const { error } = await menuItemService.restoreMenuItem(restaurantId, id);
    if (error) {
      toast('Failed to restore menu item', 'error');
      return false;
    }
    toast('Menu item restored successfully', 'success');
    fetchMenuItems();
    return true;
  };

  const duplicateMenuItem = async (id: string) => {
    if (!restaurantId || !user) return false;
    const { error } = await menuItemService.duplicateMenuItem(restaurantId, user.id, id);
    if (error) {
      toast('Failed to duplicate menu item', 'error');
      return false;
    }
    toast('Menu item duplicated successfully', 'success');
    fetchMenuItems();
    return true;
  };

  const setStatus = async (id: string, status: MenuItemStatus) => {
    if (!restaurantId) return false;
    const { error } = await menuItemService.setStatus(restaurantId, id, status);
    if (error) {
      toast('Failed to update status', 'error');
      return false;
    }
    toast('Status updated successfully', 'success');
    fetchMenuItems();
    return true;
  };

  const toggleFeatured = async (id: string, currentFeatured: boolean) => {
    if (!restaurantId) return false;
    const { error } = await menuItemService.toggleFeatured(restaurantId, id, !currentFeatured);
    if (error) {
      toast('Failed to update featured status', 'error');
      return false;
    }
    toast('Featured status updated successfully', 'success');
    fetchMenuItems();
    return true;
  };

  const bulkArchive = async () => {
    if (!restaurantId || selectedIds.length === 0) return false;
    
    const { error } = await menuItemService.bulkArchive(restaurantId, selectedIds);
    if (error) {
      toast('Failed to archive items', 'error');
      return false;
    }
    toast('Items archived successfully', 'success');
    setSelectedIds([]);
    fetchMenuItems();
    return true;
  };

  const bulkSetStatus = async (status: MenuItemStatus) => {
    if (!restaurantId || selectedIds.length === 0) return false;
    
    const { error } = await menuItemService.bulkSetStatus(restaurantId, selectedIds, status);
    if (error) {
      toast('Failed to update status', 'error');
      return false;
    }
    toast('Status updated successfully', 'success');
    setSelectedIds([]);
    fetchMenuItems();
    return true;
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredItems.map(i => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return {
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
    fetchMenuItems,
    createMenuItem,
    updateMenuItem,
    archiveMenuItem,
    restoreMenuItem,
    duplicateMenuItem,
    setStatus,
    toggleFeatured,
    bulkArchive,
    bulkSetStatus,
    toggleSelectAll,
    toggleSelectOne
  };
}
