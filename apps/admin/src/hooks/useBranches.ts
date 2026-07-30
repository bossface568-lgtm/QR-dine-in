import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { branchService } from '@qrdine/lib';
import { Branch, CreateBranchPayload, UpdateBranchPayload, BranchFilterType } from '@qrdine/types';
import { useToast } from '@qrdine/ui';

export const useBranches = () => {
  const { restaurantId, refreshAuth } = useAuth();
  const { toast } = useToast();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<BranchFilterType>('all');

  const fetchBranches = useCallback(async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const res = await branchService.getBranches(restaurantId, true); // include archived to allow filtering
      if (res.error) {
        toast(res.error.message, 'error');
      } else if (res.data) {
        setBranches(res.data);
      }
    } catch (err: any) {
      toast(err.message || 'Failed to load branches', 'error');
    } finally {
      setLoading(false);
    }
  }, [restaurantId, toast]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Filtered branches list
  const filteredBranches = useMemo(() => {
    return branches.filter((branch) => {
      // 1. Status Filter
      if (filter === 'all' && branch.is_archived) return false;
      if (filter === 'active' && (branch.is_archived || !branch.is_active)) return false;
      if (filter === 'inactive' && (branch.is_archived || branch.is_active)) return false;
      if (filter === 'archived' && !branch.is_archived) return false;

      // 2. Search Term Filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      return (
        branch.name.toLowerCase().includes(term) ||
        (branch.branch_code && branch.branch_code.toLowerCase().includes(term)) ||
        (branch.city && branch.city.toLowerCase().includes(term)) ||
        (branch.state && branch.state.toLowerCase().includes(term)) ||
        (branch.phone && branch.phone.includes(term)) ||
        (branch.email && branch.email.toLowerCase().includes(term))
      );
    });
  }, [branches, filter, searchTerm]);

  // Metrics summary counts
  const stats = useMemo(() => {
    const total = branches.filter((b) => !b.is_archived).length;
    const active = branches.filter((b) => !b.is_archived && b.is_active).length;
    const inactive = branches.filter((b) => !b.is_archived && !b.is_active).length;
    const archived = branches.filter((b) => b.is_archived).length;
    const defaultBranch = branches.find((b) => b.is_default && !b.is_archived) || null;

    return { total, active, inactive, archived, defaultBranch };
  }, [branches]);

  const createBranch = async (payload: CreateBranchPayload): Promise<boolean> => {
    if (!restaurantId) return false;
    const res = await branchService.createBranch(restaurantId, payload);
    if (res.error) {
      toast(res.error.message, 'error');
      return false;
    }
    toast(`Branch "${payload.name}" created successfully!`, 'success');
    await fetchBranches();
    await refreshAuth();
    return true;
  };

  const updateBranch = async (branchId: string, payload: UpdateBranchPayload): Promise<boolean> => {
    if (!restaurantId) return false;
    const res = await branchService.updateBranch(restaurantId, branchId, payload);
    if (res.error) {
      toast(res.error.message, 'error');
      return false;
    }
    toast('Branch updated successfully!', 'success');
    await fetchBranches();
    await refreshAuth();
    return true;
  };

  const toggleStatus = async (branchId: string, currentStatus: boolean): Promise<boolean> => {
    if (!restaurantId) return false;
    const newStatus = !currentStatus;
    const res = await branchService.toggleBranchStatus(restaurantId, branchId, newStatus);
    if (res.error) {
      toast(res.error.message, 'error');
      return false;
    }
    toast(`Branch status set to ${newStatus ? 'Active' : 'Inactive'}`, 'success');
    await fetchBranches();
    await refreshAuth();
    return true;
  };

  const setDefaultBranch = async (branchId: string): Promise<boolean> => {
    if (!restaurantId) return false;
    const res = await branchService.setBranchDefault(restaurantId, branchId);
    if (res.error) {
      toast(res.error.message, 'error');
      return false;
    }
    toast('Default primary branch updated!', 'success');
    await fetchBranches();
    await refreshAuth();
    return true;
  };

  const archiveBranch = async (branchId: string): Promise<boolean> => {
    if (!restaurantId) return false;
    const res = await branchService.archiveBranch(restaurantId, branchId);
    if (res.error) {
      toast(res.error.message, 'error');
      return false;
    }
    toast('Branch archived successfully', 'success');
    await fetchBranches();
    await refreshAuth();
    return true;
  };

  const deleteBranch = async (branchId: string): Promise<boolean> => {
    if (!restaurantId) return false;
    const res = await branchService.deleteBranch(restaurantId, branchId);
    if (res.error) {
      toast(res.error.message, 'error');
      return false;
    }
    toast('Branch permanently deleted!', 'success');
    await fetchBranches();
    await refreshAuth();
    return true;
  };

  return {
    branches,
    filteredBranches,
    stats,
    loading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    refreshBranches: fetchBranches,
    createBranch,
    updateBranch,
    toggleStatus,
    setDefaultBranch,
    archiveBranch,
    deleteBranch,
  };
};
