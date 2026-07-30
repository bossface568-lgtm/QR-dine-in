import { insforge } from '../client';
import { Table, TableStatus, ApiResponse } from '@qrdine/types';

export const tableService = {
  async getTables(restaurantId: string): Promise<ApiResponse<Table[]>> {
    try {
      const { data, error } = await insforge.database
        .from('tables')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('table_number', { ascending: true });

      if (error) throw error;
      return { data: data || [], error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch tables' } };
    }
  },

  async getTable(id: string): Promise<ApiResponse<Table>> {
    try {
      const { data, error } = await insforge.database
        .from('tables')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to fetch table' } };
    }
  },

  async createTable(tableData: Partial<Table>): Promise<ApiResponse<Table>> {
    try {
      const { data, error } = await insforge.database
        .from('tables')
        .insert(tableData)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to create table' } };
    }
  },

  async updateTable(id: string, tableData: Partial<Table>): Promise<ApiResponse<Table>> {
    try {
      const { data, error } = await insforge.database
        .from('tables')
        .update(tableData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return { data: data && data.length > 0 ? data[0] : null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to update table' } };
    }
  },

  async deleteTable(id: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await insforge.database
        .from('tables')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: null, error: null };
    } catch (err: any) {
      return { data: null, error: { message: err.message || 'Failed to delete table' } };
    }
  },

  async updateTableStatus(id: string, status: TableStatus): Promise<ApiResponse<Table>> {
    return this.updateTable(id, { status });
  }
};
