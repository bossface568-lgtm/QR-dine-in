import React from 'react';
import { Card, Toggle, Badge } from '@qrdine/ui';
import { Restaurant } from '@qrdine/types';
import { Bell, Mail, Volume2, MessageSquare, Smartphone } from 'lucide-react';

interface NotificationsTabProps {
  formData: Partial<Restaurant>;
  updateField: (key: keyof Restaurant, value: any) => void;
}

export const NotificationsTab: React.FC<NotificationsTabProps> = ({
  formData,
  updateField,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Active Notification Channels & Audio Alerts */}
      <Card variant="glass">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Live Alerts & Email Preferences</h3>
            <p className="text-xs text-slate-400">Configure sound chimes and automated email digests for management</p>
          </div>
        </div>

        <div className="flex flex-col gap-5 divide-y divide-slate-800/60">
          {/* Email Notifications */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-0.5">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Email Notifications</span>
                <span className="text-xs text-slate-500">
                  Receive daily performance reports and account security updates via email.
                </span>
              </div>
            </div>
            <Toggle
              checked={formData.email_notifications ?? true}
              onChange={(e) => updateField('email_notifications', e.target.checked)}
            />
          </div>

          {/* Kitchen Sound Alerts */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 mt-0.5">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Kitchen Display Audio Chimes</span>
                <span className="text-xs text-slate-500">
                  Play an audible chime on KDS terminals whenever a new ticket arrives.
                </span>
              </div>
            </div>
            <Toggle
              checked={formData.kitchen_alerts ?? true}
              onChange={(e) => updateField('kitchen_alerts', e.target.checked)}
            />
          </div>

          {/* Order Sound Alerts */}
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Admin Dashboard Order Chimes</span>
                <span className="text-xs text-slate-500">
                  Ring notification chime when new orders are placed by customers.
                </span>
              </div>
            </div>
            <Toggle
              checked={formData.order_alerts ?? true}
              onChange={(e) => updateField('order_alerts', e.target.checked)}
            />
          </div>
        </div>
      </Card>

      {/* Future Notification Channels */}
      <Card variant="glass">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">SMS & Mobile Push Channels</h3>
              <p className="text-xs text-slate-400">Future customer notification gateways (Twilio / Firebase)</p>
            </div>
          </div>
          <Badge variant="confirmed" size="sm">Roadmap Modules</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SMS Notifications */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-300">Customer SMS Notifications</span>
                <span className="text-[11px] text-slate-500">Send order status updates via SMS</span>
              </div>
            </div>
            <Badge variant="inactive" size="sm">Coming Soon</Badge>
          </div>

          {/* Web Push Notifications */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-300">Mobile Push Notifications</span>
                <span className="text-[11px] text-slate-500">PWA push alerts for staff & waiters</span>
              </div>
            </div>
            <Badge variant="inactive" size="sm">Coming Soon</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
