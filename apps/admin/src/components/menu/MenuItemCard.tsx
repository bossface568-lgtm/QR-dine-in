import React, { useState } from 'react';
import { MenuItem, MenuItemStatus, Category } from '@qrdine/types';
import { Button, Badge, AppImage } from '@qrdine/ui';
import { cn, formatCurrency, MENU_ITEM_STATUS_LABELS, MENU_ITEM_STATUS_COLORS } from '@qrdine/shared';
import { 
  Pencil, Copy, Archive, RotateCcw, Star, Eye, Clock, 
  MoreVertical, CheckSquare, Square, ChevronDown 
} from 'lucide-react';
import { DietaryBadge } from './DietaryBadge';

interface MenuItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
  onDetails: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onToggleFeatured: () => void;
  onSetStatus: (status: MenuItemStatus) => void;
  categories?: Category[];
}

export function MenuItemCard({
  item,
  isSelected,
  onToggleSelect,
  onEdit,
  onDetails,
  onDuplicate,
  onArchive,
  onRestore,
  onToggleFeatured,
  onSetStatus,
  categories = []
}: MenuItemCardProps) {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const isArchived = !!item.archived_at;
  const category = categories.find(c => c.id === item.category_id);
  
  const statusColor = MENU_ITEM_STATUS_COLORS[item.status] || 'slate';
  const statusLabel = MENU_ITEM_STATUS_LABELS[item.status] || item.status;

  return (
    <div className={cn(
      "bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg group",
      isArchived && "opacity-60 grayscale-[0.2]",
      isSelected && "border-orange-500/50 ring-1 ring-orange-500/20"
    )}>
      {/* Header Image */}
      <div 
        className="relative h-40 w-full flex items-center justify-center bg-slate-950 cursor-pointer overflow-hidden"
        onClick={onDetails}
      >
        {item.image_url ? (
          <AppImage 
            src={item.image_url} 
            alt={item.name} 
            entityType="menu" 
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
          />
        ) : (
          <span className="text-4xl font-bold opacity-30 text-slate-500">
            {item.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
        
        {/* Selection Checkbox */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect();
          }}
          className="absolute top-3 left-3 p-1 rounded bg-slate-950/40 backdrop-blur-sm border border-slate-700/50 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {isSelected ? (
            <CheckSquare className="w-5 h-5 text-orange-500" />
          ) : (
            <Square className="w-5 h-5" />
          )}
        </button>

        {/* Top Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          {item.is_featured && (
            <Badge variant="confirmed">Featured</Badge>
          )}
          {item.is_new && (
            <Badge variant="available">New</Badge>
          )}
        </div>

        {/* Bottom Image Overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
          <Badge variant="inactive">
            {category?.name || 'Uncategorized'}
          </Badge>
          <div className="flex gap-1">
            {item.dietary_tags?.slice(0, 3).map(tag => (
              <DietaryBadge key={tag} tag={tag} />
            ))}
            {(item.dietary_tags?.length || 0) > 3 && (
              <Badge variant="inactive">+{item.dietary_tags.length - 3}</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col">
            <h3 className="font-semibold text-lg text-slate-100 leading-tight">
              {item.name}
            </h3>
            {item.short_name && (
              <span className="text-xs text-slate-400">{item.short_name}</span>
            )}
          </div>
          <span className="font-bold text-slate-100 whitespace-nowrap">
            {formatCurrency(item.base_price, 'USD')}
          </span>
        </div>
        
        <p className="text-sm text-slate-400 h-10 line-clamp-2">
          {item.short_description || item.description || 'No description'}
        </p>

        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-center gap-3">
            {item.preparation_time && (
              <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-md">
                <Clock className="w-3 h-3" />
                <span>{item.preparation_time}m</span>
              </div>
            )}
          </div>
          
          <div className="relative">
            <button 
              className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border transition-colors",
                `bg-${statusColor}-500/10 text-${statusColor}-500 border-${statusColor}-500/20 hover:bg-${statusColor}-500/20`
              )}
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            >
              {statusLabel}
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>
            
            {showStatusDropdown && (
              <div className="absolute right-0 bottom-full mb-1 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-10 py-1">
                {(Object.keys(MENU_ITEM_STATUS_LABELS) as MenuItemStatus[]).map(status => (
                  <button
                    key={status}
                    className={cn(
                      "w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 transition-colors",
                      item.status === status ? "text-orange-400 font-medium bg-slate-800/50" : "text-slate-300"
                    )}
                    onClick={() => {
                      onSetStatus(status);
                      setShowStatusDropdown(false);
                    }}
                  >
                    {MENU_ITEM_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-slate-900/80 border-t border-slate-800 flex justify-between items-center">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onToggleFeatured} title={item.is_featured ? "Unfeature" : "Feature"}>
            <Star className={cn("w-4 h-4", item.is_featured ? "text-amber-500 fill-amber-500" : "text-slate-400")} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDetails} title="View Details">
            <Eye className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onEdit} title="Edit">
            <Pencil className="w-4 h-4 text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate">
            <Copy className="w-4 h-4 text-slate-400" />
          </Button>
          {isArchived ? (
            <Button variant="ghost" size="sm" onClick={onRestore} title="Restore">
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={onArchive} title="Archive">
              <Archive className="w-4 h-4 text-danger-400" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Click outside listener for dropdown */}
      {showStatusDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowStatusDropdown(false)}
        />
      )}
    </div>
  );
}
