import React from 'react';
import { Card, Toggle, Badge } from '@qrdine/ui';
import { Restaurant } from '@qrdine/types';
import { ShoppingBag, QrCode, MonitorCheck, CalendarClock, Bike, ShoppingCart, Zap } from 'lucide-react';

interface OrderingTabProps {
  formData: Partial<Restaurant>;
  updateField: (key: keyof Restaurant, value: any) => void;
}

export const OrderingTab: React.FC<OrderingTabProps> = ({
  formData,
  updateField,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Active Order Engine Settings */}
      <Card variant="glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Order Processing Controls</h3>
            <p className="text-xs text-slate-400">Master toggles governing customer order placement and KDS routing</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 divide-y divide-slate-800/60">
          {/* Master Accept Orders */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Accept Live Orders</span>
                <span className="text-xs text-slate-500">
                  When turned off, customers will be shown &quot;Restaurant is currently offline for orders&quot;.
                </span>
              </div>
            </div>
            <Toggle
              checked={formData.accept_orders ?? true}
              onChange={(e) => updateField('accept_orders', e.target.checked)}
            />
          </div>

          {/* Table QR Ordering */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 mt-0.5">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Enable Table QR Ordering</span>
                <span className="text-xs text-slate-500">
                  Allow customers to scan table QR codes and submit orders directly from their phones.
                </span>
              </div>
            </div>
            <Toggle
              checked={formData.enable_table_ordering ?? true}
              onChange={(e) => updateField('enable_table_ordering', e.target.checked)}
            />
          </div>

          {/* Kitchen Display Enabled */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-0.5">
                <MonitorCheck className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Kitchen Display System (KDS) Enabled</span>
                <span className="text-xs text-slate-500">
                  Send newly confirmed orders directly to kitchen display screens in real time.
                </span>
              </div>
            </div>
            <Toggle
              checked={formData.kitchen_display_enabled ?? true}
              onChange={(e) => updateField('kitchen_display_enabled', e.target.checked)}
            />
          </div>
        </div>
      </Card>

      {/* Future Expansion Features */}
      <Card variant="glass">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Advanced Order Modes</h3>
              <p className="text-xs text-slate-400">Future fulfillment options scheduled for upcoming releases</p>
            </div>
          </div>
          <Badge variant="confirmed" size="sm">Roadmap Modules</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Allow Scheduled Orders */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <CalendarClock className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-300">Allow Scheduled Orders</span>
                <span className="text-[11px] text-slate-500">Pre-order for later dining</span>
              </div>
            </div>
            <Badge variant="inactive" size="sm">Coming Soon</Badge>
          </div>

          {/* Enable Takeaway */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <ShoppingCart className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-300">Enable Takeaway / Pickup</span>
                <span className="text-[11px] text-slate-500">Customer pickup orders</span>
              </div>
            </div>
            <Badge variant="inactive" size="sm">Coming Soon</Badge>
          </div>

          {/* Enable Delivery */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <Bike className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-300">Enable Home Delivery</span>
                <span className="text-[11px] text-slate-500">Direct delivery dispatch</span>
              </div>
            </div>
            <Badge variant="inactive" size="sm">Coming Soon</Badge>
          </div>

          {/* Auto Accept Orders */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-300">Auto-Accept Orders</span>
                <span className="text-[11px] text-slate-500">Bypass manual staff confirmation</span>
              </div>
            </div>
            <Badge variant="inactive" size="sm">Coming Soon</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
