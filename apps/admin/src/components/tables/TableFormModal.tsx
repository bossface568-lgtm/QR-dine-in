import React, { useState, useEffect } from 'react';
import { Table, CreateTablePayload, UpdateTablePayload, TableStatus, Branch } from '@qrdine/types';
import { Modal, Button, Input } from '@qrdine/ui';
import { useAuth } from '../../contexts/AuthContext';
import { tableService } from '@qrdine/lib';
import { TABLE_STATUS_LABELS, FLOOR_OPTIONS, SECTION_OPTIONS } from '@qrdine/shared';
import { Users, Layers, MapPin, Grid3X3, Building2 } from 'lucide-react';

interface TableFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateTablePayload | UpdateTablePayload) => Promise<boolean>;
  table?: Table | null;
  branches?: Branch[];
}

export function TableFormModal({
  isOpen,
  onClose,
  onSubmit,
  table,
  branches = [],
}: TableFormModalProps) {
  const { restaurantId } = useAuth();
  const isEdit = !!table;

  // Form Fields
  const [tableNumber, setTableNumber] = useState('');
  const [label, setLabel] = useState('');
  const [branchId, setBranchId] = useState('');
  const [seatingCapacity, setSeatingCapacity] = useState<number | ''>(4);
  const [floor, setFloor] = useState('');
  const [section, setSection] = useState('');
  const [status, setStatus] = useState<TableStatus>('available');
  const [sortOrder, setSortOrder] = useState<number | ''>(1);
  const [isActive, setIsActive] = useState(true);

  // Errors & Loading
  const [tableNumberError, setTableNumberError] = useState<string | null>(null);
  const [capacityError, setCapacityError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (table) {
      setTableNumber(table.table_number || '');
      setLabel(table.label || '');
      setBranchId(table.branch_id || '');
      setSeatingCapacity(table.seating_capacity || 4);
      setFloor(table.floor || '');
      setSection(table.section || '');
      setStatus(table.status || 'available');
      setSortOrder(table.sort_order ?? 1);
      setIsActive(table.is_active ?? true);
    } else {
      setTableNumber('');
      setLabel('');
      setBranchId(branches.length > 0 ? branches[0].id : '');
      setSeatingCapacity(4);
      setFloor('');
      setSection('');
      setStatus('available');
      setSortOrder(1);
      setIsActive(true);
    }
    setTableNumberError(null);
    setCapacityError(null);
  }, [table, branches, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableNumber.trim()) {
      setTableNumberError('Table number is required');
      return;
    }

    if (!seatingCapacity || Number(seatingCapacity) <= 0) {
      setCapacityError('Seating capacity must be greater than zero');
      return;
    }

    setIsSubmitting(true);
    setTableNumberError(null);
    setCapacityError(null);

    try {
      // Real-time unique table number check within branch
      if (restaurantId && tableNumber.trim()) {
        const check = await tableService.checkTableNumberAvailable(
          restaurantId,
          branchId || null,
          tableNumber.trim(),
          table?.id
        );

        if (check.data === false) {
          setTableNumberError('This table number already exists in the selected branch.');
          setIsSubmitting(false);
          return;
        }
      }

      const payload: any = {
        table_number: tableNumber.trim(),
        label: label.trim() || `Table ${tableNumber.trim()}`,
        branch_id: branchId || null,
        seating_capacity: Number(seatingCapacity),
        floor: floor.trim() || null,
        section: section.trim() || null,
        status: status,
        sort_order: sortOrder !== '' ? Number(sortOrder) : 1,
        is_active: isActive,
      };

      if (isEdit) {
        payload.id = table.id;
      }

      const success = await onSubmit(payload);
      if (success) onClose();
    } catch (err: any) {
      console.error('Error submitting table form:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={isEdit ? 'Edit Dining Table' : 'Add New Dining Table'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
        {/* Table Number & Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Table Number <span className="text-rose-500">*</span>
            </label>
            <Input
              value={tableNumber}
              onChange={(e) => {
                setTableNumber(e.target.value);
                setTableNumberError(null);
              }}
              placeholder="e.g. T-101 or 12"
              required
            />
            {tableNumberError && (
              <p className="text-xs text-rose-400 mt-1">{tableNumberError}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Table Name / Label
            </label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Window Booth 1"
            />
          </div>
        </div>

        {/* Branch & Capacity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Assigned Branch
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="">Global (All Branches)</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" /> Seating Capacity <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={seatingCapacity}
              onChange={(e) => {
                const val = e.target.value === '' ? '' : Number(e.target.value);
                setSeatingCapacity(val);
                setCapacityError(null);
              }}
              placeholder="e.g. 4"
              required
            />
            {capacityError && (
              <p className="text-xs text-rose-400 mt-1">{capacityError}</p>
            )}
          </div>
        </div>

        {/* Floor & Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Floor / Level
            </label>
            <input
              type="text"
              list="floor-suggestions"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="Select or type floor"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            />
            <datalist id="floor-suggestions">
              {FLOOR_OPTIONS.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Zone / Section
            </label>
            <input
              type="text"
              list="section-suggestions"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="Select or type section"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-orange-500"
            />
            <datalist id="section-suggestions">
              {SECTION_OPTIONS.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Status & Display Order */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Initial Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TableStatus)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              {(Object.keys(TABLE_STATUS_LABELS) as TableStatus[]).map((st) => (
                <option key={st} value={st}>
                  {TABLE_STATUS_LABELS[st]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Display Order
            </label>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="1"
            />
          </div>
        </div>

        {/* Active Checkbox */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
          <input
            type="checkbox"
            id="is_active_check"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 text-orange-500 focus:ring-orange-500/20 bg-slate-900 cursor-pointer"
          />
          <label htmlFor="is_active_check" className="text-xs text-slate-300 cursor-pointer">
            <span className="font-semibold block text-slate-200">Table Active</span>
            Inactive tables are hidden from dining floor operations.
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold"
          >
            {isEdit ? 'Save Changes' : 'Create Table'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
