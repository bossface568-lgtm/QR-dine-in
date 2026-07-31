import React from 'react';
import { UtensilsCrossed, AlertCircle } from 'lucide-react';

export const RestaurantNotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-950/80 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100 mb-2">Restaurant Not Found</h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          The restaurant URL handle you opened does not exist or has been moved. Please double check the link or ask staff for assistance.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500 font-mono">
          <UtensilsCrossed className="w-4 h-4 text-orange-400" />
          <span>Error Code: RESTAURANT_404</span>
        </div>
      </div>
    </div>
  );
};
