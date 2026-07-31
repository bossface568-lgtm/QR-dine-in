import React, { useState, useEffect } from 'react';
import { MenuItem, CreateMenuItemPayload, UpdateMenuItemPayload, Category, Branch, DietaryTag, MenuItemStatus, MenuItemGalleryImage } from '@qrdine/types';
import { Modal, Button, Input, Toggle, MediaUploader } from '@qrdine/ui';
import { useAuth } from '../../contexts/AuthContext';
import { branchService, categoryService, menuItemService } from '@qrdine/lib';
import { generateSlug, DIETARY_TAG_OPTIONS, TAX_CATEGORIES, SPICE_LEVELS, MENU_ITEM_STATUS_LABELS, WEEKDAYS } from '@qrdine/shared';

interface MenuItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateMenuItemPayload | UpdateMenuItemPayload) => Promise<boolean>;
  menuItem?: MenuItem | null;
}

export function MenuItemFormModal({
  isOpen,
  onClose,
  onSubmit,
  menuItem
}: MenuItemFormModalProps) {
  const { restaurantId } = useAuth();
  const isEdit = !!menuItem;
  
  // Section 1: Basic Information
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugCustomized, setIsSlugCustomized] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [branchId, setBranchId] = useState('');
  
  // Section 2: Media
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  
  // Section 3: Pricing & Tax
  const [basePrice, setBasePrice] = useState<number | ''>('');
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>('');
  const [taxCategory, setTaxCategory] = useState('gst_5');
  
  // Section 4: Codes
  const [sku, setSku] = useState('');
  const [internalCode, setInternalCode] = useState('');
  
  // Section 5: Dietary Tags
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  
  // Section 6: Operations
  const [preparationTime, setPreparationTime] = useState<number | ''>(15);
  const [spiceLevel, setSpiceLevel] = useState<number>(0);
  const [status, setStatus] = useState<MenuItemStatus>('available');
  
  // Section 7: Display Flags
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isChefSpecial, setIsChefSpecial] = useState(false);
  const [isSeasonal, setIsSeasonal] = useState(false);
  
  // Section 8: Availability Schedule
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>(WEEKDAYS);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && restaurantId) {
      branchService.getBranches(restaurantId).then(res => {
        if (res.data) setBranches(res.data);
      });
      categoryService.getCategories(restaurantId).then(res => {
        if (res.data) setCategories(res.data);
      });
    }
  }, [isOpen, restaurantId]);

  useEffect(() => {
    if (isOpen) {
      if (menuItem) {
        setName(menuItem.name || '');
        setShortName(menuItem.short_name || '');
        setSlug(menuItem.slug || '');
        setIsSlugCustomized(true);
        setDescription(menuItem.description || '');
        setShortDescription(menuItem.short_description || '');
        setCategoryId(menuItem.category_id || '');
        setBranchId(menuItem.branch_id || '');
        setImageUrl(menuItem.image_url || null);
        setBasePrice(menuItem.base_price ?? '');
        setCompareAtPrice(menuItem.compare_at_price ?? '');
        setTaxCategory(menuItem.tax_category || 'gst_5');
        setSku(menuItem.sku || '');
        setInternalCode(menuItem.internal_code || '');
        setDietaryTags(menuItem.dietary_tags || []);
        setPreparationTime(menuItem.preparation_time ?? 15);
        setSpiceLevel(menuItem.spice_level || 0);
        setStatus(menuItem.status || 'available');
        setIsFeatured(menuItem.is_featured ?? false);
        setIsNew(menuItem.is_new ?? false);
        setIsBestSeller(menuItem.is_best_seller ?? false);
        setIsChefSpecial(menuItem.is_chef_special ?? false);
        setIsSeasonal(menuItem.is_seasonal ?? false);
        setAvailableFrom(menuItem.available_from || '');
        setAvailableUntil(menuItem.available_until || '');
        setAvailableDays(menuItem.available_days || WEEKDAYS);
      } else {
        setName('');
        setShortName('');
        setSlug('');
        setIsSlugCustomized(false);
        setSlugError(null);
        setDescription('');
        setShortDescription('');
        setCategoryId('');
        setBranchId('');
        setImageUrl(null);
        setBasePrice('');
        setCompareAtPrice('');
        setTaxCategory('gst_5');
        setSku('');
        setInternalCode('');
        setDietaryTags([]);
        setPreparationTime(15);
        setSpiceLevel(0);
        setStatus('available');
        setIsFeatured(false);
        setIsNew(false);
        setIsBestSeller(false);
        setIsChefSpecial(false);
        setIsSeasonal(false);
        setAvailableFrom('');
        setAvailableUntil('');
        setAvailableDays(WEEKDAYS);
      }
    }
  }, [isOpen, menuItem]);

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

  const handleDietaryTagToggle = (tagValue: string) => {
    setDietaryTags(prev => 
      prev.includes(tagValue) ? prev.filter(t => t !== tagValue) : [...prev, tagValue]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || basePrice === '') return;

    setIsSubmitting(true);
    setSlugError(null);

    try {
      if (restaurantId && slug.trim()) {
        const check = await menuItemService.checkSlugAvailable(restaurantId, slug.trim(), menuItem?.id);
        if (check.data === false) {
          setSlugError('This slug is already in use by another menu item.');
          return;
        }
      }

      const payload: any = {
        name: name.trim(),
        short_name: shortName.trim() || null,
        slug: slug.trim() || generateSlug(name),
        description: description.trim() || null,
        short_description: shortDescription.trim() || null,
        category_id: categoryId,
        branch_id: branchId || null,
        image_url: imageUrl,
        base_price: Number(basePrice),
        compare_at_price: compareAtPrice !== '' ? Number(compareAtPrice) : null,
        tax_category: taxCategory,
        sku: sku.trim() || null,
        internal_code: internalCode.trim() || null,
        dietary_tags: dietaryTags,
        preparation_time: preparationTime !== '' ? Number(preparationTime) : null,
        spice_level: spiceLevel,
        status: status,
        is_featured: isFeatured,
        is_new: isNew,
        is_best_seller: isBestSeller,
        is_chef_special: isChefSpecial,
        is_seasonal: isSeasonal,
        available_from: availableFrom || null,
        available_until: availableUntil || null,
        available_days: availableDays,
      };
      
      if (isEdit) {
        payload.id = menuItem.id;
      }
      
      const success = await onSubmit(payload);
      if (success) onClose();
    } catch (err: any) {
      console.error('Error submitting menu item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title={isEdit ? "Edit Menu Item" : "Create Menu Item"}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-2 max-h-[80vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            
            {/* Section 1: Basic Information */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Basic Information</h4>
              
              <Input 
                label="Item Name *" 
                value={name} 
                onChange={handleNameChange} 
                required 
                placeholder="e.g. Classic Cheeseburger"
              />
              
              <Input 
                label="Short Name (KDS/POS)" 
                value={shortName} 
                onChange={e => setShortName(e.target.value)} 
                placeholder="e.g. C.Burger"
              />

              <Input 
                label="URL Slug" 
                value={slug} 
                onChange={handleSlugChange} 
                placeholder="classic-cheeseburger"
                error={slugError || undefined}
              />
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Category *</label>
                <select
                  required
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg py-2 px-3 text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="">Select Category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Branch Visibility</label>
                <select
                  value={branchId}
                  onChange={e => setBranchId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg py-2 px-3 text-sm focus:border-orange-500 focus:outline-none"
                >
                  <option value="">All Branches (Global Item)</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.is_default ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <Input 
                as="textarea"
                label="Description" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Detailed description for customers..."
                rows={3}
              />

              <Input 
                label="Short Description" 
                value={shortDescription} 
                onChange={e => setShortDescription(e.target.value)} 
                placeholder="Brief highlight..."
              />
            </div>

            {/* Section 3: Pricing & Tax */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Pricing & Tax</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  type="number"
                  label="Base Price *" 
                  value={basePrice} 
                  onChange={e => setBasePrice(e.target.value ? Number(e.target.value) : '')} 
                  required
                  min={0}
                  step={0.01}
                />
                
                <Input 
                  type="number"
                  label="Compare at Price" 
                  value={compareAtPrice} 
                  onChange={e => setCompareAtPrice(e.target.value ? Number(e.target.value) : '')} 
                  min={0}
                  step={0.01}
                  helperText="Shows as strikethrough"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tax Category</label>
                <select
                  value={taxCategory}
                  onChange={e => setTaxCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg py-2 px-3 text-sm focus:border-orange-500 focus:outline-none"
                >
                  {TAX_CATEGORIES.map(tc => (
                    <option key={tc.value} value={tc.value}>{tc.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 4: Codes */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Codes</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="SKU" 
                  value={sku} 
                  onChange={e => setSku(e.target.value)} 
                  placeholder="e.g. BGR-001"
                />
                <Input 
                  label="Internal Code" 
                  value={internalCode} 
                  onChange={e => setInternalCode(e.target.value)} 
                  placeholder="e.g. KITCHEN-A1"
                />
                <Input 
                  label="Barcode" 
                  value="" 
                  onChange={() => {}} 
                  disabled
                  helperText="Coming soon in next update"
                />
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            
            {/* Section 2: Media */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Media</h4>
              <MediaUploader
                restaurantId={restaurantId || ''}
                entityType="menu"
                currentImageUrl={imageUrl}
                onUploadSuccess={(res) => setImageUrl(res.urls.originalUrl)}
                onRemove={() => setImageUrl(null)}
                label="Cover Image"
              />
              <div className="text-xs text-slate-500 bg-slate-950 p-3 rounded-lg border border-slate-800/50 text-center">
                Gallery management coming in next update
              </div>
            </div>

            {/* Section 5: Dietary Tags */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Dietary Tags</h4>
              <div className="flex flex-wrap gap-2">
                {DIETARY_TAG_OPTIONS.map(tag => {
                  const isSelected = dietaryTags.includes(tag.value);
                  return (
                    <button
                      type="button"
                      key={tag.value}
                      onClick={() => handleDietaryTagToggle(tag.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span>{tag.icon}</span>
                      <span>{tag.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 6: Operations */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Operations</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  type="number"
                  label="Preparation Time (mins)" 
                  value={preparationTime} 
                  onChange={e => setPreparationTime(e.target.value ? Number(e.target.value) : '')} 
                  min={0}
                />
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status</label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as MenuItemStatus)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg py-2 px-3 text-sm focus:border-orange-500 focus:outline-none"
                  >
                    {Object.entries(MENU_ITEM_STATUS_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Spice Level</label>
                <select
                  value={spiceLevel}
                  onChange={e => setSpiceLevel(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded-lg py-2 px-3 text-sm focus:border-orange-500 focus:outline-none"
                >
                  {SPICE_LEVELS.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label} {level.icon && `(${level.icon})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Section 7: Display Flags */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Display Flags</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">Featured Item</span>
                  <Toggle checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">New Item</span>
                  <Toggle checked={isNew} onChange={e => setIsNew(e.target.checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">Best Seller</span>
                  <Toggle checked={isBestSeller} onChange={e => setIsBestSeller(e.target.checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">Chef's Special</span>
                  <Toggle checked={isChefSpecial} onChange={e => setIsChefSpecial(e.target.checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-200">Seasonal</span>
                  <Toggle checked={isSeasonal} onChange={e => setIsSeasonal(e.target.checked)} />
                </div>
              </div>
            </div>

            {/* Section 8: Availability Schedule */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Availability Schedule
                </h4>
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
                  {WEEKDAYS.map(day => {
                    const isSelected = availableDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
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

          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 sticky bottom-0 bg-slate-900/90 py-4 z-10 backdrop-blur-sm mt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {isEdit ? 'Save Changes' : 'Create Menu Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
