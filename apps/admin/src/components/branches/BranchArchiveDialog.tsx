import React, { useState } from 'react';
import { Branch } from '@qrdine/types';
import { Modal, Button } from '@qrdine/ui';
import { AlertTriangle, Archive } from 'lucide-react';

interface BranchArchiveDialogProps {
  branch: Branch | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (branchId: string) => Promise<boolean>;
}

export const BranchArchiveDialog: React.FC<BranchArchiveDialogProps> = ({
  branch,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [submitting, setSubmitting] = useState(false);

  if (!branch) return null;

  const handleConfirm = async () => {
    setSubmitting(true);
    const success = await onConfirm(branch.id);
    setSubmitting(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Archive Branch Outlet" size="md">
      <div className="flex flex-col gap-5 py-2">
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold text-amber-200">Are you sure you want to archive this branch?</span>
            <span>
              Archiving <strong className="text-white">{branch.name}</strong> will deactivate it from taking live orders
              and remove it from your active topbar selector.
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs text-slate-400 flex flex-col gap-1">
          <span className="font-semibold text-slate-300">Note: Data is Preserved</span>
          <span>
            Branch records are soft-deleted and archived safely. No historic sales, orders, or table records will be
            deleted. You can restore or view archived branches under the "Archived" tab.
          </span>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            isLoading={submitting}
            onClick={handleConfirm}
            leftIcon={<Archive className="w-4 h-4" />}
          >
            Archive Branch
          </Button>
        </div>
      </div>
    </Modal>
  );
};
