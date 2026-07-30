import React from 'react';
import { Card, Badge } from '@qrdine/ui';
import { Wrench, ShieldCheck, Sliders, Layers } from 'lucide-react';

interface PlaceholderTabProps {
  title: string;
  description: string;
  type: 'integrations' | 'security' | 'advanced';
}

export const PlaceholderTab: React.FC<PlaceholderTabProps> = ({
  title,
  description,
  type,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'integrations':
        return <Layers className="w-8 h-8 text-cyan-400" />;
      case 'security':
        return <ShieldCheck className="w-8 h-8 text-emerald-400" />;
      case 'advanced':
        return <Sliders className="w-8 h-8 text-purple-400" />;
      default:
        return <Wrench className="w-8 h-8 text-orange-400" />;
    }
  };

  return (
    <Card variant="glass" className="py-12">
      <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          {getIcon()}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-center gap-2">
            <h3 className="text-lg font-bold text-slate-100">{title}</h3>
            <Badge variant="confirmed" size="sm">Placeholder Module</Badge>
          </div>
          <p className="text-xs text-slate-400">{description}</p>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 w-full text-left flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scheduled Extensions</span>
          <ul className="text-xs text-slate-400 flex flex-col gap-1.5 list-disc list-inside">
            {type === 'integrations' && (
              <>
                <li>Stripe / Razorpay Payment Gateways</li>
                <li>POS Systems (Petpooja, Toast, Clover)</li>
                <li>WhatsApp Business API Notifications</li>
              </>
            )}
            {type === 'security' && (
              <>
                <li>Two-Factor Authentication (2FA)</li>
                <li>IP Whitelisting & API Access Tokens</li>
                <li>Audit Logs & Login Session History</li>
              </>
            )}
            {type === 'advanced' && (
              <>
                <li>Database Raw Export & Automatic Backups</li>
                <li>Tenant Custom Subdomain & Domain CNAME</li>
                <li>Data Archiving & Compliance Deletion</li>
              </>
            )}
          </ul>
        </div>
      </div>
    </Card>
  );
};
