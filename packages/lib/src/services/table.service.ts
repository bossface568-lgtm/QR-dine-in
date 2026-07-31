import { insforge } from '../client';
import { Table, TableStatus, CreateTablePayload, UpdateTablePayload, ApiResponse } from '@qrdine/types';

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

      const insertRecord: Record<string, any> = {
        restaurant_id: restaurantId,
        created_by: userId,
        branch_id: payload.branch_id || null,
        table_number: payload.table_number.trim(),
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
  }
};
