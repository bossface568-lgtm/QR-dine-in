import { insforge } from '../client';
import { MenuCategory, MenuItem, ApiResponse } from '@qrdine/types';

export const menuService = {
  async getCategories(restaurantId: string): Promise<ApiResponse<MenuCategory[]>> {
    try {
      const { data, error } = await insforge.database
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch categories' } };
    }
  },

  async createCategory(categoryData: Partial<MenuCategory>): Promise<ApiResponse<MenuCategory>> {
    try {
      const { data, error } = await insforge.database
        .from('menu_categories')
        .insert(categoryData)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to create category' } };
    }
  },

  async updateCategory(id: string, categoryData: Partial<MenuCategory>): Promise<ApiResponse<MenuCategory>> {
    try {
      const { data, error } = await insforge.database
        .from('menu_categories')
        .update(categoryData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to update category' } };
    }
  },

  async deleteCategory(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await insforge.database
        .from('menu_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to delete category' } };
    }
  },

  async getMenuItems(restaurantId: string, categoryId?: string): Promise<ApiResponse<MenuItem[]>> {
    try {
      let query = insforge.database
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch menu items' } };
    }
  },

  async getMenuItem(id: string): Promise<ApiResponse<MenuItem>> {
    try {
      const { data, error } = await insforge.database
        .from('menu_items')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch menu item' } };
    }
  },

  async createMenuItem(itemData: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> {
    try {
      const { data, error } = await insforge.database
        .from('menu_items')
        .insert(itemData)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to create menu item' } };
    }
  },

  async updateMenuItem(id: string, itemData: Partial<MenuItem>): Promise<ApiResponse<MenuItem>> {
    try {
      const { data, error } = await insforge.database
        .from('menu_items')
        .update(itemData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to update menu item' } };
    }
  },

  async deleteMenuItem(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await insforge.database
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to delete menu item' } };
    }
  },

  async toggleMenuItemAvailability(id: string, isAvailable: boolean): Promise<ApiResponse<MenuItem>> {
    return this.updateMenuItem(id, { is_available: isAvailable });
  },

  async getFullMenu(restaurantId: string): Promise<ApiResponse<(MenuCategory & { items: MenuItem[] })[]>> {
    try {
      const categoriesResult = await this.getCategories(restaurantId);
      if (categoriesResult.error) throw new Error(categoriesResult.error.message);

      const itemsResult = await this.getMenuItems(restaurantId);
      if (itemsResult.error) throw new Error(itemsResult.error.message);

      const categories = categoriesResult.data || [];
      const items = itemsResult.data || [];

      const fullMenu = categories.map(cat => ({
        ...cat,
        items: items.filter(item => item.category_id === cat.id),
      }));

      return { data: fullMenu, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch full menu' } };
    }
  }
};
