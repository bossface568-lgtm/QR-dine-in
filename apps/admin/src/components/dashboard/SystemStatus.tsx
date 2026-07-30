import React from 'react';
import { Card } from '@qrdine/ui';
import { 
  ShieldCheck, 
  Database, 
  HardDrive, 
  Radio, 
  Printer, 
  CreditCard 
} from 'lucide-react';

interface StatusRowProps {
  label: string;
  value: string;
  status: 'success' | 'warning' | 'error' | 'default';
  icon: React.ReactNode;
}

const StatusRow: React.FC<StatusRowProps> = ({ label, value, status, icon }) => {
  const badgeColors = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    default: 'bg-slate-800 text-slate-400 border-slate-700/40'
  };

  return (
    <div className="flex items-center justify-between py-2 text-xs border-b border-slate-800/40 last:border-b-0">
      <div className="flex items-center gap-2.5 text-slate-400">
        <span className="p-1 rounded bg-slate-950/40 border border-slate-800/40 text-slate-400">
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </div>
      <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${badgeColors[status]}`}>
        {value}
      </span>
    </div>
  );
};

export const SystemStatus: React.FC = () => {
  return (
    <Card className="p-6 border border-slate-800 bg-slate-900/40 backdrop-blur-sm flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Database className="w-4 h-4 text-orange-500" />
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Integration Status</h3>
      </div>
      <div className="flex flex-col gap-1.5 flex-1 justify-center">
        <StatusRow 
          label="Authentication" 
          value="Connected" 
          status="success" 
          icon={<ShieldCheck className="w-3.5 h-3.5" />} 
        />
        <StatusRow 
          label="Database" 
          value="Connected" 
          status="success" 
          icon={<Database className="w-3.5 h-3.5" />} 
        />
        <StatusRow 
          label="S3 Storage" 
          value="Connected" 
          status="success" 
          icon={<HardDrive className="w-3.5 h-3.5" />} 
        />
        <StatusRow 
          label="Socket Realtime" 
          value="Ready" 
          status="success" 
          icon={<Radio className="w-3.5 h-3.5" />} 
        />
        <StatusRow 
          label="Thermal Printer" 
          value="Not Configured" 
          status="warning" 
          icon={<Printer className="w-3.5 h-3.5" />} 
        />
        <StatusRow 
          label="SaaS Plan" 
          value="Free Tier" 
          status="default" 
          icon={<CreditCard className="w-3.5 h-3.5" />} 
        />
      </div>
    </Card>
  );
};
export default SystemStatus;
