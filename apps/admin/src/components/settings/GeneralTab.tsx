import React from 'react';
import { Card, Input, Select } from '@qrdine/ui';
import { RESTAURANT_TYPES } from '@qrdine/shared';
import { Restaurant } from '@qrdine/types';
import { Store, Globe, Mail, Phone, Hash, FileText } from 'lucide-react';

interface GeneralTabProps {
  formData: Partial<Restaurant>;
  errors: Record<string, string>;
  isCheckingSlug: boolean;
  updateField: (key: keyof Restaurant, value: any) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  formData,
  errors,
  isCheckingSlug,
  updateField,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <Card variant="glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">General Identity & Contact</h3>
            <p className="text-xs text-slate-400">Basic brand metadata, support contact details, and web domain settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Restaurant Name */}
          <Input
            label="Restaurant Name *"
            placeholder="e.g. Spice Garden Bistro"
            value={formData.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            error={errors.name}
            leftIcon={<Store className="w-4 h-4 text-slate-400" />}
          />

          {/* Restaurant Slug */}
          <div className="flex flex-col gap-1.5">
            <Input
              label="Restaurant Handle (Slug) *"
              placeholder="e.g. spice-garden"
              value={formData.slug || ''}
              onChange={(e) => updateField('slug', e.target.value.toLowerCase().replace(/[\s_]+/g, '-'))}
              error={errors.slug}
              leftIcon={<Hash className="w-4 h-4 text-slate-400" />}
            />
            {isCheckingSlug && (
              <span className="text-xs text-orange-400 animate-pulse">Checking handle availability...</span>
            )}
            <span className="text-xs text-slate-500">
              Customer QR menu link: <code className="text-slate-300 font-mono">/r/{formData.slug || 'slug'}</code>
            </span>
          </div>

          {/* Restaurant Type */}
          <Select
            label="Establishment Type"
            value={formData.restaurant_type || 'casual_dining'}
            onChange={(e) => updateField('restaurant_type', e.target.value)}
            options={RESTAURANT_TYPES}
          />

          {/* Support Website */}
          <Input
            label="Website URL"
            placeholder="https://example.com"
            value={formData.website || ''}
            onChange={(e) => updateField('website', e.target.value)}
            error={errors.website}
            leftIcon={<Globe className="w-4 h-4 text-slate-400" />}
          />

          {/* Support Email */}
          <Input
            label="Support Email Address"
            placeholder="support@restaurant.com"
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            error={errors.email}
            leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          />

          {/* Support Phone */}
          <Input
            label="Support Phone Number"
            placeholder="+91 9876543210"
            value={formData.phone || ''}
            onChange={(e) => updateField('phone', e.target.value)}
            error={errors.phone}
            leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          />

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Restaurant Description
            </label>
            <div className="relative">
              <textarea
                rows={3}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
                placeholder="Briefly describe your cuisine, ambiance, and special offerings..."
                value={formData.description || ''}
                onChange={(e) => updateField('description', e.target.value)}
              />
              <FileText className="absolute right-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
            <span className="text-xs text-slate-500 mt-1 block">Displayed on the customer digital menu landing page.</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
