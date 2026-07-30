import React from 'react';
import { Category } from '@qrdine/types';
import { Card, Button, Badge } from '@qrdine/ui';
import { cn, truncate } from '@qrdine/shared';
import { Pencil, Copy, Archive, RotateCcw, Star, Eye } from 'lucide-react';

interface CategoryCardProps {
  category: Category;
  onEdit: (cat: Category) => void;
  onArchive: (cat: Category) => void;
  onRestore: (cat: Category) => void;
  onDuplicate: (cat: Category) => void;
  onToggleStatus: (cat: Category) => void;
  onToggleFeatured: (cat: Category) => void;
  onViewDetails: (cat: Category) => void;
}

export function CategoryCard({
  category,
  onEdit,
  onArchive,
  onRestore,
  onDuplicate,
  onToggleStatus,
  onToggleFeatured,
  onViewDetails,
}: CategoryCardProps) {
  const isArchived = !!category.archived_at;
  const isActive = category.is_active;
  
  // Format availability
  let availabilityText = 'Always available';
  if (category.available_days?.length || (category.available_from && category.available_until)) {
    const days = category.available_days?.length ? `${category.available_days.length} days` : 'Mon-Sun';
    const time = (category.available_from && category.available_until) 
      ? `${category.available_from}-${category.available_until}` 
      : 'All day';
    availabilityText = `${days} • ${time}`;
  }

  return (
    <Card 
      variant="glass" 
      className={cn(
        "flex flex-col overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-lg",
        isArchived && "opacity-60 grayscale-[0.2]"
      )}
    >
      {/* Header Image or Gradient */}
      <div 
        className="relative h-32 w-full flex items-center justify-center cursor-pointer"
        style={{ 
          backgroundColor: category.bg_color || '#1e293b',
          backgroundImage: category.image_url ? `url(${category.image_url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onClick={() => onViewDetails(category)}
      >
        {!category.image_url && (
          <span className="text-4xl font-bold opacity-50" style={{ color: category.text_color || '#fff' }}>
            {category.icon || category.name.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <div className="absolute top-2 right-2 flex gap-1">
          {category.is_featured && (
            <Badge variant="reserved">
              Featured
            </Badge>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-slate-100 truncate pr-2" title={category.name}>
            {category.name}
          </h3>
          <Badge variant={isActive ? 'available' : 'inactive'}>
            {isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        
        <p className="text-sm text-slate-400 h-10 line-clamp-2">
          {category.description ? truncate(category.description, 60) : 'No description'}
        </p>

        <div className="text-xs text-slate-500 mt-auto flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
          {availabilityText}
        </div>
        
        {isArchived && (
          <div className="mt-1">
            <Badge variant="archived">Archived</Badge>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 bg-slate-900/50 border-t border-slate-800 flex justify-between items-center">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onToggleFeatured(category)} title={category.is_featured ? "Unfeature" : "Feature"}>
            <Star className={cn("w-4 h-4", category.is_featured ? "text-amber-500 fill-amber-500" : "text-slate-400")} />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(category)} title="View Details">
            <Eye className="w-4 h-4 text-slate-400" />
          </Button>
        </div>
        
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)} title="Edit">
            <Pencil className="w-4 h-4 text-slate-400" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDuplicate(category)} title="Duplicate">
            <Copy className="w-4 h-4 text-slate-400" />
          </Button>
          {isArchived ? (
            <Button variant="ghost" size="sm" onClick={() => onRestore(category)} title="Restore">
              <RotateCcw className="w-4 h-4 text-slate-400" />
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={() => onArchive(category)} title="Archive">
              <Archive className="w-4 h-4 text-danger-400" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
