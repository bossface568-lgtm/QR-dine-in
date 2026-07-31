import { insforge } from '../client';
import { MenuItem, CreateMenuItemPayload, UpdateMenuItemPayload, MenuItemStatus, ApiResponse, Category } from '@qrdine/types';
import { generateSlug } from '@qrdine/shared';

/**
 * Menu Item Service — Production-grade service for menu item CRUD operations.
 * All methods enforce tenant isolation via restaurant_id scoping.
 * Follows the exact pattern established by categoryService.
 */
export const menuItemService = {
  /**
   * Fetch all menu items for a restaurant with optional filters
   */
  async getMenuItems(
    restaurantId: string,
    options?: {
      categoryId?: string;
      branchId?: string;
      status?: MenuItemStatus;
      includeArchived?: boolean;
    }
  ): Promise<ApiResponse<MenuItem[]>> {
    try {
      let query = insforge
        .database
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (!options?.includeArchived) {
        query = query.is('archived_at', null);
      }

      if (options?.categoryId) {
        query = query.eq('category_id', options.categoryId);
      }

      if (options?.branchId) {
        query = query.eq('branch_id', options.branchId);
      }

      if (options?.status) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Fetch a single menu item by ID with tenant scoping
   */
  async getMenuItem(restaurantId: string, itemId: string): Promise<ApiResponse<MenuItem>> {
    try {
      const { data, error } = await insforge
        .database
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('id', itemId);

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;
      if (!item) return { data: null, error: { message: 'Menu item not found' } };

      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Check if a slug is available within a restaurant (for menu items)
   */
  async checkSlugAvailable(restaurantId: string, slug: string, excludeId?: string): Promise<ApiResponse<boolean>> {
    try {
      let query = insforge
        .database
        .from('menu_items')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('slug', slug.trim());

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const exists = Array.isArray(data) && data.length > 0;
      return { data: !exists, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Create a new menu item
   */
  async createMenuItem(restaurantId: string, userId: string, payload: CreateMenuItemPayload): Promise<ApiResponse<MenuItem>> {
    try {
      // Generate and deduplicate slug
      let slug = payload.slug ? payload.slug.trim() : generateSlug(payload.name);

      const slugCheck = await this.checkSlugAvailable(restaurantId, slug);
      if (!slugCheck.data) {
        const suffix = Math.random().toString(36).substring(2, 6);
        slug = `${slug}-${suffix}`;
      }

      // Auto-calculate sort order if not provided
      let sort_order = payload.sort_order;
      if (sort_order === undefined) {
        const { data: maxOrderData } = await insforge
          .database
          .from('menu_items')
          .select('sort_order')
          .eq('restaurant_id', restaurantId)
          .eq('category_id', payload.category_id)
          .order('sort_order', { ascending: false })
          .limit(1);

        const highestItem = (Array.isArray(maxOrderData) && maxOrderData.length > 0) ? maxOrderData[0] : null;
        sort_order = highestItem ? (highestItem.sort_order + 1) : 0;
      }

      const insertRecord: Record<string, any> = {
        restaurant_id: restaurantId,
        created_by: userId,
        category_id: payload.category_id,
        branch_id: payload.branch_id || null,
        name: payload.name.trim(),
        short_name: payload.short_name ? payload.short_name.trim() : null,
        slug,
        description: payload.description ? payload.description.trim() : null,
        short_description: payload.short_description ? payload.short_description.trim() : null,
        base_price: payload.base_price,
        compare_at_price: payload.compare_at_price ?? null,
        tax_category: payload.tax_category || null,
        sku: payload.sku ? payload.sku.trim() : null,
        internal_code: payload.internal_code ? payload.internal_code.trim() : null,
        barcode: payload.barcode ? payload.barcode.trim() : null,
        image_url: payload.image_url || null,
        gallery_json: payload.gallery_json || [],
        dietary_tags: payload.dietary_tags || [],
        allergens: payload.allergens || [],
        preparation_time: payload.preparation_time ?? null,
        calories: payload.calories ?? null,
        spice_level: payload.spice_level ?? 0,
        status: payload.status || 'available',
        sort_order,
        is_featured: payload.is_featured ?? false,
        is_new: payload.is_new ?? false,
        is_best_seller: payload.is_best_seller ?? false,
        is_chef_special: payload.is_chef_special ?? false,
        is_seasonal: payload.is_seasonal ?? false,
        available_from: payload.available_from || null,
        available_until: payload.available_until || null,
        available_days: payload.available_days || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        branch_availability: payload.branch_availability || [],
        metadata_json: payload.metadata_json || {},
      };

      const { data, error } = await insforge
        .database
        .from('menu_items')
        .insert([insertRecord])
        .select();

      if (error) throw error;
      const createdItem = Array.isArray(data) ? data[0] : data;

      return { data: createdItem, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Update an existing menu item
   */
  async updateMenuItem(restaurantId: string, userId: string, itemId: string, payload: UpdateMenuItemPayload): Promise<ApiResponse<MenuItem>> {
    try {
      const updateRecord: Record<string, any> = {
        updated_by: userId,
        updated_at: new Date().toISOString(),
      };

      if (payload.name !== undefined) updateRecord.name = payload.name.trim();
      if (payload.short_name !== undefined) updateRecord.short_name = payload.short_name ? payload.short_name.trim() : null;
      if (payload.slug !== undefined) updateRecord.slug = payload.slug.trim();
      if (payload.description !== undefined) updateRecord.description = payload.description ? payload.description.trim() : null;
      if (payload.short_description !== undefined) updateRecord.short_description = payload.short_description ? payload.short_description.trim() : null;
      if (payload.category_id !== undefined) updateRecord.category_id = payload.category_id;
      if (payload.branch_id !== undefined) updateRecord.branch_id = payload.branch_id || null;
      if (payload.base_price !== undefined) updateRecord.base_price = payload.base_price;
      if (payload.compare_at_price !== undefined) updateRecord.compare_at_price = payload.compare_at_price;
      if (payload.tax_category !== undefined) updateRecord.tax_category = payload.tax_category;
      if (payload.sku !== undefined) updateRecord.sku = payload.sku ? payload.sku.trim() : null;
      if (payload.internal_code !== undefined) updateRecord.internal_code = payload.internal_code ? payload.internal_code.trim() : null;
      if (payload.barcode !== undefined) updateRecord.barcode = payload.barcode ? payload.barcode.trim() : null;
      if (payload.image_url !== undefined) updateRecord.image_url = payload.image_url;
      if (payload.gallery_json !== undefined) updateRecord.gallery_json = payload.gallery_json;
      if (payload.dietary_tags !== undefined) updateRecord.dietary_tags = payload.dietary_tags;
      if (payload.allergens !== undefined) updateRecord.allergens = payload.allergens;
      if (payload.preparation_time !== undefined) updateRecord.preparation_time = payload.preparation_time;
      if (payload.calories !== undefined) updateRecord.calories = payload.calories;
      if (payload.spice_level !== undefined) updateRecord.spice_level = payload.spice_level;
      if (payload.status !== undefined) updateRecord.status = payload.status;
      if (payload.sort_order !== undefined) updateRecord.sort_order = payload.sort_order;
      if (payload.is_featured !== undefined) updateRecord.is_featured = payload.is_featured;
      if (payload.is_new !== undefined) updateRecord.is_new = payload.is_new;
      if (payload.is_best_seller !== undefined) updateRecord.is_best_seller = payload.is_best_seller;
      if (payload.is_chef_special !== undefined) updateRecord.is_chef_special = payload.is_chef_special;
      if (payload.is_seasonal !== undefined) updateRecord.is_seasonal = payload.is_seasonal;
      if (payload.available_from !== undefined) updateRecord.available_from = payload.available_from;
      if (payload.available_until !== undefined) updateRecord.available_until = payload.available_until;
      if (payload.available_days !== undefined) updateRecord.available_days = payload.available_days;
      if (payload.branch_availability !== undefined) updateRecord.branch_availability = payload.branch_availability;
      if (payload.metadata_json !== undefined) updateRecord.metadata_json = payload.metadata_json;

      const { data, error } = await insforge
        .database
        .from('menu_items')
        .update(updateRecord)
        .eq('restaurant_id', restaurantId)
        .eq('id', itemId)
        .select();

      if (error) throw error;
      const updatedItem = Array.isArray(data) ? data[0] : data;

      return { data: updatedItem, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Archive a menu item (soft delete)
   */
  async archiveMenuItem(restaurantId: string, itemId: string): Promise<ApiResponse<MenuItem>> {
    try {
      const { data, error } = await insforge
        .database
        .from('menu_items')
        .update({
          archived_at: new Date().toISOString(),
          status: 'discontinued'
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', itemId)
        .select();

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;

      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Restore a menu item from archive
   */
  async restoreMenuItem(restaurantId: string, itemId: string): Promise<ApiResponse<MenuItem>> {
    try {
      const { data, error } = await insforge
        .database
        .from('menu_items')
        .update({
          archived_at: null,
          status: 'available'
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', itemId)
        .select();

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;

      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Duplicate a menu item
   */
  async duplicateMenuItem(restaurantId: string, userId: string, itemId: string): Promise<ApiResponse<MenuItem>> {
    try {
      const { data: fetchResult, error: fetchError } = await insforge
        .database
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('id', itemId);

      if (fetchError) throw fetchError;
      const original = Array.isArray(fetchResult) ? fetchResult[0] : fetchResult;
      if (!original) throw new Error('Menu item not found');

      // Calculate next sort order
      const { data: maxOrderData } = await insforge
        .database
        .from('menu_items')
        .select('sort_order')
        .eq('restaurant_id', restaurantId)
        .eq('category_id', original.category_id)
        .order('sort_order', { ascending: false })
        .limit(1);

      const highestItem = (Array.isArray(maxOrderData) && maxOrderData.length > 0) ? maxOrderData[0] : null;
      const nextSortOrder = highestItem ? (highestItem.sort_order + 1) : 0;
      const suffix = Math.random().toString(36).substring(2, 6);
      const newSlug = `${original.slug}-copy-${suffix}`;

      const {
        id, created_at, updated_at, archived_at,
        ...fieldsToCopy
      } = original;

      const duplicatePayload = {
        ...fieldsToCopy,
        name: `${original.name} (Copy)`,
        slug: newSlug,
        sort_order: nextSortOrder,
        created_by: userId,
        updated_by: null,
        status: 'available',
      };

      const { data, error } = await insforge
        .database
        .from('menu_items')
        .insert([duplicatePayload])
        .select();

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;

      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Change menu item status
   */
  async setStatus(restaurantId: string, itemId: string, status: MenuItemStatus): Promise<ApiResponse<MenuItem>> {
    try {
      const { data, error } = await insforge
        .database
        .from('menu_items')
        .update({ status })
        .eq('restaurant_id', restaurantId)
        .eq('id', itemId)
        .select();

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;
      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Toggle featured status
   */
  async toggleFeatured(restaurantId: string, itemId: string, isFeatured: boolean): Promise<ApiResponse<MenuItem>> {
    try {
      const { data, error } = await insforge
        .database
        .from('menu_items')
        .update({ is_featured: isFeatured })
        .eq('restaurant_id', restaurantId)
        .eq('id', itemId)
        .select();

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;
      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Reorder menu items within a category
   */
  async reorderMenuItems(restaurantId: string, items: { id: string; sort_order: number }[]): Promise<ApiResponse<boolean>> {
    try {
      for (const item of items) {
        const { error } = await insforge
          .database
          .from('menu_items')
          .update({ sort_order: item.sort_order })
          .eq('restaurant_id', restaurantId)
          .eq('id', item.id);

        if (error) throw error;
      }

      return { data: true, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Bulk archive menu items
   */
  async bulkArchive(restaurantId: string, itemIds: string[]): Promise<ApiResponse<boolean>> {
    try {
      if (!itemIds.length) return { data: true, error: null };

      for (const id of itemIds) {
        const { error } = await insforge
          .database
          .from('menu_items')
          .update({
            archived_at: new Date().toISOString(),
            status: 'discontinued'
          })
          .eq('restaurant_id', restaurantId)
          .eq('id', id);

        if (error) throw error;
      }

      return { data: true, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Bulk set status on menu items
   */
  async bulkSetStatus(restaurantId: string, itemIds: string[], status: MenuItemStatus): Promise<ApiResponse<boolean>> {
    try {
      if (!itemIds.length) return { data: true, error: null };

      for (const id of itemIds) {
        const { error } = await insforge
          .database
          .from('menu_items')
          .update({ status })
          .eq('restaurant_id', restaurantId)
          .eq('id', id);

        if (error) throw error;
      }

      return { data: true, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  /**
   * Get menu item count statistics
   */
  async getMenuItemStats(restaurantId: string, categoryId?: string): Promise<ApiResponse<{ total: number; active: number; featured: number; archived: number }>> {
    try {
      let query = insforge
        .database
        .from('menu_items')
        .select('id, status, is_featured, archived_at')
        .eq('restaurant_id', restaurantId);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const items = data || [];
      const notArchived = items.filter((i: any) => !i.archived_at);
      return {
        data: {
          total: notArchived.length,
          active: notArchived.filter((i: any) => i.status === 'available').length,
          featured: notArchived.filter((i: any) => i.is_featured).length,
          archived: items.filter((i: any) => i.archived_at !== null).length,
        },
        error: null
      };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },
};
