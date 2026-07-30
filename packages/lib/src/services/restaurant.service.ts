import { insforge } from '../client';
import { Restaurant, RestaurantUser, Branch, Role, Staff, ApiResponse } from '@qrdine/types';

export interface OnboardingPayload {
  // Restaurant Info
  name: string;
  slug: string;
  restaurant_type: string;
  phone: string;
  email: string;
  gst_number?: string;
  timezone: string;
  currency: string;
  logo_url?: string;

  // Branch Info
  branch_name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  branch_phone: string;

  // Owner Info
  auth_user_id: string;
  owner_name: string;
  owner_email: string;
}

export const restaurantService = {
  async getRestaurant(id: string): Promise<ApiResponse<Restaurant>> {
    try {
      const { data, error } = await insforge.database
        .from('restaurants')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch restaurant' } };
    }
  },

  async getRestaurantBySlug(slug: string): Promise<ApiResponse<Restaurant>> {
    try {
      const { data, error } = await insforge.database
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .limit(1);

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch restaurant by slug' } };
    }
  },

  async checkRestaurantSlugExists(slug: string): Promise<ApiResponse<boolean>> {
    try {
      const { data, error } = await insforge.database
        .from('restaurants')
        .select('id')
        .eq('slug', slug)
        .limit(1);

      if (error) throw error;
      return { data: data && data.length > 0, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to check slug' } };
    }
  },

  async getRestaurantUser(authUserId: string): Promise<ApiResponse<RestaurantUser & { restaurant: Restaurant }>> {
    try {
      const { data, error } = await insforge.database
        .from('restaurant_users')
        .select('*, restaurant:restaurants(*)')
        .eq('auth_user_id', authUserId)
        .limit(1);

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch user restaurant mappings' } };
    }
  },

  async createRestaurant(restaurantData: Partial<Restaurant>): Promise<ApiResponse<Restaurant>> {
    try {
      const { data, error } = await insforge.database
        .from('restaurants')
        .insert(restaurantData)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to create restaurant' } };
    }
  },

  async updateRestaurant(id: string, restaurantData: Partial<Restaurant>): Promise<ApiResponse<Restaurant>> {
    try {
      const { data, error } = await insforge.database
        .from('restaurants')
        .update(restaurantData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to update restaurant' } };
    }
  },

  async getBranches(restaurantId: string): Promise<ApiResponse<Branch[]>> {
    try {
      const { data, error } = await insforge.database
        .from('branches')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch branches' } };
    }
  },

  async onboardRestaurant(payload: OnboardingPayload): Promise<ApiResponse<{ restaurant: Restaurant; user: RestaurantUser; branch: Branch }>> {
    let createdRestaurantId: string | null = null;
    try {
      // 1. Double check slug existence
      const slugCheck = await this.checkRestaurantSlugExists(payload.slug);
      if (slugCheck.data) {
        throw new Error('Restaurant handle (slug) is already taken.');
      }

      // 2. Create Restaurant record
      const restaurantRes = await insforge.database
        .from('restaurants')
        .insert({
          name: payload.name,
          slug: payload.slug,
          restaurant_type: payload.restaurant_type,
          phone: payload.phone,
          email: payload.email,
          gst_number: payload.gst_number || null,
          timezone: payload.timezone,
          currency: payload.currency,
          logo_url: payload.logo_url || null,
          status: 'active'
        })
        .select();

      if (restaurantRes.error) throw restaurantRes.error;
      if (!restaurantRes.data || restaurantRes.data.length === 0) {
        throw new Error('Failed to create restaurant record');
      }
      const restaurant = restaurantRes.data[0];
      createdRestaurantId = restaurant.id;

      // 3. Create Owner Role
      const roleRes = await insforge.database
        .from('roles')
        .insert({
          restaurant_id: restaurant.id,
          name: 'Owner',
          description: 'Root administrator of the restaurant tenant.',
          permissions_json: { all: true }
        })
        .select();

      if (roleRes.error) throw roleRes.error;
      if (!roleRes.data || roleRes.data.length === 0) {
        throw new Error('Failed to create default owner role');
      }
      const role = roleRes.data[0];

      // 4. Create Primary Branch
      const branchRes = await insforge.database
        .from('branches')
        .insert({
          restaurant_id: restaurant.id,
          name: payload.branch_name,
          phone: payload.branch_phone,
          email: payload.owner_email,
          address: payload.address,
          city: payload.city,
          state: payload.state,
          country: payload.country,
          postal_code: payload.postal_code,
          is_active: true
        })
        .select();

      if (branchRes.error) throw branchRes.error;
      if (!branchRes.data || branchRes.data.length === 0) {
        throw new Error('Failed to create primary branch');
      }
      const branch = branchRes.data[0];

      // 5. Create Restaurant User mapping
      const userRes = await insforge.database
        .from('restaurant_users')
        .insert({
          restaurant_id: restaurant.id,
          auth_user_id: payload.auth_user_id,
          role_id: role.id,
          is_owner: true
        })
        .select();

      if (userRes.error) throw userRes.error;
      if (!userRes.data || userRes.data.length === 0) {
        throw new Error('Failed to associate user with restaurant');
      }
      const restaurantUser = userRes.data[0];

      // 6. Create Staff record for owner
      const staffRes = await insforge.database
        .from('staff')
        .insert({
          restaurant_id: restaurant.id,
          branch_id: branch.id,
          role_id: role.id,
          full_name: payload.owner_name,
          phone: payload.phone,
          email: payload.owner_email,
          status: 'active'
        })
        .select();

      if (staffRes.error) throw staffRes.error;

      return {
        data: {
          restaurant,
          user: restaurantUser,
          branch
        },
        error: null
      };
    } catch (err: any) {
      console.error('[restaurantService.onboardRestaurant] Error:', err);
      // Rollback newly created restaurant if anything failed
      if (createdRestaurantId) {
        try {
          await insforge.database.from('restaurants').delete().eq('id', createdRestaurantId);
        } catch (cleanupErr) {
          console.error('[restaurantService.onboardRestaurant] Cleanup error:', cleanupErr);
        }
      }
      return { data: null, error: { message: err.message || 'Onboarding transaction failed' } };
    }
  }
};
