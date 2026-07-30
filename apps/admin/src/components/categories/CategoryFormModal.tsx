import React, { useState, useEffect } from 'react';
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@qrdine/types';
import { Modal, Button, Input, Toggle, Spinner } from '@qrdine/ui';
import { X, Image as ImageIcon } from 'lucide-react';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCategoryPayload | UpdateCategoryPayload) => Promise<boolean>;
  onUploadImage: (file: File) => Promise<{ url: string; key: string } | null>;
  category?: Category | null;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  onUploadImage,
  category
}: CategoryFormModalProps) {
  const isEdit = !!category;
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [icon, setIcon] = useState('');
  const [bgColor, setBgColor] = useState('#1e293b');
  const [textColor, setTextColor] = useState('#ffffff');
  const [isVisible, setIsVisible] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [availableFrom, setAvailableFrom] = useState('');
  const [availableUntil, setAvailableUntil] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>([]);
  
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setName(category.name || '');
        setDescription(category.description || '');
        setImageUrl(category.image_url || '');
        setIcon(category.icon || '');
        setBgColor(category.bg_color || '#1e293b');
        setTextColor(category.text_color || '#ffffff');
        setIsVisible(category.is_visible ?? true);
        setIsFeatured(category.is_featured ?? false);
        setAvailableFrom(category.available_from || '');
        setAvailableUntil(category.available_until || '');
        setAvailableDays(category.available_days || []);
      } else {
        setName('');
        setDescription('');
        setImageUrl('');
        setIcon('');
        setBgColor('#1e293b');
        setTextColor('#ffffff');
        setIsVisible(true);
        setIsFeatured(false);
        setAvailableFrom('');
        setAvailableUntil('');
        setAvailableDays([]);
      }
    }
  }, [isOpen, category]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      const result = await onUploadImage(file);
      if (result) {
        setImageUrl(result.url);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
  };

  const handleDayToggle = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        name,
        description,
        image_url: imageUrl,
        icon,
        bg_color: bgColor,
        text_color: textColor,
        is_visible: isVisible,
        is_active: isVisible,
        is_featured: isFeatured,
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Input 
              label="Name" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required 
              placeholder="e.g. Main Course"
            />
            
            <Input 
              as="textarea"
              label="Description" 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Brief description of the category"
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Icon (Emoji)" 
                value={icon} 
                onChange={e => setIcon(e.target.value)} 
                placeholder="🍔"
              />
              <div className="flex gap-4">
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-sm font-medium text-slate-300">Bg Color</label>
                  <input 
                    type="color" 
                    value={bgColor} 
                    onChange={e => setBgColor(e.target.value)}
                    className="h-10 w-full rounded border border-slate-700 bg-slate-900/50 cursor-pointer"
                  />
                </div>
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-sm font-medium text-slate-300">Text Color</label>
                  <input 
                    type="color" 
                    value={textColor} 
                    onChange={e => setTextColor(e.target.value)}
                    className="h-10 w-full rounded border border-slate-700 bg-slate-900/50 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-300">Image</label>
              {imageUrl ? (
                <div className="relative h-32 rounded-lg border border-slate-700 overflow-hidden group">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button type="button" variant="danger" size="sm" onClick={handleRemoveImage}>
                      <X className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative h-32 rounded-lg border-2 border-dashed border-slate-700 flex flex-col items-center justify-center bg-slate-900/50 text-slate-400 hover:border-orange-500/50 hover:bg-slate-800/50 transition-colors">
                  {isUploading ? (
                    <Spinner size="md" className="text-orange-500" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                      <span className="text-xs font-medium">Click to upload</span>
                    </>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    disabled={isUploading}
                  />
                </div>
              )}
            </div>

            <div className="space-y-4 p-4 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Visibility</span>
                <Toggle checked={isVisible} onChange={e => setIsVisible(e.target.checked)} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-300">Featured</span>
                <Toggle checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 space-y-4">
          <h4 className="text-sm font-medium text-slate-300 border-b border-slate-800 pb-2">Availability Schedule (Optional)</h4>
          
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
            <label className="text-sm font-medium text-slate-300">Available Days</label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    availableDays.includes(day)
                      ? 'bg-orange-500 text-white border-orange-600'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 mt-2">
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
