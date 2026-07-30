import React from 'react';
import { Card } from '@qrdine/ui';
import { Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title, description }) => {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto py-10">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold tracking-tight text-slate-100">{title}</h2>
        {description && <p className="text-xs text-slate-400">{description}</p>}
      </div>

      {/* Box details */}
      <Card className="p-12 border border-slate-800 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-center gap-4">
        <span className="p-4 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20 animate-pulse-soft">
          <Construction className="w-8 h-8" />
        </span>
        <div className="flex flex-col gap-2 max-w-md">
          <h3 className="font-bold text-slate-200">Module Under Construction</h3>
          <p className="text-xs text-slate-500">
            The "{title}" module is scheduled for implementation in a future phase. The database foundation and RLS security layers for this module are already configured and live.
          </p>
        </div>
      </Card>
    </div>
  );
};
export default PlaceholderPage;
