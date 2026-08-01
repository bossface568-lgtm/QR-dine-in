import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { tableService, branchService } from '@qrdine/lib';
import { Table, CreateTablePayload, UpdateTablePayload, TableStatus, TableFilterType, Branch } from '@qrdine/types';
import { useToast } from '@qrdine/ui';

export function useTables() {
  const { restaurant, user } = useAuth();
  const { toast } = useToast();

  const [tables, setTables] = useState<Table[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filter, setFilter] = useState<TableFilterType>('all');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all');
  const [selectedFloorFilter, setSelectedFloorFilter] = useState<string>('all');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchTables = useCallback(async () => {
    if (!restaurant?.id) return;
    
    try {
      setLoading(true);
      const [tablesRes, branchesRes] = await Promise.all([
        tableService.getTables(restaurant.id, { includeArchived: true }),
        branchService.getBranches(restaurant.id)
      ]);
      if (tablesRes.data) setTables(tablesRes.data);
      if (branchesRes.data) setBranches(branchesRes.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
      toast('Failed to fetch tables.', 'error');
    } finally {
      setLoading(false);
    }
  }, [restaurant?.id, toast]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const filteredTables = useMemo(() => {
    let result = tables;

    // Apply tab filter
    if (filter === 'archived') {
      result = result.filter(t => !!t.archived_at);
    } else {
      result = result.filter(t => !t.archived_at);
      if (filter === 'inactive') {
        result = result.filter(t => !t.is_active || t.status === 'inactive');
      } else if (filter !== 'all') {
        result = result.filter(t => t.is_active && t.status === filter);
      }
    }

    // Apply branch filter
    if (selectedBranchFilter !== 'all') {
      result = result.filter(t => t.branch_id === selectedBranchFilter);
    }

    // Apply floor filter
    if (selectedFloorFilter !== 'all') {
      result = result.filter(t => t.floor === selectedFloorFilter);
    }

    // Apply section filter
    if (selectedSectionFilter !== 'all') {
      result = result.filter(t => t.section === selectedSectionFilter);
    }

    // Apply search
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(t => 
        (t.table_number && t.table_number.toLowerCase().includes(lowerSearch)) ||
        (t.label && t.label.toLowerCase().includes(lowerSearch)) ||
        (t.floor && t.floor.toLowerCase().includes(lowerSearch)) ||
        (t.section && t.section.toLowerCase().includes(lowerSearch))
      );
    }

    // Sort by sort_order ascending
    return [...result].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [tables, filter, selectedBranchFilter, selectedFloorFilter, selectedSectionFilter, searchTerm]);

  const stats = useMemo(() => {
    const unarchived = tables.filter(t => !t.archived_at);
    
    return {
      total: unarchived.length,
      available: unarchived.filter(t => t.is_active && t.status === 'available').length,
      occupied: unarchived.filter(t => t.is_active && t.status === 'occupied').length,
      reserved: unarchived.filter(t => t.is_active && t.status === 'reserved').length,
      cleaning: unarchived.filter(t => t.is_active && t.status === 'cleaning').length,
      inactive: unarchived.filter(t => !t.is_active || t.status === 'inactive').length,
      archived: tables.filter(t => !!t.archived_at).length
    };
  }, [tables]);

  const floors = useMemo(() => {
    const allFloors = tables.map(t => t.floor).filter(Boolean) as string[];
    return Array.from(new Set(allFloors)).sort();
  }, [tables]);

  const sections = useMemo(() => {
    const allSections = tables.map(t => t.section).filter(Boolean) as string[];
    return Array.from(new Set(allSections)).sort();
  }, [tables]);

  const createTable = async (payload: CreateTablePayload): Promise<boolean> => {
    try {
      if (!restaurant?.id || !user?.id) throw new Error('Authentication required');
      const res = await tableService.createTable(restaurant.id, user.id, payload);
      if (res.error) throw new Error(res.error.message);
      toast('Table created successfully', 'success');
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Create table error:', error);
      toast(error.message || 'Failed to create table', 'error');
      return false;
    }
  };

  const updateTable = async (id: string, payload: UpdateTablePayload): Promise<boolean> => {
    try {
      if (!restaurant?.id || !user?.id) throw new Error('Authentication required');
      const res = await tableService.updateTable(restaurant.id, user.id, id, payload);
      if (res.error) throw new Error(res.error.message);
      toast('Table updated successfully', 'success');
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Update table error:', error);
      toast(error.message || 'Failed to update table', 'error');
      return false;
    }
  };

  const archiveTable = async (id: string): Promise<boolean> => {
    try {
      if (!restaurant?.id) throw new Error('Authentication required');
      const res = await tableService.archiveTable(restaurant.id, id);
      if (res.error) throw new Error(res.error.message);
      toast('Table archived', 'success');
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Archive table error:', error);
      toast(error.message || 'Failed to archive table', 'error');
      return false;
    }
  };

  const deleteTable = async (id: string): Promise<boolean> => {
    try {
      if (!restaurant?.id) throw new Error('Authentication required');
      const res = await tableService.deleteTable(restaurant.id, id);
      if (res.error) throw new Error(res.error.message);
      toast('Table deleted permanently from database', 'success');
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Delete table error:', error);
      toast(error.message || 'Failed to permanently delete table', 'error');
      return false;
    }
  };

  const restoreTable = async (id: string): Promise<boolean> => {
    try {
      if (!restaurant?.id) throw new Error('Authentication required');
      const res = await tableService.restoreTable(restaurant.id, id);
      if (res.error) throw new Error(res.error.message);
      toast('Table restored', 'success');
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Restore table error:', error);
      toast(error.message || 'Failed to restore table', 'error');
      return false;
    }
  };

  const setStatus = async (id: string, status: TableStatus): Promise<boolean> => {
    try {
      if (!restaurant?.id) throw new Error('Authentication required');
      const res = await tableService.setStatus(restaurant.id, id, status);
      if (res.error) throw new Error(res.error.message);
      toast('Status updated', 'success');
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Set status error:', error);
      toast(error.message || 'Failed to update status', 'error');
      return false;
    }
  };

  const toggleActive = async (id: string, isActive: boolean): Promise<boolean> => {
    try {
      if (!restaurant?.id) throw new Error('Authentication required');
      const res = await tableService.toggleActive(restaurant.id, id, isActive);
      if (res.error) throw new Error(res.error.message);
      toast(isActive ? 'Table activated' : 'Table deactivated', 'success');
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Toggle active error:', error);
      toast(error.message || 'Failed to toggle status', 'error');
      return false;
    }
  };

  const bulkArchive = async (): Promise<boolean> => {
    if (!selectedIds.length || !restaurant?.id) return false;
    
    try {
      const res = await tableService.bulkArchive(restaurant.id, selectedIds);
      if (res.error) throw new Error(res.error.message);
      toast(`${selectedIds.length} tables archived`, 'success');
      setSelectedIds([]);
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Bulk archive error:', error);
      toast(error.message || 'Failed to archive tables', 'error');
      return false;
    }
  };

  const bulkSetStatus = async (status: TableStatus): Promise<boolean> => {
    if (!selectedIds.length || !restaurant?.id) return false;
    
    try {
      const res = await tableService.bulkSetStatus(restaurant.id, selectedIds, status);
      if (res.error) throw new Error(res.error.message);
      toast(`Status updated for ${selectedIds.length} tables`, 'success');
      setSelectedIds([]);
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Bulk status error:', error);
      toast(error.message || 'Failed to update tables', 'error');
      return false;
    }
  };

  const bulkDelete = async (): Promise<boolean> => {
    if (!selectedIds.length || !restaurant?.id) return false;
    
    try {
      const res = await tableService.bulkDelete(restaurant.id, selectedIds);
      if (res.error) throw new Error(res.error.message);
      toast(`${selectedIds.length} tables permanently deleted`, 'success');
      setSelectedIds([]);
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Bulk delete error:', error);
      toast(error.message || 'Failed to permanently delete tables', 'error');
      return false;
    }
  };

  const regenerateQR = async (id: string): Promise<boolean> => {
    try {
      if (!restaurant?.id || !user?.id) throw new Error('Authentication required');
      const res = await tableService.regenerateTableQRToken(restaurant.id, user.id, id);
      if (res.error) throw new Error(res.error.message);
      toast('QR Token regenerated successfully. Old QR codes are now invalid.', 'success');
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Regenerate QR error:', error);
      toast(error.message || 'Failed to regenerate QR token', 'error');
      return false;
    }
  };

  const updateQRStatus = async (id: string, status: 'active' | 'expired' | 'revoked'): Promise<boolean> => {
    try {
      if (!restaurant?.id) throw new Error('Authentication required');
      const res = await tableService.updateQRStatus(restaurant.id, id, status);
      if (res.error) throw new Error(res.error.message);
      toast(`QR status set to ${status}`, 'success');
      await fetchTables();
      return true;
    } catch (error: any) {
      console.error('Update QR status error:', error);
      toast(error.message || 'Failed to update QR status', 'error');
      return false;
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredTables.map(t => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  return {
    restaurant,
    tables,
    branches,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    selectedBranchFilter,
    setSelectedBranchFilter,
    selectedFloorFilter,
    setSelectedFloorFilter,
    selectedSectionFilter,
    setSelectedSectionFilter,
    selectedIds,
    setSelectedIds,
    fetchTables,
    filteredTables,
    stats,
    floors,
    sections,
    createTable,
    updateTable,
    archiveTable,
    deleteTable,
    restoreTable,
    setStatus,
    toggleActive,
    bulkArchive,
    bulkDelete,
    bulkSetStatus,
    regenerateQR,
    updateQRStatus,
    toggleSelectAll,
    toggleSelectOne
  };
}
