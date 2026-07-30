import React from 'react';
import { Category } from '@qrdine/types';
import { Modal, Button } from '@qrdine/ui';
import { AlertTriangle } from 'lucide-react';

interface CategoryArchiveDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  category: Category | null;
  isLoading?: boolean;
}

export function CategoryArchiveDialog({
  isOpen,
  onClose,
  onConfirm,
  category,
  isLoading
}: CategoryArchiveDialogProps) {
  if (!category) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center p-4">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        
        <h3 className="text-lg font-semibold text-slate-100 mb-2">
          Archive Category
        </h3>
        
        <p className="text-sm text-slate-400 mb-6">
          Are you sure you want to archive "<span className="text-slate-200 font-medium">{category.name}</span>"? 
          This will hide it from the menu. You can restore it later.
        </p>

        <div className="flex gap-3 w-full">
          <Button 
            variant="secondary" 
            className="flex-1" 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            className="flex-1" 
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Archive
          </Button>
        </div>
      </div>
    </Modal>
  );
}
