import React from 'react';
import { Card, MediaUploader, AppImage } from '@qrdine/ui';
import { useAuth } from '../../contexts/AuthContext';
import { Restaurant } from '@qrdine/types';
import { Palette, Image as ImageIcon, Sparkles, Utensils, QrCode } from 'lucide-react';

interface BrandingTabProps {
  formData: Partial<Restaurant>;
  updateField: (key: keyof Restaurant, value: any) => void;
}

export const BrandingTab: React.FC<BrandingTabProps> = ({
  formData,
  updateField,
}) => {
  const { restaurantId } = useAuth();

  const primaryColor = formData.primary_color || '#f97316';
  const secondaryColor = formData.secondary_color || '#0f172a';
  const accentColor = formData.accent_color || '#06b6d4';

  return (
    <div className="flex flex-col gap-6">
      {/* Brand Assets Upload */}
      <Card variant="glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Brand Identity Assets</h3>
            <p className="text-xs text-slate-400">Upload high-resolution logo and cover banner image for customer menu</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Uploader */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Restaurant Logo (Square / Icon)
            </label>
            <MediaUploader
              restaurantId={restaurantId || ''}
              entityType="logo"
              currentImageUrl={formData.logo_url}
              onUploadSuccess={(res) => updateField('logo_url', res.urls.originalUrl)}
              onRemove={() => updateField('logo_url', null)}
              label="Restaurant Logo"
            />
          </div>

          {/* Cover Banner Uploader */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Cover Banner Image (Landscape)
            </label>
            <MediaUploader
              restaurantId={restaurantId || ''}
              entityType="banner"
              currentImageUrl={formData.cover_image_url}
              onUploadSuccess={(res) => updateField('cover_image_url', res.urls.originalUrl)}
              onRemove={() => updateField('cover_image_url', null)}
              label="Cover Banner"
            />
          </div>
        </div>
      </Card>

      {/* Brand Color Theme Palette */}
      <Card variant="glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Color Palette & Theme Customization</h3>
            <p className="text-xs text-slate-400">Define primary, secondary, and accent colors for customer menu UI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {/* Primary Color */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Primary Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => updateField('primary_color', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => updateField('primary_color', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
            <span className="text-xs text-slate-500">Buttons, active badges, highlights</span>
          </div>

          {/* Secondary Color */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Secondary Background Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => updateField('secondary_color', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => updateField('secondary_color', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
            <span className="text-xs text-slate-500">Navigation headers & dark containers</span>
          </div>

          {/* Accent Color */}
          <div className="flex flex-col gap-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Accent Feature Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => updateField('accent_color', e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => updateField('accent_color', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500"
              />
            </div>
            <span className="text-xs text-slate-500">Offer banners, ratings, badges</span>
          </div>
        </div>

        {/* Live Theme Preview Card */}
        <div className="border border-slate-800 rounded-2xl p-5 bg-slate-950/80">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Live Customer App UI Preview
            </span>
            <span className="text-xs text-slate-500">Real-time theme rendering</span>
          </div>

          {/* Mock Mobile Viewport */}
          <div
            className="max-w-md mx-auto rounded-2xl overflow-hidden shadow-2xl border border-slate-800 transition-all duration-300"
            style={{ backgroundColor: secondaryColor }}
          >
            {/* Header Banner */}
            <div className="relative h-28 bg-slate-800 overflow-hidden">
              {formData.cover_image_url ? (
                <AppImage src={formData.cover_image_url} alt="Cover Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 bg-gradient-to-r from-slate-900 to-slate-800">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                </div>
              )}
              {/* Overlay Logo */}
              <div className="absolute -bottom-4 left-4 w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-700 overflow-hidden shadow-lg flex items-center justify-center">
                {formData.logo_url ? (
                  <AppImage src={formData.logo_url} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <Utensils className="w-6 h-6 text-slate-400" />
                )}
              </div>
            </div>

            {/* Mock Content */}
            <div className="p-4 pt-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white">{formData.name || 'Your Restaurant Name'}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider"
                  style={{ backgroundColor: accentColor }}
                >
                  4.8 ★
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-1">{formData.description || 'Delicious food & gourmet experiences'}</p>

              {/* Sample Action Button */}
              <button
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: primaryColor }}
              >
                <QrCode className="w-4 h-4" />
                View Digital Menu & Order
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
