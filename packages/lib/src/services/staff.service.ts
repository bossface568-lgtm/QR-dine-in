import { insforge } from '../client';
import { Staff, ApiResponse } from '@qrdine/types';

export const staffService = {
  async getStaff(restaurantId: string): Promise<ApiResponse<Staff[]>> {
    try {
      const { data, error } = await insforge.database
        .from('staff')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch staff members' } };
    }
  },

  async getStaffMember(id: string): Promise<ApiResponse<Staff>> {
    try {
      const { data, error } = await insforge.database
        .from('staff')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch staff member' } };
    }
  },

  async getStaffByUserId(userId: string): Promise<ApiResponse<Staff>> {
    try {
      const { data, error } = await insforge.database
        .from('staff')
        .select('*')
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch staff by user id' } };
    }
  },

  async addStaffMember(staffData: Partial<Staff>): Promise<ApiResponse<Staff>> {
    try {
      const { data, error } = await insforge.database
        .from('staff')
        .insert(staffData)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to add staff member' } };
    }
  },

  async updateStaffMember(id: string, staffData: Partial<Staff>): Promise<ApiResponse<Staff>> {
    try {
      const { data, error } = await insforge.database
        .from('staff')
        .update(staffData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to update staff member' } };
    }
  },

  async removeStaffMember(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await insforge.database
        .from('staff')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to remove staff member' } };
    }
  }
};
