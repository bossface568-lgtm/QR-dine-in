import { insforge } from '../client';
import {
  PublicRestaurant,
  PublicBranding,
  PublicCategory,
  PublicMenuItem,
  PublicTable,
  PublicBranch,
  PublicRestaurantStatus,
  PublicMenuPayload,
  PublicTableValidationResult,
  ApiResponse,
  Restaurant,
  Category,
  MenuItem,
  Table,
  Branch,
} from '@qrdine/types';
import {
  sanitizeRestaurant,
  sanitizeBranding,
  sanitizeCategory,
  sanitizeMenuItem,
  sanitizeTable,
  sanitizeBranch,
  sanitizeRestaurantStatus,
} from '../utils/public-sanitizer';

export const publicCustomerService = {
  /**
   * Fetch sanitized public restaurant info by unique slug.
   */
  async getPublicRestaurant(slug: string): Promise<ApiResponse<PublicRestaurant>> {
    try {
      const { data, error } = await insforge.database
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'active')
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) {
        return {
          data: null,
          error: { code: 'RESTAURANT_NOT_FOUND', message: 'Restaurant not found or inactive' },
        };
      }

      return { data: sanitizeRestaurant(data[0] as Restaurant), error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch public restaurant' } };
    }
  },

  /**
   * Fetch public branding details (colors, logo, cover image).
   */
  async getPublicBranding(slug: string): Promise<ApiResponse<PublicBranding>> {
    try {
      const { data, error } = await insforge.database
        .from('restaurants')
        .select('name, logo_url, cover_image_url, primary_color, secondary_color, accent_color, description, status')
        .eq('slug', slug)
        .eq('status', 'active')
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) {
        return {
          data: null,
          error: { code: 'RESTAURANT_NOT_FOUND', message: 'Restaurant not found' },
        };
      }

      return { data: sanitizeBranding(data[0] as Restaurant), error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch public branding' } };
    }
  },

  /**
   * Fetch visible and active categories for a restaurant.
   */
  async getPublicCategories(restaurantId: string): Promise<ApiResponse<PublicCategory[]>> {
    try {
      const { data, error } = await insforge.database
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_visible', true)
        .eq('is_active', true)
        .is('archived_at', null)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      const categories = (data || []).map((cat) => sanitizeCategory(cat as Category));
      return { data: categories, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch public categories' } };
    }
  },

  /**
   * Fetch available menu items for a restaurant (optional category filter).
   */
  async getPublicMenuItems(restaurantId: string, categoryId?: string): Promise<ApiResponse<PublicMenuItem[]>> {
    try {
      let query = insforge.database
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('status', 'available')
        .is('archived_at', null);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });

      if (error) throw error;
      const items = (data || []).map((item) => sanitizeMenuItem(item as MenuItem));
      return { data: items, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch public menu items' } };
    }
  },

  /**
   * Fetch details for a single menu item by ID.
   */
  async getPublicMenuItem(menuItemId: string): Promise<ApiResponse<PublicMenuItem>> {
    try {
      const { data, error } = await insforge.database
        .from('menu_items')
        .select('*')
        .eq('id', menuItemId)
        .eq('status', 'available')
        .is('archived_at', null)
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) {
        return {
          data: null,
          error: { code: 'ITEM_NOT_FOUND', message: 'Menu item not found or unavailable' },
        };
      }

      return { data: sanitizeMenuItem(data[0] as MenuItem), error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch public menu item' } };
    }
  },

  /**
   * Validate table token and resolve associated restaurant, branch, and table info.
   * Multi-level security validation:
   * 1. Table existence & active state
   * 2. Branch active state
   * 3. Restaurant existence & active state
   * 4. Table ownership matching restaurant
   */
  async resolveTableToken(slug: string, tableToken: string): Promise<PublicTableValidationResult> {
    try {
      // 1. Fetch table by token
      const { data: tableRows, error: tableErr } = await insforge.database
        .from('tables')
        .select('*')
        .eq('table_token', tableToken.trim().toUpperCase())
        .is('archived_at', null)
        .limit(1);

      if (tableErr || !tableRows || tableRows.length === 0) {
        return {
          valid: false,
          restaurant: null as any,
          branch: null as any,
          table: null as any,
          error: { code: 'TABLE_NOT_FOUND', message: 'Table QR code is invalid or has been removed' },
        };
      }

      const tableRaw = tableRows[0] as Table;

      if (!tableRaw.is_active) {
        return {
          valid: false,
          restaurant: null as any,
          branch: null as any,
          table: null as any,
          error: { code: 'TABLE_INACTIVE', message: 'This table is currently inactive or out of service' },
        };
      }

      // 2. Fetch associated restaurant
      const { data: restRows, error: restErr } = await insforge.database
        .from('restaurants')
        .select('*')
        .eq('id', tableRaw.restaurant_id)
        .limit(1);

      if (restErr || !restRows || restRows.length === 0) {
        return {
          valid: false,
          restaurant: null as any,
          branch: null as any,
          table: null as any,
          error: { code: 'RESTAURANT_NOT_FOUND', message: 'Restaurant not found' },
        };
      }

      const restRaw = restRows[0] as Restaurant;

      if (restRaw.slug !== slug) {
        return {
          valid: false,
          restaurant: null as any,
          branch: null as any,
          table: null as any,
          error: { code: 'TABLE_NOT_FOUND', message: 'Table token does not belong to this restaurant' },
        };
      }

      if (restRaw.status !== 'active') {
        return {
          valid: false,
          restaurant: null as any,
          branch: null as any,
          table: null as any,
          error: { code: 'RESTAURANT_UNAVAILABLE', message: 'This restaurant is currently inactive' },
        };
      }

      // 3. Fetch branch
      let branchSanitized: PublicBranch | null = null;
      if (tableRaw.branch_id) {
        const { data: branchRows } = await insforge.database
          .from('branches')
          .select('*')
          .eq('id', tableRaw.branch_id)
          .limit(1);

        if (branchRows && branchRows.length > 0) {
          const branchRaw = branchRows[0] as Branch;
          if (!branchRaw.is_active) {
            return {
              valid: false,
              restaurant: null as any,
              branch: null as any,
              table: null as any,
              error: { code: 'BRANCH_INACTIVE', message: 'This branch is currently closed or inactive' },
            };
          }
          branchSanitized = sanitizeBranch(branchRaw);
        }
      }

      return {
        valid: true,
        restaurant: sanitizeRestaurant(restRaw),
        branch: branchSanitized || {
          id: 'default',
          name: 'Main Branch',
          branch_code: 'MAIN',
          address: null,
          phone: null,
          is_active: true,
        },
        table: sanitizeTable(tableRaw),
      };
    } catch (err: any) {
      return {
        valid: false,
        restaurant: null as any,
        branch: null as any,
        table: null as any,
        error: { code: 'TABLE_NOT_FOUND', message: err.message || 'Validation failed' },
      };
    }
  },

  /**
   * Fetch operational status (is_active, accept_orders, business hours open status).
   */
  async getPublicRestaurantStatus(slug: string): Promise<ApiResponse<PublicRestaurantStatus>> {
    try {
      const { data, error } = await insforge.database
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .limit(1);

      if (error) throw error;
      if (!data || data.length === 0) {
        return {
          data: null,
          error: { code: 'RESTAURANT_NOT_FOUND', message: 'Restaurant not found' },
        };
      }

      return { data: sanitizeRestaurantStatus(data[0] as Restaurant), error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch restaurant status' } };
    }
  },

  /**
   * Batch API: Optimized initial menu payload containing Restaurant, Branding, Categories, Menu Items, and Session Info in parallel database requests.
   */
  async getPublicFullMenu(slug: string, tableToken?: string): Promise<ApiResponse<PublicMenuPayload>> {
    try {
      // 1. Resolve Table & Restaurant if tableToken provided, or fetch Restaurant by slug
      let pubRest: PublicRestaurant | null = null;
      let pubBranch: PublicBranch | null = null;
      let pubTable: PublicTable | null = null;
      let rawRest: Restaurant | null = null;

      if (tableToken) {
        const tableResult = await this.resolveTableToken(slug, tableToken);
        if (!tableResult.valid) {
          return {
            data: null,
            error: {
              code: tableResult.error?.code || 'TABLE_INVALID',
              message: tableResult.error?.message || 'Table token validation failed',
            },
          };
        }
        pubRest = tableResult.restaurant;
        pubBranch = tableResult.branch;
        pubTable = tableResult.table;
      } else {
        const restResult = await this.getPublicRestaurant(slug);
        if (restResult.error || !restResult.data) {
          return {
            data: null,
            error: restResult.error || { code: 'RESTAURANT_NOT_FOUND', message: 'Restaurant not found' },
          };
        }
        pubRest = restResult.data;
      }

      // Fetch raw restaurant for full branding/status calculations
      const { data: rawRestRows } = await insforge.database
        .from('restaurants')
        .select('*')
        .eq('id', pubRest.id)
        .limit(1);

      if (rawRestRows && rawRestRows.length > 0) {
        rawRest = rawRestRows[0] as Restaurant;
      }

      // 2. Fetch Categories & Menu Items in parallel
      const [catResult, itemsResult] = await Promise.all([
        this.getPublicCategories(pubRest.id),
        this.getPublicMenuItems(pubRest.id),
      ]);

      const branding = rawRest ? sanitizeBranding(rawRest) : {
        name: pubRest.name,
        logo_url: pubRest.logo_url,
        cover_image_url: pubRest.cover_image_url,
        primary_color: '#f97316',
        secondary_color: '#0f172a',
        accent_color: '#06b6d4',
        description: pubRest.description,
      };

      const status = rawRest ? sanitizeRestaurantStatus(rawRest) : {
        is_active: pubRest.status === 'active',
        accept_orders: pubRest.accept_orders,
        is_open: true,
        opening_time: pubRest.opening_time,
        closing_time: pubRest.closing_time,
        business_days: pubRest.business_days,
        timezone: pubRest.timezone,
      };

      return {
        data: {
          restaurant: pubRest,
          branding,
          branch: pubBranch,
          table: pubTable,
          categories: catResult.data || [],
          items: itemsResult.data || [],
          status,
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to load public menu payload' } };
    }
  },
};
