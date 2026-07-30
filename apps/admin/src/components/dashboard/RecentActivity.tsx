import React from 'react';
import { Card } from '@qrdine/ui';
import { History } from 'lucide-react';

export const RecentActivity: React.FC = () => {
  return (
    <Card className="p-6 border border-slate-800 bg-slate-900/40 backdrop-blur-sm flex flex-col gap-4 min-h-[220px]">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <History className="w-4 h-4 text-orange-500" />
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Activity Log</h3>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <span className="p-3 rounded-full bg-slate-950/40 border border-slate-800 text-slate-600 mb-2">
          <History className="w-5 h-5" />
        </span>
        <p className="text-xs font-semibold text-slate-400">No recent activity</p>
        <p className="text-xxs text-slate-600 mt-1 max-w-[200px]">Live operations events (scans, checkout requests, KDS updates) will render here.</p>
      </div>
    </Card>
  );
};
export default RecentActivity;
