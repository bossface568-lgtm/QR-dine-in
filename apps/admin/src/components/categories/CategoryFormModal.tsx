import React, { useState, useEffect } from 'react';
import { Category, CreateCategoryPayload, UpdateCategoryPayload, Branch } from '@qrdine/types';
import { Modal, Button, Input, Toggle, MediaUploader } from '@qrdine/ui';
import { useAuth } from '../../contexts/AuthContext';
import { branchService, categoryService } from '@qrdine/lib';
import { generateSlug } from '@qrdine/shared';
import { Building2, Sparkles } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => Promise<boolean>;
  category?: Category | null;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  category
}: CategoryFormModalProps) {
  const { restaurantId } = useAuth();
  const isEdit = !!category;
  
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [icon, setIcon] = useState('');
  const [bgColor, setBgColor] = useState('#1e293b');
  const [textColor, setTextColor] = useState('#ffffff');
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [branchId, setBranchId] = useState<string>('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>(DAYS_OF_WEEK);
  
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch branches for multi-branch assignment
  useEffect(() => {
    if (isOpen && restaurantId) {
      branchService.getBranches(restaurantId).then(res => {
        if (res.data) setBranches(res.data);
      });
    }
  }, [isOpen, restaurantId]);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || '');
        setSlug(category.slug || '');
        setIsSlugCustomized(true);
        setDescription(category.description || '');
        setImageUrl(category.image_url || null);
        setIcon(category.icon || '');
        setBgColor(category.bg_color || '#1e293b');
        setTextColor(category.text_color || '#ffffff');
        setIsVisible(category.is_visible ?? true);
        setIsFeatured(category.is_featured ?? false);
        setBranchId(category.branch_id || '');
        setAvailableFrom(category.available_from || '');
        setAvailableUntil(category.available_until || '');
        setAvailableDays(category.available_days || DAYS_OF_WEEK);
      } else {
        setName('');
        setSlug('');
        setIsSlugCustomized(false);
        setSlugError(null);
        setDescription('');
        setImageUrl(null);
        setIcon('');
        setBgColor('#1e293b');
        setTextColor('#ffffff');
        setIsVisible(true);
        setIsFeatured(false);
        setBranchId('');
        setAvailableFrom('');
        setAvailableUntil('');
        setAvailableDays(DAYS_OF_WEEK);
      }
    }
  }, [isOpen, category]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugCustomized) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugCustomized(true);
    setSlugError(null);
  };

  const handleDayToggle = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Validate slug uniqueness
    if (restaurantId && slug.trim()) {
      const check = await categoryService.checkSlugAvailable(restaurantId, slug.trim(), category?.id);
      if (check.error || !check.data) {
        setSlugError('This slug is already in use by another category.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        slug: slug.trim() || generateSlug(name),
        description: description.trim(),
        image_url: imageUrl,
        icon: icon.trim(),
        bg_color: bgColor,
        text_color: textColor,
        is_visible: isVisible,
        is_active: isVisible,
        is_featured: isFeatured,
        branch_id: branchId || null,
        available_from: availableFrom || null,
        available_until: availableUntil || null,
        available_days: availableDays,
      };
      
      if (isEdit) {
        payload.id = category.id;
      }
      
      const success = await onSubmit(payload);
      if (success) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title={isEdit ? "Edit Category" : "Create Category"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left Column: Basic Information */}
          <div className="space-y-4">
            <Input 
              label="Category Name *" 
              value={name} 
              onChange={handleNameChange} 
              required 
              placeholder="e.g. Gourmet Burgers, Beverages"
            />

            <Input 
              label="URL Slug (Identifier)" 
              value={slug} 
              onChange={handleSlugChange} 
              placeholder="gourmet-burgers"
              error={slugError || undefined}
              helperText="Auto-generated from category name. Unique identifier for QR menu URLs."
            />
            
            <Input 
              as="textarea"
              label="Description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Provide a brief description for customers..."
              rows={3}
            />

            {/* Branch Assignment */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-orange-400" />
                Branch Visibility
              </label>
              <select
                value={branchId}
                onChange={e => setBranchId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-100 rounded-lg py-2 px-3 text-sm focus:border-orange-500 focus:outline-none"
              >
                <option value="">All Branches (Global Category)</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.is_default ? '(Primary)' : ''}
                  </option>
                ))}
              </select>
              <span className="text-xs text-slate-500">
                Select specific branch or make visible across all locations.
              </span>
            </div>

            {/* Icon & Color Styling */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Input 
                label="Display Icon (Emoji)" 
                value={icon} 
                onChange={e => setIcon(e.target.value)} 
                placeholder="🍔"
              />
              <div className="flex gap-3">
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Card Bg</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={bgColor} 
                      onChange={e => setBgColor(e.target.value)}
                      className="h-9 w-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{bgColor}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="color" 
                      value={textColor} 
                      onChange={e => setTextColor(e.target.value)}
                      className="h-9 w-9 rounded-lg border-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs font-mono text-slate-400">{textColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Display Image & Status */}
          <div className="space-y-4">
            {/* Category Image Uploader (Shared Media Service) */}
            <MediaUploader
              restaurantId={restaurantId || ''}
              entityType="category"
              currentImageUrl={imageUrl}
              onUploadSuccess={(res) => setImageUrl(res.urls.originalUrl)}
              onRemove={() => setImageUrl(null)}
              label="Display Image"
            />

            {/* Toggles */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200">Active & Visible</span>
                  <span className="text-xs text-slate-500">Show this category on customer menus</span>
                </div>
                <Toggle checked={isVisible} onChange={e => setIsVisible(e.target.checked)} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Featured Category
                  </span>
                  <span className="text-xs text-slate-500">Highlight at top of digital menu</span>
                </div>
                <Toggle checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
              </div>
            </div>
          </div>
        </div>

        {/* Availability Schedule Section */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Availability Schedule & Day Restrictions (Optional)
            </h4>
            <span className="text-xs text-slate-500">e.g. Breakfast only (7AM - 11AM)</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="time" 
              label="Available From" 
              value={availableFrom} 
              onChange={e => setAvailableFrom(e.target.value)} 
            />
            <Input 
              type="time" 
              label="Available Until" 
              value={availableUntil} 
              onChange={e => setAvailableUntil(e.target.value)} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Available Days of Week
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => {
                const isSelected = availableDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleDayToggle(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-sm'
                        : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
