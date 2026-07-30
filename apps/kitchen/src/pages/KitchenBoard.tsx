import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, Button } from '@qrdine/ui';
import { ChefHat, LogOut } from 'lucide-react';

export const KitchenBoard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* KDS Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-900 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <ChefHat className="w-6 h-6 text-orange-500" />
          <h1 className="text-lg font-bold tracking-wide uppercase">Kitchen Display System</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse-soft" />
          <span className="text-xs text-slate-500 uppercase font-semibold">Active Terminal</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="text-rose-500 hover:bg-rose-500/10 border-0"
          >
            Logout
          </Button>
        </div>
      </header>

      {/* Main KDS Grid Layout */}
      <main className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
        <Card className="max-w-2xl mx-auto text-center py-12 flex flex-col items-center justify-center gap-4">
          <ChefHat className="w-12 h-12 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-200">Active Cooking Board</h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md">
            This workspace displays incoming orders divided into columns (Pending → Preparing → Ready). You can begin implementing the KDS tickets flow here.
          </p>
        </Card>
      </main>
    </div>
  );
};
