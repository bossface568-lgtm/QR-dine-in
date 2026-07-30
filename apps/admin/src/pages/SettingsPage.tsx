import React, { useState } from 'react';
import { useSettings } from '../hooks/useSettings';
import { Button, Card, Spinner } from '@qrdine/ui';
import { cn } from '@qrdine/shared';
import { GeneralTab } from '../components/settings/GeneralTab';
import { BrandingTab } from '../components/settings/BrandingTab';
import { BusinessTab } from '../components/settings/BusinessTab';
import { RegionalTab } from '../components/settings/RegionalTab';
import { OrderingTab } from '../components/settings/OrderingTab';
import { NotificationsTab } from '../components/settings/NotificationsTab';
import { PlaceholderTab } from '../components/settings/PlaceholderTab';
import {
  Store,
  Palette,
  Building2,
  Globe2,
  ShoppingBag,
  Bell,
  Layers,
  ShieldCheck,
  Sliders,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Settings,
} from 'lucide-react';

export type SettingsTabType =
  | 'general'
  | 'branding'
  | 'business'
  | 'regional'
  | 'ordering'
  | 'notifications'
  | 'integrations'
  | 'security'
  | 'advanced';

interface TabItem {
  id: SettingsTabType;
  label: string;
  icon: React.ReactNode;
  isPlaceholder?: boolean;
}

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTabType>('general');
  const {
    formData,
    isDirty,
    isSaving,
    isCheckingSlug,
    errors,
    updateField,
    saveSettings,
    resetSettings,
  } = useSettings();

  const tabs: TabItem[] = [
    { id: 'general', label: 'General', icon: <Store className="w-4 h-4" /> },
    { id: 'branding', label: 'Branding', icon: <Palette className="w-4 h-4" /> },
    { id: 'business', label: 'Business', icon: <Building2 className="w-4 h-4" /> },
    { id: 'regional', label: 'Regional', icon: <Globe2 className="w-4 h-4" /> },
    { id: 'ordering', label: 'Ordering', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Layers className="w-4 h-4" />, isPlaceholder: true },
    { id: 'security', label: 'Security', icon: <ShieldCheck className="w-4 h-4" />, isPlaceholder: true },
    { id: 'advanced', label: 'Advanced', icon: <Sliders className="w-4 h-4" />, isPlaceholder: true },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto pb-12">
      {/* Header Bar with Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shadow-lg shadow-orange-500/10">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-100 tracking-tight">Restaurant Configuration</h1>
            <p className="text-xs text-slate-400">Manage identity, brand palette, operating hours, and ordering controls</p>
          </div>
        </div>

        {/* Action Toolbar & Save Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            {isDirty ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 font-semibold">Unsaved changes</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">All changes saved</span>
              </>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={resetSettings}
              disabled={!isDirty || isSaving}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reset
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={saveSettings}
              disabled={!isDirty || isSaving}
              isLoading={isSaving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Global Validation Alert if any error */}
      {Object.keys(errors).length > 0 && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold">Validation Errors Detected</span>
            <span>Please check fields in the active tabs: {Object.values(errors).join(', ')}</span>
          </div>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-800/60">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border',
                isActive
                  ? 'bg-orange-500 text-white border-orange-400/50 shadow-lg shadow-orange-500/20'
                  : 'bg-slate-900/40 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800/40'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.isPlaceholder && (
                <span className={cn(
                  'text-[9px] px-1.5 py-0.2 rounded-full uppercase tracking-wider font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                )}>
                  Soon
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Tab Panel Content */}
      <div className="mt-2">
        {activeTab === 'general' && (
          <GeneralTab
            formData={formData}
            errors={errors}
            isCheckingSlug={isCheckingSlug}
            updateField={updateField}
          />
        )}

        {activeTab === 'branding' && (
          <BrandingTab
            formData={formData}
            updateField={updateField}
          />
        )}

        {activeTab === 'business' && (
          <BusinessTab
            formData={formData}
            errors={errors}
            updateField={updateField}
          />
        )}

        {activeTab === 'regional' && (
          <RegionalTab
            formData={formData}
            updateField={updateField}
          />
        )}

        {activeTab === 'ordering' && (
          <OrderingTab
            formData={formData}
            updateField={updateField}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab
            formData={formData}
            updateField={updateField}
          />
        )}

        {activeTab === 'integrations' && (
          <PlaceholderTab
            title="Integrations & Gateways"
            description="Connect third-party payment gateways, POS hardware systems, and WhatsApp APIs."
            type="integrations"
          />
        )}

        {activeTab === 'security' && (
          <PlaceholderTab
            title="Tenant Security & Compliance"
            description="Manage API access keys, two-factor authentication, and security log audits."
            type="security"
          />
        )}

        {activeTab === 'advanced' && (
          <PlaceholderTab
            title="Advanced Database & Custom Domains"
            description="Manage raw data exports, CNAME custom domains, and database maintenance."
            type="advanced"
          />
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
