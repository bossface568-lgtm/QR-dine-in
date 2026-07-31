import React from 'react';
import { Clock, Store } from 'lucide-react';

interface RestaurantUnavailablePageProps {
  restaurantName?: string;
}

export const RestaurantUnavailablePage: React.FC<RestaurantUnavailablePageProps> = ({ restaurantName }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-slate-950/80 border border-slate-800 p-8 rounded-3xl backdrop-blur-xl shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 mb-6">
          <Clock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-100 mb-2">Restaurant Unavailable</h1>
        <p className="text-sm text-slate-400 leading-relaxed mb-6">
          {restaurantName || 'This restaurant'} is currently not accepting online orders or digital menu views. Please speak to our staff.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-500 font-mono">
          <Store className="w-4 h-4 text-orange-400" />
          <span>Status: RESTAURANT_INACTIVE</span>
        </div>
      </div>
    </div>
  );
};
