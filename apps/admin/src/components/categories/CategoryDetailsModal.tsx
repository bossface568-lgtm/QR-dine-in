import React from 'react';
import { Category } from '@qrdine/types';
import { Modal, Badge } from '@qrdine/ui';
import { formatDate } from '@qrdine/shared';

interface CategoryDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
}

export function CategoryDetailsModal({ isOpen, onClose, category }: CategoryDetailsModalProps) {
  if (!category) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" title="Category Details">
      <div className="flex flex-col">
        {/* Header Cover */}
        <div 
          className="h-32 w-full rounded-t-lg relative flex items-end p-4 -mt-4 -mx-4 mb-4"
          style={{ 
            backgroundColor: category.bg_color || '#1e293b',
            backgroundImage: category.image_url ? `url(${category.image_url})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent rounded-t-lg" />
          <h2 className="relative z-10 text-2xl font-bold text-white flex items-center gap-2">
            {category.icon && <span>{category.icon}</span>}
            {category.name}
          </h2>
        </div>

        <div className="space-y-6">
          {/* Main Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500 block mb-1">Status</span>
              <Badge variant={category.is_active ? 'available' : 'inactive'}>
                {category.is_active ? 'Active' : 'Inactive'}
              </Badge>
              {category.archived_at && (
                <span className="ml-2"><Badge variant="archived">Archived</Badge></span>
              )}
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Featured</span>
              <Badge variant={category.is_featured ? 'reserved' : 'inactive'}>
                {category.is_featured ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Visibility</span>
              <Badge variant={category.is_visible ? 'available' : 'inactive'}>
                {category.is_visible ? 'Visible' : 'Hidden'}
              </Badge>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Sort Order</span>
              <span className="text-slate-200">{category.sort_order ?? 0}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block mb-1">Description</span>
              <p className="text-slate-300">{category.description || 'No description provided.'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block mb-1">Slug</span>
              <span className="font-mono text-slate-300 bg-slate-900 px-2 py-1 rounded">{category.slug}</span>
            </div>
          </div>

          {/* Schedule */}
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Availability</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500 block mb-1">Time</span>
                <span className="text-slate-300">
                  {category.available_from && category.available_until 
                    ? `${category.available_from} - ${category.available_until}`
                    : 'All day'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1">Days</span>
                <span className="text-slate-300">
                  {category.available_days?.length 
                    ? category.available_days.join(', ')
                    : 'Every day'}
                </span>
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="border-t border-slate-800 pt-4">
            <h3 className="text-sm font-medium text-slate-400 mb-3">Appearance</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded border border-slate-700 shadow-inner" style={{ backgroundColor: category.bg_color || '#1e293b' }} />
                <span className="text-slate-400">Background</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded border border-slate-700 shadow-inner bg-slate-900 flex items-center justify-center">
                  <span className="text-lg font-bold leading-none" style={{ color: category.text_color || '#ffffff' }}>A</span>
                </div>
                <span className="text-slate-400">Text</span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t border-slate-800 pt-4 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Created At</span>
              <span className="text-slate-400">{formatDate(category.created_at)}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Last Updated</span>
              <span className="text-slate-400">{formatDate(category.updated_at)}</span>
            </div>
            {category.archived_at && (
              <div className="col-span-2">
                <span className="text-slate-500 block mb-1">Archived At</span>
                <span className="text-slate-400">{formatDate(category.archived_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
