import React from 'react';
import { Card, Input, Checkbox } from '@qrdine/ui';
import { WEEKDAYS } from '@qrdine/shared';
import { Restaurant } from '@qrdine/types';
import { Building2, Clock, MapPin, Receipt, Calendar } from 'lucide-react';

interface BusinessTabProps {
  formData: Partial<Restaurant>;
  errors: Record<string, string>;
  updateField: (key: keyof Restaurant, value: any) => void;
}

export const BusinessTab: React.FC<BusinessTabProps> = ({
  formData,
  errors,
  updateField,
}) => {
  const activeDays = formData.business_days || WEEKDAYS;

  const toggleDay = (day: string) => {
    let nextDays: string[];
    if (activeDays.includes(day)) {
      nextDays = activeDays.filter((d) => d !== day);
    } else {
      nextDays = [...activeDays, day];
    }
    updateField('business_days', nextDays);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Legal & Tax Verification */}
      <Card variant="glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Taxation & Business Registration</h3>
            <p className="text-xs text-slate-400">Legal entity registration, GSTIN, and tax compliance details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* GSTIN */}
          <Input
            label="GSTIN / Tax Registration Number"
            placeholder="22AAAAA0000A1Z5"
            value={formData.gst_number || ''}
            onChange={(e) => updateField('gst_number', e.target.value.toUpperCase())}
            error={errors.gst_number}
            leftIcon={<Receipt className="w-4 h-4 text-slate-400" />}
          />

          {/* PAN Number */}
          <Input
            label="PAN Number (Optional)"
            placeholder="ABCDE1234F"
            value={formData.pan_number || ''}
            onChange={(e) => updateField('pan_number', e.target.value.toUpperCase())}
            error={errors.pan_number}
            leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
          />

          {/* Business Registration Number */}
          <Input
            label="FSSAI / License Number (Optional)"
            placeholder="10020022000123"
            value={formData.business_registration || ''}
            onChange={(e) => updateField('business_registration', e.target.value)}
            leftIcon={<Building2 className="w-4 h-4 text-slate-400" />}
          />
        </div>
      </Card>

      {/* Operating Schedule */}
      <Card variant="glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Default Operating Schedule</h3>
            <p className="text-xs text-slate-400">Set restaurant-wide default opening hours and weekly operating days</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Opening Time */}
          <Input
            label="Default Opening Time"
            type="time"
            value={formData.opening_time || '09:00'}
            onChange={(e) => updateField('opening_time', e.target.value)}
            leftIcon={<Clock className="w-4 h-4 text-slate-400" />}
          />

          {/* Closing Time */}
          <Input
            label="Default Closing Time"
            type="time"
            value={formData.closing_time || '23:00'}
            onChange={(e) => updateField('closing_time', e.target.value)}
            leftIcon={<Clock className="w-4 h-4 text-slate-400" />}
          />
        </div>

        {/* Operating Days */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-orange-400" />
            Weekly Operating Days
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {WEEKDAYS.map((day) => {
              const isChecked = activeDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 ${
                    isChecked
                      ? 'bg-orange-500/15 text-orange-400 border-orange-500/40 shadow-lg shadow-orange-500/10'
                      : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
                  }`}
                >
                  <Checkbox checked={isChecked} onChange={() => {}} />
                  <span>{day}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Business Registered Address */}
      <Card variant="glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Registered Business Address</h3>
            <p className="text-xs text-slate-400">Headquarters or registered corporate physical address</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <textarea
            rows={3}
            className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none"
            placeholder="Complete street address, building/suite number..."
            value={formData.business_address || ''}
            onChange={(e) => updateField('business_address', e.target.value)}
          />
          <span className="text-xs text-slate-500">Printed on official invoices and customer receipts.</span>
        </div>
      </Card>
    </div>
  );
};
