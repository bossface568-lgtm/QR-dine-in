import React from 'react';
import { Card } from '@qrdine/ui';

export const SettingsPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-bold text-slate-100 mb-2">Restaurant Configuration Settings</h2>
        <p className="text-sm text-slate-400">
          Scaffold restaurant detail forms, currencies, logos, operating hours, and plans configuration details here.
        </p>
      </Card>
    </div>
  );
};
