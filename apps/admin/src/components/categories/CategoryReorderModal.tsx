import React, { useState, useEffect } from 'react';
import { Category } from '@qrdine/types';
import { Modal, Button } from '@qrdine/ui';
import { cn } from '@qrdine/shared';
import { GripVertical } from 'lucide-react';

interface CategoryReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSave: (items: { id: string; sort_order: number }[]) => Promise<boolean>;
}

export const CategoryReorderModal: React.FC<CategoryReorderModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSave,
}) => {
  const [items, setItems] = useState<Category[]>([]);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Filter out archived and sort by current sort_order
      setItems(
        categories
          .filter((c) => !c.archived_at)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      );
    } else {
      setDraggedIdx(null);
      setDragOverIdx(null);
    }
  }, [categories, isOpen]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    // Small fix for Firefox to allow drag
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIdx === null || draggedIdx === index) return;
    setDragOverIdx(index);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null) return;
    
    const newItems = [...items];
    const draggedItem = newItems[draggedIdx];
    
    newItems.splice(draggedIdx, 1);
    newItems.splice(index, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIdx(null);
    setDragOverIdx(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const payload = items.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));
    
    const success = await onSave(payload);
    if (success) {
      onClose();
    }
    setIsSaving(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reorder Categories" size="md">
      <div className="py-2">
        <p className="text-slate-400 text-sm mb-4">
          Drag and drop categories to change their display order on the menu.
        </p>
        
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
              className={cn(
                "flex items-center gap-3 p-3 bg-slate-800/50 border rounded-xl transition-all duration-200",
                draggedIdx === index ? "opacity-50 border-orange-500/50" : "border-slate-700/50",
                dragOverIdx === index && draggedIdx !== null && draggedIdx < index ? "border-b-2 border-b-orange-500" : "",
                dragOverIdx === index && draggedIdx !== null && draggedIdx > index ? "border-t-2 border-t-orange-500" : "",
                "hover:bg-slate-800"
              )}
            >
              <div className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 p-1">
                <GripVertical size={20} />
              </div>
              
              <div className="flex-1 flex flex-col">
                <span className="text-sm font-medium text-slate-200">{item.name}</span>
                {item.description && (
                  <span className="text-xs text-slate-500 truncate max-w-[200px]">
                    {item.description}
                  </span>
                )}
              </div>
              
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/50 text-xs font-medium text-slate-400">
                {index + 1}
              </div>
            </div>
          ))}
          
          {items.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No active categories to reorder.
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-800">
        <Button variant="secondary" onClick={onClose} disabled={isSaving}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSave} 
          isLoading={isSaving}
          disabled={items.length === 0 || isSaving}
        >
          Save Order
        </Button>
      </div>
    </Modal>
  );
};
