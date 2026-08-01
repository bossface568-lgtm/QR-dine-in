import { insforge } from '../client';
import { Table, TableStatus, CreateTablePayload, UpdateTablePayload, ApiResponse, PublicTableResolution, Restaurant, Branch } from '@qrdine/types';
import { generateTableToken } from '@qrdine/shared';

/**
 * Table Service — Production-grade service for table CRUD operations.
 * Enforces tenant isolation via restaurant_id scoping on all operations.
 * Supports soft-deletion (archiving), branch scoping, floor/section filters, and bulk operations.
 */
export const tableService = {
  /**
   * Fetch all tables for a restaurant with optional filters
   */
  async getTables(
    restaurantId: string,
    options?: {
      branchId?: string;
      floor?: string;
      section?: string;
      status?: TableStatus;
      includeArchived?: boolean;
    }
  ): Promise<ApiResponse<Table[]>> {
    try {
      let query = insforge
        .database
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantId);

      if (!options?.includeArchived) {
        query = query.is('archived_at', null);
      }

      if (options?.branchId && options.branchId !== 'all') {
        query = query.eq('branch_id', options.branchId);
      }

      if (options?.floor && options.floor !== 'all') {
        query = query.eq('floor', options.floor);
      }

      if (options?.section && options.section !== 'all') {
        query = query.eq('section', options.section);
      }

      if (options?.status && options.status !== ('all' as any)) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query.order('sort_order', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch tables' } };
    }
  },

  /**
   * Fetch a single table by ID with tenant scoping
   */
  async getTable(restaurantId: string, tableId: string): Promise<ApiResponse<Table>> {
    try {
      const { data, error } = await insforge
        .database
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('id', tableId);

      if (error) throw error;
      const table = Array.isArray(data) ? data[0] : data;
      if (!table) return { data: null, error: { message: 'Table not found' } };

      return { data: table, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch table' } };
    }
  },

  /**
   * Resolve a table by restaurant slug and table token (for Customer App)
   * Validates restaurant status and ensures the table token belongs to the restaurant.
   */
  async getTableByToken(restaurantSlug: string, tableToken: string): Promise<ApiResponse<PublicTableResolution>> {
    try {
      // 1. Fetch restaurant by slug
      const { data: restData, error: restErr } = await insforge
        .database
        .from('restaurants')
        .select('*')
        .eq('slug', restaurantSlug)
        .limit(1);

      if (restErr) throw restErr;
      const restaurant: Restaurant | null = Array.isArray(restData) && restData.length > 0 ? restData[0] : null;
      if (!restaurant) {
        return { data: null, error: { message: 'Restaurant not found', code: 'RESTAURANT_NOT_FOUND' } };
      }

      if (restaurant.status !== 'active' && restaurant.is_active === false) {
        return { data: null, error: { message: 'Restaurant is currently unavailable', code: 'RESTAURANT_UNAVAILABLE' } };
      }

      // 2. Fetch table by token scoped to this restaurant
      const { data: tableData, error: tableErr } = await insforge
        .database
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .eq('table_token', tableToken.trim())
        .is('archived_at', null)
        .limit(1);

      if (tableErr) throw tableErr;
      const table: Table | null = Array.isArray(tableData) && tableData.length > 0 ? tableData[0] : null;

      if (!table) {
        return { data: null, error: { message: 'Invalid table token', code: 'INVALID_TABLE_TOKEN' } };
      }

      if (table.qr_status === 'expired') {
        return { data: null, error: { message: 'This QR Code has expired. Please scan the updated QR code at your table.', code: 'EXPIRED_TABLE_TOKEN' } };
      }

      if (table.qr_status === 'revoked' || table.is_active === false) {
        return { data: null, error: { message: 'This table QR Code is currently disabled.', code: 'REVOKED_TABLE_TOKEN' } };
      }

      // 3. Optional: Fetch branch if assigned
      let branch: Branch | null = null;
      if (table.branch_id) {
        const { data: branchData } = await insforge
          .database
          .from('branches')
          .select('*')
          .eq('id', table.branch_id)
          .limit(1);
        if (Array.isArray(branchData) && branchData.length > 0) {
          branch = branchData[0];
        }
      }

      return {
        data: {
          restaurant,
          branch,
          table,
        },
        error: null,
      };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to resolve table token' } };
    }
  },

  /**
   * Check if a table number is available within a branch
   */
  async checkTableNumberAvailable(
    restaurantId: string,
    branchId: string | null,
    tableNumber: string,
    excludeId?: string
  ): Promise<ApiResponse<boolean>> {
    try {
      let query = insforge
        .database
        .from('tables')
        .select('id')
        .eq('restaurant_id', restaurantId)
        .eq('table_number', tableNumber.trim())
        .is('archived_at', null);

      if (branchId) {
        query = query.eq('branch_id', branchId);
      } else {
        query = query.is('branch_id', null);
      }

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
   * Create a new table
   */
  async createTable(restaurantId: string, userId: string, payload: CreateTablePayload): Promise<ApiResponse<Table>> {
    try {
      // Auto-calculate sort_order if not provided
      let sort_order = payload.sort_order;
      if (sort_order === undefined) {
        const { data: maxData } = await insforge
          .database
          .from('tables')
          .select('sort_order')
          .eq('restaurant_id', restaurantId)
          .order('sort_order', { ascending: false })
          .limit(1);

        const highest = (Array.isArray(maxData) && maxData.length > 0) ? maxData[0] : null;
        sort_order = highest ? (highest.sort_order + 1) : 1;
      }

      const table_token = payload.table_token ? payload.table_token.trim() : generateTableToken();

      const insertRecord: Record<string, any> = {
        restaurant_id: restaurantId,
        created_by: userId,
        branch_id: payload.branch_id || null,
        table_number: payload.table_number.trim(),
        table_token,
        label: payload.label ? payload.label.trim() : `Table ${payload.table_number.trim()}`,
        seating_capacity: payload.seating_capacity || 4,
        floor: payload.floor ? payload.floor.trim() : null,
        section: payload.section ? payload.section.trim() : null,
        status: payload.status || 'available',
        sort_order,
        is_active: payload.is_active ?? true,
        is_occupied: payload.status === 'occupied',
      };

      const { data, error } = await insforge
        .database
        .from('tables')
        .insert([insertRecord])
        .select();

      if (error) throw error;
      const created = Array.isArray(data) ? data[0] : data;

      return { data: created, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to create table' } };
    }
  },

  /**
   * Update an existing table
   */
  async updateTable(restaurantId: string, userId: string, tableId: string, payload: UpdateTablePayload): Promise<ApiResponse<Table>> {
    try {
      const updateRecord: Record<string, any> = {
        updated_by: userId,
        updated_at: new Date().toISOString(),
      };

      if (payload.branch_id !== undefined) updateRecord.branch_id = payload.branch_id || null;
      if (payload.table_number !== undefined) updateRecord.table_number = payload.table_number.trim();
      if (payload.label !== undefined) updateRecord.label = payload.label ? payload.label.trim() : null;
      if (payload.seating_capacity !== undefined) updateRecord.seating_capacity = payload.seating_capacity;
      if (payload.floor !== undefined) updateRecord.floor = payload.floor ? payload.floor.trim() : null;
      if (payload.section !== undefined) updateRecord.section = payload.section ? payload.section.trim() : null;
      if (payload.status !== undefined) {
        updateRecord.status = payload.status;
        updateRecord.is_occupied = payload.status === 'occupied';
      }
      if (payload.sort_order !== undefined) updateRecord.sort_order = payload.sort_order;
      if (payload.is_active !== undefined) updateRecord.is_active = payload.is_active;

      const { data, error } = await insforge
        .database
        .from('tables')
        .update(updateRecord)
        .eq('restaurant_id', restaurantId)
        .eq('id', tableId)
        .select();

      if (error) throw error;
      const updated = Array.isArray(data) ? data[0] : data;

      return { data: updated, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to update table' } };
    }
  },

  /**
   * Soft delete (archive) a table
   */
  async archiveTable(restaurantId: string, tableId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await insforge
        .database
        .from('tables')
        .update({
          archived_at: new Date().toISOString(),
          status: 'inactive',
          is_active: false,
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', tableId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: { message: err.message || 'Failed to archive table' } };
    }
  },

  /**
   * Permanently delete a table from PostgreSQL database
   */
  async deleteTable(restaurantId: string, tableId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await insforge
        .database
        .from('tables')
        .delete()
        .eq('restaurant_id', restaurantId)
        .eq('id', tableId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: { message: err.message || 'Failed to permanently delete table' } };
    }
  },

  /**
   * Bulk permanently delete multiple tables in a single batch query
   */
  async bulkDelete(restaurantId: string, tableIds: string[]): Promise<ApiResponse<boolean>> {
    try {
      if (!tableIds || tableIds.length === 0) return { data: true, error: null };

      const { error } = await insforge
        .database
        .from('tables')
        .delete()
        .eq('restaurant_id', restaurantId)
        .in('id', tableIds);

      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: { message: err.message || 'Failed to delete tables' } };
    }
  },

  /**
   * Restore an archived table
   */
  async restoreTable(restaurantId: string, tableId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await insforge
        .database
        .from('tables')
        .update({
          archived_at: null,
          status: 'available',
          is_active: true,
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', tableId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: { message: err.message || 'Failed to restore table' } };
    }
  },

  /**
   * Quick status update
   */
  async setStatus(restaurantId: string, tableId: string, status: TableStatus): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await insforge
        .database
        .from('tables')
        .update({
          status,
          is_occupied: status === 'occupied',
          updated_at: new Date().toISOString(),
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', tableId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: { message: err.message || 'Failed to update table status' } };
    }
  },

  /**
   * Quick active toggle
   */
  async toggleActive(restaurantId: string, tableId: string, isActive: boolean): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await insforge
        .database
        .from('tables')
        .update({
          is_active: isActive,
          status: isActive ? 'available' : 'inactive',
          updated_at: new Date().toISOString(),
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', tableId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: { message: err.message } };
    }
  },

  /**
   * Bulk archive multiple tables
   */
  async bulkArchive(restaurantId: string, tableIds: string[]): Promise<ApiResponse<boolean>> {
    try {
      let hasError = false;
      for (const id of tableIds) {
        const res = await this.archiveTable(restaurantId, id);
        if (res.error) hasError = true;
      }
      return { data: !hasError, error: hasError ? { message: 'Some tables failed to archive' } : null };
    } catch (err: any) {
      return { data: false, error: { message: err.message } };
    }
  },

  /**
   * Bulk status update for multiple tables
   */
  async bulkSetStatus(restaurantId: string, tableIds: string[], status: TableStatus): Promise<ApiResponse<boolean>> {
    try {
      let hasError = false;
      for (const id of tableIds) {
        const res = await this.setStatus(restaurantId, id, status);
        if (res.error) hasError = true;
      }
      return { data: !hasError, error: hasError ? { message: 'Some tables failed to update status' } : null };
    } catch (err: any) {
      return { data: false, error: { message: err.message } };
    }
  },

  /**
   * Regenerate Table QR Token — Generates a fresh 7-character token, invalidates old token, and updates qr_version & qr_last_regenerated_at
   */
  async regenerateTableQRToken(restaurantId: string, userId: string, tableId: string): Promise<ApiResponse<Table>> {
    try {
      // 1. Fetch current table to increment qr_version
      const existingRes = await this.getTable(restaurantId, tableId);
      if (existingRes.error || !existingRes.data) {
        return { data: null, error: { message: existingRes.error?.message || 'Table not found' } };
      }

      const currentTable = existingRes.data;
      const newToken = generateTableToken();
      const currentVersion = currentTable.qr_version || 1;

      const updateRecord: Record<string, any> = {
        table_token: newToken,
        qr_version: currentVersion + 1,
        qr_last_regenerated_at: new Date().toISOString(),
        qr_status: 'active',
        updated_by: userId,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await insforge
        .database
        .from('tables')
        .update(updateRecord)
        .eq('restaurant_id', restaurantId)
        .eq('id', tableId)
        .select();

      if (error) throw error;
      const updated = Array.isArray(data) ? data[0] : data;
      return { data: updated, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to regenerate QR token' } };
    }
  },

  /**
   * Update QR Status (active, expired, revoked)
   */
  async updateQRStatus(restaurantId: string, tableId: string, status: 'active' | 'expired' | 'revoked'): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await insforge
        .database
        .from('tables')
        .update({
          qr_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('restaurant_id', restaurantId)
        .eq('id', tableId);

      if (error) throw error;
      return { data: true, error: null };
    } catch (err: any) {
      return { data: false, error: { message: err.message || 'Failed to update QR status' } };
    }
  }
};
