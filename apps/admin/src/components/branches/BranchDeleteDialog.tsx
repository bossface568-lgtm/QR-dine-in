import React, { useState } from 'react';
import { Branch } from '@qrdine/types';
import { Modal, Button, Input } from '@qrdine/ui';
import { AlertOctagon, Trash2 } from 'lucide-react';

interface BranchDeleteDialogProps {
  branch: Branch | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (branchId: string) => Promise<boolean>;
}

export const BranchDeleteDialog: React.FC<BranchDeleteDialogProps> = ({
  branch,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [confirmName, setConfirmName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!branch) return null;

  const isConfirmed = confirmName.trim() === branch.name.trim();

  const handleConfirm = async () => {
    if (!isConfirmed) return;
    setSubmitting(true);
    const success = await onConfirm(branch.id);
    setSubmitting(false);
    if (success) {
      setConfirmName('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Permanently Delete Branch" size="md">
      <div className="flex flex-col gap-5 py-2">
        <div className="flex items-start gap-3.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
          <AlertOctagon className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 text-xs">
            <span className="font-bold text-rose-200">Danger: Permanent Deletion</span>
            <span>
              This action will permanently purge <strong className="text-white">{branch.name}</strong> from the database.
              This cannot be undone.
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          <label className="text-slate-300">
            Please type <strong className="text-rose-400 select-all">{branch.name}</strong> to confirm deletion:
          </label>
          <Input
            id="confirmBranchName"
            placeholder={branch.name}
            value={confirmName}
            onChange={(e) => setConfirmName(e.target.value)}
            className="bg-slate-950/40 border-rose-500/30 focus:border-rose-500 text-xs"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            disabled={!isConfirmed || submitting}
            isLoading={submitting}
            onClick={handleConfirm}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Permanently Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};
