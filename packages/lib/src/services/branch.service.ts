import { insforge } from '../client';
import { Branch, CreateBranchPayload, UpdateBranchPayload, ApiResponse } from '@qrdine/types';

export const branchService = {
  /**
   * Fetch all branches for a restaurant tenant
   */
  async getBranches(restaurantId: string, includeArchived = false): Promise<ApiResponse<Branch[]>> {
    try {
      let query = insforge.database
        .from('branches')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }

      const { data, error } = await query.order('is_default', { ascending: false }).order('created_at', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch branches' } };
    }
  },

  /**
   * Fetch single branch by ID with tenant security scope
   */
  async getBranch(restaurantId: string, branchId: string): Promise<ApiResponse<Branch>> {
    try {
      const { data, error } = await insforge.database
        .from('branches')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('id', branchId)
        .limit(1);

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch branch details' } };
    }
  },

  /**
   * Create a new branch for a restaurant tenant
   */
  async createBranch(restaurantId: string, payload: CreateBranchPayload): Promise<ApiResponse<Branch>> {
    try {
      // 1. Check duplicate name within same tenant
      const { data: existingName } = await insforge.database
        .from('branches')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('name', payload.name.trim())
        .limit(1);

      if (existingName && existingName.length > 0) {
        throw new Error(`A branch named "${payload.name}" already exists.`);
      }

      // 2. Check duplicate branch_code if provided
      if (payload.branch_code && payload.branch_code.trim()) {
        const { data: existingCode } = await insforge.database
          .from('branches')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .eq('branch_code', payload.branch_code.trim())
          .limit(1);

        if (existingCode && existingCode.length > 0) {
          throw new Error(`Branch code "${payload.branch_code}" is already in use.`);
        }
      }

      // 3. Determine default status: if no active branches exist, this must be default
      const { data: existingBranches } = await insforge.database
        .from('branches')
        .select('id, is_default')
        .eq('restaurant_id', restaurantId)
        .eq('is_archived', false);

      const isFirstBranch = !existingBranches || existingBranches.length === 0;
      const shouldBeDefault = payload.is_default || isFirstBranch;

      // Unset other defaults if this new branch will be default
      if (shouldBeDefault && existingBranches && existingBranches.length > 0) {
        await insforge.database
          .from('branches')
          .update({ is_default: false })
          .eq('restaurant_id', restaurantId);
      }

      // 4. Insert branch
      const insertData = {
        restaurant_id: restaurantId,
        name: payload.name.trim(),
        branch_code: payload.branch_code ? payload.branch_code.trim() : null,
        phone: payload.phone ? payload.phone.trim() : null,
        email: payload.email ? payload.email.trim() : null,
        address: payload.address ? payload.address.trim() : null,
        address_line2: payload.address_line2 ? payload.address_line2.trim() : null,
        city: payload.city ? payload.city.trim() : null,
        state: payload.state ? payload.state.trim() : null,
        country: payload.country ? payload.country.trim() : 'India',
        postal_code: payload.postal_code ? payload.postal_code.trim() : null,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        opening_time: payload.opening_time || '09:00',
        closing_time: payload.closing_time || '22:00',
        business_days: payload.business_days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        timezone: payload.timezone || 'Asia/Kolkata',
        is_active: payload.is_active ?? true,
        is_default: shouldBeDefault,
        is_archived: false,
      };

      const { data, error } = await insforge.database
        .from('branches')
        .insert(insertData)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to create branch' } };
    }
  },

  /**
   * Update an existing branch
   */
  async updateBranch(restaurantId: string, branchId: string, payload: UpdateBranchPayload): Promise<ApiResponse<Branch>> {
    try {
      // 1. Verify existence and tenant ownership
      const { data: currentBranch } = await insforge.database
        .from('branches')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('id', branchId)
        .limit(1);

      if (!currentBranch || currentBranch.length === 0) {
        throw new Error('Branch not found or unauthorized.');
      }

      // 2. Duplicate name check if name is changing
      if (payload.name && payload.name.trim() !== currentBranch[0].name) {
        const { data: existingName } = await insforge.database
          .from('branches')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .eq('name', payload.name.trim())
          .neq('id', branchId)
          .limit(1);

        if (existingName && existingName.length > 0) {
          throw new Error(`Another branch named "${payload.name}" already exists.`);
        }
      }

      // 3. Duplicate code check if code is changing
      if (payload.branch_code && payload.branch_code.trim() !== currentBranch[0].branch_code) {
        const { data: existingCode } = await insforge.database
          .from('branches')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .eq('branch_code', payload.branch_code.trim())
          .neq('id', branchId)
          .limit(1);

        if (existingCode && existingCode.length > 0) {
          throw new Error(`Branch code "${payload.branch_code}" is already in use.`);
        }
      }

      // 4. Handle default flag changes
      if (payload.is_default === true) {
        await insforge.database
          .from('branches')
          .update({ is_default: false })
          .eq('restaurant_id', restaurantId);
      }

      const updateData: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (payload.name !== undefined) updateData.name = payload.name.trim();
      if (payload.branch_code !== undefined) updateData.branch_code = payload.branch_code ? payload.branch_code.trim() : null;
      if (payload.phone !== undefined) updateData.phone = payload.phone ? payload.phone.trim() : null;
      if (payload.email !== undefined) updateData.email = payload.email ? payload.email.trim() : null;
      if (payload.address !== undefined) updateData.address = payload.address ? payload.address.trim() : null;
      if (payload.address_line2 !== undefined) updateData.address_line2 = payload.address_line2 ? payload.address_line2.trim() : null;
      if (payload.city !== undefined) updateData.city = payload.city ? payload.city.trim() : null;
      if (payload.state !== undefined) updateData.state = payload.state ? payload.state.trim() : null;
      if (payload.country !== undefined) updateData.country = payload.country ? payload.country.trim() : null;
      if (payload.postal_code !== undefined) updateData.postal_code = payload.postal_code ? payload.postal_code.trim() : null;
      if (payload.latitude !== undefined) updateData.latitude = payload.latitude;
      if (payload.longitude !== undefined) updateData.longitude = payload.longitude;
      if (payload.opening_time !== undefined) updateData.opening_time = payload.opening_time;
      if (payload.closing_time !== undefined) updateData.closing_time = payload.closing_time;
      if (payload.business_days !== undefined) updateData.business_days = payload.business_days;
      if (payload.timezone !== undefined) updateData.timezone = payload.timezone;
      if (payload.is_active !== undefined) updateData.is_active = payload.is_active;
      if (payload.is_default !== undefined) updateData.is_default = payload.is_default;
      if (payload.is_archived !== undefined) updateData.is_archived = payload.is_archived;

      const { data, error } = await insforge.database
        .from('branches')
        .update(updateData)
        .eq('restaurant_id', restaurantId)
        .eq('id', branchId)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to update branch' } };
    }
  },

  /**
   * Activate or deactivate a branch with safety checks for default branch
   */
  async toggleBranchStatus(restaurantId: string, branchId: string, isActive: boolean): Promise<ApiResponse<Branch>> {
    try {
      const { data: branchData } = await insforge.database
        .from('branches')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('id', branchId)
        .limit(1);

      if (!branchData || branchData.length === 0) {
        throw new Error('Branch not found.');
      }

      const targetBranch = branchData[0];

      // Prevent deactivating default branch
      if (!isActive && targetBranch.is_default) {
        throw new Error('Cannot deactivate the default branch. Please set another branch as default first.');
      }

      // Prevent deactivating the only active branch
      if (!isActive) {
        const { data: activeBranches } = await insforge.database
          .from('branches')
          .select('id')
          .eq('restaurant_id', restaurantId)
          .eq('is_active', true)
          .eq('is_archived', false);

        if (activeBranches && activeBranches.length <= 1) {
          throw new Error('Cannot deactivate the only active branch. Your restaurant must have at least one active branch.');
        }
      }

      const { data, error } = await insforge.database
        .from('branches')
        .update({ is_active: isActive, updated_at: new Date().toISOString() })
        .eq('restaurant_id', restaurantId)
        .eq('id', branchId)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to update branch status' } };
    }
  },

  /**
   * Set a branch as the default primary branch
   */
  async setBranchDefault(restaurantId: string, branchId: string): Promise<ApiResponse<Branch>> {
    try {
      // 1. Reset all branches for this tenant to non-default
      await insforge.database
        .from('branches')
        .update({ is_default: false })
        .eq('restaurant_id', restaurantId);

      // 2. Set target branch to default and ensure it is active and unarchived
      const { data, error } = await insforge.database
        .from('branches')
        .update({
          is_default: true,
          is_active: true,
          is_archived: false,
          updated_at: new Date().toISOString()
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', branchId)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to set default branch' } };
    }
  },

  /**
   * Soft-delete / Archive a branch
   */
  async archiveBranch(restaurantId: string, branchId: string): Promise<ApiResponse<Branch>> {
    try {
      const { data: branchData } = await insforge.database
        .from('branches')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('id', branchId)
        .limit(1);

      if (!branchData || branchData.length === 0) {
        throw new Error('Branch not found.');
      }

      const targetBranch = branchData[0];

      if (targetBranch.is_default) {
        throw new Error('Cannot archive the primary default branch. Please set another branch as default first.');
      }

      // Check remaining non-archived active branches count
      const { data: activeBranches } = await insforge.database
        .from('branches')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('is_archived', false);

      if (activeBranches && activeBranches.length <= 1) {
        throw new Error('Cannot archive the only remaining branch. Your restaurant must have at least one branch.');
      }

      const { data, error } = await insforge.database
        .from('branches')
        .update({
          is_archived: true,
          is_active: false,
          is_default: false,
          updated_at: new Date().toISOString()
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', branchId)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to archive branch' } };
    }
  },

  /**
   * Permanently delete a branch
   */
  async deleteBranch(restaurantId: string, branchId: string): Promise<ApiResponse<boolean>> {
    try {
      const { data: branchData } = await insforge.database
        .from('branches')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('id', branchId)
        .limit(1);

      if (!branchData || branchData.length === 0) {
        throw new Error('Branch not found.');
      }

      const targetBranch = branchData[0];

      if (targetBranch.is_default) {
        throw new Error('Cannot permanently delete the primary default branch. Please set another branch as default first.');
      }

      // Check remaining total branches count for tenant
      const { data: allBranches } = await insforge.database
        .from('branches')
        .select('id')
        .eq('restaurant_id', restaurantId);

      if (allBranches && allBranches.length <= 1) {
        throw new Error('Cannot delete the only branch of a restaurant. Your restaurant must have at least one branch.');
      }

      const { error } = await insforge.database
        .from('branches')
        .delete()
        .eq('restaurant_id', restaurantId)
        .eq('id', branchId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: { message: err.message || 'Failed to delete branch' } };
    }
  },

  /**
   * Fetch staff & table count metrics for a branch
   */
  async getBranchMetrics(restaurantId: string, branchId: string): Promise<ApiResponse<{ staffCount: number; tableCount: number }>> {
    let staffCount = 0;
    let tableCount = 0;

    try {
      const staffRes = await insforge.database
        .from('staff')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('branch_id', branchId);

      if (staffRes.data) {
        staffCount = staffRes.data.length;
      }
    } catch {
      // Fallback 0
    }

    try {
      const tableRes = await insforge.database
        .from('tables')
        .select('id')
        .eq('restaurant_id', restaurantId);

      if (tableRes.data) {
        tableCount = tableRes.data.length;
      }
    } catch {
      // Fallback 0
    }

    return {
      data: { staffCount, tableCount },
      error: null
    };
  }
};
