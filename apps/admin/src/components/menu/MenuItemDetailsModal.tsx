import React from 'react';
import { MenuItem, Category } from '@qrdine/types';
import { Modal, Button, Badge, AppImage } from '@qrdine/ui';
import { cn, formatCurrency, MENU_ITEM_STATUS_LABELS, MENU_ITEM_STATUS_COLORS } from '@qrdine/shared';
import { 
  Pencil, Copy, Archive, Info, Tag, Clock, Hash, Flame
} from 'lucide-react';
import { DietaryBadge } from './DietaryBadge';

interface MenuItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  categories?: Category[];
}

export function MenuItemDetailsModal({
  isOpen,
  onClose,
  item,
  onEdit,
  onDuplicate,
  onArchive,
  categories = []
}: MenuItemDetailsModalProps) {
  if (!item) return null;

  const category = categories.find(c => c.id === item.category_id);
  const statusColor = MENU_ITEM_STATUS_COLORS[item.status] || 'slate';
  const statusLabel = MENU_ITEM_STATUS_LABELS[item.status] || item.status;
  const isArchived = !!item.archived_at;

  const handleEdit = () => {
    onClose();
    onEdit();
  };

  const handleDuplicate = () => {
    onClose();
    onDuplicate();
  };

  const handleArchive = () => {
    onClose();
    onArchive();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      title="Menu Item Details"
      size="lg"
      footer={
        <div className="flex justify-between w-full">
          {!isArchived && (
            <Button variant="danger" leftIcon={<Archive size={16} />} onClick={handleArchive}>
              Archive
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={onClose}>Close</Button>
            <Button variant="outline" leftIcon={<Copy size={16} />} onClick={handleDuplicate}>
              Duplicate
            </Button>
            <Button variant="primary" leftIcon={<Pencil size={16} />} onClick={handleEdit}>
              Edit Item
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0 relative">
            {item.image_url ? (
              <AppImage src={item.image_url} alt={item.name} entityType="menu" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl font-bold opacity-30 text-slate-500">
                  {item.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            {item.is_featured && (
              <div className="absolute top-2 right-2">
                <Badge variant="confirmed">Featured</Badge>
              </div>
            )}
            {isArchived && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                <Badge variant="archived">Archived</Badge>
              </div>
            )}
          </div>
          
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="inactive">{category?.name || 'Uncategorized'}</Badge>
                <Badge variant={item.status === 'available' ? 'available' : item.status === 'out_of_stock' ? 'cancelled' : 'inactive'}>{statusLabel}</Badge>
                {item.is_new && <Badge variant="available">New</Badge>}
              </div>
              <h2 className="text-2xl font-bold text-slate-100">{item.name}</h2>
              {item.short_name && <p className="text-slate-400">Short: {item.short_name}</p>}
              <p className="font-mono text-sm text-slate-500 mt-1">/{item.slug}</p>
            </div>
            
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-slate-100">
                {formatCurrency(item.base_price, 'USD')}
              </span>
              {item.compare_at_price && item.compare_at_price > item.base_price && (
                <span className="text-lg text-slate-500 line-through">
                  {formatCurrency(item.compare_at_price, 'USD')}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {item.dietary_tags?.map(tag => (
                <DietaryBadge key={tag} tag={tag} />
              ))}
            </div>
          </div>
        </div>

        {/* Details Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <h3 className="flex items-center gap-2 font-semibold text-slate-200 mb-3">
              <Info className="w-4 h-4 text-orange-500" /> Description
            </h3>
            <p className="text-sm text-slate-400 whitespace-pre-wrap">
              {item.description || 'No description provided.'}
            </p>
            {item.short_description && (
              <div className="mt-3 pt-3 border-t border-slate-800/50">
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Short Description</p>
                <p className="text-sm text-slate-400">{item.short_description}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h3 className="flex items-center gap-2 font-semibold text-slate-200 mb-3">
                <Clock className="w-4 h-4 text-orange-500" /> Operations & Details
              </h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">Prep Time</p>
                  <p className="text-slate-200">{item.preparation_time ? `${item.preparation_time} mins` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Calories</p>
                  <p className="text-slate-200">{item.calories ? `${item.calories} kcal` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Spice Level</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map(level => (
                      <Flame 
                        key={level} 
                        className={cn("w-3.5 h-3.5", level <= item.spice_level ? "text-orange-500 fill-orange-500" : "text-slate-700")} 
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Tax Category</p>
                  <p className="text-slate-200">{item.tax_category || 'Standard'}</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              <h3 className="flex items-center gap-2 font-semibold text-slate-200 mb-3">
                <Hash className="w-4 h-4 text-orange-500" /> Identifiers
              </h3>
              <div className="grid grid-cols-2 gap-y-3 text-sm">
                <div>
                  <p className="text-slate-500 text-xs">SKU</p>
                  <p className="text-slate-200 font-mono text-xs">{item.sku || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Barcode</p>
                  <p className="text-slate-200 font-mono text-xs">{item.barcode || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-slate-500 text-xs">Internal Code</p>
                  <p className="text-slate-200 font-mono text-xs">{item.internal_code || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Allergens */}
        {item.allergens && item.allergens.length > 0 && (
          <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <h3 className="flex items-center gap-2 font-semibold text-slate-200 mb-3">
              <Tag className="w-4 h-4 text-orange-500" /> Allergens
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.allergens.map(allergen => (
                <Badge key={allergen} variant="preparing">
                  {allergen}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
