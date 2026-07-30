import { insforge } from '../client';
import { Category, CreateCategoryPayload, UpdateCategoryPayload, ApiResponse } from '@qrdine/types';
import { generateSlug } from '@qrdine/shared';

export const categoryService = {
  async getCategories(restaurantId: string, branchId?: string, includeArchived: boolean = false): Promise<ApiResponse<Category[]>> {
    try {
      let query = insforge
        .database
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (!includeArchived) {
        query = query.is('archived_at', null);
      }

      if (branchId) {
        query = query.eq('branch_id', branchId);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async getCategory(restaurantId: string, categoryId: string): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await insforge
        .database
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('id', categoryId);

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;
      if (!item) return { data: null, error: { message: 'Category not found' } };

      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async createCategory(restaurantId: string, userId: string, payload: CreateCategoryPayload): Promise<ApiResponse<Category>> {
    try {
      let slug = payload.slug;
      if (!slug) {
        slug = generateSlug(payload.name);
        const suffix = Math.random().toString(36).substring(2, 6);
        slug = `${slug}-${suffix}`;
      }

      let sort_order = payload.sort_order;
      if (sort_order === undefined) {
        const { data: maxOrderData } = await insforge
          .database
          .from('menu_categories')
          .select('sort_order')
          .eq('restaurant_id', restaurantId)
          .order('sort_order', { ascending: false })
          .limit(1);
          
        const highestItem = (Array.isArray(maxOrderData) && maxOrderData.length > 0) ? maxOrderData[0] : null;
        sort_order = highestItem ? (highestItem.sort_order + 1) : 0;
      }

      const insertRecord: Record<string, any> = {
        restaurant_id: restaurantId,
        created_by: userId,
        name: payload.name,
        slug,
        sort_order,
        description: payload.description || null,
        image_url: payload.image_url || null,
        icon: payload.icon || null,
        bg_color: payload.bg_color || '#1e293b',
        text_color: payload.text_color || '#f8fafc',
        is_visible: payload.is_visible ?? true,
        is_active: payload.is_active ?? true,
        is_featured: payload.is_featured ?? false,
        available_from: payload.available_from || null,
        available_until: payload.available_until || null,
        available_days: payload.available_days || ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],
        seo_title: payload.seo_title || null,
        seo_description: payload.seo_description || null,
        branch_id: payload.branch_id || null,
      };

      const { data, error } = await insforge
        .database
        .from('menu_categories')
        .insert([insertRecord])
        .select();

      if (error) throw error;
      const createdItem = Array.isArray(data) ? data[0] : data;
      
      return { data: createdItem, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async updateCategory(restaurantId: string, userId: string, categoryId: string, payload: UpdateCategoryPayload): Promise<ApiResponse<Category>> {
    try {
      const updateRecord: Record<string, any> = {
        updated_by: userId,
        updated_at: new Date().toISOString(),
      };

      if (payload.name !== undefined) updateRecord.name = payload.name;
      if (payload.slug !== undefined) updateRecord.slug = payload.slug;
      if (payload.description !== undefined) updateRecord.description = payload.description;
      if (payload.image_url !== undefined) updateRecord.image_url = payload.image_url;
      if (payload.icon !== undefined) updateRecord.icon = payload.icon;
      if (payload.bg_color !== undefined) updateRecord.bg_color = payload.bg_color;
      if (payload.text_color !== undefined) updateRecord.text_color = payload.text_color;
      if (payload.is_visible !== undefined) updateRecord.is_visible = payload.is_visible;
      if (payload.is_active !== undefined) updateRecord.is_active = payload.is_active;
      if (payload.is_featured !== undefined) updateRecord.is_featured = payload.is_featured;
      if (payload.available_from !== undefined) updateRecord.available_from = payload.available_from;
      if (payload.available_until !== undefined) updateRecord.available_until = payload.available_until;
      if (payload.available_days !== undefined) updateRecord.available_days = payload.available_days;
      if (payload.seo_title !== undefined) updateRecord.seo_title = payload.seo_title;
      if (payload.seo_description !== undefined) updateRecord.seo_description = payload.seo_description;
      if (payload.branch_id !== undefined) updateRecord.branch_id = payload.branch_id;
      if (payload.sort_order !== undefined) updateRecord.sort_order = payload.sort_order;

      const { data, error } = await insforge
        .database
        .from('menu_categories')
        .update(updateRecord)
        .eq('restaurant_id', restaurantId)
        .eq('id', categoryId)
        .select();

      if (error) throw error;
      const updatedItem = Array.isArray(data) ? data[0] : data;
      
      return { data: updatedItem, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async archiveCategory(restaurantId: string, categoryId: string): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await insforge
        .database
        .from('menu_categories')
        .update({
          archived_at: new Date().toISOString(),
          is_active: false
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', categoryId)
        .select();

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;
      
      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async restoreCategory(restaurantId: string, categoryId: string): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await insforge
        .database
        .from('menu_categories')
        .update({
          archived_at: null,
          is_active: true
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', categoryId)
        .select();

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;
      
      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async duplicateCategory(restaurantId: string, userId: string, categoryId: string): Promise<ApiResponse<Category>> {
    try {
      const { data: fetchResult, error: fetchError } = await insforge
        .database
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('id', categoryId);

      if (fetchError) throw fetchError;
      const original = Array.isArray(fetchResult) ? fetchResult[0] : fetchResult;
      if (!original) throw new Error('Category not found');

      const { data: maxOrderData } = await insforge
        .database
        .from('menu_categories')
        .select('sort_order')
        .eq('restaurant_id', restaurantId)
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
        updated_by: null
      };

      const { data, error } = await insforge
        .database
        .from('menu_categories')
        .insert([duplicatePayload])
        .select();

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;
      
      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async toggleCategoryStatus(restaurantId: string, categoryId: string, isActive: boolean): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await insforge
        .database
        .from('menu_categories')
        .update({ is_active: isActive })
        .eq('restaurant_id', restaurantId)
        .eq('id', categoryId)
        .select();

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;
      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async toggleFeatured(restaurantId: string, categoryId: string, isFeatured: boolean): Promise<ApiResponse<Category>> {
    try {
      const { data, error } = await insforge
        .database
        .from('menu_categories')
        .update({ is_featured: isFeatured })
        .eq('restaurant_id', restaurantId)
        .eq('id', categoryId)
        .select();

      if (error) throw error;
      const item = Array.isArray(data) ? data[0] : data;
      return { data: item, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  },

  async reorderCategories(restaurantId: string, items: { id: string; sort_order: number }[]): Promise<ApiResponse<boolean>> {
    try {
      for (const item of items) {
        const { error } = await insforge
          .database
          .from('menu_categories')
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

  async uploadCategoryImage(file: File): Promise<ApiResponse<{ url: string; key: string }>> {
    try {
      const path = `categories/${Date.now()}_${file.name}`;
      
      const { data, error } = await insforge
        .storage
        .from('menu-images')
        .upload(path, file);

      if (error) throw error;
      
      const url = (data as any)?.url || `https://vy3qe8cs.ap-southeast.insforge.app/storage/v1/object/public/menu-images/${path}`;
      const key = (data as any)?.path || path;
      
      return { data: { url, key }, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }
};
