import React from 'react';
import { Card, Input, Select } from '@qrdine/ui';
import {
  SUPPORTED_CURRENCIES,
  SUPPORTED_TIMEZONES,
  DATE_FORMATS,
  TIME_FORMATS,
  SUPPORTED_LANGUAGES,
} from '@qrdine/shared';
import { Restaurant } from '@qrdine/types';
import { Globe2, DollarSign, Clock, Calendar, Languages, Map } from 'lucide-react';

interface RegionalTabProps {
  formData: Partial<Restaurant>;
  updateField: (key: keyof Restaurant, value: any) => void;
}

export const RegionalTab: React.FC<RegionalTabProps> = ({
  formData,
  updateField,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Localization & Formats */}
      <Card variant="glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Globe2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Regional Localization & Formats</h3>
            <p className="text-xs text-slate-400">Configure default currency, timezone, date/time formats, and primary language</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Currency */}
          <Select
            label="Base Currency"
            value={formData.currency || 'INR'}
            onChange={(e) => updateField('currency', e.target.value)}
            options={SUPPORTED_CURRENCIES}
          />

          {/* Timezone */}
          <Select
            label="Default Timezone"
            value={formData.timezone || 'Asia/Kolkata'}
            onChange={(e) => updateField('timezone', e.target.value)}
            options={SUPPORTED_TIMEZONES}
          />

          {/* Date Format */}
          <Select
            label="Date Display Format"
            value={formData.date_format || 'DD/MM/YYYY'}
            onChange={(e) => updateField('date_format', e.target.value)}
            options={DATE_FORMATS}
          />

          {/* Time Format */}
          <Select
            label="Time Display Format"
            value={formData.time_format || '12h'}
            onChange={(e) => updateField('time_format', e.target.value)}
            options={TIME_FORMATS}
          />

          {/* Primary Language */}
          <Select
            label="Primary Menu Language"
            value={formData.language || 'en'}
            onChange={(e) => updateField('language', e.target.value)}
            options={SUPPORTED_LANGUAGES}
          />
        </div>
      </Card>

      {/* Regional Location Attributes */}
      <Card variant="glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Territory & Jurisdiction</h3>
            <p className="text-xs text-slate-400">Default country, state, and city parameters for outlets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Country */}
          <Input
            label="Country Code / Name"
            placeholder="India (IN)"
            value={formData.country || 'IN'}
            onChange={(e) => updateField('country', e.target.value)}
          />

          {/* State */}
          <Input
            label="State / Province"
            placeholder="e.g. Maharashtra"
            value={formData.state || ''}
            onChange={(e) => updateField('state', e.target.value)}
          />

          {/* City */}
          <Input
            label="City / Region"
            placeholder="e.g. Mumbai"
            value={formData.city || ''}
            onChange={(e) => updateField('city', e.target.value)}
          />
        </div>
      </Card>
    </div>
  );
};
